
(() => {
  'use strict';
  const root = document.getElementById('danaView');
  if(!root) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const nav = root.querySelector('[data-case-nav]');
  const links = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
  const sections = links.map(link => document.getElementById(link.getAttribute('href').slice(1))).filter(Boolean);
  let revealObserver = null;
  let spyObserver = null;

  function initialiseReveals(){
    const nodes = Array.from(root.querySelectorAll('[data-reveal]'));
    if(reduce || !('IntersectionObserver' in window)){
      nodes.forEach(node => node.classList.add('is-visible'));
      return;
    }
    if(revealObserver) return;
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
    nodes.forEach(node => revealObserver.observe(node));
  }

  function initialiseSectionSpy(){
    if(spyObserver || !sections.length || !('IntersectionObserver' in window)) return;
    spyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        const target = '#' + entry.target.id;
        links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === target));
      });
    }, {rootMargin:'-36% 0px -55% 0px', threshold:.02});
    sections.forEach(section => spyObserver.observe(section));
  }

  function refresh(){
    if(root.hidden) return;
    initialiseReveals();
    initialiseSectionSpy();
  }
  window.addEventListener('portfolio:viewchange', event => {
    if(event.detail?.view === 'dana') refresh();
  });
  if(!root.hidden) refresh();
})();
