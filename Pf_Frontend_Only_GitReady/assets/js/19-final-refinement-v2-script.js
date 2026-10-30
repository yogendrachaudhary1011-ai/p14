
(function(){
  'use strict';
  const ease = 'transform .68s cubic-bezier(.16,1,.3,1)';
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function slidesFor(viewport){
    return Array.from(viewport.querySelectorAll(':scope > .archive-carousel-rail > .archive-carousel-slide, :scope > .archive-carousel-rail > .archive-carousel-slide'));
  }
  function setSlide(viewport, index, animate){
    const rail = viewport.querySelector(':scope > .archive-carousel-rail, :scope > .archive-carousel-rail');
    const slides = slidesFor(viewport);
    if(!rail || !slides.length) return;
    const total = slides.length;
    const safeIndex = ((index % total) + total) % total;
    viewport.dataset.refinedIndex = String(safeIndex);
    rail.style.transition = (animate === false || reduced) ? 'none' : ease;
    rail.style.transform = 'translate3d(-' + (safeIndex * 100) + '%,0,0)';
    slides.forEach((slide, slideIndex) => slide.setAttribute('aria-hidden', slideIndex === safeIndex ? 'false' : 'true'));
  }
  function currentSlide(viewport){ return Number(viewport.dataset.refinedIndex || 0); }

  document.querySelectorAll('[data-archive-carousel]').forEach((viewport) => {
    const isArchive = viewport.hasAttribute('data-archive-carousel');
    const stage = isArchive ? viewport.closest('.archive-carousel-stage') : viewport.closest('.archive-carousel-stage');
    const prev = stage && stage.querySelector('[data-refined-carousel-prev]');
    const next = stage && stage.querySelector('[data-refined-carousel-next]');
    const rail = viewport.querySelector(':scope > .archive-carousel-rail, :scope > .archive-carousel-rail');
    const slides = slidesFor(viewport);
    if(!stage || !rail || slides.length < 2) return;
    setSlide(viewport, 0, false);
    const step = (delta) => setSlide(viewport, currentSlide(viewport) + delta, true);
    prev && prev.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); step(-1); });
    next && next.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); step(1); });
    viewport.tabIndex = 0;
    viewport.addEventListener('keydown', (event) => {
      if(event.key === 'ArrowLeft'){ event.preventDefault(); step(-1); }
      if(event.key === 'ArrowRight'){ event.preventDefault(); step(1); }
    });
    let pointer = null;
    viewport.addEventListener('pointerdown', (event) => {
      if(event.pointerType === 'mouse' && event.button !== 0) return;
      pointer = { id:event.pointerId, startX:event.clientX, startY:event.clientY, index:currentSlide(viewport), horizontal:false };
      viewport.setPointerCapture && viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-dragging');
      rail.style.setProperty('transition', 'none', 'important');
    });
    viewport.addEventListener('pointermove', (event) => {
      if(!pointer || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.startX;
      const dy = event.clientY - pointer.startY;
      if(!pointer.horizontal && Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy)) pointer.horizontal = true;
      if(!pointer.horizontal) return;
      const width = Math.max(viewport.clientWidth, 1);
      const percentage = (dx / width) * 100;
      rail.style.transform = 'translate3d(calc(-' + (pointer.index * 100) + '% + ' + percentage + '%),0,0)';
    });
    const completePointer = (event) => {
      if(!pointer || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.startX;
      const threshold = Math.max(42, viewport.clientWidth * .16);
      const index = pointer.index;
      const horizontal = pointer.horizontal;
      pointer = null;
      viewport.classList.remove('is-dragging');
      if(horizontal && Math.abs(dx) >= threshold) setSlide(viewport, index + (dx < 0 ? 1 : -1), true);
      else setSlide(viewport, index, true);
    };
    viewport.addEventListener('pointerup', completePointer);
    viewport.addEventListener('pointercancel', completePointer);
  });

  // Documentation and photo focus state is class-driven for smooth, broad browser support.
  function installFocus(grid, itemSelector){
    if(!grid) return;
    const clear = () => {
      grid.classList.remove('has-media-focus');
      grid.querySelectorAll(itemSelector).forEach(item => item.classList.remove('is-focused'));
    };
    grid.addEventListener('pointerover', (event) => {
      const item = event.target.closest(itemSelector);
      if(!item || !grid.contains(item)) return;
      grid.classList.add('has-media-focus');
      grid.querySelectorAll(itemSelector).forEach(node => node.classList.toggle('is-focused', node === item));
    });
    grid.addEventListener('pointerout', (event) => {
      const item = event.target.closest(itemSelector);
      if(!item) return;
      const next = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest(itemSelector) : null;
      if(next && grid.contains(next)) return;
      clear();
    });
    grid.addEventListener('focusin', (event) => {
      const item = event.target.closest(itemSelector);
      if(!item) return;
      grid.classList.add('has-media-focus');
      grid.querySelectorAll(itemSelector).forEach(node => node.classList.toggle('is-focused', node === item));
    });
    grid.addEventListener('focusout', (event) => { if(!grid.contains(event.relatedTarget)) clear(); });
  }
  installFocus(document.querySelector('#sddToolsView .archive-documentation-grid'), '.archive-doc-card');
  installFocus(document.querySelector('#sddToolsView .archive-documentation-photo-grid'), '.archive-doc-photo');
  installFocus(document.querySelector('#photography-works .personal-photo-grid-real'), '.personal-photo');

  // SDD and personal reels: source is loaded before first play; one clip plays at a time.
  const reelCards = Array.from(document.querySelectorAll('[data-portfolio-reel]'));
  function iconFor(card){ return card.querySelector('[data-portfolio-reel-icon]'); }
  function labelFor(card){ return card.querySelector('[data-portfolio-reel-label]'); }
  function titleFor(card){ return card.getAttribute('data-video-title') || 'video'; }
  function renderReelState(card, isPlaying){
    const title = titleFor(card);
    const control = card.querySelector('[data-portfolio-reel-control]');
    const icon = iconFor(card);
    const label = labelFor(card);
    if(icon) icon.textContent = isPlaying ? 'pause' : 'play_arrow';
    if(label) label.textContent = (isPlaying ? 'Pause ' : 'Play ') + title;
    if(control){ control.setAttribute('aria-label', (isPlaying ? 'Pause ' : 'Play ') + title); control.setAttribute('title', (isPlaying ? 'Pause ' : 'Play ') + title); }
    card.classList.toggle('is-playing', isPlaying);
  }
  function ensureSource(video){
    const source = video.querySelector('source');
    if(!source) return Promise.reject(new Error('Video source is missing'));
    if(!source.getAttribute('src') && source.dataset.src){
      source.setAttribute('src', source.dataset.src);
      source.removeAttribute('data-src');
      video.load();
    }
    if(video.readyState >= 2) return Promise.resolve();
    return new Promise((resolve) => {
      let done = false;
      const finish = () => { if(done) return; done = true; resolve(); };
      video.addEventListener('loadeddata', finish, {once:true});
      video.addEventListener('canplay', finish, {once:true});
      video.addEventListener('error', finish, {once:true});
      window.setTimeout(finish, 7000);
    });
  }
  function pauseCard(card, reset){
    const video = card.querySelector('video');
    if(!video) return;
    video.pause();
    if(reset){ try{ video.currentTime = 0; }catch(_){} }
    renderReelState(card, false);
  }
  reelCards.forEach((card) => {
    const video = card.querySelector('video');
    const control = card.querySelector('[data-portfolio-reel-control]');
    if(!video || !control) return;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    renderReelState(card, false);
    control.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if(!video.paused && !video.ended){ pauseCard(card, false); return; }
      reelCards.forEach(other => { if(other !== card) pauseCard(other, true); });
      try{
        await ensureSource(video);
        video.muted = true;
        await video.play();
        renderReelState(card, true);
      }catch(error){
        pauseCard(card, false);
        control.setAttribute('aria-label', 'Unable to play ' + titleFor(card));
      }
    });
    video.addEventListener('play', () => renderReelState(card, true));
    video.addEventListener('pause', () => renderReelState(card, false));
    video.addEventListener('ended', () => pauseCard(card, true));
  });
