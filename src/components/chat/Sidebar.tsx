import { Plus, MessageSquare, LogOut, Trash2, Shield, PanelLeft, Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';

import { ThemeToggle } from '../ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useEffect, useState } from 'react';
import { chatApi } from '../../services/api';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../ui/input';

export function Sidebar() {
  const { conversations, activeConversationId, setActiveConversation, setConversations, deleteConversation, clearChat } = useChatStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { setSidebarOpen } = useAppStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await chatApi.getConversations();
        setConversations(response.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };

    fetchConversations();
  }, [isAuthenticated, setConversations]);

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    setActiveConversation(null);
    navigate('/');
  };

  const handleSelectChat = (id: string) => {
    setActiveConversation(id);
    navigate(`/c/${id}`);
  };

  const handleLogout = () => {
    clearChat();
    logout();
    navigate('/login');
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await chatApi.deleteConversation(id);
        deleteConversation(id);
        if (activeConversationId === id) {
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-xl border-r shadow-xl z-20">
      {isAuthenticated && (
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setSidebarOpen(false)}
              title="Close Sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-9 w-9 transition-colors",
                isSearchOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
              )}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Search Conversations"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <Input
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pr-8 bg-muted/30 border-primary/10 focus-visible:ring-primary/20 rounded-lg text-xs"
                    autoFocus
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-transparent"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            onClick={handleNewChat} 
            className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/10 shadow-sm transition-all duration-200" 
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            <span className="font-semibold">New Chat</span>
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1.5 p-2">
          {filteredConversations.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground text-xs italic">
              No conversations found for "{searchQuery}"
            </div>
          )}
          {filteredConversations.map((conv) => (
            <motion.div 
              key={conv.id} 
              className="group relative"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant={activeConversationId === conv.id ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start text-left font-normal truncate pr-10 h-11 rounded-xl transition-all duration-200",
                  activeConversationId === conv.id 
                    ? "bg-primary/10 text-primary font-semibold shadow-inner" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleSelectChat(conv.id)}
              >
                <MessageSquare className={cn(
                  "w-4 h-4 mr-2 shrink-0 transition-colors",
                  activeConversationId === conv.id ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="truncate">{conv.title}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                onClick={(e) => handleDeleteChat(conv.id, e)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50 mt-auto flex flex-col gap-3 bg-muted/20">
        {!isAuthenticated ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-1 shadow-sm"
          >
            <div className="flex items-center gap-2 text-primary mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Guest Mode</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Sign in to save your chat history and unlock unlimited messages.
            </p>
          </motion.div>
        ) : (
          <div className="flex items-center justify-between mb-1 px-1">
            <div className="flex items-center gap-3 truncate">
              <Avatar className="w-9 h-9 border-2 border-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold truncate leading-none mb-1">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-[11px] text-muted-foreground truncate leading-none">{user?.email}</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        )}
        
        <div className="flex items-center gap-2 px-1">
          {!isAuthenticated && <ThemeToggle />}
          <Button 
            variant="ghost" 
            className={cn(
              "flex-1 justify-start h-10 rounded-xl transition-colors",
              isAuthenticated ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={isAuthenticated ? handleLogout : () => navigate('/login')}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="font-medium">{isAuthenticated ? 'Log out' : 'Sign in'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
