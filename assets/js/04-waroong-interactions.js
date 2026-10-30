
(function(){
  const root=document.getElementById('waroongView');
  if(!root) return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const roleData={
    sales:{title:'Business user',text:'Manages customers, suppliers, groups, levels, and everyday operational records.',scope:'Needs dense information to remain readable while status and next actions stay predictable.'},
    admin:{title:'Accounting user',text:'Reviews purchases, bills, payments, vouchers, and outstanding amounts.',scope:'Needs accounting changes to stay traceable and corrections to follow explicit rules such as reversal.'},
    driver:{title:'Administrator',text:'Manages fiscal years, migration, roles, subscription, sessions, and security-sensitive settings.',scope:'Needs irreversible actions to be deliberate, clearly explained, and difficult to trigger by accident.'}
  };
  const roleButtons=[...root.querySelectorAll('[data-waroong-role]')];
  const rolePanel=root.querySelector('#waroongRolePanel');
  const setRole=key=>{
    const data=roleData[key]; if(!data||!rolePanel) return;
    roleButtons.forEach(button=>{
      const active=button.dataset.waroongRole===key;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    rolePanel.innerHTML=`<div><span class="tiny">Selected role</span><h3>${data.title}</h3><p>${data.text}</p></div><p class="role-panel-scope">${data.scope}</p>`;
  };
  roleButtons.forEach(button=>button.addEventListener('click',()=>setRole(button.dataset.waroongRole)));

  const approachData={
    map:{label:'Checkpoint 01',title:'Map the workflows',text:'Map party, purchase, accounting, profile, and settings flows to understand dependencies, states, and action paths.'},
    tasks:{label:'Checkpoint 02',title:'Define states and actions',text:'Turn workflow rules into lists, details, forms, summaries, messages, and confirmation patterns that expose only valid next actions.'}
  };
  const approachButtons=[...root.querySelectorAll('[data-waroong-approach]')];
  const approachPanel=root.querySelector('#waroongApproachPanel');
  const setApproach=key=>{
    const data=approachData[key]; if(!data||!approachPanel) return;
    approachButtons.forEach(button=>{
      const active=button.dataset.waroongApproach===key;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-selected',String(active));
    });
    approachPanel.innerHTML=`<div><span class="detail-label">${data.label}</span><h3>${data.title}</h3><p>${data.text}</p></div><small>Each checkpoint shows how workflow logic becomes interface structure.</small>`;
  };
  approachButtons.forEach(button=>button.addEventListener('click',()=>setApproach(button.dataset.waroongApproach)));

  const nav=root.querySelector('.waroong-case-nav');
  const navLinks=nav?[...nav.querySelectorAll('a[href^="#waroong-"]')]:[];
  const sections=navLinks.map(link=>root.querySelector(link.getAttribute('href'))).filter(Boolean);
  const setNav=id=>navLinks.forEach(link=>{
    const active=link.getAttribute('href')===`#${id}`;
    link.classList.toggle('is-active',active);
    if(active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
  });
  const updateNav=()=>{
    if(root.hidden||!sections.length) return;
    const marker=Math.min(280,Math.max(130,window.innerHeight*.34));
    let current=null;
    sections.forEach(section=>{if(section.getBoundingClientRect().top<=marker) current=section;});
    setNav(current?current.id:'');
  };
  let scheduled=false;
  const requestUpdate=()=>{if(scheduled) return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;updateNav();});};
  window.addEventListener('scroll',requestUpdate,{passive:true});
  window.addEventListener('resize',requestUpdate,{passive:true});
  window.addEventListener('hashchange',()=>setTimeout(requestUpdate,0));
  navLinks.forEach(link=>link.addEventListener('click',()=>setTimeout(requestUpdate,250)));
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)) requestUpdate();},{rootMargin:'-30% 0px -55% 0px',threshold:0});
    sections.forEach(section=>observer.observe(section));
  }
  setTimeout(requestUpdate,0);
})();
