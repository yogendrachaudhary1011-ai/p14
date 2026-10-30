import { SiteSettings, Project, ExperienceItem, EducationItem } from '../types';

export const initialSiteSettings: SiteSettings = {
  siteTitle: 'Yogendra Chaudhary — UI/UX & Product Designer Portfolio',
  brandName: 'YOGENDRA',
  brandRole: 'PRODUCT DESIGNER',
  email: 'yogendrachaudhary2061@gmail.com',
  phone: '9843688407',
  location: 'Kathmandu, Nepal',
  availabilityText: 'Available for UI/UX and product design\nand collaboration.',
  availabilityStatus: 'Available',
  footerText: '© 2026 Yogendra Chaudhary',
  footerSubtitle: 'UI/UX & Product Designer / Nepal',
  resumeUrl: '/assets/Yogendra_Chaudhary_CV.pdf',
  seo: {
    title: 'Yogendra Chaudhary — UI/UX & Product Designer Portfolio',
    description: 'UI/UX and Product Designer creating clear software interfaces, reusable components, user-centered workflows, and implementation-ready product experiences.',
    canonicalUrl: 'https://yogendrach.vercel.app/',
    ogImage: '/og-rizka-portfolio.jpg',
    robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
  }
};

// All projects removed per permanent deletion request
export const initialProjects: Project[] = [];

export const initialExperience: ExperienceItem[] = [
  {
    id: 'exp-1',
    role: 'Junior UI/UX Designer',
    company: 'Aarawan Media & Tech · Kathmandu, Nepal',
    dates: 'Appointed after internship',
    duration: 'Progressed from internship',
    current: true,
    headline: 'Product design & development',
    description: 'I design and refine software product interfaces with a focus on clarity, usability, and consistent interaction patterns while collaborating with developers to support accurate implementation.',
    tags: [
      'UI Design',
      'User Flows',
      'Interaction Design',
      'Design Systems',
      'Usability Testing',
      'Workflow Design',
      'Developer Handoff',
      'Figma',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Cross-functional Collaboration'
    ],
    order: 1,
    visible: true
  },
  {
    id: 'exp-2',
    role: 'UI/UX Design Intern',
    company: 'Aarawan Media & Tech · Kathmandu, Nepal',
    dates: '14 Jun — 17 Sep 2026',
    duration: '3-month internship',
    current: false,
    headline: 'Assisted with usability testing, interface reviews, and refinements based on feedback.',
    description: 'Created reusable interface elements and collaborated with the product development team while supporting clear, usable software interfaces.',
    tags: [
      'Interface Reviews',
      'Reusable Components',
      'Usability Testing',
      'Product Collaboration',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Developer Handoff',
      'Cross-functional Collaboration'
    ],
    order: 2,
    visible: true
  }
];

export const initialEducation: EducationItem[] = [
  {
    id: 'edu-1',
    title: 'Bachelor of Business Studies',
    institution: 'Makawanpur Multiple Campus',
    location: 'Hetauda, Makawanpur',
    dates: '4th year · Running',
    status: 'Running',
    program: 'BBS',
    year: '4th',
    description: 'Current study in Business Studies alongside hands-on UI/UX product design practice.',
    tags: ['Business Studies', 'UI/UX Design', 'Product Design', 'Workflow Design', 'Usability Testing', 'Developer Collaboration', 'Figma', 'Adobe Illustrator'],
    order: 1,
    visible: true
  },
  {
    id: 'edu-2',
    title: 'Nepali · Bhojpuri',
    institution: 'English · Hindi',
    location: 'Nepal',
    dates: 'Languages',
    status: '04 listed',
    program: 'Communication',
    year: '4',
    description: 'Four languages listed in my CV alongside an ongoing Bachelor of Business Studies and hands-on UI/UX product work.',
    tags: ['Nepali', 'Bhojpuri', 'English', 'Hindi', 'Figma'],
    order: 2,
    visible: true
  }
];
