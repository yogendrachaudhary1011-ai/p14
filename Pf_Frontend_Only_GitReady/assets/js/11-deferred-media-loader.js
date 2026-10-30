
(function(){
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const observers=new Map();
  const activeView=media=>{const view=media.closest('.page-view');return !view||!view.hidden;};
  const hasDeferredSource=video=>Boolean(video.dataset.mediaSrc||video.querySelector('source[data-src],source[data-media-src]'));
  const loadImage=image=>{
    if(image.dataset.mediaReady==='true') return Promise.resolve(image);
    const source=image.dataset.src||image.dataset.mediaSrc;
    if(!source){image.dataset.mediaReady='true';return Promise.resolve(image);}
    return new Promise(resolve=>{
      const done=()=>{image.dataset.mediaReady='true';resolve(image);};
      image.addEventListener('load',done,{once:true});
      image.addEventListener('error',done,{once:true});
      image.src=source;
      image.removeAttribute('data-src');
      image.removeAttribute('data-media-src');
    });
  };
  const loadVideo=video=>{
    if(video.dataset.mediaReady==='true') return Promise.resolve(video);
    if(!hasDeferredSource(video)){video.dataset.mediaReady='true';return Promise.resolve(video);}
    return new Promise(resolve=>{
      const done=()=>{video.dataset.mediaReady='true';resolve(video);};
      video.addEventListener('loadedmetadata',done,{once:true});
      video.addEventListener('error',done,{once:true});
      if(video.dataset.mediaSrc){video.src=video.dataset.mediaSrc;video.removeAttribute('data-media-src');}
      video.querySelectorAll('source[data-src],source[data-media-src]').forEach(source=>{
        source.src=source.dataset.src||source.dataset.mediaSrc;
        source.removeAttribute('data-src');source.removeAttribute('data-media-src');
      });
      video.preload='metadata';
      video.load();
    });
  };
  const hydrate=media=>media instanceof HTMLVideoElement?loadVideo(media):loadImage(media);
  window.__hydrateDeferredMedia=hydrate;
  const playAutoplay=video=>{
    if(video.dataset.autoplay==='true'&&activeView(video)&&!reduced){video.play?.().catch(()=>{});}
  };
  const observe=media=>{
    if(media.dataset.mediaLoad==='interaction') return;
    if(!('IntersectionObserver' in window)){hydrate(media).then(()=>{if(media instanceof HTMLVideoElement)playAutoplay(media);});return;}
    const type=media instanceof HTMLVideoElement?'video':'image';
    if(!observers.has(type)){
      observers.set(type,new IntersectionObserver(entries=>entries.forEach(entry=>{
        const node=entry.target;
        if(entry.isIntersecting&&activeView(node)){
          observers.get(type).unobserve(node);
          hydrate(node).then(()=>{if(node instanceof HTMLVideoElement)playAutoplay(node);});
        }
      }),{rootMargin:'360px 0px',threshold:.01}));
    }
    observers.get(type).observe(media);
  };
  const initialise=()=>{
    document.querySelectorAll('img[data-deferred-media],video[data-deferred-media]').forEach(observe);
  };
  const refresh=()=>{
    document.querySelectorAll('video[data-deferred-media][data-autoplay="true"]').forEach(video=>{
      if(!activeView(video)){video.pause?.();return;}
      observe(video);
    });
    document.querySelectorAll('img[data-deferred-media]').forEach(observe);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initialise,{once:true}); else initialise();
  window.addEventListener('portfolio:viewchange',refresh);
})();
