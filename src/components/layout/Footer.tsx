import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { getPrewrittenMailtoUrl } from '../../utils/emailUtils';
import { initialSiteSettings } from '../../data/initialData';

export const Footer: React.FC = () => {
  const { settings } = usePortfolio();
  const copy = { ...initialSiteSettings.siteCopy, ...(settings.siteCopy || {}) };
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
            {copy.footerEmail}
          </a>
          <a
            aria-label="Yogendra on Behance"
            href={(settings.behanceUrl && settings.behanceUrl.includes('yogendrachaudhary1')) ? settings.behanceUrl : 'https://www.behance.net/yogendrachaudhary1'}
            rel="noopener noreferrer"
            target="_blank"
          >
            {copy.behance}
          </a>
          <a
            aria-label="Open Yogendra’s resume"
            href={settings.resumeUrl || '/assets/Yogendra_Chaudhary_CV.pdf'}
            rel="noopener noreferrer"
            target="_blank"
          >
            {copy.footerResume}
          </a>
          <a
            aria-label="Yogendra on LinkedIn"
            href={settings.linkedinUrl ? (settings.linkedinUrl.startsWith('http') ? settings.linkedinUrl : `https://${settings.linkedinUrl}`) : 'https://www.linkedin.com/in/yogendrach'}
            rel="noopener noreferrer"
            target="_blank"
          >
            {copy.linkedIn}
          </a>
        </nav>
      </div>
    </footer>
  );
};

