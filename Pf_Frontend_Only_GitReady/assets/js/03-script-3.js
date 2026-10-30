
const homePage=document.getElementById('homePage');
const header=document.getElementById('siteHeader');
const progress=document.getElementById('progress');
const menu=document.getElementById('menu');
const mobileNav=document.getElementById('mobileNav');

    if(menu&&mobileNav){
      const setMobileMenu=(open)=>{
        mobileNav.classList.toggle('is-open',open);
        menu.classList.toggle('is-open',open);
        menu.setAttribute('aria-expanded',String(open));
        menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');
      };

      menu.addEventListener('click',()=>setMobileMenu(!mobileNav.classList.contains('is-open')));
      mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMobileMenu(false)));
      document.addEventListener('keydown',(event)=>{
        if(event.key==='Escape'&&mobileNav.classList.contains('is-open')){
          setMobileMenu(false);
          menu.focus();
        }
      });
      window.addEventListener('resize',()=>{
        if(window.innerWidth>860&&mobileNav.classList.contains('is-open'))setMobileMenu(false);
      });
    }

    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12});
    document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));

    /* Hero-only clarity, scroll, parallax, and elastic card interaction */
    const hero=document.querySelector('.hero');
    const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function updateHeroScroll(){
      if(!hero||homePage.hidden)return;
      const progress=Math.max(0,Math.min(1,window.scrollY/(hero.offsetHeight*.9)));
      hero.style.setProperty('--hero-scroll',progress.toFixed(3));
    }

    const aboutTimeline=document.querySelector('.about-timeline');
    const timelineItems=[...document.querySelectorAll('.about-timeline > .timeline-item')];
    function updateExperienceTimeline(){
      if(!aboutTimeline||homePage.hidden)return;

      const rect=aboutTimeline.getBoundingClientRect();
      const viewportHeight=window.innerHeight;
      const trackTop=11;
      const trackBottom=0;
      const trackHeight=Math.max(0,rect.height-trackTop-trackBottom);

      /* PRESENT is held as a finish state through the first readable Experience view.
         The line only begins to recede after the current role moves further upward
         than the visual hold line. */
      const headerHeight=(typeof header!=='undefined' && header)
        ? header.getBoundingClientRect().height
        : 72;
      const shrinkEndLine=Math.max(headerHeight+24,viewportHeight*.12);
      const fullHoldLine=Math.max(
        headerHeight+132,
        Math.min(viewportHeight*.27,220)
      );
      const presentPoint=rect.top+trackTop;
      const fillRatio=presentPoint>=fullHoldLine
        ? 1
        : Math.max(0,Math.min(1,(presentPoint-shrinkEndLine)/(fullHoldLine-shrinkEndLine)));
      const scrollProgress=trackHeight*fillRatio;

      aboutTimeline.style.setProperty('--timeline-progress',`${scrollProgress.toFixed(1)}px`);

      let activeIndex=-1;
      timelineItems.forEach((item,index)=>{
        const itemRect=item.getBoundingClientRect();
        const hasPassed=itemRect.top < viewportHeight*.9;
        item.classList.toggle('is-revealed',hasPassed);
        if(hasPassed)activeIndex=index;
      });
      timelineItems.forEach((item,index)=>item.classList.toggle('is-active',index===activeIndex));
    }

    const aboutStatus=[...document.querySelectorAll('[data-about-status]')];
    const aboutPanels=[...document.querySelectorAll('.about-panel[id]')];
    if(aboutStatus.length&&aboutPanels.length){
      const aboutObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){
          aboutStatus.forEach(status=>status.classList.toggle('is-active',status.dataset.aboutStatus===entry.target.id));
        }
      }),{rootMargin:'-30% 0px -55% 0px',threshold:.06});
      aboutPanels.forEach(panel=>aboutObserver.observe(panel));
    }

    document.querySelectorAll('[data-about-shortcut]').forEach(button=>button.addEventListener('click',()=>{
      const target=document.getElementById(button.dataset.aboutShortcut);
      if(target) target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
    }));

    function updateScroll(){
      header.classList.toggle('is-scrolled',window.scrollY>16);
      const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?window.scrollY/max*100:0)+'%';
      updateHeroScroll();
      updateExperienceTimeline();
    }

    const idStage=document.getElementById('idCardStage');
    const idRoot=document.getElementById('idCardRoot');
    const idCard=document.getElementById('idCard');
    const idAnchor=document.getElementById('idCardAnchor');
    const lanyard=document.getElementById('lanyard');
    const lanyardBody=document.getElementById('lanyardBody');
    const lanyardEdgeLeft=document.getElementById('lanyardEdgeLeft');
    const lanyardEdgeRight=document.getElementById('lanyardEdgeRight');
    const idCardStrap=document.querySelector('.id-card-strap');
    const stackOne=document.getElementById('stackCardOne');
    const stackTwo=document.getElementById('stackCardTwo');

    let cardState={
      x:-8,y:reduceMotion?0:-24,
      targetX:0,targetY:0,
      vx:reduceMotion?0:.04,vy:0,
      rotation:reduceMotion?0:-3,vr:0,
      dragging:false,started:false
    };
    let backOne={x:0,y:0,rotation:7},backTwo={x:0,y:0,rotation:-6};
    let pointerStart={x:0,y:0,cardX:0,cardY:0};
    let pointerVelocity={x:0,y:0};
    let lastPointerAt=0;
    let lastFrame=performance.now();
    let physicsFrame=null;

    function limits(){
      const mobile=window.matchMedia('(max-width: 620px)').matches;
      const tablet=window.matchMedia('(min-width: 621px) and (max-width: 860px)').matches;
      // V3: 130% of the original travel envelope. The lanyard remains connected
      // because the same constrained state drives both card and ribbon geometry.
      return mobile?{x:98.8,y:106.6,up:44.2}:tablet?{x:192.4,y:176.8,up:75.4}:{x:249.6,y:213.2,up:88.4};
    }
    function constrain(x,y){
      const lim=limits();
      const adjustedY=Math.max(-lim.up,Math.min(lim.y,y));
      const ratio=Math.sqrt((x*x)/(lim.x*lim.x)+(adjustedY*adjustedY)/(lim.y*lim.y));
      return ratio>1?{x:x/ratio,y:adjustedY/ratio}:{x,y:adjustedY};
    }
    function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
    function point(x,y){return {x,y};}
    function offsetPoint(p,n,amount){return point(p.x+n.x*amount,p.y+n.y*amount);}
    function cubicPath(a,c1,c2,b){return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;}

    function updateLanyard(){
      if(!idStage||!idCard||!idAnchor||!lanyard||!lanyardBody||!lanyardEdgeLeft||!lanyardEdgeRight)return;
      const stageRect=idStage.getBoundingClientRect();
      const anchorRect=idAnchor.getBoundingClientRect();
      const strapRect=(idCardStrap||idCard).getBoundingClientRect();
      if(!stageRect.width||!stageRect.height)return;

      /*
        The SVG itself starts far above the hero, rather than drawing a path
        with an invisible/undefined beginning inside the hero. Coordinates are
        shifted into that enlarged SVG canvas, then the parent stage is clipped
        precisely at the bottom edge of the navbar.
      */
      const overhangRaw=getComputedStyle(idStage).getPropertyValue('--lanyard-overhang');
      const svgOverhang=Math.max(420,parseFloat(overhangRaw)||620);
      const anchor=point(
        anchorRect.left+anchorRect.width/2-stageRect.left,
        anchorRect.top+anchorRect.height/2-stageRect.top+svgOverhang
      );
      const attach=point(
        strapRect.left+strapRect.width/2-stageRect.left,
        strapRect.top+1-stageRect.top+svgOverhang
      );
      const dx=attach.x-anchor.x;
      const dy=attach.y-anchor.y;
      const distance=Math.max(1,Math.hypot(dx,dy));
      const normal=point(-dy/distance,dx/distance);
      const cardWidth=idCard.getBoundingClientRect().width||260;
      const ribbonWidth=clamp(cardWidth*.088,16,23);
      const half=ribbonWidth*.5;

      /*
        The upper control point stays high and vertical so the visible ribbon
        enters cleanly from above the viewport. The lower half gains a soft,
        load-bearing curve that responds to the card's drag velocity.
      */
      const dragSway=clamp(
        (cardState.targetX-cardState.x)*.34 + cardState.vx*6.2,
        -56,56
      );
      const verticalMotion=clamp(cardState.vy*2.8,-24,24);
      const firstDrop=clamp(dy*.30,178,252);
      const returnLift=clamp(dy*.24,74,154);
      const c1=point(
        anchor.x+dx*.055-dragSway*.10,
        anchor.y+firstDrop
      );
      const c2=point(
        attach.x-dx*.23+dragSway,
        attach.y-returnLift+verticalMotion
      );

      const leftStart=offsetPoint(anchor,normal,half);
      const leftC1=offsetPoint(c1,normal,half);
      const leftC2=offsetPoint(c2,normal,half);
      const leftEnd=offsetPoint(attach,normal,half);
      const rightStart=offsetPoint(anchor,normal,-half);
      const rightC1=offsetPoint(c1,normal,-half);
      const rightC2=offsetPoint(c2,normal,-half);
      const rightEnd=offsetPoint(attach,normal,-half);
      const leftPath=cubicPath(leftStart,leftC1,leftC2,leftEnd);
      const rightPath=cubicPath(rightStart,rightC1,rightC2,rightEnd);
      const body=`${leftPath} L ${rightEnd.x.toFixed(2)} ${rightEnd.y.toFixed(2)} C ${rightC2.x.toFixed(2)} ${rightC2.y.toFixed(2)}, ${rightC1.x.toFixed(2)} ${rightC1.y.toFixed(2)}, ${rightStart.x.toFixed(2)} ${rightStart.y.toFixed(2)} Z`;

      lanyard.setAttribute('viewBox',`0 0 ${stageRect.width.toFixed(2)} ${(stageRect.height+svgOverhang).toFixed(2)}`);
      lanyardBody.setAttribute('d',body);
      lanyardEdgeLeft.setAttribute('d',leftPath);
      lanyardEdgeRight.setAttribute('d',rightPath);
      idStage.style.setProperty('--lanyard-width',`${ribbonWidth.toFixed(2)}px`);
    }

    function renderCard(){
      if(!idCard)return;
      idCard.style.transform=`translate3d(${cardState.x.toFixed(2)}px,${cardState.y.toFixed(2)}px,0) rotate(${cardState.rotation.toFixed(2)}deg)`;
      if(stackOne)stackOne.style.transform=`translate3d(${(backOne.x+17).toFixed(2)}px,${(backOne.y+14).toFixed(2)}px,0) rotate(${backOne.rotation.toFixed(2)}deg)`;
      if(stackTwo)stackTwo.style.transform=`translate3d(${(backTwo.x-13).toFixed(2)}px,${(backTwo.y+18).toFixed(2)}px,0) rotate(${backTwo.rotation.toFixed(2)}deg)`;
      updateLanyard();
    }

    function tick(now){
      const dt=Math.min(32,now-lastFrame)/16.6667;
      lastFrame=now;
      if(!reduceMotion){
        const spring=cardState.dragging?.22:(cardState.started?.062:.052);
        const damping=cardState.dragging?.70:(cardState.started?.79:.83);
        cardState.vx+=(cardState.targetX-cardState.x)*spring*dt;
        cardState.vy+=(cardState.targetY-cardState.y)*spring*dt;
        cardState.vx*=Math.pow(damping,dt);
        cardState.vy*=Math.pow(damping,dt);
        cardState.x+=cardState.vx*dt;
        cardState.y+=cardState.vy*dt;
        const targetRotation=clamp(cardState.x*.052+cardState.vx*.58+cardState.y*.008,-13,13);
        cardState.vr+=(targetRotation-cardState.rotation)*.095*dt;
        cardState.vr*=Math.pow(.72,dt);
        cardState.rotation+=cardState.vr*dt;
      }
      const foregroundFactor=cardState.dragging?.13:.09;
      backOne.x+=(cardState.x-backOne.x)*foregroundFactor;
      backOne.y+=(cardState.y-backOne.y)*foregroundFactor;
      backOne.rotation+=(cardState.rotation+7-backOne.rotation)*foregroundFactor;
      backTwo.x+=(cardState.x-backTwo.x)*.055;
      backTwo.y+=(cardState.y-backTwo.y)*.055;
      backTwo.rotation+=(cardState.rotation-6-backTwo.rotation)*.055;
      renderCard();
      physicsFrame=requestAnimationFrame(tick);
    }

    function beginCard(){
      if(!idStage||!idCard||reduceMotion){renderCard();updateLanyard();return;}
      idStage.classList.add('is-ready');
      setTimeout(()=>{cardState.started=true;},330);
      if(!physicsFrame){lastFrame=performance.now();physicsFrame=requestAnimationFrame(tick);}
    }
    function eventPoint(event){return {x:event.clientX,y:event.clientY};}
    function onCardDown(event){
      if(reduceMotion)return;
      cardState.dragging=true;
      idCard.classList.add('is-dragging');
      idCard.setPointerCapture?.(event.pointerId);
      const p=eventPoint(event);
      pointerStart={x:p.x,y:p.y,cardX:cardState.targetX,cardY:cardState.targetY};
      pointerVelocity={x:0,y:0};
      lastPointerAt=performance.now();
      event.preventDefault();
    }
    function onCardMove(event){
      if(!cardState.dragging)return;
      const p=eventPoint(event);
      const next=constrain(pointerStart.cardX+(p.x-pointerStart.x),pointerStart.cardY+(p.y-pointerStart.y));
      const now=performance.now();
      const elapsed=Math.max(8,now-lastPointerAt);
      pointerVelocity={x:(next.x-cardState.targetX)/elapsed*16.67,y:(next.y-cardState.targetY)/elapsed*16.67};
      lastPointerAt=now;
      cardState.targetX=next.x;
      cardState.targetY=next.y;
    }
    function onCardUp(event){
      if(!cardState.dragging)return;
      cardState.dragging=false;
      idCard.classList.remove('is-dragging');
      idCard.releasePointerCapture?.(event.pointerId);
      cardState.vx+=pointerVelocity.x*.34;
      cardState.vy+=pointerVelocity.y*.34;
      cardState.targetX=0;
      cardState.targetY=0;
    }
    if(idCard){
      idCard.addEventListener('pointerdown',onCardDown);
      idCard.addEventListener('pointermove',onCardMove);
      idCard.addEventListener('pointerup',onCardUp);
      idCard.addEventListener('pointercancel',onCardUp);
      idCard.addEventListener('lostpointercapture',onCardUp);
    }
    if(hero&&idRoot&&!reduceMotion){
      hero.addEventListener('pointermove',event=>{
        if(event.pointerType==='touch'||cardState.dragging)return;
        const r=hero.getBoundingClientRect();const nx=(event.clientX-r.left)/r.width-.5;const ny=(event.clientY-r.top)/r.height-.5;
        idRoot.style.setProperty('--parallax-x',`${(nx*10).toFixed(2)}px`);
        idRoot.style.setProperty('--parallax-y',`${(ny*8).toFixed(2)}px`);
      });
      hero.addEventListener('pointerleave',()=>{
        idRoot.style.setProperty('--parallax-x','0px');idRoot.style.setProperty('--parallax-y','0px');
      });
    }
    window.__portfolioReplayHome=()=>{
      if(reduceMotion||!homePage) return;
      const homeView=document.getElementById('homeView');
      if(!homeView) return;
      homeView.classList.add('home-restart');
      idStage?.classList.remove('is-ready');
      cardState.x=-8;cardState.y=-24;cardState.targetX=0;cardState.targetY=0;cardState.vx=.04;cardState.vy=0;cardState.rotation=-3;cardState.vr=0;cardState.started=false;
      renderCard();
      void homeView.offsetWidth;
      requestAnimationFrame(()=>{
        homeView.classList.remove('home-restart');
        idStage?.classList.add('is-ready');
        window.setTimeout(()=>{cardState.started=true;},330);
      });
    };

    if(document.readyState==='complete')beginCard();else window.addEventListener('load',beginCard,{once:true});
    window.addEventListener('resize',()=>{updateLanyard();updateHeroScroll();},{passive:true});
    window.addEventListener('scroll',updateScroll,{passive:true});window.addEventListener('resize',updateScroll);updateScroll();

    const projectsGrid=document.getElementById('projectsGrid');
    function makeExitGhost(card,rect){
      const ghost=card.cloneNode(true);
      ghost.classList.remove('is-hidden');
      ghost.classList.add('project-ghost');
      ghost.style.left=`${rect.left}px`;ghost.style.top=`${rect.top}px`;
      ghost.style.width=`${rect.width}px`;ghost.style.height=`${rect.height}px`;
      document.body.appendChild(ghost);
      const animation=ghost.animate([
        {opacity:1,transform:'translate3d(0,0,0) scale(1)',filter:'blur(0)'},
        {opacity:0,transform:'translate3d(0,-4px,0) scale(.982)',filter:'blur(3px)'}
      ],{duration:320,easing:'cubic-bezier(.22,.82,.24,1)',fill:'forwards'});
      animation.finished.finally(()=>ghost.remove());
    }
    function filterProjects(key){
      if(!projectsGrid) return;
      const cards=[...projectsGrid.querySelectorAll('.project')];
      const first=new Map(cards.map(card=>[card,card.getBoundingClientRect()]));
      const entering=[];
      if(!reduceMotion){
        cards.forEach(card=>{
          const shouldHide=key!=='all'&&card.dataset.category!==key;
          if(shouldHide&&!card.classList.contains('is-hidden')) makeExitGhost(card,first.get(card));
          if(!shouldHide&&card.classList.contains('is-hidden')) entering.push(card);
        });
      }
      cards.forEach(card=>card.classList.toggle('is-hidden',key!=='all'&&card.dataset.category!==key));
      projectsGrid.dataset.activeFilter=key;
      if(reduceMotion) return;
      cards.forEach(card=>{
        if(card.classList.contains('is-hidden')) return;
        const last=card.getBoundingClientRect();
        const before=first.get(card);
        if(entering.includes(card)){
          card.animate([
            {opacity:0,transform:'scale(.982)',filter:'blur(3px)'},
            {opacity:1,transform:'scale(1)',filter:'blur(0)'}
          ],{duration:460,easing:'cubic-bezier(.22,.82,.24,1)',fill:'both'});
          return;
        }
        const dx=before.left-last.left;
        const dy=before.top-last.top;
        const sx=before.width/Math.max(1,last.width);
        const sy=before.height/Math.max(1,last.height);
        if(Math.abs(dx)>.5||Math.abs(dy)>.5||Math.abs(sx-1)>.01||Math.abs(sy-1)>.01){
          card.animate([
            {transform:`translate3d(${dx}px,${dy}px,0) scale(${sx},${sy})`,transformOrigin:'top left'},
            {transform:'translate3d(0,0,0) scale(1,1)',transformOrigin:'top left'}
          ],{duration:640,easing:'cubic-bezier(.22,.82,.24,1)',fill:'both'});
        }
      });
    }
    document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{
      const key=btn.dataset.filter;
      document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('is-active',b===btn);b.setAttribute('aria-pressed',String(b===btn))});
      filterProjects(key);
    }));

    const projects={
      'sdd-web':{eyebrow:'The Vedic Sewa / Web & Mobile / 2026',title:'A service platform built around clear booking states and trust.',text:'Product design across customer and guru profiles, puja, yatra and consultation booking, shop and after-sales flows, livestream, messaging, verification, FAQ and policy states.',facts:[['My role','UI/UX & Product Designer'],['What it demonstrates','Service lifecycle, status-aware actions, trust and account flows'],['Platforms','Web and mobile'],['Focus','Bookings, commerce, livestream, verification and profiles']]},
      'waroong':{eyebrow:'Numira / Business Software / 2026',title:'Making dense business workflows easier to understand and control.',text:'Product design for party, purchase, accounting, profile and settings areas, including customer and supplier workflows, purchase states, vouchers, chart of accounts, fiscal-year controls, migration, roles and security.',facts:[['My role','UI/UX & Product Designer'],['What it demonstrates','Complex workflows, accounting accuracy, state-aware actions'],['Core areas','Party, purchase, accounting, profile and settings'],['Delivery','Figma, reusable UI and developer handoff']]},
      'safari':{eyebrow:'SOMTU / University Website / 2026',title:'A complete responsive university experience from discovery to registration.',text:'Website design for the School of Management, Tribhuvan University, covering programs, updates, notices, events, resources, research, publications, results and a seven-step application flow.',facts:[['My role','UI/UX & Product Designer'],['Coverage','87 screens across desktop and mobile'],['System','81 component variants'],['Delivery','Complete screen and component reference for developer handoff']]},
      'pilar':{eyebrow:'Design Practice / Developer Handoff',title:'Turning design intent into implementation-ready guidance.',text:'A practice page focused on reusable components, interaction states, hierarchy, responsive behavior and clear communication with developers.',facts:[['Focus','Implementation clarity'],['What it demonstrates','Design decisions, states and responsive rules'],['Tools','Figma and developer handoff'],['Collaboration','Cross-functional product development']]},
      'calendar':{eyebrow:'Design Practice / Interface Systems',title:'Building reusable UI patterns for consistent product experiences.',text:'A practice page covering actions, forms, data states, responsive components, feedback, empty states, confirmation patterns and reusable interface foundations.',facts:[['Focus','Reusable UI and design consistency'],['What it demonstrates','Component thinking and iteration'],['Coverage','Web, mobile, forms, tables, cards and dialogs'],['Tools','Figma, Photoshop and Illustrator']]},
    };
        const modal=document.getElementById('projectModal');const modalTitle=document.getElementById('modalTitle');const modalText=document.getElementById('modalText');const modalEyebrow=document.getElementById('modalEyebrow');const modalFacts=document.getElementById('modalFacts');const modalClose=document.getElementById('modalClose');const modalAction=document.getElementById('modalAction');let lastTrigger=null;
    function openModal(key,trigger){const p=projects[key];if(!p)return;lastTrigger=trigger;modalEyebrow.textContent=p.eyebrow;modalTitle.textContent=p.title;modalText.textContent=p.text;modalFacts.innerHTML=p.facts.map(([a,b])=>`<div class="modal-fact"><b>${a}</b><span>${b}</span></div>`).join('');modalAction.textContent='Close snapshot';modalAction.href='#';modal.hidden=false;document.body.style.overflow='hidden';modalClose.focus();}
    function closeModal(){modal.hidden=true;document.body.style.overflow='';lastTrigger?.focus();}
    document.querySelectorAll('[data-project]').forEach(btn=>btn.addEventListener('click',()=>openModal(btn.dataset.project,btn)));modalClose.addEventListener('click',closeModal);modalAction.addEventListener('click',e=>{e.preventDefault();closeModal()});modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal()});

