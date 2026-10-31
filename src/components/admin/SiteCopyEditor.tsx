import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

type SiteCopy = Record<string, string>;

interface SiteCopyEditorProps {
  defaults: SiteCopy;
  values?: SiteCopy;
  onChange: (key: string, value: string) => void;
}

const groups = [
  { id: 'navigation', title: 'Header & navigation', description: 'Menu links and mobile navigation.' },
  { id: 'hero', title: 'Hero & ID card', description: 'Landing page introduction, buttons, portrait card, and tool labels.' },
  { id: 'work', title: 'Selected work', description: 'Work page heading, filters, and empty state.' },
  { id: 'about', title: 'About & contact', description: 'About page labels, experience, education, and contact section.' },
  { id: 'caseStudy', title: 'Project details', description: 'Case study navigation, metadata, buttons, and section labels.' },
  { id: 'caseStudyBlocks', title: 'Case study content labels', description: 'Labels used inside decision and comparison blocks.' }
];

const keyGroups: Record<string, string> = {
  navHome: 'navigation', navWork: 'navigation', navAbout: 'navigation', navContact: 'navigation', navMenuOpen: 'navigation', navMenuClose: 'navigation',
  heroFirstName: 'hero', heroLastName: 'hero', heroRole: 'hero', heroDescription: 'hero', heroAboutButton: 'hero', heroWorkButton: 'hero',
  idCardName: 'hero', idCardTopline: 'hero', idCardRole: 'hero', idCardMicroline: 'hero', idCardDescription: 'hero',
  orbitFigma: 'hero', orbitPhotoshop: 'hero', orbitIllustrator: 'hero', orbitPremiere: 'hero', orbitFramer: 'hero', orbitPhotoshopMark: 'hero', orbitIllustratorMark: 'hero', orbitPremiereMark: 'hero', orbitFramerMark: 'hero',
  workHeading: 'work', workDescription: 'work', filterAll: 'work', filterProduct: 'work', filterArchive: 'work', emptyProjectsHeading: 'work', emptyProjectsDescription: 'work', emptyProjectsButton: 'work',
  aboutHeading: 'about', aboutCaption: 'about', aboutNavAbout: 'about', aboutNavExperience: 'about', aboutNavEducation: 'about', downloadCv: 'about', behance: 'about', linkedIn: 'about', experienceHeading: 'about', educationHeading: 'about', currentLabel: 'about', connectHeading: 'about', footerEmail: 'about', footerResume: 'about',
  backToOverview: 'caseStudy', backToProjects: 'caseStudy', backToTop: 'caseStudy', viewNextProject: 'caseStudy', caseStudyLabel: 'caseStudy', roleLabel: 'caseStudy', durationLabel: 'caseStudy', deliverablesLabel: 'caseStudy', figmaButton: 'caseStudy', liveProjectButton: 'caseStudy', jumpTo: 'caseStudy', sectionsFallback: 'caseStudy',
  comparisonFirstAttempt: 'caseStudyBlocks', comparisonProblem: 'caseStudyBlocks', comparisonFix: 'caseStudyBlocks', comparisonLearning: 'caseStudyBlocks', decisionConstraint: 'caseStudyBlocks', decisionAction: 'caseStudyBlocks', decisionWhy: 'caseStudyBlocks'
};

const prettify = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());

export const SiteCopyEditor: React.FC<SiteCopyEditorProps> = ({ defaults, values, onChange }) => {
  const [activeGroup, setActiveGroup] = useState(groups[0].id);
  const [query, setQuery] = useState('');
  const active = groups.find((group) => group.id === activeGroup) || groups[0];
  const fields = useMemo(() => Object.entries(defaults).filter(([key, text]) => {
    const inGroup = keyGroups[key] === activeGroup;
    const searchText = `${prettify(key)} ${text}`.toLowerCase();
    return inGroup && (!query.trim() || searchText.includes(query.trim().toLowerCase()));
  }), [activeGroup, defaults, query]);
  const countByGroup = (groupId: string) => Object.keys(defaults).filter((key) => keyGroups[key] === groupId).length;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#12131a] overflow-hidden" aria-labelledby="site-copy-title">
      <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#f37021]">Public website</p>
          <h3 id="site-copy-title" className="mt-1 text-lg font-bold text-white">Text & labels</h3>
          <p className="mt-1 text-sm text-zinc-400">Choose a page area, then edit the words visitors see. Changes save automatically.</p>
        </div>
        <label className="relative block w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <span className="sr-only">Search text fields</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a label or phrase" className="w-full rounded-lg border border-white/10 bg-[#0d0e14] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#f37021]" />
        </label>
      </div>

      <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Text groups" className="flex gap-2 overflow-x-auto border-b border-white/10 p-3 md:flex-col md:border-b-0 md:border-r md:p-4">
          {groups.map((group) => (
            <button key={group.id} type="button" onClick={() => setActiveGroup(group.id)} aria-current={activeGroup === group.id ? 'page' : undefined} className={`flex shrink-0 items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors md:w-full ${activeGroup === group.id ? 'border-[#f37021]/40 bg-[#f37021]/10 text-white' : 'border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/5 hover:text-white'}`}>
              <span>{group.title}</span><span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">{countByGroup(group.id)}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
            <div><h4 className="font-semibold text-white">{active.title}</h4><p className="mt-1 text-xs text-zinc-400">{active.description}</p></div>
            <span className="text-xs text-zinc-500">{fields.length} {fields.length === 1 ? 'field' : 'fields'}</span>
          </div>
          {fields.length ? <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {fields.map(([key, defaultValue]) => {
              const value = values?.[key] ?? defaultValue;
              const longText = defaultValue.length > 72 || key.toLowerCase().includes('description');
              return <label key={key} className={longText ? 'xl:col-span-2' : ''}>
                <span className="mb-1.5 block text-xs font-semibold text-zinc-300">{prettify(key)}</span>
                {longText ? <textarea rows={3} value={value} onChange={(event) => onChange(key, event.target.value)} className="w-full resize-y rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2.5 text-sm text-white outline-none focus:border-[#f37021]" /> : <input type="text" value={value} onChange={(event) => onChange(key, event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2.5 text-sm text-white outline-none focus:border-[#f37021]" />}
              </label>;
            })}
          </div> : <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-400">No matching text in this group. Try another search.</div>}
        </div>
      </div>
    </section>
  );
};
