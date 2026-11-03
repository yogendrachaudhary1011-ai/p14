import React, { useState } from 'react';

export interface NavSectionItem {
  id: string;
  label: string;
}

interface SectionNavigationProps {
  sections: NavSectionItem[];
  activeSection: string;
  onSelectSection: (id: string) => void;
  copy: Record<string, string>;
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({
  sections,
  activeSection,
  onSelectSection,
  copy
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (sections.length === 0) return null;

  return (
    <>
      {/* MOBILE / TABLET FLOATING DOCK (visible below lg) - positioned cleanly below 72px header */}
      <div className="lg:hidden w-full sticky top-[72px] z-30 bg-black/95 backdrop-blur-md border-b border-white/10 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">{copy.jumpTo}</span>
            <span className="text-white text-sm font-medium truncate">
              {sections.find((s) => s.id === activeSection)?.label || copy.sectionsFallback}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="px-3 py-1.5 rounded bg-zinc-900 border border-white/10 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-zinc-800"
          >
            <span>{mobileMenuOpen ? copy.navMenuClose : copy.navMenuOpen}</span>
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
                      ? 'font-semibold bg-white/10'
                      : 'hover:bg-white/5'
                  }`}
                  style={{
                    color: isActive ? 'var(--cs-nav-active-text, var(--cs-accent-text, #8be28b))' : 'var(--cs-nav-text, var(--cs-muted, #a1a1aa))'
                  }}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <div
                      className="w-2 h-2 rounded-full shadow-xs"
                      style={{
                        backgroundColor: 'var(--cs-nav-active-indicator, var(--cs-accent, #8be28b))',
                        boxShadow: '0 0 8px var(--cs-nav-active-indicator, var(--cs-accent, #8be28b))'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* DESKTOP STICKY LEFT NAVIGATION - Pure Black Figma Outline Style */}
      <nav
        aria-label="Case Study Table of Contents"
        className="hidden lg:flex w-72 shrink-0 sticky top-24 self-start flex-col justify-start items-start gap-3 z-30 pt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{
          position: 'sticky',
          top: '96px',
          alignSelf: 'flex-start'
        }}
      >
        <div className="w-full flex flex-col gap-2">
          {sections.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full text-left py-1.5 px-0 relative flex items-center justify-between text-lg leading-6 transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? 'font-medium translate-x-1'
                    : 'hover:translate-x-0.5'
                }`}
                style={{
                  color: isActive ? 'var(--cs-nav-active-text, var(--cs-accent-text, #8be28b))' : 'var(--cs-nav-text, var(--cs-muted, #a1a1aa))'
                }}
              >
                <span className="relative inline-block min-w-0 truncate pr-2 pb-1">
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 -bottom-px h-0.5 rounded-full transition-[width,opacity] duration-300 ease-out motion-reduce:transition-none ${
                      isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`}
                    style={{ backgroundColor: 'var(--cs-nav-active-indicator, var(--cs-accent, #8be28b))' }}
                  />
                </span>
                {!isActive && (
                  <span className="w-2 h-0.5 bg-white/0 group-hover:bg-white/40 shrink-0 transition-all duration-200 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

