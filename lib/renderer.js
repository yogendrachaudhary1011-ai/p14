import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { db, doc, getDoc, collection, getDocs, query, orderBy, where } from './firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function safeContentUrl(value) {
  const url = String(value || '').trim();
  if (!url || /^(?:javascript|data|vbscript):/i.test(url)) return '';
  if (/^(?:https?:\/\/|mailto:|tel:|#|\/)/i.test(url)) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '';
  return `/${url.replace(/^\.\/+/, '')}`;
}

function paragraphs(value, className = '') {
  return String(value || '').split(/\n\s*\n/).map(part => part.trim()).filter(Boolean)
    .map(part => `<p${className ? ` class="${className}"` : ''}>${escapeHtml(part).replace(/\n/g, '<br/>')}</p>`).join('');
}

function themeStyleMarkup(settings) {
  const theme = settings.theme || {};
  const variables = {
    background: '--bg', surface: '--surface', text: '--text', accent: '--lime', accentAlt: '--orange'
  };
  let declarations = Object.entries(variables)
    .filter(([key]) => /^#[0-9a-f]{6}$/i.test(theme[key] || ''))
    .map(([key, variable]) => `${variable}:${theme[key]};`).join('');
  const fonts = {
    dmSans: '"DM Sans",Arial,sans-serif',
    inter: '"Inter",Arial,sans-serif',
    system: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
  };
  if (fonts[theme.fontFamily]) declarations += `--sans:${fonts[theme.fontFamily]};`;
  return declarations ? `<style id="cms-theme-overrides">:root{${declarations}}</style>` : '';
}

function applyTheme($, settings) {
  const markup = themeStyleMarkup(settings);
  if (markup) $('head').append(markup);
}

function applyCmsContentStyles($) {
  $('head').append(`<style id="cms-content-styles">
    .cms-content-section__grid{display:grid;grid-template-columns:1fr;gap:clamp(24px,5vw,72px);align-items:center}
    .cms-content-section__grid.has-image{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
    .cms-content-section__copy .display{margin:12px 0 18px}
    .cms-content-section__copy .lead{max-width:66ch;margin:0 0 16px;color:var(--muted);line-height:1.65}
    .cms-content-section__media img{width:100%;max-height:620px;object-fit:cover;border:1px solid var(--line);border-radius:8px}
    .cms-content-section__copy .button{margin-top:14px}
    @media(max-width:760px){.cms-content-section__grid.has-image{grid-template-columns:1fr}}
  </style>`);
}

function renderCustomSections(sections = []) {
  return sections.filter(section => section && section.visible !== false).map((section, index) => {
    const image = safeContentUrl(section.image);
    const buttonUrl = safeContentUrl(section.buttonLink);
    return `<section class="section cms-content-section" id="custom-content-${index + 1}"><div class="shell cms-content-section__grid${image ? ' has-image' : ''}">
      <div class="cms-content-section__copy">${section.eyebrow ? `<span class="eyebrow">${escapeHtml(section.eyebrow)}</span>` : ''}${section.title ? `<h2 class="display display-lg">${escapeHtml(section.title)}</h2>` : ''}${paragraphs(section.body, 'lead')}${section.buttonText && buttonUrl ? `<a class="button primary" href="${escapeHtml(buttonUrl)}">${escapeHtml(section.buttonText)} <span aria-hidden="true" class="material-symbols-rounded material-arrow-icon">arrow_outward</span></a>` : ''}</div>
      ${image ? `<div class="cms-content-section__media"><img src="${escapeHtml(image)}" alt="${escapeHtml(section.imageAlt || section.title || '')}" loading="lazy"/></div>` : ''}
    </div></section>`;
  }).join('');
}

function renderCaseStudySections(project) {
  const story = project.caseStudy || {};
  const fields = [
    ['Overview', story.overview || project.summary],
    ['Challenge', story.challenge],
    ['Approach', story.approach],
    ['Solution', story.solution],
    ['Outcomes', story.outcomes]
  ].filter(([, value]) => String(value || '').trim());
  const image = safeContentUrl(story.image);
  if (!fields.length && !image) return '';
  const sections = fields.map(([title, body]) => `<section class="case-section case-story-section cms-case-story-section"><div class="shell case-story-grid"><div class="case-story-head"><h2>${escapeHtml(title)}</h2></div><div class="case-story-content">${paragraphs(body, 'lead')}</div></div></section>`).join('');
  return `${sections}${image ? `<section class="case-section cms-case-story-image"><div class="shell"><img src="${escapeHtml(image)}" alt="${escapeHtml(project.title)} project image" loading="lazy" style="width:100%;border-radius:12px;"/></div></section>` : ''}`;
}

function applyHomeLayout($, homePage) {
  const preferences = homePage.sectionSettings || {};
  const sections = [
    { key: 'hero', selector: '#home', defaultOrder: 1 },
    { key: 'work', selector: '#work', defaultOrder: 2 },
    { key: 'about', selector: '#about', defaultOrder: 3 }
  ].map(item => ({ ...item, node: $(item.selector), preference: preferences[item.key] || {} }));
  for (const item of sections) {
    if (item.preference.visible === false) item.node.attr('hidden', 'hidden');
    else item.node.removeAttr('hidden');
  }
  const parent = sections[0].node.parent();
  if (parent.length && sections.every(item => item.node.parent().is(parent))) {
    sections.sort((a, b) => (Number(a.preference.order) || a.defaultOrder) - (Number(b.preference.order) || b.defaultOrder))
      .forEach(item => parent.append(item.node));
  }
  if (preferences.contact?.visible === false) $('#contact').attr('hidden', 'hidden');
  else $('#contact').removeAttr('hidden');
}

// In-memory published cache
let cachedSnapshot = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute auto-refresh or immediate invalidate

export function invalidateCache() {
  cachedSnapshot = null;
  lastCacheTime = 0;
  console.log('[Renderer] Cache invalidated.');
}

export async function getPublishedSnapshot(forceFresh = false) {
  const now = Date.now();
  if (!forceFresh && cachedSnapshot && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedSnapshot;
  }

  try {
    const [settingsSnap, homePageSnap, projectsSnap, expSnap, eduSnap, navSnap, socSnap] = await Promise.all([
      getDoc(doc(db, 'site_settings', 'general')),
      getDoc(doc(db, 'pages', 'home')),
      getDocs(query(collection(db, 'projects'), orderBy('order', 'asc'))),
      getDocs(query(collection(db, 'experience'), orderBy('order', 'asc'))),
      getDocs(query(collection(db, 'education'), orderBy('order', 'asc'))),
      getDocs(query(collection(db, 'navigation'), orderBy('order', 'asc'))),
      getDocs(query(collection(db, 'social_links'), orderBy('order', 'asc')))
    ]);

    const settings = settingsSnap.exists() ? settingsSnap.data() : {};
    const homePage = homePageSnap.exists() ? homePageSnap.data() : {};
    
    const projects = [];
    projectsSnap.forEach(d => {
      const data = d.data();
      if (data.status === 'published' || data.status === undefined) {
        projects.push({ id: d.id, ...data });
      }
    });

    const experience = [];
    expSnap.forEach(d => {
      const data = d.data();
      if (data.visible !== false) {
        experience.push({ id: d.id, ...data });
      }
    });

    const education = [];
    eduSnap.forEach(d => {
      const data = d.data();
      if (data.visible !== false) {
        education.push({ id: d.id, ...data });
      }
    });

    const navigation = [];
    navSnap.forEach(d => {
      const data = d.data();
      if (data.visible !== false) {
        navigation.push({ id: d.id, ...data });
      }
    });

    const socials = [];
    socSnap.forEach(d => {
      const data = d.data();
      if (data.visible !== false) {
        socials.push({ id: d.id, ...data });
      }
    });

    cachedSnapshot = {
      settings,
      homePage,
      projects,
      experience,
      education,
      navigation,
      socials
    };
    lastCacheTime = now;
    return cachedSnapshot;
  } catch (err) {
    console.warn('[Renderer] Firestore read error, using fallback or stale cache:', err.message);
    if (cachedSnapshot) return cachedSnapshot;
    return {
      settings: {},
      homePage: {},
      projects: [],
      experience: [],
      education: [],
      navigation: [],
      socials: []
    };
  }
}

/**
 * Server-side HTML binder: injects published Firestore data into the canonical static HTML
 */
export async function renderHtml(filePath, currentRoute = '/') {
  const fullPath = path.resolve(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Template not found: ${filePath}`);
  }

  const rawHtml = fs.readFileSync(fullPath, 'utf8');
  const snapshot = await getPublishedSnapshot();
  const { settings, homePage, projects, experience, education, navigation, socials } = snapshot;

  // Use cheerio to inject dynamic content without breaking markup or scripts
  const $ = cheerio.load(rawHtml, { decodeEntities: false });
  applyTheme($, settings);
  applyCmsContentStyles($);

  // 1. Meta / Head / SEO
  if (settings.siteTitle) {
    $('title').text(settings.siteTitle);
  }
  if (settings.seo?.description) {
    $('meta[name="description"]').attr('content', settings.seo.description);
  }
  if (settings.seo?.ogTitle || settings.siteTitle) {
    $('meta[property="og:title"]').attr('content', settings.seo?.ogTitle || settings.siteTitle);
    $('meta[name="twitter:title"]').attr('content', settings.seo?.ogTitle || settings.siteTitle);
  }
  if (settings.seo?.description) {
    $('meta[property="og:description"]').attr('content', settings.seo.description);
    $('meta[name="twitter:description"]').attr('content', settings.seo.description);
  }
  if (settings.seo?.ogImage) {
    $('meta[property="og:image"]').attr('content', settings.seo.ogImage);
    $('meta[name="twitter:image"]').attr('content', settings.seo.ogImage);
  }

  // 2. Header Brand & Availability
  if (settings.brandName || settings.brandRole) {
    $('.brand').each(function () {
      const bName = settings.brandName || 'YOGENDRA';
      const bRole = settings.brandRole || 'PRODUCT DESIGNER';
      const parts = bRole.split(' ');
      const role1 = parts[0] || 'PRODUCT';
      const role2 = parts.slice(1).join(' ') || 'DESIGNER';
      $(this).html(`${bName}<b>——</b><span class="brand-role">${role1}<span class="brand-role-gap">${role2}</span></span>`);
    });
  }

  if (settings.availabilityText) {
    const formattedAvail = settings.availabilityText.replace(/\n/g, '<br/>');
    $('.nav-availability span').html(formattedAvail);
    $('.mobile-availability').html(`<i aria-hidden="true"></i>${settings.availabilityText.replace(/\n/g, ' ')}`);
  }

  if (settings.email) {
    $('.nav-talk, .mobile-talk').attr('href', `mailto:${settings.email}`);
    $('.connect-fill-link').attr('href', `mailto:${settings.email}`);
  }
  if (settings.contactCtaUrl) $('.connect-fill-link').attr('href', safeContentUrl(settings.contactCtaUrl));
  if (settings.phone) $('a[href^="tel:"], .phone-link').attr('href', `tel:${settings.phone}`);
  if (settings.contactCtaText) $('.connect-fill-label').text(settings.contactCtaText);
  if (settings.contactButtonText) {
    $('.nav-talk, .mobile-talk').each(function () { $(this).contents().first().replaceWith(`${escapeHtml(settings.contactButtonText)} `); });
  }

  // 3. Navigation Links
  if (navigation && navigation.length > 0) {
    const navLinksHtml = navigation.map(n => 
      `<a data-static-route="${n.route}" href="${n.route === '/' ? '/' : n.route.replace(/^\//, '') + '.html'}">${n.label}</a>`
    ).join('\n');
    $('.nav-links').html(navLinksHtml);
  }

  // 4. Hero Section (Homepage / Projects page)
  if (homePage.heroKicker) {
    $('.hero-kicker').text(homePage.heroKicker);
  }
  if (homePage.heroNameFirst && homePage.heroNameLast) {
    $('.hero-title-line--name').html(
      `<span class="hero-name-word">${homePage.heroNameFirst}</span><span class="hero-name-word">${homePage.heroNameLast}</span>`
    );
  }
  if (homePage.heroSubtitle) {
    // e.g. UI/UX — PRODUCT DESIGNER
    const subParts = homePage.heroSubtitle.split('—');
    const partA = subParts[0] ? subParts[0].trim() : 'UI/UX';
    const partB = subParts[1] ? subParts[1].trim() : 'PRODUCT DESIGNER';
    const roleWords = partB.split(' ');
    const spanWords = roleWords.map(w => `<span>${w}</span>`).join('');
    $('.hero-title-line--two').html(`${partA} <i aria-hidden="true">—</i>`);
    $('.hero-title-line--three').html(`<b>${spanWords}</b>`);
  }
  if (homePage.heroCopy) {
    // Keep hero copy text
    const words = homePage.heroCopy.split(' ');
    let delay = 0.34;
    const wordSpans = words.map(w => {
      const span = `<span class="copy-word" style="--word-delay:${delay.toFixed(3)}s">${w}</span>`;
      delay += 0.055;
      return span;
    }).join(' ');
    $('#heroCopy').attr('aria-label', homePage.heroCopy).html(wordSpans);
  }

  // Hero Actions
  if (homePage.heroPrimaryBtnText) {
    $('.hero-actions .button.primary').html(
      `${homePage.heroPrimaryBtnText} <span aria-hidden="true" class="arrow material-symbols-rounded material-arrow-icon">south_east</span>`
    );
  }
  if (homePage.heroPrimaryBtnLink) $('.hero-actions .button.primary').attr('href', safeContentUrl(homePage.heroPrimaryBtnLink));
  if (homePage.heroSecondaryBtnText) {
    $('.hero-actions .button.secondary').html(
      `${homePage.heroSecondaryBtnText} <span aria-hidden="true" class="arrow material-symbols-rounded material-arrow-icon">south_east</span>`
    );
  }
  if (homePage.heroSecondaryBtnLink) $('.hero-actions .button.secondary').attr('href', safeContentUrl(homePage.heroSecondaryBtnLink));

  // ID Card
  if (homePage.idCard) {
    if (homePage.idCard.tag) $('.id-card-top span').text(homePage.idCard.tag);
    if (homePage.idCard.photo) {
      const profileImage = safeContentUrl(homePage.idCard.photo);
      $('.id-card-photo img').attr('src', profileImage).attr('data-media-src', profileImage);
    }
    if (homePage.idCard.name) {
      const nameParts = homePage.idCard.name.split(' ');
      $('.id-card-name').html(nameParts.join('<br/>'));
    }
    if (homePage.idCard.role) $('.id-card-role').text(homePage.idCard.role);
    if (homePage.idCard.micro) $('.id-card-micro').html(homePage.idCard.micro.replace(/\n/g, '<br/>'));
  }

  // 5. Work Section & Projects Grid
  if (homePage.workSection) {
    if (homePage.workSection.eyebrow) $('.work-top .eyebrow').text(homePage.workSection.eyebrow);
    if (homePage.workSection.title) $('.work-title').text(homePage.workSection.title);
    if (homePage.workSection.intro) $('.work-intro').text(homePage.workSection.intro);
  }

  if (projects && projects.length > 0 && $('#projectsGrid').length > 0) {
    let cardsHtml = '';
    for (const proj of projects) {
      const projectRoute = proj.route || `/${proj.slug}`;
      const href = /^https?:\/\//i.test(projectRoute) ? projectRoute : `/${String(projectRoute).replace(/^\/+|\/+$/g, '')}`;
      const cat = proj.category || 'product';
      const meta = proj.categoryLabel ? `${proj.categoryLabel} · ${proj.year || '2026'}` : `Case Study · ${proj.year || '2026'}`;
      const mediaNote = proj.mediaNote || 'Product design';
      const coverClass = proj.coverClass || `cover-${proj.slug}`;
      const coverImg = safeContentUrl(proj.coverImage || 'assets/media/home-media-03-d6c887bed8af.webp');

      cardsHtml += `
<article class="project" data-category="${cat}" data-reveal="">
<a aria-label="Open ${proj.title} case study" class="project-card" href="${href}">
<div class="project-media"><span class="media-note">${mediaNote}</span><span aria-hidden="true" class="media-action material-symbols-rounded material-arrow-icon">arrow_outward</span><img alt="${proj.title} interface preview" class="project-cover ${coverClass}" decoding="async" loading="lazy" src="${coverImg}"/></div>
<div class="project-copy"><div class="project-meta"><span>${meta}</span><span>${proj.year || '2026'}</span></div><h3>${proj.title}</h3><p><strong>${proj.summary || ''}</strong></p></div>
</a>
</article>`;
    }
    $('#projectsGrid').html(cardsHtml);
  }

  // 6. About Section
  if (homePage.aboutSection) {
    if (homePage.aboutSection.kicker) $('#about-profile .eyebrow').text(homePage.aboutSection.kicker);
    if (homePage.aboutSection.title) $('#about-profile h2').text(homePage.aboutSection.title);
    if (homePage.aboutSection.lead) $('#about-profile .lead').text(homePage.aboutSection.lead);
    if (homePage.aboutSection.videoSrc) {
      $('.about-visual-media').attr('data-media-src', safeContentUrl(homePage.aboutSection.videoSrc));
    }
    if (homePage.aboutSection.videoPoster) $('.about-visual-media').attr('poster', safeContentUrl(homePage.aboutSection.videoPoster));
    if (homePage.aboutSection.caption) $('.about-visual-caption').text(homePage.aboutSection.caption);
  }

  if (currentRoute === '/') {
    if (homePage.customSections?.length) {
      const customMarkup = renderCustomSections(homePage.customSections);
      if ($('#contact').length) $('#contact').before(customMarkup);
      else $('#homePage').append(customMarkup);
    }
    applyHomeLayout($, homePage);
  }

  // CV / Resume link
  if (settings.resumeUrl) {
    $('.about-cv-button').attr('href', settings.resumeUrl);
    $('.certificate-record-link').attr('href', settings.resumeUrl);
    $('a:contains("Resume"), .footer-socials a[href*="CV.pdf"]').attr('href', settings.resumeUrl);
  }

  // 7. Experience Timeline
  if (experience && experience.length > 0 && $('.about-timeline').length > 0) {
    const currentExp = experience.filter(e => e.current);
    const prevExp = experience.filter(e => !e.current);

    let timelineHtml = '';
    for (const exp of currentExp) {
      const tags = (exp.tags || []).map(t => `<span class="tag skill">${t}</span>`).join('');
      timelineHtml += `
<article class="timeline-item current">
<span class="timeline-present-label">CURRENT</span>
<span aria-hidden="true" class="timeline-present-pulse"></span>
<div class="timeline-meta">
<div class="timeline-date">${exp.dates || ''}</div>
<span aria-label="Employment duration" class="timeline-duration">${exp.duration || ''}</span>
</div>
<div class="timeline-title"><h3>${exp.role}</h3><span>${exp.company}</span></div>
<p class="timeline-desc"><b>${exp.headline || ''}</b>${exp.description || ''}</p>
<div class="tag-row">${tags}</div>
</article>`;
    }

    for (const exp of prevExp.slice(0, 1)) {
      const tags = (exp.tags || []).map(t => `<span class="tag skill">${t}</span>`).join('');
      timelineHtml += `
<article class="timeline-item">
<div class="timeline-meta">
<div class="timeline-date">${exp.dates || ''}</div>
<span aria-label="Employment duration" class="timeline-duration">${exp.duration || ''}</span>
</div>
<div class="timeline-title"><h3>${exp.role}</h3><span>${exp.company}</span></div>
<p class="timeline-desc"><b>${exp.headline || ''}</b>${exp.description || ''}</p>
<div class="tag-row">${tags}</div>
</article>`;
    }
    $('.about-timeline').html(timelineHtml);

    // Earlier experiences under details
    if (prevExp.length > 1) {
      let earlierHtml = '';
      for (const exp of prevExp.slice(1)) {
        const tags = (exp.tags || []).map(t => `<span class="tag skill">${t}</span>`).join('');
        earlierHtml += `
<article class="earlier-role">
<div><span class="timeline-date">${exp.dates || ''}</span><h4>${exp.role}</h4><p>${exp.company}</p></div>
<div class="tag-row">${tags}</div>
</article>`;
      }
      $('.earlier-experience-list').html(earlierHtml);
    }
  }

  // 8. Education & Languages
  if (education && education.length > 0 && $('.education-list').length > 0) {
    let eduHtml = '';
    for (const edu of education) {
      const tags = (edu.tags || []).map(t => `<span class="tag skill">${t}</span>`).join('');
      eduHtml += `
<article class="education-item">
<div class="education-date">${edu.dates || ''}</div>
<div class="education-content">
<div class="education-title"><h3>${edu.title}</h3><span>${edu.institution}</span></div>
<p>${edu.description || ''}</p>
<div class="education-achievement"><span>${edu.program || 'Program'}</span><strong><span class="education-score-label">${edu.status || ''}</span><span class="metric-count">${edu.year || ''}</span></strong></div>
<div class="tag-row">${tags}</div>
</div>
</article>`;
    }
    $('.education-list').html(eduHtml);
  }

  // 9. Footer
  if (settings.footerText || settings.footerSubtitle) {
    const fMeta = `<span>${settings.footerText || '© 2026 Yogendra Chaudhary'}</span><span>${settings.footerSubtitle || 'UI/UX & Product Designer / Nepal'}</span>`;
    $('.footer-meta, .case-footer-meta').html(fMeta);
  }

  const routeSlug = String(currentRoute || '').replace(/^\/+|\/+$/g, '');
  const currentProject = projects.find(project => project.slug === routeSlug);
  if (currentProject && $('.case-hero').length) {
    if (currentProject.title) {
      $('.case-hero h1').first().text(currentProject.title);
      $('.case-stage-label').first().text(`${currentProject.categoryLabel || 'Product Case Study'} · ${currentProject.year || ''}`.trim());
      $('title').text(`${currentProject.title} — ${settings.brandName || 'Portfolio'}`);
    }
    if (currentProject.summary) $('.case-hero .lead').first().text(currentProject.summary);
    if (currentProject.coverImage) {
      const coverImage = safeContentUrl(currentProject.coverImage);
      $('.case-hero picture source').removeAttr('srcset');
      $('.case-hero img.hero-asset-image, .case-hero picture img').first().attr('src', coverImage).attr('data-media-src', coverImage);
    }
    if (currentProject.caseStudy?.enabled) {
      const storyMarkup = renderCaseStudySections(currentProject);
      if (storyMarkup) {
        $('.case-main .case-nav, .case-main > section:not(.case-hero):not(.case-explore)').attr('hidden', 'hidden');
        const explore = $('.case-main .case-explore').first();
        if (explore.length) explore.before(storyMarkup);
        else $('.case-main').append(storyMarkup);
      }
    }
  }

  if (socials && socials.length > 0) {
    const socLinks = socials.map(s => 
      `<a aria-label="${s.label}" class="social-button" href="${s.url}" rel="noreferrer" target="_blank"><span>${s.label}</span></a>`
    ).join('\n');
    $('.footer-socials').html(socLinks);
  }

  return $.html();
}

/**
 * Render dynamic case study for newly created projects
 */
export async function renderDynamicCaseStudy(project) {
  const snapshot = await getPublishedSnapshot();
  const { settings, projects, navigation, socials } = snapshot;
  const roleParts = String(settings.brandRole || 'PRODUCT DESIGNER').split(' ');
  const navItems = navigation?.length ? navigation : [{ label: 'Work', route: '/projects' }, { label: 'About', route: '/about' }];
  const navLinksHtml = navItems.map(item => `<a data-static-route="${escapeHtml(item.route || '/')}" href="${escapeHtml(safeContentUrl(item.route || '/'))}">${escapeHtml(item.label)}</a>`).join('\n');
  const footerSocialsHtml = (socials || []).map(item => `<a aria-label="${escapeHtml(item.label)}" class="social-button" href="${escapeHtml(safeContentUrl(item.url))}" rel="noreferrer" target="_blank"><span>${escapeHtml(item.label)}</span></a>`).join('\n');

  // Render using existing design system structure
  const otherProjects = projects.filter(p => p.id !== project.id).slice(0, 2);
  const otherCardsHtml = otherProjects.map(p => `
    <a class="case-explore-card" href="/${escapeHtml(p.slug)}">
      <div aria-hidden="true" class="case-explore-thumb">
        <img alt="${escapeHtml(p.title)}" class="case-explore-project-image" src="${escapeHtml(safeContentUrl(p.coverImage || '/assets/media/home-media-03-d6c887bed8af.webp'))}"/>
      </div>
      <div class="case-explore-copy">
        <div>
          <span class="case-explore-type">${p.categoryLabel || 'Case Study'}</span>
          <h3>${p.title}</h3>
          <p>${p.summary || ''}</p>
        </div>
        <span aria-hidden="true" class="case-explore-arrow material-symbols-rounded material-arrow-icon">arrow_outward</span>
      </div>
    </a>
  `).join('');
  const storyMarkup = project.caseStudy?.enabled
    ? renderCaseStudySections(project)
    : `<section class="case-section case-story-section"><div class="shell case-story-grid"><div class="case-story-head"><h2>Overview</h2><p>Designed solution and workflows</p></div><div class="case-story-content"><p class="lead">${escapeHtml(project.summary || '')}</p>${project.coverImage ? `<div style="margin-top:2rem"><img src="${escapeHtml(project.coverImage)}" style="width:100%;border-radius:12px;border:1px solid rgba(255,255,255,0.1)" alt="${escapeHtml(project.title)}"/></div>` : ''}</div></div></section>`;

  return `<!DOCTYPE html>
<html class="portfolio-boot" lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width,initial-scale=1" name="viewport"/>
<meta content="${project.summary || ''}" name="description"/>
<meta content="Yogendra Chaudhary" name="author"/>
<title>${project.title} — Yogendra Chaudhary</title>
<link href="/assets/media/home-media-01-a8072a2c986d.png" rel="icon" sizes="192x192" type="image/png"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Inter:wght@300;400;700&display=swap" rel="stylesheet"/>
<link href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/duotone/style.css" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0,0&display=swap" rel="stylesheet"/>
<link href="/assets/site.css" rel="stylesheet"/>
${themeStyleMarkup(settings)}
<style id="cms-content-styles">.cms-content-section__grid{display:grid;grid-template-columns:1fr;gap:36px;align-items:center}.cms-content-section__grid.has-image{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.cms-content-section__copy .display{margin:12px 0 18px}.cms-content-section__copy .lead{max-width:66ch;color:var(--muted);line-height:1.65}.cms-content-section__media img{width:100%;max-height:620px;object-fit:cover;border:1px solid var(--line);border-radius:8px}@media(max-width:760px){.cms-content-section__grid.has-image{grid-template-columns:1fr}}</style>
</head>
<body class="portfolio-boot is-case-view">
<header class="header is-scrolled" id="siteHeader">
<nav aria-label="Main navigation" class="shell nav">
<a class="brand" data-static-route="/" href="/">${escapeHtml(settings.brandName || 'YOGENDRA')}<b>——</b><span class="brand-role">${escapeHtml(roleParts[0] || 'PRODUCT')}<span class="brand-role-gap">${escapeHtml(roleParts.slice(1).join(' ') || 'DESIGNER')}</span></span></a>
<div class="nav-links">${navLinksHtml}</div>
<div class="nav-actions">
<div aria-label="Availability status" class="nav-availability"><i aria-hidden="true"></i><span>${(settings.availabilityText || '').replace(/\n/g, '<br/>')}</span></div>
<a aria-label="Email Yogendra" class="nav-talk" href="mailto:${escapeHtml(settings.email || 'yogendrachaudhary2061@gmail.com')}">${escapeHtml(settings.contactButtonText || "Let's Talk")}<span aria-hidden="true" class="material-symbols-rounded material-arrow-icon">arrow_outward</span></a>
</div>
</nav>
</header>
<main id="siteContent">
<div class="case-main">
<div class="case-backbar"><div class="shell"><a class="case-back" href="/projects.html"><span aria-hidden="true" class="material-symbols-rounded material-arrow-icon">arrow_back</span> Back to Selected Work</a></div></div>
<section class="case-hero work-hero">
<div class="shell grid">
<div class="case-hero-copy">
<span class="case-stage-label">${project.categoryLabel || 'Product Case Study'} · ${project.year || '2026'}</span>
<h1>${project.title}</h1>
<p class="lead">${project.summary || ''}</p>
</div>
<dl class="case-hero-meta portfolio-hero-meta-grid">
<div><dt>Project</dt><dd>${project.title}</dd></div>
<div><dt>Role</dt><dd>UI/UX & Product Designer</dd></div>
<div><dt>Category</dt><dd>${project.category || 'Product Design'}</dd></div>
<div><dt>Year</dt><dd>${project.year || '2026'}</dd></div>
</dl>
</div>
</section>
${storyMarkup}
<section aria-labelledby="other-projects" class="case-explore">
<div class="shell">
<div class="case-explore-top">
<div><span class="eyebrow">Continue exploring</span><h2 id="other-projects">Explore other projects.</h2></div>
<a class="case-explore-home" href="/projects.html">All selected work <span aria-hidden="true" class="material-symbols-rounded material-arrow-icon">arrow_outward</span></a>
</div>
<div class="case-explore-grid">${otherCardsHtml}</div>
</div>
</section>
</div>
<footer class="case-footer">
<div class="shell case-footer-inner">
<div class="case-footer-meta"><span>${settings.footerText || '© 2026 Yogendra Chaudhary'}</span><span>${settings.footerSubtitle || 'UI/UX & Product Designer / Nepal'}</span></div>
<nav aria-label="Social channels" class="footer-socials">${footerSocialsHtml}</nav>
</div>
</footer>
</main>
</body>
</html>`;
}

