
(()=>{
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage=document.getElementById('idCardStage');
  const root=document.getElementById('idCardRoot');
  if(stage&&root&&!reduce&&!window.__v6HeroCardIntroDone){
    window.__v6HeroCardIntroDone=true;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      stage.classList.add('v6-card-intro');
      root.classList.add('v6-id-enter');
      root.addEventListener('animationend',()=>root.classList.remove('v6-id-enter'),{once:true});
    }));
  }

  const modal=document.getElementById('certificateModal');
  const opener=document.querySelector('[data-certificate-open]');
  const closer=modal?.querySelector('[data-certificate-close]');
  let lastFocus=null;
  const closeModal=()=>{
    if(!modal||modal.hidden)return;
    modal.hidden=true;
    document.body.classList.remove('v6-certificate-open');
    lastFocus?.focus?.();
  };
  opener?.addEventListener('click',()=>{
    if(!modal)return;
    lastFocus=document.activeElement;
    modal.hidden=false;
    document.body.classList.add('v6-certificate-open');
    closer?.focus();
  });
  closer?.addEventListener('click',closeModal);
  modal?.addEventListener('click',event=>{if(event.target===modal)closeModal();});
  window.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();});
})();
