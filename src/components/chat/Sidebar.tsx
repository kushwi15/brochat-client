import { Plus, MessageSquare, LogOut, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';

import { ThemeToggle } from '../ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useEffect } from 'react';
import { chatApi } from '../../services/api';

export function Sidebar() {
  const { conversations, activeConversationId, setActiveConversation, setConversations, deleteConversation } = useChatStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();



  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await chatApi.getConversations();
        setConversations(response.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };

    fetchConversations();
  }, [setConversations]);

  const handleNewChat = () => {
    setActiveConversation(null);
    navigate('/');
  };

  const handleSelectChat = (id: string) => {
    setActiveConversation(id);
    navigate(`/c/${id}`);
  };

  const handleLogout = () => {
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
    <div className="flex flex-col h-full bg-muted/30 border-r">
      <div className="p-4">
        <Button onClick={handleNewChat} className="w-full justify-start gap-2" variant="outline">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {conversations.map((conv) => (
            <div key={conv.id} className="group relative">
              <Button
                variant={activeConversationId === conv.id ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start text-left font-normal truncate pr-8",
                  activeConversationId === conv.id && "bg-secondary/80 font-medium"
                )}
                onClick={() => handleSelectChat(conv.id)}
              >
                <MessageSquare className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">{conv.title}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={(e) => handleDeleteChat(conv.id, e)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium truncate">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
          <ThemeToggle />
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );
}
