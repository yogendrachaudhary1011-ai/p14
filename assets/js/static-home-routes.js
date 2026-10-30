
(() => {
  'use strict';
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const targets = {
    '/': 'home',
    '/projects': 'work',
    '/about': 'about',
    '/contact': 'contact'
  };

  const normalizedPath = () => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    return targets[path] ? path : '/';
  };

  function resetSelectedWork(){
    const grid = document.getElementById('projectsGrid');
    document.querySelectorAll('.project-ghost').forEach(node => node.remove());
    document.querySelectorAll('#homeView .filter').forEach(button => {
      const isAll = button.dataset.filter === 'all';
      button.classList.toggle('is-active', isAll);
      button.setAttribute('aria-pressed', String(isAll));
    });
    if(!grid) return;
    grid.dataset.activeFilter = 'all';
    grid.querySelectorAll('.project').forEach(card => {
      card.classList.remove('is-hidden');
      card.getAnimations?.().forEach(animation => animation.cancel());
    });
  }

  function setActiveNav(path){
    document.querySelectorAll('[data-static-route]').forEach(link => {
      const active = link.dataset.staticRoute === path;
      if(active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function scrollToRoute(path, behavior = 'auto'){
    const targetId = targets[path] || 'home';
    if(targetId === 'work') resetSelectedWork();
    const target = document.getElementById(targetId);
    if(!target) return;
    const root = document.documentElement;
    const body = document.body;
    const prevRoot = root.style.scrollBehavior;
    const prevBody = body.style.scrollBehavior;
    if(behavior === 'auto'){
      root.style.scrollBehavior = 'auto';
      body.style.scrollBehavior = 'auto';
    }
    target.scrollIntoView({behavior: reduceMotion ? 'auto' : behavior, block:'start'});
    if(behavior === 'auto'){
      requestAnimationFrame(() => {
        root.style.scrollBehavior = prevRoot;
        body.style.scrollBehavior = prevBody;
      });
    }
  }

  function applyRoute({behavior = 'auto'} = {}){
    const path = normalizedPath();
    setActiveNav(path);
    scrollToRoute(path, behavior);
  }

  document.querySelectorAll('a[data-static-route]').forEach(link => {
    link.addEventListener('click', event => {
      if(event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const path = link.dataset.staticRoute;
      if(!targets[path]) return;
      event.preventDefault();
      if(normalizedPath() !== path) history.pushState({route:path}, '', path);
      applyRoute({behavior:'smooth'});
    });
  });

  window.addEventListener('popstate', () => applyRoute({behavior:'smooth'}));

  // Direct visits render at the intended section without adding a hash or a duplicate URL.
  const directScroll = () => applyRoute({behavior:'auto'});
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => requestAnimationFrame(directScroll));
  }, {once:true});
  else requestAnimationFrame(() => requestAnimationFrame(directScroll));
  window.addEventListener('load', directScroll, {once:true});
})();
