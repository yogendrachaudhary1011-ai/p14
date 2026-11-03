import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { getGmailComposeUrl } from '../../utils/emailUtils';
import { initialSiteSettings } from '../../data/initialData';
import { ProjectTheme } from '../../types';
import { resolveProjectTheme } from '../../utils/themePresets';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  projectTheme?: ProjectTheme;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, projectTheme }) => {
  const { settings } = usePortfolio();
  const copy = { ...initialSiteSettings.siteCopy, ...(settings.siteCopy || {}) };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  const emailUrl = getGmailComposeUrl(settings.email || 'yogendrachaudhary2061@gmail.com');
  const resumeUrl = settings.resumeUrl || '/assets/Yogendra_Chaudhary_CV.pdf';

  const resolvedHeaderTheme = projectTheme ? resolveProjectTheme(projectTheme) : null;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollY / maxScroll) * 100)) : 0;
      setProgressWidth(pct);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const isLandingPage = currentPath === '/' || currentPath === '' || currentPath === '/index.html';
  const shouldShrink = isScrolled && !isLandingPage;
  const currentHeight = shouldShrink ? '52px' : '72px';

  return (
    <>
      <div
        className="progress"
        id="progress"
        style={{
          width: `${progressWidth}%`,
          backgroundColor: resolvedHeaderTheme?.progressBarColor || undefined
        }}
        role="progressbar"
        aria-valuenow={Math.round(progressWidth)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      <header
        className={`header ${isScrolled ? 'is-scrolled' : ''}`}
        id="siteHeader"
        style={{
          height: currentHeight,
          minHeight: isLandingPage ? '72px' : undefined,
          ...(resolvedHeaderTheme
            ? {
                backgroundColor: isScrolled
                  ? resolvedHeaderTheme.headerBg
                  : resolvedHeaderTheme.headerBg
                  ? `${resolvedHeaderTheme.headerBg}f0`
                  : undefined,
                borderColor: resolvedHeaderTheme.headerBorderColor,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                ['--header-contact-btn-bg' as any]: resolvedHeaderTheme.headerContactBtnBg,
                ['--header-contact-btn-text' as any]: resolvedHeaderTheme.headerContactBtnText,
                ['--header-contact-btn-border' as any]: resolvedHeaderTheme.headerContactBtnBorder
              }
            : {}),
          transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease'
        }}
      >
      <nav
        aria-label="Main navigation"
        className="shell nav"
        style={{
          height: '100%',
          minHeight: isLandingPage ? '72px' : undefined,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >

        <div className="nav-links">
          <a
            href="/"
            className={currentPath === '/' ? 'is-active' : ''}
            onClick={(e) => handleNavClick(e, '/')}
            style={
              resolvedHeaderTheme
                ? {
                    color: currentPath === '/'
                      ? resolvedHeaderTheme.headerNavActiveColor
                      : resolvedHeaderTheme.headerNavTextColor
                  }
                : undefined
            }
          >
            {copy.navHome}
          </a>
          <a
            href="/#work"
            onClick={(e) => handleNavClick(e, '/#work')}
            style={
              resolvedHeaderTheme
                ? {
                    color: resolvedHeaderTheme.headerNavTextColor
                  }
                : undefined
            }
          >
            {copy.navWork}
          </a>
          <a
            href="/#about"
            onClick={(e) => handleNavClick(e, '/#about')}
            style={
              resolvedHeaderTheme
                ? {
                    color: resolvedHeaderTheme.headerNavTextColor
                  }
                : undefined
            }
          >
            {copy.navAbout}
          </a>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={
              resolvedHeaderTheme
                ? {
                    color: resolvedHeaderTheme.headerNavTextColor
                  }
                : undefined
            }
          >
            {copy.navResume}
          </a>

        </div>

        <div className="nav-actions">
          <div
            aria-label="Availability status"
            className="nav-availability"
            style={
              resolvedHeaderTheme
                ? {
                    backgroundColor: resolvedHeaderTheme.headerAvailabilityBg !== 'transparent'
                      ? resolvedHeaderTheme.headerAvailabilityBg
                      : undefined,
                    color: resolvedHeaderTheme.headerAvailabilityText
                  }
                : undefined
            }
          >
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
            aria-label="Open Gmail to email Yogendra"
            className="nav-talk"
            href={emailUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={
              resolvedHeaderTheme
                ? {
                    backgroundColor: resolvedHeaderTheme.headerContactBtnBg,
                    color: resolvedHeaderTheme.headerContactBtnText,
                    borderColor: resolvedHeaderTheme.headerContactBtnBorder,
                    ['--header-contact-btn-bg' as any]: resolvedHeaderTheme.headerContactBtnBg,
                    ['--header-contact-btn-text' as any]: resolvedHeaderTheme.headerContactBtnText,
                    ['--header-contact-btn-border' as any]: resolvedHeaderTheme.headerContactBtnBorder
                  }
                : undefined
            }
          >
            {copy.navContact}
            <span
              aria-hidden="true"
              className="material-symbols-rounded material-arrow-icon"
              style={resolvedHeaderTheme ? { color: resolvedHeaderTheme.headerContactBtnText } : undefined}
            >
              arrow_outward
            </span>
          </a>

        </div>

        <button
          aria-expanded={mobileMenuOpen}
          aria-label="Open navigation"
          className={`menu ${mobileMenuOpen ? 'is-active' : ''}`}
          id="menu"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span style={resolvedHeaderTheme ? { backgroundColor: resolvedHeaderTheme.headerNavTextColor } : undefined}></span>
          <span style={resolvedHeaderTheme ? { backgroundColor: resolvedHeaderTheme.headerNavTextColor } : undefined}></span>
        </button>

        <div
          className={`mobile-nav ${mobileMenuOpen ? 'is-open' : ''}`}
          id="mobileNav"
          style={{
            top: currentHeight,
            transition: 'top 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            ...(resolvedHeaderTheme
              ? {
                  backgroundColor: resolvedHeaderTheme.headerBg,
                  borderColor: resolvedHeaderTheme.headerBorderColor
                }
              : {})
          }}
        >
          <a
            href="/"
            onClick={(e) => handleNavClick(e, '/')}
            style={resolvedHeaderTheme ? { color: resolvedHeaderTheme.headerNavActiveColor, borderColor: resolvedHeaderTheme.headerBorderColor } : undefined}
          >
            {copy.navHome}
          </a>
          <a
            href="/#work"
            onClick={(e) => handleNavClick(e, '/#work')}
            style={resolvedHeaderTheme ? { color: resolvedHeaderTheme.headerNavTextColor, borderColor: resolvedHeaderTheme.headerBorderColor } : undefined}
          >
            {copy.navWork}
          </a>
          <a
            href="/#about"
            onClick={(e) => handleNavClick(e, '/#about')}
            style={resolvedHeaderTheme ? { color: resolvedHeaderTheme.headerNavTextColor, borderColor: resolvedHeaderTheme.headerBorderColor } : undefined}
          >
            {copy.navAbout}
          </a>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-resume"
            onClick={() => setMobileMenuOpen(false)}
            style={resolvedHeaderTheme ? { color: resolvedHeaderTheme.headerNavTextColor, borderColor: resolvedHeaderTheme.headerBorderColor } : undefined}
          >
            {copy.navResume}
          </a>
          <span
            className="mobile-availability"
            style={resolvedHeaderTheme ? { color: resolvedHeaderTheme.headerAvailabilityText } : undefined}
          >
            <i aria-hidden="true"></i>
            {settings.availabilityText.replace('\n', ' ')}
          </span>
          <a
            aria-label="Email Yogendra"
            className="mobile-talk"
            href={emailUrl}
            style={
              resolvedHeaderTheme
                ? {
                    backgroundColor: resolvedHeaderTheme.headerContactBtnBg,
                    color: resolvedHeaderTheme.headerContactBtnText,
                    borderColor: resolvedHeaderTheme.headerContactBtnBorder,
                    ['--header-contact-btn-bg' as any]: resolvedHeaderTheme.headerContactBtnBg,
                    ['--header-contact-btn-text' as any]: resolvedHeaderTheme.headerContactBtnText,
                    ['--header-contact-btn-border' as any]: resolvedHeaderTheme.headerContactBtnBorder
                  }
                : undefined
            }
          >
            {copy.navContact}
            <span
              aria-hidden="true"
              className="material-symbols-rounded material-arrow-icon"
              style={resolvedHeaderTheme ? { color: resolvedHeaderTheme.headerContactBtnText } : undefined}
            >
              arrow_outward
            </span>
          </a>
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${resolvedHeaderTheme ? resolvedHeaderTheme.headerBorderColor : 'rgba(255,255,255,0.08)'}` }}>
            <a
              href={(settings.behanceUrl && settings.behanceUrl.includes('yogendrachaudhary1')) ? settings.behanceUrl : 'https://www.behance.net/yogendrachaudhary1'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '12px', color: '#b8ff57', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}
            >
              Behance ↗
            </a>
            <a
              href={settings.linkedinUrl ? (settings.linkedinUrl.startsWith('http') ? settings.linkedinUrl : `https://${settings.linkedinUrl}`) : 'https://www.linkedin.com/in/yogendrach'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '12px', color: '#b8ff57', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--mono)' }}
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      </nav>
    </header>
    </>
  );
};
