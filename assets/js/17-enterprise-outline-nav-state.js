
(function(){
  const root=document.getElementById('enterpriseView');
  if(!root) return;
  const nav=root.querySelector('.enterprise-case-nav');
  if(!nav || !('IntersectionObserver' in window)) return;
  const links=[...nav.querySelectorAll('a[href^="#"]')];
  const sections=links.map(link=>document.getElementById((link.getAttribute('href')||'').slice(1))).filter(Boolean);
  if(!sections.length) return;
  let observer;
  const bind=()=>{
    if(observer) return;
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      links.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')===`#${entry.target.id}`));
    }),{rootMargin:'-34% 0px -55% 0px',threshold:.02});
    sections.forEach(section=>observer.observe(section));
  };
  window.addEventListener('portfolio:viewchange',()=>{if(!root.hidden) bind();});
  if(!root.hidden) bind();
})();
