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

  // Normalize path
  let normalized = currentPath.replace(/\/index\.html$/, '').replace(/\.html$/, '');
  if (!normalized || normalized === '') normalized = '/';
  if (normalized.endsWith('/') && normalized.length > 1) {
    normalized = normalized.slice(0, -1);
  }

  const renderRoute = () => {
    if (normalized === '/' || normalized === '') {
      return <HomePage onNavigate={navigate} />;
    }
    if (normalized === '/projects') {
      return <ProjectsPage onNavigate={navigate} />;
    }
    if (normalized === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (normalized.startsWith('/admin')) {
      return <AdminPage onNavigate={navigate} />;
    }

    // Check for dynamic projects created through CMS
    const slug = normalized.replace(/^\//, '');
    const foundProject = projects.find(p => p.slug === slug);
    if (foundProject) {
      return <DynamicCase project={foundProject} onNavigate={navigate} />;
    }

    return <HomePage onNavigate={navigate} />;
  };

  const isAdminView = normalized.startsWith('/admin');

  return (
    <div className="portfolio-app">
      {!isAdminView && <Header currentPath={normalized} onNavigate={navigate} />}
      <div id="siteContent">
        {renderRoute()}
      </div>
      {!isAdminView && <Footer onNavigate={navigate} />}
    </div>
  );
};
