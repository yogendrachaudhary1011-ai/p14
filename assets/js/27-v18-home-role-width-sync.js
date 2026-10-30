

(() => {
  const syncHomeRoleWidth = () => {
    const home = document.querySelector('#homeView');
    const name = home?.querySelector('.hero-title-line--one');
    if (!home || !name) return;
    const width = Math.ceil(name.getBoundingClientRect().width);
    if (width > 0) home.style.setProperty('--home-name-line-width', width + 'px');
  };
  const run = () => requestAnimationFrame(() => requestAnimationFrame(syncHomeRoleWidth));
  if (document.fonts?.ready) document.fonts.ready.then(run);
  window.addEventListener('resize', run, {passive:true});
  window.addEventListener('orientationchange', run, {passive:true});
  document.addEventListener('DOMContentLoaded', run, {once:true});
  run();
})();

