
(function(){
  const root=document.getElementById('pilarView');
  const page=document.getElementById('pilarPage');
  if(!root || !page) return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero=page.querySelector('.pti-hero');
  const revealNodes=[...page.querySelectorAll('[data-pti-reveal]')];
  const navLinks=[...page.querySelectorAll('.pti-case-nav a[href^="#"]')];
  const sectionNodes=navLinks.map(link=>document.getElementById(link.getAttribute('href').slice(1))).filter(Boolean);
  let revealObserver;
  let sectionObserver;

  function ensureReveal(){
    if(reduced){revealNodes.forEach(node=>node.classList.add('is-visible'));return;}
    if(!revealObserver){
      revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}
      }),{threshold:.1});
      revealNodes.forEach(node=>revealObserver.observe(node));
    }
  }
  function ensureSectionSpy(){
    if(sectionObserver || !sectionNodes.length) return;
    sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const id=entry.target.id;
      navLinks.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')==='#'+id));
    }),{rootMargin:'-33% 0px -56% 0px',threshold:0});
    sectionNodes.forEach(section=>sectionObserver.observe(section));
  }
  function onViewChange(){
    if(root.hidden) return;
    ensureReveal();ensureSectionSpy();
  }
  window.addEventListener('portfolio:viewchange',onViewChange);
  if(!root.hidden) onViewChange();

  hero?.addEventListener('pointermove',event=>{
    if(reduced || window.matchMedia('(hover: none)').matches) return;
    const rect=hero.getBoundingClientRect();
    const x=((event.clientX-rect.left)/rect.width-.5)*10;
    const y=((event.clientY-rect.top)/rect.height-.5)*7;
    hero.style.setProperty('--pti-x',x.toFixed(2)+'px');
    hero.style.setProperty('--pti-y',y.toFixed(2)+'px');
  });
  hero?.addEventListener('pointerleave',()=>{hero.style.setProperty('--pti-x','0px');hero.style.setProperty('--pti-y','0px');});
})();
