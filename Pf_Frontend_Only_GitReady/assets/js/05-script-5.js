
(function(){
  const root=document.getElementById('safariView');
  if(!root) return;

  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}
  }),{threshold:.12});
  root.querySelectorAll('[data-reveal]').forEach(el=>reveal.observe(el));

  const navLinks=[...root.querySelectorAll('.case-nav a')];
  const navObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting) navLinks.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')==='#'+entry.target.id));
  }),{rootMargin:'-38% 0px -50% 0px',threshold:.02});
  root.querySelectorAll('.case-section, .case-hero').forEach(el=>navObserver.observe(el));
})();
