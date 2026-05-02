import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/chat/Sidebar';
import { GuestLimitModal } from '../components/chat/GuestLimitModal';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';
import { signalRService } from '../services/signalrService';
import { cn } from '../lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

export default function ChatLayout() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    signalRService.startConnection();
    return () => {
      signalRService.stopConnection();
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {isAuthenticated && (
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out bg-background",
            sidebarOpen 
              ? "translate-x-0 w-72 lg:relative" 
              : "-translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden"
          )}
        >
          <Sidebar />
        </div>
      )}


      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full min-w-0 bg-background relative">
        {/* Floating Sidebar Toggle (Desktop Only) */}
        {!sidebarOpen && isAuthenticated && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 z-30 hidden lg:block"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
              className="bg-card/50 backdrop-blur-md border shadow-sm hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* Mobile Header */}
        <div className="flex items-center h-14 px-4 border-b lg:hidden">
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <span className={cn("font-semibold", isAuthenticated ? "ml-4" : "mx-auto")}>BroChat</span>
        </div>

        {/* Guest Mode Banner */}
        {!isAuthenticated && (
          <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between z-30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Guest Mode</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">— Sign in to save your chat history and unlock all features.</span>
            </div>
            <Button 
              size="sm" 
              className="h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
              onClick={() => window.location.href = '/login'}
            >
              Sign In
            </Button>
          </div>
        )}

        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
      <GuestLimitModal />
    </div>
  );
}
