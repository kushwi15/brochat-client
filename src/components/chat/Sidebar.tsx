import { Plus, MessageSquare, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ThemeToggle } from '../ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useEffect, useState } from 'react';
import { chatApi } from '../../services/api';

export function Sidebar() {
  const { conversations, activeConversationId, setActiveConversation, setConversations } = useChatStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await chatApi.getConversations();
        setConversations(response.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoading(false);
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
            <Button
              key={conv.id}
              variant={activeConversationId === conv.id ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start text-left font-normal truncate",
                activeConversationId === conv.id && "bg-secondary/80 font-medium"
              )}
              onClick={() => handleSelectChat(conv.id)}
            >
              <MessageSquare className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">{conv.title}</span>
            </Button>
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
