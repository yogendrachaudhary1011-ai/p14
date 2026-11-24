import React, { useEffect, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { initialSiteSettings } from '../../data/initialData';
import { useCompressedLandingImage } from '../../utils/landingMediaCompression';

export const IdCard: React.FC = () => {
  const { settings } = usePortfolio();
  const copy = { ...initialSiteSettings.siteCopy, ...(settings.siteCopy || {}) };
  const portraitSrc = useCompressedLandingImage(
    settings.profileImage || '/assets/media/hero-id-portrait.jpeg',
    800
  );
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

    const scheduleTick = () => {
      if (isDisposed || physicsFrame !== null) return;
      lastFrame = performance.now();
      physicsFrame = requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      if (isDisposed) return;
      physicsFrame = null;
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

      const isSettled =
        !cardState.dragging &&
        cardState.started &&
        Math.abs(cardState.targetX - cardState.x) < 0.05 &&
        Math.abs(cardState.targetY - cardState.y) < 0.05 &&
        Math.abs(cardState.vx) < 0.02 &&
        Math.abs(cardState.vy) < 0.02 &&
        Math.abs(cardState.vr) < 0.02 &&
        Math.abs(cardState.rotation) < 0.05 &&
        Math.abs(cardState.x - backOne.x) < 0.05 &&
        Math.abs(cardState.y - backOne.y) < 0.05 &&
        Math.abs(cardState.x - backTwo.x) < 0.05 &&
        Math.abs(cardState.y - backTwo.y) < 0.05;

      if (!reduceMotion && !isSettled) {
        physicsFrame = requestAnimationFrame(tick);
      }
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
      scheduleTick();
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
      scheduleTick();
    };

    const onCardKeyDown = (event: KeyboardEvent) => {
      if (reduceMotion) return;
      const impulse = 14;
      if (event.key === 'ArrowLeft') {
        cardState.vx -= impulse;
        scheduleTick();
        event.preventDefault();
      } else if (event.key === 'ArrowRight') {
        cardState.vx += impulse;
        scheduleTick();
        event.preventDefault();
      } else if (event.key === 'ArrowUp') {
        cardState.vy -= impulse;
        scheduleTick();
        event.preventDefault();
      } else if (event.key === 'ArrowDown') {
        cardState.vy += impulse;
        scheduleTick();
        event.preventDefault();
      } else if (event.key === 'Enter' || event.key === ' ') {
        cardState.vx += (Math.random() > 0.5 ? 1 : -1) * 16;
        cardState.vy += 10;
        scheduleTick();
        event.preventDefault();
      } else if (event.key === 'Escape') {
        cardState.targetX = 0;
        cardState.targetY = 0;
        scheduleTick();
      }
    };

    card.addEventListener('pointerdown', onCardDown);
    card.addEventListener('pointermove', onCardMove);
    card.addEventListener('pointerup', onCardUp);
    card.addEventListener('pointercancel', onCardUp);
    card.addEventListener('lostpointercapture', onCardUp);
    card.addEventListener('keydown', onCardKeyDown);

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

    scheduleTick();

    return () => {
      isDisposed = true;
      window.clearTimeout(startTimer);
      if (physicsFrame) cancelAnimationFrame(physicsFrame);
      card.removeEventListener('pointerdown', onCardDown);
      card.removeEventListener('pointermove', onCardMove);
      card.removeEventListener('pointerup', onCardUp);
      card.removeEventListener('pointercancel', onCardUp);
      card.removeEventListener('lostpointercapture', onCardUp);
      card.removeEventListener('keydown', onCardKeyDown);
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
                <span>{copy.idCardTopline}</span>
                <i className="id-card-chip"></i>
              </div>
              <div className="id-card-photo">
                <img
                  alt={`${copy.idCardName} profile portrait`}
                  decoding="async"
                  draggable={false}
                  fetchPriority="high"
                  height="1371"
                  loading="eager"
                  src={portraitSrc}
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallbackApplied) {
                      e.currentTarget.dataset.fallbackApplied = '1';
                      e.currentTarget.src = '/assets/media/hero-id-portrait.jpeg';
                    }
                  }}
                  width="720"
                />
              </div>
              <div className="id-card-body">
                <h2 className="id-card-name">
                  {copy.idCardName.split(/\s+/).map((word, index) => <React.Fragment key={index}>{index > 0 && <br />}{word}</React.Fragment>)}
                </h2>
                <p className="id-card-role">{copy.idCardRole}</p>
                <p className="id-card-micro">
                  {copy.idCardMicroline}<br />{copy.idCardDescription}
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
          <svg
            width="18"
            height="27"
            viewBox="0 0 38 57"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ position: 'relative', zIndex: 1, transform: 'translateZ(15px)' }}
          >
            <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="currentColor" />
            <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="currentColor" />
            <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="currentColor" />
            <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="currentColor" />
            <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="currentColor" />
          </svg>
          <small>{copy.orbitFigma}</small>
        </div>
        <div className="app-tile ps">
          <b>{copy.orbitPhotoshopMark}</b>
          <small>{copy.orbitPhotoshop}</small>
        </div>
        <div className="app-tile ai">
          <b>{copy.orbitIllustratorMark}</b>
          <small>{copy.orbitIllustrator}</small>
        </div>
        <div className="app-tile ae">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ position: 'relative', zIndex: 1, transform: 'translateZ(15px)' }}
          >
            <path
              d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
              fill="currentColor"
            />
          </svg>
          <small>{copy.orbitChatGPT || 'ChatGPT'}</small>
        </div>
        <div className="app-tile pr">
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ position: 'relative', zIndex: 1, transform: 'translateZ(15px)' }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 3A21 21 0 1 0 24 45A21 21 0 1 0 24 3ZM32.1 18.3C32.4 15.6 30.3 13.3 26.6 13.3C19.6 13.3 14.2 19.6 14.2 26.8C14.2 31.9 17.6 34.8 22.5 34.8C27.7 34.8 32 31.4 33.6 27.9C33.9 27.2 33.2 26.4 32.4 26.9C30.4 29.9 26.9 32.2 23.1 32.2C19.6 32.2 17.7 29.8 17.7 26.3C17.7 20.6 21.9 15.4 26.5 15.4C28.8 15.4 29.9 16.6 29.4 18.2C29 19.4 30.2 20.3 31.3 19.6C31.8 19.2 32 18.8 32.1 18.3Z"
              fill="currentColor"
            />
          </svg>
          <small>{copy.orbitCanva || 'Canva'}</small>
        </div>
        <div className="app-tile fr">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ position: 'relative', zIndex: 1, transform: 'translateZ(15px)' }}
          >
            <path
              d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"
              fill="currentColor"
            />
          </svg>
          <small>{copy.orbitClaude || 'Claude'}</small>
        </div>
      </div>
    </>
  );
};

