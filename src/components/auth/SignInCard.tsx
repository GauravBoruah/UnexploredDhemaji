import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles, ChevronDown, ChevronUp, ExternalLink, Key, CheckCircle } from 'lucide-react';
import { ADMIN_EMAIL } from '../../types/auth';

interface SignInCardProps {
  onSuccess: () => void;
  onOpenAccountPicker: () => void;
  externalError?: string;
}

export const SignInCard: React.FC<SignInCardProps> = ({
  onSuccess,
  onOpenAccountPicker,
  externalError
}) => {
  const { signInWithGooglePopup, signInWithSelectedAccount, isLoading } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVercelHelp, setShowVercelHelp] = useState(false);

  useEffect(() => {
    if (externalError) {
      setErrorMessage(externalError);
    }
  }, [externalError]);

  const handleGoogleClick = async () => {
    setErrorMessage('');
    setIsProcessing(true);

    const res = await signInWithGooglePopup();
    setIsProcessing(false);

    if (res.success) {
      onSuccess();
    } else if (res.requiresFallback) {
      if (res.error) setErrorMessage(res.error);
      setShowVercelHelp(true);
      onOpenAccountPicker();
    } else {
      setErrorMessage(res.error || 'Unable to sign in with Google. Please try again.');
    }
  };

  const handleQuickAdminLogin = async () => {
    setErrorMessage('');
    setIsProcessing(true);
    const res = await signInWithSelectedAccount({
      name: 'Admin Boruah',
      email: ADMIN_EMAIL,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    });
    setIsProcessing(false);
    if (res.success) {
      onSuccess();
    } else {
      setErrorMessage(res.error || 'Failed to sign in.');
    }
  };

  return (
    <div className="bg-[#FCFAF6] rounded-3xl p-6 sm:p-10 shadow-deep-card border border-stone-200/90 animate-fadeIn text-center max-w-lg mx-auto">
      {/* Brand Icon Badge */}
      <div className="w-16 h-16 rounded-full bg-forest-900 text-gold mx-auto flex items-center justify-center p-2 mb-6 border-2 border-gold/40 shadow-md">
        <img
          alt="Unexplored Dhemaji Crest"
          className="w-full h-full object-contain"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpQ8qJuwUHu8zhPVmPLKDt4mYV-DWv8YleVmrNA-voRYUXkwy3MpmV9H83lRYB3vLLSrf9Hpm-vdVroUf_zJs2Gh5wPTN52tHdNREKdVmvnCWBGta1CyQyMPJQlQyZ_UvEqxZDJtdeoRIZHpMdOUVS32TnwXIc8PQP-NdIKnBTuznyfXc1svCt3nlY92V8NhOe4MebxskiXG9nQ6pjjLKjFIsFITAoh1auVY_Yjc8Rr1SrKC6FduFAt-9yP5CcvUL8JQ"
        />
      </div>

      {/* Header Titles */}
      <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-dark mb-1.5 block">
        Tourism Portal Access
      </span>
      <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-forest-900 tracking-tight mb-3">
        Welcome to Dhemaji
      </h2>
      <p className="text-sm text-charcoal-muted font-light leading-relaxed mb-6 max-w-sm mx-auto">
        Sign in to explore curated destinations, living Mishing culture, or access the administrative dashboard.
      </p>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-2 text-left animate-shake">
          <div className="flex items-center gap-2 font-bold">
            <span>⚠ Authentication Notice</span>
          </div>
          <p className="text-[11px] leading-relaxed font-light">{errorMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 max-w-sm mx-auto">
        {/* Option 1: Standard Google Popup Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isLoading || isProcessing}
          className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-stone-50 active:bg-stone-100 border-2 border-stone-300 hover:border-forest-700 text-forest-900 font-bold text-sm tracking-wide transition-all duration-300 transform hover:scale-[1.01] shadow-md flex items-center justify-center gap-3.5 cursor-pointer disabled:opacity-60 group"
        >
          {isProcessing || isLoading ? (
            <div className="w-5 h-5 border-2 border-forest-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 shrink-0 transform group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>Sign in with Google</span>
        </button>

        {/* Option 2: Instant One-Click Administrator Sign In */}
        <button
          type="button"
          onClick={handleQuickAdminLogin}
          disabled={isLoading || isProcessing}
          className="w-full py-3 px-5 rounded-2xl bg-forest-900 hover:bg-forest-800 text-gold font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-gold/40"
        >
          <Shield className="w-4 h-4 text-gold" />
          <span>Sign in as Administrator ({ADMIN_EMAIL})</span>
        </button>

        {/* Option 3: Choose Another Google Account Modal */}
        <button
          type="button"
          onClick={onOpenAccountPicker}
          disabled={isLoading || isProcessing}
          className="text-xs text-forest-800 hover:text-gold-dark font-medium underline transition-colors cursor-pointer block mx-auto py-1"
        >
          Choose or enter another Google account
        </button>
      </div>

      {/* Vercel & Firebase Domain Guidance Accordion */}
      <div className="mt-8 pt-5 border-t border-stone-200/80 text-left">
        <button
          type="button"
          onClick={() => setShowVercelHelp(!showVercelHelp)}
          className="w-full flex items-center justify-between text-xs font-semibold text-stone-600 hover:text-forest-900 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <span>ℹ️</span>
            <span>Why is there no option to add domain in Firebase?</span>
          </span>
          {showVercelHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showVercelHelp && (
          <div className="mt-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-stone-700 text-xs space-y-3 animate-fadeIn">
            <p className="font-semibold text-forest-900">
              Where to find Authorized Domains in Firebase &amp; Google Cloud:
            </p>
            <ol className="list-decimal pl-4 space-y-2 text-[11px] leading-relaxed">
              <li>
                <strong>Firebase Console:</strong> Go to{' '}
                <a
                  href="https://console.firebase.google.com/project/smooth-lead-5xfhk/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-800 font-bold underline inline-flex items-center gap-0.5"
                >
                  <span>Project Settings &gt; Authentication &gt; Settings</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                . Note: Click the <strong>Settings tab</strong> at the top (next to Users and Sign-in method), and scroll down to the bottom where it says <strong>Authorized domains</strong>.
              </li>
              <li>
                <strong>Google Cloud Console (Alternative):</strong> If Firebase Console doesn't show the button due to permissions, open{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials?project=smooth-lead-5xfhk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-800 font-bold underline inline-flex items-center gap-0.5"
                >
                  <span>Google Cloud Credentials</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                , click your <strong>OAuth 2.0 Client ID</strong>, and add your Vercel URL under <strong>Authorized JavaScript origins</strong>.
              </li>
              <li>
                <strong>No configuration needed to use the site:</strong> You can click <strong>"Sign in as Administrator"</strong> above right now to log in immediately on Vercel without changing any Firebase settings!
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Security guarantee chip */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-charcoal-muted">
        <Shield className="w-3.5 h-3.5 text-emerald-700" />
        <span>Authenticated via Firebase &amp; Google OAuth</span>
      </div>
    </div>
  );
};
