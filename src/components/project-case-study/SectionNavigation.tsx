import React, { useState } from 'react';

export interface NavSectionItem {
  id: string;
  label: string;
}

interface SectionNavigationProps {
  sections: NavSectionItem[];
  activeSection: string;
  onSelectSection: (id: string) => void;
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({
  sections,
  activeSection,
  onSelectSection
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (sections.length === 0) return null;

  return (
    <>
      {/* MOBILE / TABLET FLOATING DOCK (visible below lg) - positioned cleanly below 72px header */}
      <div className="lg:hidden w-full sticky top-[72px] z-30 bg-black/95 backdrop-blur-md border-b border-white/10 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Jump to:</span>
            <span className="text-white text-sm font-medium truncate">
              {sections.find((s) => s.id === activeSection)?.label || 'Sections'}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="px-3 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-zinc-800"
          >
            <span>{mobileMenuOpen ? 'Close' : 'Menu'}</span>
            <span className="material-symbols-rounded text-sm">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Dropdown panel */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
            {sections.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3 rounded flex items-center justify-between text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'text-white font-semibold bg-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <div className="w-2 h-2 rounded-full bg-[#ff853a]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* DESKTOP STICKY LEFT NAVIGATION (matching Figma w-72) */}
      <nav
        aria-label="Case Study Table of Contents"
        className="hidden lg:flex w-72 sticky top-28 self-start flex-col justify-start items-start gap-2.5 z-20 py-2"
      >
        <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-1 px-3 select-none">
          CASE STUDY OUTLINE
        </div>

        <div className="w-full flex flex-col gap-1">
          {sections.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full text-left py-2 px-3 rounded-[4px] relative flex items-center justify-between text-base font-['Plus_Jakarta_Sans'] transition-all cursor-pointer ${
                  isActive
                    ? 'text-white font-medium bg-white/10 translate-x-1'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="truncate pr-2">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff853a] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
