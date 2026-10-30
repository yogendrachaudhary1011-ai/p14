import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = usePortfolio();

  return (
    <footer className="case-footer">
      <div className="shell case-footer-inner">
        <div className="case-footer-meta">
          <span>{settings.footerText}</span>
          <span>{settings.footerSubtitle}</span>
        </div>
        <nav aria-label="Social channels" className="case-footer-socials">
          <a aria-label="Email Yogendra" href={`mailto:${settings.email}`}>
            Email
          </a>
          <a
            aria-label="Open Yogendra’s portfolio"
            href={settings.seo.canonicalUrl || 'https://yogendrach.vercel.app'}
            rel="noreferrer"
            target="_blank"
          >
            Portfolio
          </a>
          <a
            aria-label="Open Yogendra’s resume"
            href={settings.resumeUrl || '/assets/Yogendra_Chaudhary_CV.pdf'}
            rel="noreferrer"
            target="_blank"
          >
            Resume
          </a>
          <a
            aria-label="Call Yogendra"
            href={`tel:${settings.phone}`}
            rel="noreferrer"
            target="_blank"
          >
            Phone
          </a>
          <a
            aria-label="Yogendra on LinkedIn"
            href="https://www.linkedin.com/in/yogendrach"
            rel="noreferrer"
            target="_blank"
          >
            LinkedIn
          </a>
          <button
            onClick={() => onNavigate('/admin')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#5c5c6e',
              cursor: 'pointer',
              fontSize: 'inherit',
              padding: 0
            }}
          >
            Admin
          </button>
        </nav>
      </div>
    </footer>
  );
};
