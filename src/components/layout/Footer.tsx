import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { getPrewrittenMailtoUrl } from '../../utils/emailUtils';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = usePortfolio();
  const emailUrl = getPrewrittenMailtoUrl(settings.email || 'yogendrachaudhary2061@gmail.com');

  return (
    <footer className="case-footer">
      <div className="shell case-footer-inner">
        <div className="case-footer-meta">
          <span>{settings.footerText}</span>
          <span>{settings.footerSubtitle}</span>
        </div>
        <nav aria-label="Social channels" className="case-footer-socials">
          <a
            aria-label="Email Yogendra Chaudhary"
            href={emailUrl}
          >
            Email
          </a>
          <a
            aria-label="Yogendra on Behance"
            href={(settings.behanceUrl && settings.behanceUrl.includes('yogendrachaudhary1')) ? settings.behanceUrl : 'https://www.behance.net/yogendrachaudhary1'}
            rel="noopener noreferrer"
            target="_blank"
          >
            Behance
          </a>
          <a
            aria-label="Open Yogendra’s resume"
            href={settings.resumeUrl || '/assets/Yogendra_Chaudhary_CV.pdf'}
            rel="noopener noreferrer"
            target="_blank"
          >
            Resume
          </a>
          <a
            aria-label="Yogendra on LinkedIn"
            href={settings.linkedinUrl ? (settings.linkedinUrl.startsWith('http') ? settings.linkedinUrl : `https://${settings.linkedinUrl}`) : 'https://www.linkedin.com/in/yogendrach'}
            rel="noopener noreferrer"
            target="_blank"
          >
            LinkedIn
          </a>
          <button
            type="button"
            onClick={() => onNavigate('/admin')}
            className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0"
            title="Open Admin Panel"
          >
            CMS
          </button>
        </nav>
      </div>
    </footer>
  );
};
