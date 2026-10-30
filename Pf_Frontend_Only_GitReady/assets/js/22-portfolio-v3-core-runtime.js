
(() => {
  'use strict';
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const carouselStates = new Map();
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const $ = (selector, root=document) => root.querySelector(selector);

  const escapeHtml = value => String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  function wordMarkup(phrase, startDelay){
    return phrase.split(/\s+/).filter(Boolean).map((word, index) =>
      `<span class="copy-word" style="--word-delay:${(startDelay + index * .055).toFixed(3)}s">${escapeHtml(word)}</span>`
    ).join(' ');
  }

  function syncHomeHero(){
    const title = $('#homeView .hero-title');
    if(title){
      title.setAttribute('aria-label', 'Yogendra Chaudhary — UI/UX & Product Designer');
      title.innerHTML = [
        '<span class="hero-title-line hero-title-line--one hero-title-line--name portfolio-v3-title-line"><span class="hero-name-word">YOGENDRA</span></span>',
        '<span class="hero-title-line hero-title-line--two portfolio-v3-title-line">CHAUDHARY <span class="portfolio-v3-dash" aria-hidden="true"></span></span>',
        '<span class="hero-title-line hero-title-line--three portfolio-v3-title-line portfolio-v3-title-line--role"><span>PRODUCT</span><span>DESIGNER</span></span>'
      ].join('');
    }

    const copy = $('#homeView #heroCopy');
    if(!copy) return;
    const groups = [
      'A UI/UX and Product Designer',
      'focused on intuitive software interfaces and reusable components',
      '—turning complex product requirements into clear workflows',
      'and usable experiences people can navigate with confidence.'
    ];
    let delay = .34;
    copy.setAttribute('aria-label', groups.join(' '));
    copy.innerHTML = groups.map((group, index) => {
      const markup = wordMarkup(group, delay);
      delay += group.split(/\s+/).filter(Boolean).length * .055;
      return `<span class="highlight-phrase" tabindex="0" data-highlight-phrase="${index + 1}">${markup}</span>`;
    }).join(' ');
  }

  function slideOrder(slide, fallback){
    const explicit = Number(slide.dataset.slideOrder || slide.dataset.order || slide.dataset.slide || '');
    if(Number.isFinite(explicit) && explicit > 0) return explicit;
    const image = slide.querySelector('img');
    const text = `${image?.alt || ''} ${image?.dataset.filename || ''}`;
    const match = text.match(/(?:slide\s*|\b|_)(\d{1,2})(?:\b|_)/i);
    return match ? Number(match[1]) : fallback + 1;
  }

  function removeLegacyCarouselSurface(stage){
    $$('.archive-carousel-controls,.archive-carousel-button,.final-carousel-button,.v4-carousel-button,.portfolio-carousel-button,.v6-carousel-control,.portfolio-carousel-dots,.v6-carousel-dots,.portfolio-v3-carousel-control,.portfolio-v3-carousel-dots', stage).forEach(node => node.remove());
    stage.removeAttribute('data-final-carousel');
    stage.removeAttribute('data-portfolio-carousel');
    stage.removeAttribute('data-v6-carousel-ready');
  }

  function kindFor(stage){
    const title = $('h3', stage.closest('article'))?.textContent?.trim() || '';
    if(/instagram/i.test(title)) return 'instagram';
    if(/employee gathering/i.test(title)) return 'gathering';
    if(/golf/i.test(title)) return 'golf';
    return 'standard';
  }

  function makeControl(direction){
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `portfolio-v3-carousel-control portfolio-v3-carousel-control--${direction}`;
    button.dataset.portfolioV3CarouselControl = direction;
    button.setAttribute('aria-label', direction === 'next' ? 'Next slide' : 'Previous slide');
    button.innerHTML = `<span class="material-symbols-rounded" aria-hidden="true">${direction === 'next' ? 'chevron_right' : 'chevron_left'}</span>`;
    return button;
  }

  function layout(state, animate=false){
    const {viewport, rail, slides} = state;
    const width = Math.round(viewport.getBoundingClientRect().width || viewport.clientWidth || 0);
    if(width < 4) return false;
    rail.style.setProperty('width', `${width * slides.length}px`, 'important');
    rail.style.setProperty('height', '100%', 'important');
    slides.forEach((slide, index) => {
      slide.style.setProperty('flex', `0 0 ${width}px`, 'important');
      slide.style.setProperty('width', `${width}px`, 'important');
      slide.style.setProperty('min-width', `${width}px`, 'important');
      slide.style.setProperty('height', '100%', 'important');
      slide.style.setProperty('display', 'grid', 'important');
      slide.style.setProperty('visibility', 'visible', 'important');
      slide.style.setProperty('opacity', '1', 'important');
      slide.setAttribute('aria-hidden', String(index !== state.index));
    });
    rail.style.setProperty('transition', animate && !reduceMotion ? 'transform 620ms var(--ease)' : 'none', 'important');
    rail.style.setProperty('transform', `translate3d(${-state.index * width}px,0,0)`, 'important');
    viewport.dataset.carouselIndex = String(state.index);
    state.dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === state.index)));
    return true;
  }

  function move(state, target, animate=true, absolute=false){
    const total = state.slides.length;
    if(total < 2) return;
    const next = absolute ? target : state.index + target;
    state.index = ((next % total) + total) % total;
    layout(state, animate);
  }

  function cloneViewport(original){
    const clone = original.cloneNode(true);
    clone.removeAttribute('data-final-carousel');
    clone.removeAttribute('data-carousel-index');
    clone.removeAttribute('data-v6-carousel-index');
    clone.classList.remove('portfolio-carousel-viewport', 'v6-carousel-viewport');
    clone.classList.add('portfolio-v3-carousel-viewport');
    clone.dataset.portfolioV3Carousel = 'ready';
    clone.tabIndex = 0;
    const rail = $('.archive-carousel-rail', clone);
    if(rail){
      ['width','height','transform','transition','display','overflow','will-change'].forEach(property => rail.style.removeProperty(property));
      $$('.archive-carousel-slide', rail).forEach(slide => {
        ['display','flex','flex-basis','min-width','width','height','visibility','opacity','transform','transition'].forEach(property => slide.style.removeProperty(property));
      });
    }
    original.replaceWith(clone);
    return clone;
  }

  function mountCarousel(original){
    if(!original || original.dataset.portfolioV3Carousel === 'ready') return;
    const stage = original.closest('.archive-carousel-stage');
    const originalRail = $('.archive-carousel-rail', original);
    if(!stage || !originalRail) return;

    // Clone to discard every direct listener and inline transform created by older controllers.
    const viewport = cloneViewport(original);
    const rail = $('.archive-carousel-rail', viewport);
    if(!rail) return;
    const slides = $$('.archive-carousel-slide', rail)
      .map((slide, index) => ({slide, index, order:slideOrder(slide, index)}))
      .sort((a, b) => a.order - b.order || a.index - b.index)
      .map(item => item.slide);
    if(!slides.length) return;
    slides.forEach(slide => rail.appendChild(slide));

    removeLegacyCarouselSurface(stage);
    stage.classList.add('portfolio-v3-carousel-stage');
    stage.dataset.carouselKind = kindFor(stage);
    stage.dataset.portfolioV3Carousel = 'ready';
    viewport.setAttribute('aria-label', `${$('h3', stage.closest('article'))?.textContent?.trim() || 'Media'} carousel`);

    const state = {stage, viewport, rail, slides, index:0, dots:[], drag:null, resizeObserver:null};
    carouselStates.set(viewport, state);

    if(slides.length > 1){
      const prev = makeControl('prev');
      const next = makeControl('next');
      prev.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); move(state, -1, true); });
      next.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); move(state, 1, true); });
      stage.append(prev, next);

      const dots = document.createElement('div');
      dots.className = 'portfolio-v3-carousel-dots';
      dots.setAttribute('aria-label', 'Carousel slide selector');
      state.dots = slides.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'portfolio-v3-carousel-dot';
        dot.dataset.portfolioV3CarouselDot = String(index);
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); move(state, index, true, true); });
        dots.appendChild(dot);
        return dot;
      });
      stage.appendChild(dots);
    }

    // Archive cards formerly opened a modal. Carousel media now owns these interactions instead.
    viewport.addEventListener('click', event => event.stopPropagation());
    viewport.addEventListener('keydown', event => {
      if(event.key === 'ArrowLeft'){ event.preventDefault(); move(state, -1, true); }
      if(event.key === 'ArrowRight'){ event.preventDefault(); move(state, 1, true); }
    });
    viewport.addEventListener('pointerdown', event => {
      if(event.pointerType === 'mouse' && event.button !== 0) return;
      state.drag = {id:event.pointerId, startX:event.clientX, startY:event.clientY, startIndex:state.index, horizontal:false};
      viewport.setPointerCapture?.(event.pointerId);
      rail.style.setProperty('transition', 'none', 'important');
    });
    viewport.addEventListener('pointermove', event => {
      const drag = state.drag;
      if(!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if(!drag.horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) drag.horizontal = true;
      if(!drag.horizontal) return;
      event.preventDefault();
      const width = Math.max(1, Math.round(viewport.getBoundingClientRect().width || viewport.clientWidth || 1));
      rail.style.setProperty('transform', `translate3d(${-drag.startIndex * width + dx}px,0,0)`, 'important');
    }, {passive:false});
    const finishDrag = event => {
      const drag = state.drag;
      if(!drag || drag.id !== event.pointerId) return;
      state.drag = null;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const threshold = Math.max(38, (viewport.clientWidth || 0) * .16);
      if(drag.horizontal && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy)){
        move(state, drag.startIndex + (dx < 0 ? 1 : -1), true, true);
      }else{
        state.index = drag.startIndex;
        layout(state, true);
      }
    };
    viewport.addEventListener('pointerup', finishDrag);
    viewport.addEventListener('pointercancel', finishDrag);

    if('ResizeObserver' in window){
      state.resizeObserver = new ResizeObserver(() => layout(state, false));
      state.resizeObserver.observe(viewport);
    }
    layout(state, false);
  }

  function mountAllCarousels(){
    $$('[data-archive-carousel]').forEach(mountCarousel);
    requestAnimationFrame(() => carouselStates.forEach(state => layout(state, false)));
  }

  function refreshCarousels(){
    requestAnimationFrame(() => requestAnimationFrame(() => {
      carouselStates.forEach(state => layout(state, false));
    }));
  }

  function boot(){
    syncHomeHero();
    mountAllCarousels();
    window.addEventListener('portfolio:viewchange', refreshCarousels);
    window.addEventListener('resize', refreshCarousels, {passive:true});
    // Kept only for inspection in the final single-file build; it has no routing side effects.
    window.__portfolioV3CarouselAudit = () => Array.from(carouselStates.values()).map(state => ({
      title: $('h3', state.stage.closest('article'))?.textContent?.trim() || 'Media',
      slides: state.slides.length,
      index: state.index,
      mounted: state.viewport.isConnected
    }));
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
