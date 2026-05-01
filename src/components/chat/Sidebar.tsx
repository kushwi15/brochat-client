import { Plus, MessageSquare, LogOut, Trash2, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';

import { ThemeToggle } from '../ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useEffect } from 'react';
import { chatApi } from '../../services/api';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { motion } from 'framer-motion';

export function Sidebar() {
  const { conversations, activeConversationId, setActiveConversation, setConversations, deleteConversation, clearChat } = useChatStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();



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
        <div className="p-4 mb-2">
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
          {conversations.map((conv) => (
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
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold truncate leading-none mb-1">{user?.name}</span>
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
