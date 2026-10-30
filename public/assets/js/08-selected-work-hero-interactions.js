
(function(){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-project-hero]').forEach(hero=>{
    if(reduced) return;
    hero.addEventListener('pointermove',event=>{
      if(window.matchMedia('(hover: none)').matches) return;
      const rect=hero.getBoundingClientRect();
      const x=((event.clientX-rect.left)/rect.width-.5)*10;
      const y=((event.clientY-rect.top)/rect.height-.5)*7;
      hero.style.setProperty('--work-hero-x',x.toFixed(2)+'px');
      hero.style.setProperty('--work-hero-y',y.toFixed(2)+'px');
    });
    hero.addEventListener('pointerleave',()=>{
      hero.style.setProperty('--work-hero-x','0px');
      hero.style.setProperty('--work-hero-y','0px');
    });
  });
})();
