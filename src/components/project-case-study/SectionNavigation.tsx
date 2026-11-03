import React from 'react';

export interface NavSectionItem {
  id: string;
  label: string;
}

interface SectionNavigationProps {
  sections: NavSectionItem[];
  activeSection: string;
  onSelectSection: (id: string) => void;
  copy?: Record<string, string>;
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({
  sections,
  activeSection,
  onSelectSection
}) => {
  if (sections.length === 0) return null;

  return (
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
  );
};

