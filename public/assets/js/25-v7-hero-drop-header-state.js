
(() => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const header = document.getElementById('siteHeader');
  const card = document.getElementById('idCardRoot');
  if (reduce || !header || !card) return;
  requestAnimationFrame(() => {
    header.classList.add('v7-card-drop-active');
    const clear = () => header.classList.remove('v7-card-drop-active');
    card.addEventListener('animationend', clear, {once:true});
    window.setTimeout(clear, 2100);
  });
})();
