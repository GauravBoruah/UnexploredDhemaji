import React, { useState } from 'react';
import { GoogleAccountOption } from '../../types/auth';
import { SignInCard } from './SignInCard';
import { SuccessCard } from './SuccessCard';
import { GoogleAccountPickerModal } from './GoogleAccountPickerModal';
import { useAuth } from '../../context/AuthContext';

interface AuthPageProps {
  onAuthenticated: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const { signInWithSelectedAccount, user } = useAuth();
  const [googlePickerOpen, setGooglePickerOpen] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelectGoogleAccount = async (account: GoogleAccountOption) => {
    setGooglePickerOpen(false);
    setGoogleAuthError('');

    const res = await signInWithSelectedAccount(account);
    if (res.success) {
      setShowSuccess(true);
    } else {
      setGoogleAuthError(res.error || 'Unable to sign in with Google. Please try again.');
    }
  };

  const handleDirectSuccess = () => {
    setShowSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] flex flex-col lg:flex-row relative selection:bg-[#D99B26] selection:text-[#071811]">
      {/* Assamese Textile Border Top Ribbon */}
      <div
        aria-hidden="true"
        className="w-full h-3 absolute top-0 left-0 right-0 z-30 bg-repeat-x border-b border-[#C4161C]/20 shadow-xs"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida/AEtjO1Ws2pGIVvvcAQSrunQ5Y1FotZZwd0_hXQ6LZV7sSWzVItsFySXpt1eWM9hOEuCKOFp_qP9Ldb2rLdYUfRaHoaRqwgm_JIQmoT90STm2Vgj0sKDet8QhWpyI62qqZlwBrGhvvrrGeniqU1Yi4pHciOOucTU9Myz5trlr2UzuWuW1ucEk7RGOIokFRo-3odo3pbOocCt6wv-hNU2mWOfMTEv5vNHrt95vEAdRuM7WByNc6EnPJLvG0ZdGAhQ')",
          backgroundSize: 'auto 12px',
          backgroundRepeat: 'repeat-x'
        }}
      />

      {/* LEFT SIDE: Cinematic Visual Section */}
      <div className="relative w-full lg:w-1/2 min-h-[340px] sm:min-h-[420px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden text-white z-10">
        <div className="absolute inset-0 z-0">
          <img
            alt="Scenic Brahmaputra sunrise and wetlands of Dhemaji, Assam"
            className="w-full h-full object-cover object-center filter brightness-95 scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
            src="https://lh3.googleusercontent.com/aida/AEtjO1Ukrh3UMtbY9OATEYT7K1RS3kMy0zazlhy1cjBAS-S8uJemtLmgl9iLPMp9U3AmP_AcG5X1HpgW-SgefjPb4kvfED6YQ1y7YBzF5rO0k_rm089zlgc6EVr528Q05UopM0bEebgpyhg23LoIJk4xE6cHKEJQP5BK9umxOoDv7LDja2-NY31jODGK-Ywto3lrKa1OJ79asASh3oJAyd-Y1DBnEaKRzE4rrbgXulvYKvHrhrzcfzjKJTaKi3M"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/60 to-forest-800/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-900/80 via-forest-900/40 to-transparent" />
        </div>

        {/* Top: Brand Header */}
        <div className="relative z-10 flex items-center gap-3 mt-4 lg:mt-0">
          <img
            alt="Unexplored Dhemaji Crest"
            className="h-11 w-11 object-contain rounded-full bg-white p-0.5 border border-gold/60 shadow-md"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpQ8qJuwUHu8zhPVmPLKDt4mYV-DWv8YleVmrNA-voRYUXkwy3MpmV9H83lRYB3vLLSrf9Hpm-vdVroUf_zJs2Gh5wPTN52tHdNREKdVmvnCWBGta1CyQyMPJQlQyZ_UvEqxZDJtdeoRIZHpMdOUVS32TnwXIc8PQP-NdIKnBTuznyfXc1svCt3nlY92V8NhOe4MebxskiXG9nQ6pjjLKjFIsFITAoh1auVY_Yjc8Rr1SrKC6FduFAt-9yP5CcvUL8JQ"
          />
          <div className="flex flex-col">
            <span className="font-serif tracking-widest text-[10px] uppercase text-[#F3CF7A] font-bold">
              Official Tourism Portal
            </span>
            <span className="font-serif tracking-[0.2em] text-lg font-black text-white">
              UNEXPLORED DHEMAJI
            </span>
          </div>
        </div>

        {/* Middle: Evocative Cinematic Copy */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/70 border border-gold/40 text-gold text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-4 backdrop-blur-xs">
            <span>◆</span>
            <span>Gateway to Upper Assam</span>
            <span>◆</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md mb-3">
            Discover the beauty <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold to-gold-hover">
              beyond the familiar.
            </span>
          </h1>

          <p className="font-editorial italic text-base sm:text-lg text-stone-200 mb-4 font-normal">
            “Explore the landscapes, culture and history of Dhemaji, Assam.”
          </p>

          <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed hidden sm:block">
            From the sacred Subansiri gorges of Gerukamukh to the stilt settlements of the Mishing tribe and ancient medieval royal capitals, welcome to Assam's most captivating frontier.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 pt-4 border-t border-white/10 hidden sm:flex items-center gap-6 text-[11px] text-stone-300">
          <div className="flex items-center gap-1.5">
            <span className="text-gold">✦</span>
            <span>Verified Travel Network</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gold">✦</span>
            <span>Firebase Security</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gold">✦</span>
            <span>Google One-Tap Access</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Card Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 z-20">
        <div className="w-full max-w-md my-auto">
          {showSuccess ? (
            <SuccessCard
              userName={user?.displayName || 'Explorer'}
              onRedirect={onAuthenticated}
            />
          ) : (
            <SignInCard
              onSuccess={handleDirectSuccess}
              onOpenAccountPicker={() => setGooglePickerOpen(true)}
              externalError={googleAuthError}
            />
          )}

          <div className="mt-6 text-center text-xs text-charcoal-muted flex items-center justify-center gap-2">
            <span>🛡️</span>
            <span>Dedicated to sustainable Assam travel &amp; heritage preservation</span>
          </div>
        </div>
      </div>

      {/* Google Account Picker Modal */}
      <GoogleAccountPickerModal
        isOpen={googlePickerOpen}
        onClose={() => setGooglePickerOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
      />
    </div>
  );
};
