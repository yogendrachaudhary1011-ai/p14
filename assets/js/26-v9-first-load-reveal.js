
(function(){
  const root=document.documentElement;
  const reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal=()=>{
    if(reduce){root.classList.remove('portfolio-boot');return;}
    requestAnimationFrame(()=>window.setTimeout(()=>root.classList.remove('portfolio-boot'),110));
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',reveal,{once:true});
  else reveal();
})();
