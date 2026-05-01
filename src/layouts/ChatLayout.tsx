import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/chat/Sidebar';
import { GuestLimitModal } from '../components/chat/GuestLimitModal';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';
import { signalRService } from '../services/signalrService';
import { cn } from '../lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function ChatLayout() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

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
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full min-w-0">
        {/* Mobile Header */}
        <div className="flex items-center h-14 px-4 border-b lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="ml-4 font-semibold">BroChat</span>
        </div>

        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
      <GuestLimitModal />
    </div>
  );
}
