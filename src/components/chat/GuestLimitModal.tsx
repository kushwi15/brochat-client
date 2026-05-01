import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useAppStore } from '../../store/useAppStore';
import { Sparkles, UserPlus } from 'lucide-react';

export function GuestLimitModal() {
  const navigate = useNavigate();
  const { isGuestLimitModalOpen, setGuestLimitModalOpen } = useAppStore();

  const handleSignUp = () => {
    setGuestLimitModalOpen(false);
    navigate('/register');
  };

  return (
    <Dialog open={isGuestLimitModalOpen} onOpenChange={setGuestLimitModalOpen}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 p-6 pb-2 flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="px-6 py-4 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2">
              Limit Reached
            </DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed">
              You've hit the limit for guest messages. To continue chatting without interruption and unlock full history, please create an account.
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="px-6 py-6 bg-muted/30 flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={() => setGuestLimitModalOpen(false)}
            className="flex-1"
          >
            Wait 10 minutes
          </Button>
          <Button 
            onClick={handleSignUp}
            className="flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Sign Up Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
