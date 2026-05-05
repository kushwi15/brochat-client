import { Send, Square, Mic, MicOff, Loader2, Paperclip, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useChatStore } from '../../store/useChatStore';
import { useSendMessage } from '../../hooks/useSendMessage';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { signalRService } from '../../services/signalrService';
import { cn } from '../../lib/utils';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MessageInput() {
  const { 
    inputText, 
    setInputText, 
    isTyping, 
    setTyping,
    isVoiceMode,
    setIsVoiceMode,
    selectedFiles,
    setSelectedFiles
  } = useChatStore();

  const { sendMessage } = useSendMessage();
  const [isAutoSending, setIsAutoSending] = useState(false);
  const autoSendTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (overrideText?: string) => {
    // 1. Clear any pending auto-send timers
    if (autoSendTimerRef.current) {
      window.clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    setIsAutoSending(false);

    // 2. Stop listening if active
    if (isListening) {
      stopListening();
    }

    // 3. Use the latest transcript if provided, otherwise fall back to store text
    const textToSend = overrideText || inputText;

    if (textToSend.trim() || selectedFiles.length > 0) {
      // Clear immediately for a snappy UI
      setInputText('');
      setSelectedFiles([]);
      
      // 4. Perform the actual sending (which includes uploads) in the background
      setTimeout(async () => {
        await sendMessage(textToSend, selectedFiles);
      }, 50);
    }
  };

  const addFileLocally = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const newAttachment = {
      url: previewUrl,
      type: file.type,
      name: file.name,
      file: file
    };
    setSelectedFiles(prev => [...prev, newAttachment]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addFileLocally(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Wrapper for manual button clicks to satisfy MouseEventHandler type
  const handleManualSend = () => {
    handleSend();
  };

  const { isListening, supported, startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      // 1. Prevent the mic from capturing the AI's own voice
      if (isTyping || (window.speechSynthesis && window.speechSynthesis.speaking)) {
        return;
      }

      setInputText(transcript);
      
      // Reset timer on every new word/result
      if (autoSendTimerRef.current) window.clearTimeout(autoSendTimerRef.current);
      
      setIsAutoSending(true);
      autoSendTimerRef.current = window.setTimeout(() => {
        handleSend(transcript);
      }, 2000);
    },
    onEnd: () => {
    }
  });

  // Auto-restart microphone ONLY when AI is totally silent and finished typing
  useEffect(() => {
    const checkAndRestart = () => {
      const isAiSpeaking = window.speechSynthesis && window.speechSynthesis.speaking;
      
      if (isVoiceMode && !isTyping && !isListening && !isAutoSending && !isAiSpeaking) {
        startListening();
      }
    };

    // Poll slightly to ensure we catch the end of speech synthesis
    const interval = setInterval(checkAndRestart, 500);
    return () => clearInterval(interval);
  }, [isTyping, isVoiceMode, isListening, isAutoSending, startListening]);


  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSendTimerRef.current) window.clearTimeout(autoSendTimerRef.current);
    };
  }, []);


  const toggleRecording = () => {
    if (isListening) {
      stopListening();
      setIsVoiceMode(false);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (autoSendTimerRef.current) {
        window.clearTimeout(autoSendTimerRef.current);
        autoSendTimerRef.current = null;
      }
      setIsAutoSending(false);
    } else {
      startListening();
      setIsVoiceMode(true);
    }
  };




  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex flex-col w-full gap-2">
      {isAutoSending && (
        <div className="flex items-center gap-2 px-4 py-1 text-xs text-primary animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Sending in 2 seconds...</span>
        </div>
      )}

      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 10 }}
            className="flex flex-wrap gap-2 px-4 mb-2 max-h-40 overflow-y-auto custom-scrollbar"
          >
            {selectedFiles.map((file, index) => (
              <motion.div 
                key={file.url} 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                className="relative group w-20 h-20 shrink-0"
              >
                {file.type.startsWith('image/') ? (
                  <img 
                    src={file.url} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded-xl border shadow-sm transition-transform group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-xl border text-[10px] text-center p-1 transition-colors group-hover:bg-muted/80">
                    <Paperclip className="w-6 h-6 mb-1 text-primary" />
                    <span className="truncate w-full px-1">{file.name}</span>
                  </div>
                )}
                <button 
                  onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 bg-background border rounded-full p-1 shadow-md hover:text-destructive transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-end w-full bg-muted/50 rounded-3xl border focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all p-2 gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,application/pdf"
        />
        <Button
          size="icon"
          variant="ghost"
          className="w-10 h-10 rounded-full text-muted-foreground hover:bg-muted shrink-0 mb-0.5"
          onClick={() => fileInputRef.current?.click()}
          disabled={isTyping}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <textarea
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (isAutoSending && autoSendTimerRef.current) {
              clearTimeout(autoSendTimerRef.current);
              setIsAutoSending(false);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none border-0 focus-visible:ring-0 px-3 py-3 text-sm focus:outline-none"
          rows={1}
        />
        <div className="flex shrink-0 mb-1 gap-1">
          {supported && (
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "w-10 h-10 rounded-full transition-all duration-300",
                isVoiceMode ? "bg-red-500/10 text-red-500 animate-pulse scale-110" : "text-muted-foreground hover:bg-muted"
              )}
              onClick={toggleRecording}
              title={isVoiceMode ? "Stop voice mode" : "Voice command"}
            >
              {isVoiceMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}


          {isTyping ? (
            <Button 
              size="icon" 
              variant="default" 
              className="w-10 h-10 rounded-full bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                await signalRService.cancelGeneration();
                setTyping(false);
              }}
              title="Stop generating"
            >
              <Square className="w-4 h-4 fill-current" />
            </Button>
          ) : (
            <Button 
              size="icon" 
              variant="default" 
              className="w-10 h-10 rounded-full"
              disabled={!inputText.trim() && !isListening}
              onClick={handleManualSend}
            >
              <Send className="w-4 h-4" />
            </Button>

          )}
        </div>
      </div>
    </div>
  );
}

