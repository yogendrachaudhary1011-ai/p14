
(function(){
  const addMaterialArrow=(node,className,label)=>{
    if(!node || node.querySelector(':scope > .'+className)) return;
    const icon=document.createElement('span');
    icon.className=`${className} material-symbols-rounded material-arrow-icon`;
    icon.textContent=label;
    icon.setAttribute('aria-hidden','true');
    node.appendChild(icon);
  };
  document.querySelectorAll('.waroong-journey-step:not(:last-child),.safari-flow-step:not(:last-child)').forEach(step=>addMaterialArrow(step,'material-flow-step-arrow','arrow_forward'));
  document.querySelectorAll('.safari-design-guardrails span').forEach(item=>{
    if(item.querySelector('.ph-guardrail-check')) return;
    const icon=document.createElement('i');
    icon.className='ph-guardrail-check ph-duotone ph-check';
    icon.setAttribute('aria-hidden','true');
    item.prepend(icon);
  });
})();
