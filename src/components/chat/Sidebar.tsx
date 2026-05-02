import { Plus, MessageSquare, LogOut, Trash2, PanelLeft, Search, X } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';

export function Sidebar() {
  const { conversations, activeConversationId, setActiveConversation, setConversations, deleteConversation, clearChat } = useChatStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { setSidebarOpen } = useAppStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setConversationToDelete(id);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;

    setIsDeleting(true);
    try {
      await chatApi.deleteConversation(conversationToDelete);
      deleteConversation(conversationToDelete);
      if (activeConversationId === conversationToDelete) {
        navigate('/');
      }
      setConversationToDelete(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background lg:bg-card/40 backdrop-blur-xl border-r shadow-2xl z-20">
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

      <ScrollArea className="flex-1 px-2 overflow-hidden">
        <div className="space-y-1.5 p-2 overflow-hidden">
          {filteredConversations.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground text-xs italic">
              No conversations found for "{searchQuery}"
            </div>
          )}
          {filteredConversations.map((conv) => (
            <motion.div
              key={conv.id}
              className="group flex items-center gap-1 w-full max-w-full overflow-hidden"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Chat button — flex-1 + min-w-0 clips overflowing title */}
              <button
                className={cn(
                  "flex items-center gap-2 flex-1 min-w-0 w-0 h-11 px-3 rounded-xl text-sm font-normal text-left transition-all duration-200 overflow-hidden",
                  activeConversationId === conv.id
                    ? "bg-primary/10 text-primary font-semibold shadow-inner"
                    : "hover:bg-muted/50 text-foreground"
                )}
                onClick={() => handleSelectChat(conv.id)}
              >
                <MessageSquare className={cn(
                  "w-4 h-4 shrink-0",
                  activeConversationId === conv.id ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="truncate">{conv.title}</span>
              </button>

              {/* Delete icon — shrink-0 keeps it always visible on the right */}
              <button
                className="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                onClick={(e) => handleDeleteChat(conv.id, e)}
                title="Delete chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50 mt-auto flex flex-col gap-3 bg-muted/20">
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

        <div className="flex items-center gap-2 px-1">
          <Button
            variant="ghost"
            className="flex-1 justify-start h-10 rounded-xl transition-colors text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="font-medium">Log out</span>
          </Button>
        </div>
      </div>

      <Dialog open={!!conversationToDelete} onOpenChange={(open) => !open && setConversationToDelete(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Chat?</DialogTitle>
            <DialogDescription>
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setConversationToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Chat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
