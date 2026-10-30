import React, { useState, useRef } from 'react';

export const IdCard: React.FC = () => {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setTransform({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      aria-hidden="true"
      className="id-card-stage"
      id="idCardStage"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="id-card-anchor" id="idCardAnchor"></div>
      <svg
        aria-hidden="true"
        className="lanyard"
        id="lanyard"
        preserveAspectRatio="none"
        role="presentation"
        viewBox="0 0 100 100"
      >
        <path
          className="lanyard-body"
          id="lanyardBody"
          d="M 50,0 Q 50,50 50,100"
          stroke="rgba(243, 112, 33, 0.4)"
          strokeWidth="3"
          fill="none"
        ></path>
      </svg>
      <div
        className="id-card-root"
        id="idCardRoot"
        ref={cardRef}
        style={{
          transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
          transition: transform.rotateX === 0 ? 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'transform 0.1s ease-out'
        }}
      >
        <div className="stack-card two" id="stackCardTwo"></div>
        <div className="stack-card one" id="stackCardOne"></div>
        <article className="id-card" id="idCard">
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
                src="/assets/media/home-media-02-c6ea6ce61d01.webp"
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
  );
};
