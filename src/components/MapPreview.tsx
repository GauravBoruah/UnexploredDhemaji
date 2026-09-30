import React from 'react';

export const MapPreview: React.FC = () => {
  return (
    <section
      className="py-20 bg-ivory-warm"
      data-purpose="interactive-map-showcase"
      id="map-preview"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto mb-12">
          <span className="text-gold-dark font-serif text-xs font-bold tracking-[0.25em] uppercase block mb-2">
            Cartographic Explorer
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-forest-900 mb-4">
            Interactive Geography &amp; Key Landmarks
          </h2>
          <p className="text-charcoal-muted text-sm sm:text-base leading-relaxed">
            Follow the lifelines of the Subansiri and Brahmaputra. Locate riverside communities, temple sanctuaries, and nature reserves spanning the district.
          </p>
        </div>

        {/* Illustrated Map Display with Styled Frame */}
        <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white p-2">
          <img
            alt="Full Illustrated Map of Dhemaji District Assam with key towns and attractions"
            className="w-full h-auto rounded-2xl object-cover"
            src="https://lh3.googleusercontent.com/aida/AEtjO1V1Iy9ba_agYUx2mtRLGp9Fg4xvI92N-ddkHP2X46Acvs0hdUaHNVr6D0vhP5STMFzS-WKgYS7zHEn4v9boEhF46eIBW5NaXJf0n3BY06Sm3c4hzX5Xg7JrcybxLYJGMQm4oq8paU2hZmUn3YIGXvjVNpq7mq6aYqaT0SqRvj9D0HmEss9WoORkKOKTggOFn-scyubhFvQsN553E6r8e7loJcGF3TvsLcD_MrRvKGTwN2haW-bcnqMyJQ"
          />
          <div className="mt-4 pb-2 px-4 flex flex-wrap items-center justify-between gap-4 text-left">
            <div>
              <h4 className="font-serif font-bold text-forest-900 text-sm">
                Dhemaji District Cartography
              </h4>
              <p className="text-xs text-charcoal-muted">
                Featuring Jonai, Silapathar, Bordoloni, Gogamukh &amp; Himalayan foothills
              </p>
            </div>
            <a
              className="px-5 py-2 rounded-full border border-forest-700 hover:bg-forest-800 hover:text-white text-forest-800 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              href="https://lh3.googleusercontent.com/aida-public/AB6AXuBprezSj8WTLxxMVO6SWdnq3zDYMMx4RteQf94oKBYeFunp7uAkHQCPIGMBrGN7musqZ6b1JpWMs79cxOSNYbGggAIkQqZdz3FoSG1zQpGv-JlXChWDNJjhmRYuyBVDpG2N1xJ86WU752ISR0pVTmbHvwVhipD0IGn6EgmRGF6UQ3k1aBwkXZpL7k6y4F9LTEEagAfAjQu_D3Fi1Kw_S7gaiC1LjcHBcj78sVOWuY4C-W2IwFC9i_4x"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>View Full Resolution</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
