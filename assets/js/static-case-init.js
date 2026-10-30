
(() => {
  'use strict';
  const root = document.querySelector('.page-view.route-entered');
  const view = root?.dataset?.page || 'case';
  document.body.classList.add('is-case-view');
  document.getElementById('siteHeader')?.classList.add('is-scrolled');
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('portfolio:viewchange', {detail:{view, target:location.hash.replace('#','')}}));
  });
})();
