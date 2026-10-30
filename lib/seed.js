import bcrypt from 'bcryptjs';
import { db, doc, getDoc, setDoc, writeBatch } from './firebase.js';

export async function seedDatabaseIfNeeded() {
  try {
    const markerRef = doc(db, 'system_metadata', 'init_state');
    const markerSnap = await getDoc(markerRef);

    if (markerSnap.exists() && markerSnap.data()?.initialized) {
      console.log('[Seed] Database is already initialized. Skipping seed to protect live data.');
      return false;
    }

    console.log('[Seed] Initializing database with exact current website data...');

    // 1. Initial Admin User
    const adminRef = doc(db, 'admin_users', 'zane-wick');
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('Zane@123', salt);
    await setDoc(adminRef, {
      username: 'Zane Wick',
      passwordHash,
      role: 'superadmin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 2. Global Site Settings
    const settingsRef = doc(db, 'site_settings', 'general');
    await setDoc(settingsRef, {
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
        ogImage: 'og-rizka-portfolio.jpg',
        robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
      },
      updatedAt: new Date().toISOString()
    });

    // 3. Home Page Content
    const homePageRef = doc(db, 'pages', 'home');
    await setDoc(homePageRef, {
      heroKicker: 'Portfolio / UI/UX & Product Design',
      heroNameFirst: 'YOGENDRA',
      heroNameLast: 'CHAUDHARY',
      heroSubtitle: 'UI/UX — PRODUCT DESIGNER',
      heroCopy: 'A UI/UX and Product Designer focused on intuitive software interfaces, reusable components, and user-centered workflows—turning complex product requirements into clear, usable experiences that people can navigate with confidence.',
      heroPrimaryBtnText: 'View Selected Work',
      heroPrimaryBtnLink: 'projects.html',
      heroSecondaryBtnText: 'Get to Know Me',
      heroSecondaryBtnLink: 'about.html',
      idCard: {
        name: 'Yogendra Chaudhary',
        role: 'Product Designer',
        tag: 'Design practice / 2026',
        photo: 'assets/media/home-media-02-c6ea6ce61d01.webp',
        micro: 'Flows → Interfaces → Products\nDesigning clear, usable product experiences.'
      },
      workSection: {
        eyebrow: 'Selected work',
        title: 'SELECTED WORK',
        intro: 'Selected product design work across business software, university web experiences, and service platforms.'
      },
      aboutSection: {
        kicker: 'About me',
        title: 'A UI/UX and Product Designer focused on clear software experiences.',
        lead: 'I design intuitive software interfaces, reusable UI components, and user-centered workflows. My process combines interaction design, usability testing, and close developer collaboration to make complex products easier to understand and use.',
        videoSrc: 'assets/media/home-media-10-7f38a3b02f4c.webm',
        videoPoster: 'assets/media/home-media-11-2c67061de865.webp',
        caption: 'Yogendra / flows → interfaces → products'
      },
      updatedAt: new Date().toISOString()
    });

    // 4. Projects (All 7 existing portfolio case studies)
    const initialProjects = [
      {
        id: 'waroong-app',
        title: 'Numira Accounting & Business Management Software',
        slug: 'waroong-app',
        category: 'product',
        categoryLabel: 'Product Case Study · Business Software',
        mediaNote: 'Business software / product design',
        coverImage: 'assets/media/home-media-03-d6c887bed8af.webp',
        coverClass: 'cover-waroong',
        year: '2026',
        order: 1,
        status: 'published',
        featured: true,
        summary: 'Party, purchase, accounting, profile, settings, sales, and quotation workflows in one structured platform.',
        route: '/waroong-app',
        customTemplate: 'waroong-app/index.html'
      },
      {
        id: 'taman-safari-digital-map',
        title: 'SOMTU Website',
        slug: 'taman-safari-digital-map',
        category: 'product',
        categoryLabel: 'Product Case Study · University Website',
        mediaNote: 'University website / responsive product design',
        coverImage: 'assets/media/home-media-04-f775f2921176.webp',
        coverClass: 'cover-safari',
        year: '2026',
        order: 2,
        status: 'published',
        featured: true,
        summary: '87 screens and 81 component variants across desktop and mobile for the School of Management, Tribhuvan University.',
        route: '/taman-safari-digital-map',
        customTemplate: 'taman-safari-digital-map/index.html'
      },
      {
        id: 'sdd-website-revamp',
        title: 'The Vedic Sewa',
        slug: 'sdd-website-revamp',
        category: 'product',
        categoryLabel: 'Product Case Study · Service Platform',
        mediaNote: 'Service platform / web & mobile',
        coverImage: 'assets/media/home-media-05-aa658763e66a.webp',
        coverClass: 'cover-sdd-web',
        year: '2026',
        order: 3,
        status: 'published',
        featured: true,
        summary: 'Booking, commerce, livestream, guru verification, messaging, and profile experiences across web and mobile.',
        route: '/sdd-website-revamp',
        customTemplate: 'sdd-website-revamp/index.html'
      },
      {
        id: 'enterprise-asset-maintenance',
        title: 'Workflow Design for Complex Software',
        slug: 'enterprise-asset-maintenance',
        category: 'product',
        categoryLabel: 'Design Practice · Workflow Design',
        mediaNote: 'Design practice / complex workflows',
        coverImage: 'assets/media/home-media-06-74dffd74e3b2.webp',
        coverClass: 'cover-enterprise',
        year: '2026',
        order: 4,
        status: 'published',
        featured: true,
        summary: 'Turning multi-step product requirements into clear, status-aware workflows and safer actions.',
        route: '/enterprise-asset-maintenance',
        customTemplate: 'enterprise-asset-maintenance/index.html'
      },
      {
        id: 'dana-study-case',
        title: 'Usability Testing & Iteration',
        slug: 'dana-study-case',
        category: 'product',
        categoryLabel: 'Design Practice · Usability Testing',
        mediaNote: 'Design practice / usability',
        coverImage: 'assets/media/home-media-07-86798e6a527e.webp',
        coverClass: 'cover-dana',
        year: '2026',
        order: 5,
        status: 'published',
        featured: true,
        summary: 'Using usability testing, interface reviews, and feedback to identify friction and refine product experiences.',
        route: '/dana-study-case',
        customTemplate: 'dana-study-case/index.html'
      },
      {
        id: 'sdd-marketing-archive',
        title: 'Reusable UI & Design Systems',
        slug: 'sdd-marketing-archive',
        category: 'archive',
        categoryLabel: 'Design Practice · Interface Systems',
        mediaNote: 'Design practice / reusable UI',
        coverImage: 'assets/media/home-media-08-9e38bea4f09c.webp',
        coverClass: 'cover-sdd-archive',
        year: '2026',
        order: 6,
        status: 'published',
        featured: false,
        summary: 'Reusable components, consistent interaction patterns, and structured UI foundations for scalable product work.',
        route: '/sdd-marketing-archive',
        customTemplate: 'sdd-marketing-archive/index.html'
      },
      {
        id: 'pti-brand-foundation',
        title: 'Developer Handoff & Collaboration',
        slug: 'pti-brand-foundation',
        category: 'archive',
        categoryLabel: 'Design Practice · Developer Handoff',
        mediaNote: 'Design practice / delivery',
        coverImage: 'assets/media/home-media-09-2fbc21a135bd.webp',
        coverClass: 'cover-pti',
        year: '2026',
        order: 7,
        status: 'published',
        featured: false,
        summary: 'Communicating design intent clearly so implementation stays consistent with the intended experience.',
        route: '/pti-brand-foundation',
        customTemplate: 'pti-brand-foundation/index.html'
      }
    ];

    for (const proj of initialProjects) {
      await setDoc(doc(db, 'projects', proj.id), {
        ...proj,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 5. Experience Timeline
    const initialExperience = [
      {
        id: 'exp-1',
        role: 'Junior UI/UX Designer',
        company: 'Aarawan Media & Tech · Kathmandu, Nepal',
        dates: 'Appointed after internship',
        duration: 'Progressed from internship',
        current: true,
        headline: 'Product design & development',
        description: 'I design and refine software product interfaces with a focus on clarity, usability, and consistent interaction patterns while collaborating with developers to support accurate implementation.',
        tags: ['UI Design', 'User Flows', 'Interaction Design', 'Design Systems', 'Usability Testing', 'Workflow Design', 'Developer Handoff', 'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Cross-functional Collaboration'],
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
        tags: ['Interface Reviews', 'Reusable Components', 'Usability Testing', 'Product Collaboration', 'Adobe Photoshop', 'Adobe Illustrator', 'Developer Handoff', 'Cross-functional Collaboration'],
        order: 2,
        visible: true
      },
      {
        id: 'exp-3',
        role: 'Product Design · Numira',
        company: 'Accounting & Business Management Software',
        dates: '2026',
        duration: 'Project',
        current: false,
        headline: 'Selected project work',
        description: 'Party, purchase, accounting, profile, and settings workflows.',
        tags: ['Business workflows', 'Status-aware actions', 'Figma', 'Developer handoff'],
        order: 3,
        visible: true
      },
      {
        id: 'exp-4',
        role: 'Product Design · SOMTU',
        company: 'School of Management, Tribhuvan University',
        dates: '2026',
        duration: 'Project',
        current: false,
        headline: 'Selected project work',
        description: 'Responsive web experience with guided registration journey.',
        tags: ['Responsive web', 'Registration flow', 'Figma', 'Developer handoff'],
        order: 4,
        visible: true
      }
    ];

    for (const exp of initialExperience) {
      await setDoc(doc(db, 'experience', exp.id), {
        ...exp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 6. Education & Languages
    const initialEducation = [
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

    for (const edu of initialEducation) {
      await setDoc(doc(db, 'education', edu.id), {
        ...edu,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 7. Navigation
    const initialNav = [
      { id: 'nav-1', label: 'Work', route: '/projects', staticRoute: '/projects', order: 1, visible: true, external: false },
      { id: 'nav-2', label: 'About', route: '/about', staticRoute: '/about', order: 2, visible: true, external: false }
    ];

    for (const item of initialNav) {
      await setDoc(doc(db, 'navigation', item.id), {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 8. Social Links
    const initialSocials = [
      { id: 'social-1', platform: 'Email', label: 'Email', url: 'mailto:yogendrachaudhary2061@gmail.com', order: 1, visible: true },
      { id: 'social-2', platform: 'Portfolio', label: 'Portfolio', url: 'https://yogendrach.vercel.app', order: 2, visible: true },
      { id: 'social-3', platform: 'Resume', label: 'Resume', url: '/assets/Yogendra_Chaudhary_CV.pdf', order: 3, visible: true },
      { id: 'social-4', platform: 'Phone', label: 'Phone', url: 'tel:9843688407', order: 4, visible: true },
      { id: 'social-5', platform: 'LinkedIn', label: 'LinkedIn', url: 'https://www.linkedin.com/in/yogendrach', order: 5, visible: true }
    ];

    for (const soc of initialSocials) {
      await setDoc(doc(db, 'social_links', soc.id), {
        ...soc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 9. Media library initial index
    const initialMedia = [
      { id: 'media-cv', name: 'Yogendra Chaudhary CV', url: '/assets/Yogendra_Chaudhary_CV.pdf', mimeType: 'application/pdf', category: 'documents', alt: 'Yogendra Chaudhary Curriculum Vitae' },
      { id: 'media-portrait', name: 'Profile Portrait (ID Card)', url: 'assets/media/home-media-02-c6ea6ce61d01.webp', mimeType: 'image/webp', category: 'portrait', alt: 'Yogendra Chaudhary Profile portrait' },
      { id: 'media-waroong-cover', name: 'Numira Cover', url: 'assets/media/home-media-03-d6c887bed8af.webp', mimeType: 'image/webp', category: 'projects', alt: 'Numira product interface preview' },
      { id: 'media-safari-cover', name: 'SOMTU Cover', url: 'assets/media/home-media-04-f775f2921176.webp', mimeType: 'image/webp', category: 'projects', alt: 'SOMTU responsive website interface preview' },
      { id: 'media-sdd-web-cover', name: 'The Vedic Sewa Cover', url: 'assets/media/home-media-05-aa658763e66a.webp', mimeType: 'image/webp', category: 'projects', alt: 'The Vedic Sewa service-platform preview' },
      { id: 'media-enterprise-cover', name: 'Enterprise Workflow Cover', url: 'assets/media/home-media-06-74dffd74e3b2.webp', mimeType: 'image/webp', category: 'projects', alt: 'Enterprise operations dashboard' },
      { id: 'media-dana-cover', name: 'Usability Testing Cover', url: 'assets/media/home-media-07-86798e6a527e.webp', mimeType: 'image/webp', category: 'projects', alt: 'Usability testing and iteration preview' },
      { id: 'media-sdd-archive-cover', name: 'Reusable UI Cover', url: 'assets/media/home-media-08-9e38bea4f09c.webp', mimeType: 'image/webp', category: 'projects', alt: 'Reusable UI system visual' },
      { id: 'media-pti-cover', name: 'Developer Handoff Cover', url: 'assets/media/home-media-09-2fbc21a135bd.webp', mimeType: 'image/webp', category: 'projects', alt: 'Developer handoff reference visual' },
      { id: 'media-about-video', name: 'About Showcase Video', url: 'assets/media/home-media-10-7f38a3b02f4c.webm', mimeType: 'video/webm', category: 'video', alt: 'Yogendra product showcase reel' },
      { id: 'media-about-poster', name: 'About Video Poster', url: 'assets/media/home-media-11-2c67061de865.webp', mimeType: 'image/webp', category: 'poster', alt: 'About video poster' },
      { id: 'media-og', name: 'Open Graph Social Image', url: 'og-rizka-portfolio.jpg', mimeType: 'image/jpeg', category: 'seo', alt: 'Portfolio Open Graph preview card' }
    ];

    for (const m of initialMedia) {
      await setDoc(doc(db, 'media', m.id), {
        ...m,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 10. Finalize with marker
    await setDoc(markerRef, {
      initialized: true,
      schemaVersion: 1,
      seededAt: new Date().toISOString(),
      source: 'live_frontend_baseline'
    });

    console.log('[Seed] Database initialization complete!');
    return true;
  } catch (err) {
    console.error('[Seed] Database seed error:', err);
    throw err;
  }
}
