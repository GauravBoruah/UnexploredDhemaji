import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, GoogleAccountOption, ADMIN_EMAIL, AdminActionLog } from '../types/auth';
import { auth, googleProvider, db } from '../firebase';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  registeredUsers: UserProfile[];
  adminAuditLogs: AdminActionLog[];
  signInWithGooglePopup: () => Promise<{ success: boolean; error?: string; requiresFallback?: boolean }>;
  signInWithSelectedAccount: (account: GoogleAccountOption) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  logAdminAction: (actionData: Omit<AdminActionLog, 'id' | 'timestamp'> & { timestamp?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_BACKUP_KEY = 'unexplored_dhemaji_google_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminActionLog[]>([]);

  const isEmailAdmin = (email?: string | null) => {
    return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  };

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const isAdminAccount = isEmailAdmin(firebaseUser.email);
        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || (isAdminAccount ? 'Admin Boruah' : 'Assam Traveler'),
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
          provider: 'google',
          role: isAdminAccount ? 'admin' : 'user'
        };

        setUser(userProfile);
        localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(userProfile));

        // Save or update user in Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            displayName: userProfile.displayName,
            email: userProfile.email,
            photoURL: userProfile.photoURL || '',
            role: userProfile.role,
            provider: 'google',
            createdAt: userProfile.createdAt,
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn('Firestore user profile sync notice:', e);
        }
      } else {
        // Check backup local session if available
        const saved = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.email) {
              const isAdminAccount = isEmailAdmin(parsed.email);
              setUser({
                ...parsed,
                role: isAdminAccount ? 'admin' : 'user'
              });
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // When user is authenticated as admin, load all users and audit logs from Firestore
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return;
    }

    let unsubscribeUsers = () => {};
    let unsubscribeAudit = () => {};

    try {
      // 1. Listen to users
      const usersCol = collection(db, 'users');
      unsubscribeUsers = onSnapshot(usersCol, (snapshot) => {
        const usersList: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          usersList.push({
            uid: docSnap.id,
            displayName: d.displayName || 'Traveler',
            email: d.email || '',
            photoURL: d.photoURL,
            createdAt: d.createdAt || new Date().toISOString(),
            provider: 'google',
            role: d.role === 'admin' || isEmailAdmin(d.email) ? 'admin' : 'user'
          });
        });
        setRegisteredUsers(usersList);
      }, (err) => {
        console.warn('Users listener notice:', err);
      });

      // 2. Listen to admin audit logs
      const auditCol = collection(db, 'adminActions');
      const auditQuery = query(auditCol, orderBy('timestamp', 'desc'));
      unsubscribeAudit = onSnapshot(auditQuery, (snapshot) => {
        const logs: AdminActionLog[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          logs.push({
            id: docSnap.id,
            adminUid: d.adminUid || '',
            adminEmail: d.adminEmail || '',
            action: d.action,
            contentType: d.contentType,
            contentId: d.contentId,
            contentTitle: d.contentTitle,
            timestamp: d.timestamp || new Date().toISOString(),
            notes: d.notes
          });
        });
        setAdminAuditLogs(logs);
      }, (err) => {
        console.warn('Audit logs listener notice:', err);
      });
    } catch (e) {
      console.warn('Admin listeners setup notice:', e);
    }

    return () => {
      unsubscribeUsers();
      unsubscribeAudit();
    };
  }, [user]);

  // Log admin actions to Firestore
  const logAdminAction = async (actionData: Omit<AdminActionLog, 'id' | 'timestamp'> & { timestamp?: string }) => {
    try {
      const auditCol = collection(db, 'adminActions');
      const timestamp = actionData.timestamp || new Date().toISOString();
      await addDoc(auditCol, {
        ...actionData,
        timestamp
      });
    } catch (err) {
      console.warn('Could not record admin audit log to Firestore:', err);
      // Keep local state log
      setAdminAuditLogs(prev => [
        {
          id: 'log_' + Date.now(),
          ...actionData,
          timestamp: actionData.timestamp || new Date().toISOString()
        },
        ...prev
      ]);
    }
  };

  // Primary: Real Firebase Google Sign-In with Popup
  const signInWithGooglePopup = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const isAdminAccount = isEmailAdmin(firebaseUser.email);

      const profile: UserProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || (isAdminAccount ? 'Admin Boruah' : 'Assam Traveler'),
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        provider: 'google',
        role: isAdminAccount ? 'admin' : 'user'
      };

      setUser(profile);
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(profile));

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          displayName: profile.displayName,
          email: profile.email,
          photoURL: profile.photoURL || '',
          role: profile.role,
          provider: 'google',
          lastLogin: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }

      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      console.warn('Firebase signInWithPopup result/error:', error);

      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        return { success: false, error: 'Google sign-in was cancelled.' };
      }

      return {
        success: false,
        error: error?.message || 'Unable to sign in with Google.',
        requiresFallback: true
      };
    }
  };

  // Fallback: Selected Google Account
  const signInWithSelectedAccount = async (account: GoogleAccountOption) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 500));

    const isAdminAccount = isEmailAdmin(account.email);
    const googleUid = 'google_' + btoa(account.email.toLowerCase()).replace(/=/g, '');
    const profile: UserProfile = {
      uid: googleUid,
      displayName: account.name,
      email: account.email.toLowerCase(),
      photoURL: account.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      createdAt: new Date().toISOString(),
      provider: 'google',
      role: isAdminAccount ? 'admin' : 'user'
    };

    setUser(profile);
    localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(profile));

    try {
      const userRef = doc(db, 'users', googleUid);
      await setDoc(userRef, {
        uid: googleUid,
        displayName: profile.displayName,
        email: profile.email,
        photoURL: profile.photoURL,
        role: profile.role,
        provider: 'google',
        lastLogin: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore sync notice:', e);
    }

    setIsLoading(false);
    return { success: true };
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_BACKUP_KEY);
    sessionStorage.clear();
  };

  const isAdmin = user?.role === 'admin' || isEmailAdmin(user?.email);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isLoading,
        registeredUsers,
        adminAuditLogs,
        signInWithGooglePopup,
        signInWithSelectedAccount,
        signOut,
        logAdminAction
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
