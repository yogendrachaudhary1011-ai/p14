import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const { settings, isAdmin } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const isCaseStudy = currentPath !== '/' && currentPath !== '/projects' && currentPath !== '/about' && currentPath !== '/admin';

  return (
    <header className={`header ${isCaseStudy ? 'is-scrolled' : ''}`} id="siteHeader">
      <nav aria-label="Main navigation" className="shell nav">
        <a
          className="brand"
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
        >
          {settings.brandName || 'YOGENDRA'}
          <b>——</b>
          <span className="brand-role">
            PRODUCT<span className="brand-role-gap">DESIGNER</span>
          </span>
        </a>

        <div className="nav-links">
          <a
            href="/projects"
            className={currentPath === '/projects' ? 'is-active' : ''}
            onClick={(e) => handleNavClick(e, '/projects')}
          >
            Work
          </a>
          <a
            href="/about"
            className={currentPath === '/about' ? 'is-active' : ''}
            onClick={(e) => handleNavClick(e, '/about')}
          >
            About
          </a>
        </div>

        <div className="nav-actions">
          <div aria-label="Availability status" className="nav-availability">
            <i aria-hidden="true"></i>
            <span>
              {settings.availabilityText.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < settings.availabilityText.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </span>
          </div>

          <a
            aria-label="Email Yogendra"
            className="nav-talk"
            href={`mailto:${settings.email}`}
          >
            Let's Talk
            <span aria-hidden="true" className="material-symbols-rounded material-arrow-icon">
              arrow_outward
            </span>
          </a>

          {isAdmin ? (
            <button
              onClick={() => onNavigate('/admin')}
              className="cms-admin-indicator"
              style={{
                background: 'rgba(243, 112, 33, 0.2)',
                color: '#f37021',
                border: '1px solid rgba(243, 112, 33, 0.4)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                marginLeft: '8px'
              }}
              title="Open Admin CMS"
            >
              CMS Active
            </button>
          ) : (
            <button
              onClick={() => onNavigate('/admin')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#5c5c6e',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px 6px',
                marginLeft: '6px',
                opacity: 0.6
              }}
              title="Admin Login"
            >
              ⚙
            </button>
          )}
        </div>

        <button
          aria-expanded={mobileMenuOpen}
          aria-label="Open navigation"
          className={`menu ${mobileMenuOpen ? 'is-active' : ''}`}
          id="menu"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
        </button>

        <div className={`mobile-nav ${mobileMenuOpen ? 'is-open' : ''}`} id="mobileNav">
          <a href="/projects" onClick={(e) => handleNavClick(e, '/projects')}>
            Work
          </a>
          <a href="/about" onClick={(e) => handleNavClick(e, '/about')}>
            About
          </a>
          <span className="mobile-availability">
            <i aria-hidden="true"></i>
            {settings.availabilityText.replace('\n', ' ')}
          </span>
          <a
            aria-label="Email Yogendra"
            className="mobile-talk"
            href={`mailto:${settings.email}`}
          >
            Let's Talk
            <span aria-hidden="true" className="material-symbols-rounded material-arrow-icon">
              arrow_outward
            </span>
          </a>
          <a
            href="/admin"
            onClick={(e) => handleNavClick(e, '/admin')}
            style={{ fontSize: '13px', color: '#8e8ea0', marginTop: '12px' }}
          >
            {isAdmin ? 'Admin CMS (Logged In)' : 'Admin Login'}
          </a>
        </div>
      </nav>
    </header>
  );
};
