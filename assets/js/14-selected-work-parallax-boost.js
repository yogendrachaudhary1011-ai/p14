
(function(){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced) return;
  const setups=[
    {selector:'[data-project-hero]',x:'--work-hero-x',y:'--work-hero-y'},
    {selector:'#sddToolsView .sdd-hero',x:'--sdd-x',y:'--sdd-y'},
    {selector:'#pilarView .pti-hero',x:'--pti-x',y:'--pti-y'},
    {selector:'#gatheringView .eg-hero',x:'--archive-hero-x',y:'--archive-hero-y'}
  ];
  setups.forEach(({selector,x,y})=>document.querySelectorAll(selector).forEach(hero=>{
    let raf=0,point=null;
    const update=()=>{
      raf=0;
      if(!point) return;
      const rect=hero.getBoundingClientRect();
      const px=((point.clientX-rect.left)/rect.width-.5)*12;
      const py=((point.clientY-rect.top)/rect.height-.5)*8.4;
      hero.style.setProperty(x,px.toFixed(2)+'px');
      hero.style.setProperty(y,py.toFixed(2)+'px');
    };
    hero.addEventListener('pointermove',event=>{
      if(window.matchMedia('(hover: none)').matches) return;
      point=event;
      if(!raf) raf=requestAnimationFrame(update);
    },{passive:true});
    hero.addEventListener('pointerleave',()=>{
      point=null;
      if(raf){cancelAnimationFrame(raf);raf=0;}
      hero.style.setProperty(x,'0px');
      hero.style.setProperty(y,'0px');
    });
  }));
})();
