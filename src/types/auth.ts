export const ADMIN_EMAIL = 'boruahborajen2019@gmail.com';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  provider: 'google';
  role: 'admin' | 'user';
}

export interface GoogleAccountOption {
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface AdminActionLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action:
    | 'APPROVE_PLACE'
    | 'REJECT_PLACE'
    | 'EDIT_PLACE'
    | 'DELETE_PLACE'
    | 'APPROVE_CULTURE'
    | 'REJECT_CULTURE'
    | 'EDIT_CULTURE'
    | 'DELETE_CULTURE';
  contentType: 'place' | 'culture';
  contentId: string;
  contentTitle?: string;
  timestamp: string;
  notes?: string;
}
