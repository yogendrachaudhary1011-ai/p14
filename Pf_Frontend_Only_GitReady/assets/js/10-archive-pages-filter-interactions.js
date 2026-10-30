
(function(){
  function pauseAll(){ window.__pausePlaceholderMedia?.(); }
  function initSddArchive(){
    const root=document.getElementById('sddToolsView'); if(!root) return;
    const buttons=[...root.querySelectorAll('[data-sddarchive-filter]')];
    const items=[...root.querySelectorAll('[data-sddarchive-item]')];
    const status=root.querySelector('[data-sddarchive-status]');
    const labels={all:'Showing all interface-system patterns.',brand:'Showing Actions & Navigation.',sales:'Showing Forms & Inputs.',print:'Showing Data & Status.',internal:'Showing States & Feedback.'};
    const setFilter=filter=>{
      buttons.forEach(button=>{const active=button.dataset.sddarchiveFilter===filter;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});
      items.forEach(item=>{const cats=(item.dataset.category||'').trim().split(/\s+/);item.classList.toggle('is-filtered',filter!=='all'&&!cats.includes(filter));});
      if(status) status.textContent=labels[filter]||labels.all;
      pauseAll();
    };
    buttons.forEach(button=>button.addEventListener('click',()=>setFilter(button.dataset.sddarchiveFilter)));
    setFilter('all');
  }
  initSddArchive();
})();
    