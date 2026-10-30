import React, { useState, useEffect } from 'react';
import { usePortfolio } from './context/PortfolioContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AboutPage } from './pages/AboutPage';
import { DynamicCase } from './pages/case-studies/DynamicCase';
import { AdminPage } from './pages/admin/AdminPage';

export const App: React.FC = () => {
  const { projects } = usePortfolio();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Robust path normalization
  const raw = currentPath.trim();
  let normalized = raw
    .replace(/\/index\.html$/i, '')
    .replace(/\.html$/i, '')
    .replace(/\/+$/, '');
  if (!normalized || normalized === '') normalized = '/';

  // Helper to find project from any path format
  const findProjectByPath = (path: string) => {
    const clean = path.replace(/\/+$/, '');
    
    // 1. Direct slug match (e.g. /somtu -> 'somtu')
    const directSlug = clean.replace(/^\//, '');
    let p = projects.find(proj => proj.slug === directSlug || proj.id === directSlug || proj.route === clean);
    if (p) return p;

    // 2. Sub-path match (e.g. /projects/somtu, /project/somtu, /case-study/somtu)
    const segments = clean.split('/').filter(Boolean);
    if (segments.length >= 1) {
      const lastSegment = segments[segments.length - 1];
      p = projects.find(proj => proj.slug === lastSegment || proj.id === lastSegment || proj.route === `/${lastSegment}`);
      if (p) return p;
    }
    return undefined;
  };

  const matchedProject = findProjectByPath(normalized);
  const isCaseStudy = !!matchedProject;
  const isAdminView = normalized.startsWith('/admin');

  const renderRoute = () => {
    if (isAdminView) {
      return <AdminPage onNavigate={navigate} />;
    }
    if (matchedProject) {
      return <DynamicCase project={matchedProject} onNavigate={navigate} />;
    }
    if (normalized === '/projects' || normalized === '/work') {
      return <ProjectsPage onNavigate={navigate} />;
    }
    if (normalized === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }

    return <HomePage onNavigate={navigate} />;
  };

  return (
    <div className="portfolio-app">
      {!isAdminView && <Header currentPath={normalized} onNavigate={navigate} />}
      <div id="siteContent">
        {renderRoute()}
      </div>
      {!isAdminView && <Footer />}
    </div>
  );
};

