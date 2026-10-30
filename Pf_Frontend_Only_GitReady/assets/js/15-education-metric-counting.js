
(function(){
  const metricSelector='.metric-count[data-count-value]';
  const metrics=Array.from(document.querySelectorAll(metricSelector));
  if(!metrics.length)return;

  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function format(value,decimals){
    return Number(value).toLocaleString('id-ID', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function finish(metric){
    const target=Number(metric.dataset.countValue);
    const decimals=Number(metric.dataset.countDecimals||0);
    metric.textContent=format(target,decimals);
    metric.dataset.counted='true';
  }

  function animate(metric){
    if(metric.dataset.counted==='true')return;
    const target=Number(metric.dataset.countValue);
    const decimals=Number(metric.dataset.countDecimals||0);
    if(!Number.isFinite(target)||reduced){finish(metric);return;}

    const duration=decimals ? 1050 : 900;
    const start=performance.now();
    metric.dataset.counted='true';

    function tick(now){
      const elapsed=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-elapsed,4);
      metric.textContent=format(target*eased,decimals);
      if(elapsed<1){
        requestAnimationFrame(tick);
      }else{
        finish(metric);
      }
    }
    requestAnimationFrame(tick);
  }

  metrics.forEach(metric=>{
    const decimals=Number(metric.dataset.countDecimals||0);
    metric.textContent=format(0,decimals);
  });

  if(reduced||!('IntersectionObserver' in window)){
    metrics.forEach(finish);
    return;
  }

  const groups=new Map();
  metrics.forEach(metric=>{
    const viewportTarget=metric.closest('.education-achievement')||metric;
    if(!groups.has(viewportTarget))groups.set(viewportTarget,[]);
    groups.get(viewportTarget).push(metric);
  });

  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      (groups.get(entry.target)||[]).forEach(animate);
      observer.unobserve(entry.target);
    });
  },{
    threshold:.16,
    rootMargin:'0px 0px -8% 0px'
  });

  groups.forEach((_,viewportTarget)=>observer.observe(viewportTarget));
})();
