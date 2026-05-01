import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { useAppStore } from './store/useAppStore';
import { useEffect } from 'react';
import { Toaster } from './components/ui/sonner';

function App() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
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
  }, [theme]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster richColors position="top-center" closeButton expand />
    </BrowserRouter>
  );
}

export default App;
