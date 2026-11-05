import React, { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import { usePortfolio } from './context/PortfolioContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';

// Code-split secondary routes so the initial landing page bundle is minimal and renders instantly
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const DynamicCase = lazy(() => import('./pages/case-studies/DynamicCase').then((m) => ({ default: m.DynamicCase })));
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then((m) => ({ default: m.AdminPage })));

const PageFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center py-16" aria-busy="true" aria-label="Loading page">
    <div className="w-5 h-5 border-2 border-white/10 border-t-[#f37021] rounded-full animate-spin" />
  </div>
);

export const App: React.FC = () => {
  const { projects } = usePortfolio();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [scrollTarget, setScrollTarget] = useState(() => window.location.hash.slice(1));
  const [navigationVersion, setNavigationVersion] = useState(0);

  useLayoutEffect(() => {
    if (!scrollTarget) return;
    let cancelled = false;
    let frame = 0;
    let correctionTimer = 0;
    let attempts = 0;

    const scrollToTarget = (behavior: ScrollBehavior) => {
      const target = document.getElementById(scrollTarget);
      if (!target || target.getClientRects().length === 0) {
        if (attempts++ < 30) frame = requestAnimationFrame(() => scrollToTarget(behavior));
        return;
      }
      const headerOffset = document.getElementById('siteHeader')?.getBoundingClientRect().height || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 16;
      window.scrollTo({ top, behavior });
    };

    // Let the routed page paint before looking for its anchor. A few retries
    // cover slower page mounts and direct visits to /#work or /#about.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => scrollToTarget('smooth'));
    });

    // The hero portrait and web fonts can change the height above the target
    // after the first scroll. Correct once those assets have had time to settle.
    correctionTimer = window.setTimeout(() => {
      if (cancelled) return;
      const target = document.getElementById(scrollTarget);
      if (!target || target.getClientRects().length === 0) return;
      const headerOffset = document.getElementById('siteHeader')?.getBoundingClientRect().height || 0;
      const targetTop = target.getBoundingClientRect().top;
      if (Math.abs(targetTop - headerOffset - 16) > 48) scrollToTarget('smooth');
    }, 700);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(correctionTimer);
    };
  }, [currentPath, navigationVersion, scrollTarget]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setScrollTarget(window.location.hash.slice(1));
      setNavigationVersion((version) => version + 1);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const destination = new URL(path, window.location.origin);
    const destinationPath = destination.pathname || '/';
    window.history.pushState(null, '', `${destinationPath}${destination.search}${destination.hash}`);
    setCurrentPath(destinationPath);
    const targetId = destination.hash.slice(1);
    setScrollTarget(targetId);
    setNavigationVersion((version) => version + 1);
    if (!targetId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      return (
        <Suspense fallback={<PageFallback />}>
          <AdminPage onNavigate={navigate} />
        </Suspense>
      );
    }
    if (matchedProject) {
      return (
        <Suspense fallback={<PageFallback />}>
          <DynamicCase project={matchedProject} onNavigate={navigate} />
        </Suspense>
      );
    }
    if (normalized === '/projects' || normalized === '/work') {
      return (
        <Suspense fallback={<PageFallback />}>
          <ProjectsPage onNavigate={navigate} />
        </Suspense>
      );
    }
    if (normalized === '/about') {
      return (
        <Suspense fallback={<PageFallback />}>
          <AboutPage onNavigate={navigate} />
        </Suspense>
      );
    }

    return <HomePage onNavigate={navigate} />;
  };

  return (
    <div className="portfolio-app">
      {!isAdminView && <Header currentPath={normalized} onNavigate={navigate} projectTheme={matchedProject?.theme} />}
      <div id="siteContent">
        {renderRoute()}
      </div>
      {!isAdminView && <Footer />}
    </div>
  );
};

