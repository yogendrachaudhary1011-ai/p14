
(function(){
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const allReels=[...document.querySelectorAll('[data-placeholder-reel]')];

  function setPlaying(card, playing){
    if(!card) return;
    card.classList.toggle('is-playing',playing);
    const button=card.querySelector('[data-placeholder-play]');
    const label=card.querySelector('[data-placeholder-play-label]');
    if(button){
      button.setAttribute('aria-pressed',String(playing));
      button.setAttribute('aria-label',`${playing?'Pause':'Play'} ${card.querySelector('h3')?.textContent?.trim()||'video placeholder'}`);
    }
    if(label) label.textContent=playing?'Pause':'Play';
    const icon=button?.querySelector('.ph-duotone');
    if(icon){icon.className='ph-duotone '+(playing?'ph-pause':'ph-play');icon.setAttribute('aria-hidden','true');}
    const video=card.querySelector('video');
    if(video){
      if(playing){const play=()=>video.play?.().catch(()=>{});const hydrated=window.__hydrateDeferredMedia?.(video);if(hydrated?.then)hydrated.then(play);else play();}else { video.pause?.(); try{video.currentTime=0;}catch(_){} }
    }
  }
  function pauseAll(except){ allReels.forEach(card=>{if(card!==except) setPlaying(card,false);}); }
  window.__pausePlaceholderMedia=()=>pauseAll();

  allReels.forEach(card=>{
    const button=card.querySelector('[data-placeholder-play]');
    button?.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();
      const next=!card.classList.contains('is-playing');
      pauseAll(card);
      setPlaying(card,next);
    });
  });
  if('IntersectionObserver' in window){
    const reelObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting||entry.intersectionRatio<.48) setPlaying(entry.target,false);
    }),{threshold:[0,.48,.75]});
    allReels.forEach(card=>reelObserver.observe(card));
  }
  window.addEventListener('portfolio:viewchange',()=>pauseAll());

  function setCarousel(carousel,index){
    const rail=carousel.querySelector('.archive-carousel-rail');
    const slides=rail?[...rail.children]:[];
    if(!rail||!slides.length) return;
    const next=((index%slides.length)+slides.length)%slides.length;
    carousel.dataset.activeSlide=String(next);
    rail.style.transform=`translate3d(-${next*100}%,0,0)`;
  }
  document.querySelectorAll('[data-archive-carousel]').forEach(carousel=>{
    setCarousel(carousel,0);
    const stage=carousel.closest('.archive-carousel-stage,.archive-carousel-stage');
    stage?.querySelector('[data-archive-carousel-prev]')?.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();pauseAll();setCarousel(carousel,Number(carousel.dataset.activeSlide||0)-1);
    });
    stage?.querySelector('[data-archive-carousel-next]')?.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();pauseAll();setCarousel(carousel,Number(carousel.dataset.activeSlide||0)+1);
    });
  });

  const root=document.getElementById('sddToolsView');
  const modal=document.getElementById('archiveMediaModal');
  const preview=modal?.querySelector('[data-archive-modal-preview]');
  const modalTitle=modal?.querySelector('[data-archive-modal-title]');
  const modalText=modal?.querySelector('[data-archive-modal-text]');
  const modalType=modal?.querySelector('[data-archive-modal-type]');
  const modalFormat=modal?.querySelector('[data-archive-modal-format]');
  const modalKind=modal?.querySelector('[data-archive-modal-kind]');
  let lastTrigger=null;

  const openDetail=item=>{
    if(!modal||!preview) return;
    pauseAll();
    lastTrigger=item;
    const stage=item.querySelector('.archive-work-stage,.archive-doc-visual');
    const title=item.querySelector('.archive-work-copy h3,.archive-doc-copy h3,figcaption span:first-child')?.textContent?.trim()||'Archive media';
    const copy=item.querySelector('.archive-work-copy p,.archive-doc-copy p')?.textContent?.trim()||'Media placeholder.';
    const type=item.querySelector('.archive-work-copy > span,.archive-doc-copy > span,figcaption span:last-child')?.textContent?.trim()||'Archive media';
    const format=item.querySelector('.archive-media-note')?.textContent?.trim()||'Media placeholder';
    const kind=(item.dataset.mediaKind||'media').replace(/\b\w/g,letter=>letter.toUpperCase());
    const cloned=stage?.cloneNode(true);
    if(cloned){
      cloned.querySelectorAll('button').forEach(button=>button.remove());
      cloned.querySelectorAll('.archive-media-arrow').forEach(arrow=>arrow.remove());
      preview.replaceChildren(cloned);
    }else preview.textContent='Media preview';
    if(modalTitle) modalTitle.textContent=title;
    if(modalText) modalText.textContent=copy;
    if(modalType) modalType.textContent=type;
    if(modalFormat) modalFormat.textContent=format;
    if(modalKind) modalKind.textContent=`${kind} preview`;
    if(typeof modal.showModal==='function') modal.showModal(); else modal.setAttribute('open','');
    modal.querySelector('[data-archive-modal-close]')?.focus();
  };
  const closeDetail=()=>{ if(!modal)return;modal.close?.();modal.removeAttribute('open');lastTrigger?.focus?.(); };
  root?.querySelectorAll('[data-archive-media]').forEach(item=>{
    item.addEventListener('click',event=>{
      if(event.target.closest('[data-archive-carousel-prev],[data-archive-carousel-next],[data-placeholder-play]')) return;
      openDetail(item);
    });
    item.addEventListener('keydown',event=>{
      if(event.target.closest('button')) return;
      if(event.key==='Enter'||event.key===' '){event.preventDefault();openDetail(item);}
    });
  });
  modal?.querySelector('[data-archive-modal-close]')?.addEventListener('click',closeDetail);
  modal?.addEventListener('click',event=>{if(event.target===modal)closeDetail();});
  modal?.addEventListener('cancel',event=>{event.preventDefault();closeDetail();});

  // Dramatic, low-contrast entrance for every media placeholder on detail pages.
  const mediaSelectors=[
    '.work-hero-media','.case-hero-media','.sdd-hero-media','.eg-hero-media','.pti-visual-frame','.sddweb-live-placeholder','.archive-work-stage',
    '.personal-content-card','.personal-photo','.archive-doc-card','.archive-doc-photo',
    '.case-media','.case-visual','.prototype-canvas','.screen'
  ].join(',');
  const mediaNodes=[...document.querySelectorAll('.page-view[data-page]:not([data-page="home"]) '+mediaSelectors)];
  const unique=[];
  mediaNodes.forEach(node=>{ if(!unique.some(parent=>parent.contains(node))) unique.push(node); });
  const show=node=>node.classList.add('is-media-visible');
  if(reduce||!('IntersectionObserver' in window)) unique.forEach(show);
  else{
    const mediaObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){show(entry.target);mediaObserver.unobserve(entry.target);}
    }),{threshold:.14,rootMargin:'0px 0px -6% 0px'});
    unique.forEach((node,index)=>{node.classList.add('media-reveal');node.style.setProperty('--media-delay',`${Math.min((index%5)*65,260)}ms`);mediaObserver.observe(node);});
  }
})();
