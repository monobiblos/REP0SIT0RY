import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Header from './components/common/header';
import PageTransition from './components/common/page-transition';

const HomePage = lazy(() => import('./pages/home-page'));
const ArcaivesPage = lazy(() => import('./pages/arcaives-page'));
const MemoPage = lazy(() => import('./pages/memo-page'));
const AdminPage = lazy(() => import('./pages/admin-page'));

function AppContent() {
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTimeout(() => setTransitioning(false), 300);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation.pathname]);

  return (
    <>
      <PageTransition active={transitioning} />
      <Header />
      <Box sx={{ pt: { xs: 7, md: 8 }, flex: 1 }}>
        <Suspense fallback={<PageTransition active />}>
          <Routes location={displayLocation}>
            <Route path="/" element={<HomePage />} />
            <Route path="/arcaives" element={<ArcaivesPage />} />
            <Route path="/arcaives/:id" element={<ArcaivesPage />} />
            <Route path="/memo" element={<MemoPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </Box>
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppContent />
      </Box>
    </HashRouter>
  );
}

export default App;
