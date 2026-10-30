
(function () {
  const root = document.getElementById('sddToolsView');
  const page = document.getElementById('sddToolsPage');
  if (!root || !page) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = page.querySelector('.sdd-hero');
  const revealNodes = [...page.querySelectorAll('[data-sdd-reveal]')];
  const navLinks = [...page.querySelectorAll('.sdd-case-nav a[href^="#"]')];
  const sectionNodes = navLinks.map((link) => document.getElementById(link.getAttribute('href').slice(1))).filter(Boolean);
  let revealObserver;
  let sectionObserver;

  function ensureReveal() {
    if (reduced) {
      revealNodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }
    if (revealObserver) return;
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  function ensureSectionSpy() {
    if (sectionObserver || !sectionNodes.length) return;
    sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-34% 0px -55% 0px', threshold: 0 });
    sectionNodes.forEach((section) => sectionObserver.observe(section));
  }

  function onViewChange() {
    if (root.hidden) return;
    ensureReveal();
    ensureSectionSpy();
  }

  window.addEventListener('portfolio:viewchange', onViewChange);
  if (!root.hidden) onViewChange();

  hero?.addEventListener('pointermove', (event) => {
    if (reduced || window.matchMedia('(hover: none)').matches) return;
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 7;
    hero.style.setProperty('--sdd-x', `${x.toFixed(2)}px`);
    hero.style.setProperty('--sdd-y', `${y.toFixed(2)}px`);
  });

  hero?.addEventListener('pointerleave', () => {
    hero.style.setProperty('--sdd-x', '0px');
    hero.style.setProperty('--sdd-y', '0px');
  });
})();