// Ensure every Explore card reflects the matching Homepage media instead of generic miniatures.
  document.querySelectorAll('.case-explore-card[data-route]').forEach((card) => {
    const route = card.getAttribute('data-route');
    if(!route) return;
    const homeCard = document.querySelector('#projectsGrid .project-card[data-route="' + route + '"]');
    const target = card.querySelector('.case-explore-thumb');
    const source = homeCard && homeCard.querySelector('.project-media');
    if(!target || !source) return;
    const frame = document.createElement('div');
    frame.className = 'homepage-project-thumb';
    Array.from(source.childNodes).forEach((node) => frame.appendChild(node.cloneNode(true)));
    frame.querySelectorAll('[data-media-src]').forEach((node) => {
      const uri = node.getAttribute('data-media-src');
      if(uri && !node.getAttribute('src')) node.setAttribute('src', uri);
      node.removeAttribute('data-media-src');
    });
    frame.querySelectorAll('img[data-src],video[data-src],source[data-src]').forEach((node) => {
      const uri = node.getAttribute('data-src');
      if(uri && !node.getAttribute('src')) node.setAttribute('src', uri);
      node.removeAttribute('data-src');
    });
    frame.querySelectorAll('video').forEach((video) => { video.muted = true; video.playsInline = true; video.preload = 'metadata'; });
    target.replaceChildren(frame);
  });
})();
