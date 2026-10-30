
(function(){
  const root=document.getElementById('sddWebView');
  if(!root) return;
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const revealAll=()=>{
    const nodes=[...root.querySelectorAll('[data-sddweb-reveal]')];
    if(reduce||!('IntersectionObserver' in window)){nodes.forEach(node=>node.classList.add('is-visible'));return;}
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.12});
    nodes.forEach(node=>observer.observe(node));
  };
  const bindSpy=()=>{
    const links=[...root.querySelectorAll('.sddweb-case-nav a[href^="#"]')];
    const sections=links.map(link=>document.getElementById(link.getAttribute('href').slice(1))).filter(Boolean);
    if(!sections.length||!('IntersectionObserver' in window)) return;
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){links.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')==='#'+entry.target.id));}}),{rootMargin:'-35% 0px -54% 0px',threshold:.02});
    sections.forEach(section=>observer.observe(section));
  };
  const init=()=>{if(root.hidden)return;revealAll();bindSpy();};
  window.addEventListener('portfolio:viewchange',init); if(!root.hidden) init();
})();
        