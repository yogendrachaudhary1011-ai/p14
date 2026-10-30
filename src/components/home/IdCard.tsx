import React, { useEffect, useRef } from 'react';

export const IdCard: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const lanyardRef = useRef<SVGSVGElement>(null);
  const bodyRef = useRef<SVGPathElement>(null);
  const edgeLeftRef = useRef<SVGPathElement>(null);
  const edgeRightRef = useRef<SVGPathElement>(null);
  const stackOneRef = useRef<HTMLDivElement>(null);
  const stackTwoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const root = rootRef.current;
    const card = cardRef.current;
    const anchor = anchorRef.current;
    const lanyard = lanyardRef.current;
    const body = bodyRef.current;
    const edgeLeft = edgeLeftRef.current;
    const edgeRight = edgeRightRef.current;
    const stackOne = stackOneRef.current;
    const stackTwo = stackTwoRef.current;

    if (!stage || !root || !card || !anchor || !lanyard || !body || !edgeLeft || !edgeRight) {
      return;
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // Card drop intro entrance animation
    const header = document.getElementById('siteHeader');
    if (!reduceMotion) {
      requestAnimationFrame(() => {
        stage.classList.add('v6-card-intro');
        root.classList.add('v6-id-enter');
        header?.classList.add('v7-card-drop-active');

        const clearDrop = () => {
          root.classList.remove('v6-id-enter');
          header?.classList.remove('v7-card-drop-active');
        };
        root.addEventListener('animationend', clearDrop, { once: true });
        window.setTimeout(clearDrop, 2100);
      });
    }

    let cardState = {
      x: -8,
      y: reduceMotion ? 0 : -24,
      targetX: 0,
      targetY: 0,
      vx: reduceMotion ? 0 : 0.04,
      vy: 0,
      rotation: reduceMotion ? 0 : -3,
      vr: 0,
      dragging: false,
      started: false
    };

    let backOne = { x: 0, y: 0, rotation: 7 };
    let backTwo = { x: 0, y: 0, rotation: -6 };
    let pointerStart = { x: 0, y: 0, cardX: 0, cardY: 0 };
    let pointerVelocity = { x: 0, y: 0 };
    let lastPointerAt = 0;
    let lastFrame = performance.now();
    let physicsFrame: number | null = null;
    let isDisposed = false;

    const limits = () => {
      const mobile = window.matchMedia('(max-width: 620px)').matches;
      const tablet = window.matchMedia('(min-width: 621px) and (max-width: 860px)').matches;
      return mobile
        ? { x: 98.8, y: 106.6, up: 44.2 }
        : tablet
        ? { x: 192.4, y: 176.8, up: 75.4 }
        : { x: 249.6, y: 213.2, up: 88.4 };
    };

    const constrain = (x: number, y: number) => {
      const lim = limits();
      const adjustedY = Math.max(-lim.up, Math.min(lim.y, y));
      const ratio = Math.sqrt((x * x) / (lim.x * lim.x) + (adjustedY * adjustedY) / (lim.y * lim.y));
      return ratio > 1 ? { x: x / ratio, y: adjustedY / ratio } : { x, y: adjustedY };
    };

    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
    const point = (x: number, y: number) => ({ x, y });
    const offsetPoint = (p: { x: number; y: number }, n: { x: number; y: number }, amount: number) =>
      point(p.x + n.x * amount, p.y + n.y * amount);
    const cubicPath = (
      a: { x: number; y: number },
      c1: { x: number; y: number },
      c2: { x: number; y: number },
      b: { x: number; y: number }
    ) =>
      `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;

    const updateLanyard = () => {
      if (!stage || !card || !anchor || !lanyard || !body || !edgeLeft || !edgeRight) return;
      const stageRect = stage.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const strap = card.querySelector('.id-card-strap') || card;
      const strapRect = strap.getBoundingClientRect();
      if (!stageRect.width || !stageRect.height) return;

      const overhangRaw = getComputedStyle(stage).getPropertyValue('--lanyard-overhang');
      const svgOverhang = Math.max(420, parseFloat(overhangRaw) || 620);
      const anchorPt = point(
        anchorRect.left + anchorRect.width / 2 - stageRect.left,
        anchorRect.top + anchorRect.height / 2 - stageRect.top + svgOverhang
      );
      const attachPt = point(
        strapRect.left + strapRect.width / 2 - stageRect.left,
        strapRect.top + 1 - stageRect.top + svgOverhang
      );
      const dx = attachPt.x - anchorPt.x;
      const dy = attachPt.y - anchorPt.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const normal = point(-dy / distance, dx / distance);
      const cardWidth = card.getBoundingClientRect().width || 260;
      const ribbonWidth = clamp(cardWidth * 0.088, 16, 23);
      const half = ribbonWidth * 0.5;

      const dragSway = clamp(
        (cardState.targetX - cardState.x) * 0.34 + cardState.vx * 6.2,
        -56,
        56
      );
      const verticalMotion = clamp(cardState.vy * 2.8, -24, 24);
      const firstDrop = clamp(dy * 0.3, 178, 252);
      const returnLift = clamp(dy * 0.24, 74, 154);
      const c1 = point(anchorPt.x + dx * 0.055 - dragSway * 0.1, anchorPt.y + firstDrop);
      const c2 = point(attachPt.x - dx * 0.23 + dragSway, attachPt.y - returnLift + verticalMotion);

      const leftStart = offsetPoint(anchorPt, normal, half);
      const leftC1 = offsetPoint(c1, normal, half);
      const leftC2 = offsetPoint(c2, normal, half);
      const leftEnd = offsetPoint(attachPt, normal, half);
      const rightStart = offsetPoint(anchorPt, normal, -half);
      const rightC1 = offsetPoint(c1, normal, -half);
      const rightC2 = offsetPoint(c2, normal, -half);
      const rightEnd = offsetPoint(attachPt, normal, -half);
      const leftPath = cubicPath(leftStart, leftC1, leftC2, leftEnd);
      const rightPath = cubicPath(rightStart, rightC1, rightC2, rightEnd);
      const ribbonBody = `${leftPath} L ${rightEnd.x.toFixed(2)} ${rightEnd.y.toFixed(2)} C ${rightC2.x.toFixed(2)} ${rightC2.y.toFixed(2)}, ${rightC1.x.toFixed(2)} ${rightC1.y.toFixed(2)}, ${rightStart.x.toFixed(2)} ${rightStart.y.toFixed(2)} Z`;

      lanyard.setAttribute(
        'viewBox',
        `0 0 ${stageRect.width.toFixed(2)} ${(stageRect.height + svgOverhang).toFixed(2)}`
      );
      body.setAttribute('d', ribbonBody);
      edgeLeft.setAttribute('d', leftPath);
      edgeRight.setAttribute('d', rightPath);
      stage.style.setProperty('--lanyard-width', `${ribbonWidth.toFixed(2)}px`);
    };

    const renderCard = () => {
      if (!card || isDisposed) return;
      card.style.transform = `translate3d(${cardState.x.toFixed(2)}px,${cardState.y.toFixed(2)}px,0) rotate(${cardState.rotation.toFixed(2)}deg)`;
      if (stackOne) {
        stackOne.style.transform = `translate3d(${(backOne.x + 17).toFixed(2)}px,${(backOne.y + 14).toFixed(2)}px,0) rotate(${backOne.rotation.toFixed(2)}deg)`;
      }
      if (stackTwo) {
        stackTwo.style.transform = `translate3d(${(backTwo.x - 13).toFixed(2)}px,${(backTwo.y + 18).toFixed(2)}px,0) rotate(${backTwo.rotation.toFixed(2)}deg)`;
      }
      updateLanyard();
    };

    const tick = (now: number) => {
      if (isDisposed) return;
      const dt = Math.min(32, now - lastFrame) / 16.6667;
      lastFrame = now;
      if (!reduceMotion) {
        const spring = cardState.dragging ? 0.22 : cardState.started ? 0.062 : 0.052;
        const damping = cardState.dragging ? 0.7 : cardState.started ? 0.79 : 0.83;
        cardState.vx += (cardState.targetX - cardState.x) * spring * dt;
        cardState.vy += (cardState.targetY - cardState.y) * spring * dt;
        cardState.vx *= Math.pow(damping, dt);
        cardState.vy *= Math.pow(damping, dt);
        cardState.x += cardState.vx * dt;
        cardState.y += cardState.vy * dt;
        const targetRotation = clamp(
          cardState.x * 0.052 + cardState.vx * 0.58 + cardState.y * 0.008,
          -13,
          13
        );
        cardState.vr += (targetRotation - cardState.rotation) * 0.095 * dt;
        cardState.vr *= Math.pow(0.72, dt);
        cardState.rotation += cardState.vr * dt;
      }
      const foregroundFactor = cardState.dragging ? 0.13 : 0.09;
      backOne.x += (cardState.x - backOne.x) * foregroundFactor;
      backOne.y += (cardState.y - backOne.y) * foregroundFactor;
      backOne.rotation += (cardState.rotation + 7 - backOne.rotation) * foregroundFactor;
      backTwo.x += (cardState.x - backTwo.x) * 0.055;
      backTwo.y += (cardState.y - backTwo.y) * 0.055;
      backTwo.rotation += (cardState.rotation - 6 - backTwo.rotation) * 0.055;

      renderCard();
      physicsFrame = requestAnimationFrame(tick);
    };

    // Pointer events for dragging
    const onCardDown = (event: PointerEvent) => {
      if (reduceMotion) return;
      cardState.dragging = true;
      card.classList.add('is-dragging');
      card.setPointerCapture?.(event.pointerId);
      pointerStart = {
        x: event.clientX,
        y: event.clientY,
        cardX: cardState.targetX,
        cardY: cardState.targetY
      };
      pointerVelocity = { x: 0, y: 0 };
      lastPointerAt = performance.now();
      event.preventDefault();
    };

    const onCardMove = (event: PointerEvent) => {
      if (!cardState.dragging) return;
      const next = constrain(
        pointerStart.cardX + (event.clientX - pointerStart.x),
        pointerStart.cardY + (event.clientY - pointerStart.y)
      );
      const now = performance.now();
      const elapsed = Math.max(8, now - lastPointerAt);
      pointerVelocity = {
        x: ((next.x - cardState.targetX) / elapsed) * 16.67,
        y: ((next.y - cardState.targetY) / elapsed) * 16.67
      };
      lastPointerAt = now;
      cardState.targetX = next.x;
      cardState.targetY = next.y;
    };

    const onCardUp = (event: PointerEvent) => {
      if (!cardState.dragging) return;
      cardState.dragging = false;
      card.classList.remove('is-dragging');
      try {
        card.releasePointerCapture?.(event.pointerId);
      } catch {}
      cardState.vx += pointerVelocity.x * 0.34;
      cardState.vy += pointerVelocity.y * 0.34;
      cardState.targetX = 0;
      cardState.targetY = 0;
    };

    card.addEventListener('pointerdown', onCardDown);
    card.addEventListener('pointermove', onCardMove);
    card.addEventListener('pointerup', onCardUp);
    card.addEventListener('pointercancel', onCardUp);
    card.addEventListener('lostpointercapture', onCardUp);

    // Hero mouse parallax effect
    const hero = document.getElementById('home');
    const onHeroPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || cardState.dragging || reduceMotion) return;
      if (!hero || !root) return;
      const r = hero.getBoundingClientRect();
      const nx = (event.clientX - r.left) / r.width - 0.5;
      const ny = (event.clientY - r.top) / r.height - 0.5;
      root.style.setProperty('--parallax-x', `${(nx * 10).toFixed(2)}px`);
      root.style.setProperty('--parallax-y', `${(ny * 8).toFixed(2)}px`);
    };

    const onHeroPointerLeave = () => {
      if (!root) return;
      root.style.setProperty('--parallax-x', '0px');
      root.style.setProperty('--parallax-y', '0px');
    };

    if (hero && !reduceMotion) {
      hero.addEventListener('pointermove', onHeroPointerMove as EventListener, { passive: true });
      hero.addEventListener('pointerleave', onHeroPointerLeave);
    }

    const onResize = () => {
      updateLanyard();
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Start physics loop
    stage.classList.add('is-ready');
    const startTimer = window.setTimeout(() => {
      cardState.started = true;
    }, 330);

    lastFrame = performance.now();
    physicsFrame = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      window.clearTimeout(startTimer);
      if (physicsFrame) cancelAnimationFrame(physicsFrame);
      card.removeEventListener('pointerdown', onCardDown);
      card.removeEventListener('pointermove', onCardMove);
      card.removeEventListener('pointerup', onCardUp);
      card.removeEventListener('pointercancel', onCardUp);
      card.removeEventListener('lostpointercapture', onCardUp);
      if (hero) {
        hero.removeEventListener('pointermove', onHeroPointerMove as EventListener);
        hero.removeEventListener('pointerleave', onHeroPointerLeave);
      }
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="id-card-stage"
        id="idCardStage"
        ref={stageRef}
      >
        <div className="id-card-anchor" id="idCardAnchor" ref={anchorRef}></div>
        <svg
          aria-hidden="true"
          className="lanyard"
          id="lanyard"
          preserveAspectRatio="none"
          ref={lanyardRef}
          role="presentation"
        >
          <path className="lanyard-body" id="lanyardBody" ref={bodyRef}></path>
          <path
            className="lanyard-edge lanyard-edge-left"
            id="lanyardEdgeLeft"
            ref={edgeLeftRef}
          ></path>
          <path
            className="lanyard-edge lanyard-edge-right"
            id="lanyardEdgeRight"
            ref={edgeRightRef}
          ></path>
        </svg>

        <div className="id-card-root" id="idCardRoot" ref={rootRef}>
          <div className="stack-card two" id="stackCardTwo" ref={stackTwoRef}></div>
          <div className="stack-card one" id="stackCardOne" ref={stackOneRef}></div>

          <article
            aria-label="Interactive Product Designer ID Card. Drag to explore lanyard physics."
            className="id-card"
            id="idCard"
            ref={cardRef}
            tabIndex={0}
          >
            <div className="id-card-surface">
              <div className="id-card-strap"></div>
              <div className="id-card-top">
                <span>Design practice / 2026</span>
                <i className="id-card-chip"></i>
              </div>
              <div className="id-card-photo">
                <img
                  alt="Profile portrait"
                  decoding="async"
                  draggable={false}
                  height="1371"
                  loading="eager"
                  src="/assets/aistudio/Profile-24mb_66f4e952.jpeg"
                  width="720"
                />
              </div>
              <div className="id-card-body">
                <h2 className="id-card-name">
                  Yogendra<br />Chaudhary
                </h2>
                <p className="id-card-role">Product Designer</p>
                <p className="id-card-micro">
                  Flows → Interfaces → Products<br />Designing clear, usable product experiences.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Floating 3D Tool Orbit */}
      <div aria-hidden="true" className="tool-orbit">
        <div className="orbit-ring"></div>
        <div className="app-tile figma">
          <b>Fg</b>
          <small>Figma</small>
        </div>
        <div className="app-tile ps">
          <b>Ps</b>
          <small>Photoshop</small>
        </div>
        <div className="app-tile ai">
          <b>Ai</b>
          <small>Illustrator</small>
        </div>
        <div className="app-tile ae">
          <b>Ae</b>
          <small>After Effects</small>
        </div>
        <div className="app-tile pr">
          <b>Pr</b>
          <small>Premiere</small>
        </div>
        <div className="app-tile fr">
          <b>Fr</b>
          <small>Framer</small>
        </div>
      </div>
    </>
  );
};
