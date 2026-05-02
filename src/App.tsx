import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import { useEffect } from 'react';
import { Preloader } from './components/ui/Preloader';
import { Toaster } from './components/ui/sonner';

function App() {
  const theme = useAppStore((state) => state.theme);
  const { initializeGuest, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      initializeGuest();
    }
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, _hasHydrated, isAuthenticated]);

  if (!_hasHydrated) {
    return <Preloader />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster richColors position="top-center" closeButton expand />
    </BrowserRouter>
  );
}

export default App;
