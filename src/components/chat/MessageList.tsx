import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '../../lib/utils';
import { Bot, Sparkles, MessageSquare, Code, Lightbulb, Pencil, Check, X, Volume2, VolumeX, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSendMessage } from '../../hooks/useSendMessage';
import { chatApi } from '../../services/api';
import { signalRService } from '../../services/signalrService';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

export function MessageList() {
  const { messages, isTyping, updateMessage, setTyping, setMessages, activeConversationId } = useChatStore();
  const { user } = useAuthStore();
  const { sendMessage } = useSendMessage();
  const { speak, stop, isPlaying } = useTextToSpeech();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const userMessages = messages.filter(m => m.role === 'user');
  const lastUserMessageId = userMessages[userMessages.length - 1]?.id;

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditValue(content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editValue.trim()) return;

    try {
      await chatApi.updateMessage(editingId, editValue);
      updateMessage(editingId, editValue);
      
      // If editing the last message, trigger AI regeneration
      if (editingId === lastUserMessageId && activeConversationId) {
        setTyping(true);
        // Optimistically remove the last AI message if it exists
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'ai') {
          setMessages(messages.slice(0, -1));
        }
        await signalRService.regenerateResponse(activeConversationId);
      }
      
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update message:', error);
      setTyping(false);
    }
  };

  const handleToggleSpeech = (id: string, content: string) => {
    if (isPlaying && speakingMessageId === id) {
      stop();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(id);
      speak(content);
    }
  };

  // Reset speaking state when TTS ends naturally
  useEffect(() => {
    if (!isPlaying) {
      setSpeakingMessageId(null);
    }
  }, [isPlaying]);

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-2 mx-auto rotate-3 hover:rotate-0 transition-transform duration-300">
              <Bot className="w-10 h-10 text-primary" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back BRO!</h2>
            <p className="text-muted-foreground text-lg">
              Your intelligent companion for everything from coding to brainstorming.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {[
              { icon: MessageSquare, title: "Explain anything", desc: "Complex topics made simple", prompt: "Explain how quantum computing works in simple terms." },
              { icon: Code, title: "Write & Debug", desc: "Instant code help and reviews", prompt: "Write a clean React component for a responsive navigation bar." },
              { icon: Lightbulb, title: "Brainstorm", desc: "Ideas for your next project", prompt: "Brainstorm 5 unique startup ideas for a sustainable lifestyle." },
              { icon: Sparkles, title: "And more...", desc: "Just ask and I'll help!", prompt: "What are some interesting things I can ask you?" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                onClick={() => handlePromptClick(item.prompt)}
                className="p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
              >
                <item.icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6 pb-20">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "flex gap-4 w-full",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Avatar className={cn(
                "w-9 h-9 flex-shrink-0 border-none shadow-sm mt-1",
                msg.role === 'user' ? "bg-primary" : "bg-muted shadow-inner"
              )}>
                {msg.role === 'user' ? (
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold border-none">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-muted text-muted-foreground border-none">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                )}
              </Avatar>

              <div
                className={cn(
                  "px-4 py-3 rounded-2xl max-w-[85%] text-sm shadow-sm transition-all duration-200",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-tr-sm hover:shadow-md"
                    : "bg-card border rounded-tl-sm hover:shadow-md"
                )}
              >
                {msg.role === 'user' ? (
                  <div className="group relative pr-6">
                    {editingId === msg.id ? (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-primary-foreground/10 border-none focus:ring-0 text-sm resize-none rounded p-1 outline-none min-h-[60px]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit();
                            }
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingId(null)} className="p-1 hover:bg-primary-foreground/20 rounded">
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={handleSaveEdit} className="p-1 hover:bg-primary-foreground/20 rounded">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {msg.attachments.map((file, idx) => (
                              <div key={idx} className="max-w-[200px] overflow-hidden rounded-lg border border-primary-foreground/20">
                                {file.type?.startsWith('image/') ? (
                                  <img 
                                    src={file.url} 
                                    alt="Attached" 
                                    className="max-h-48 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity" 
                                    onClick={() => window.open(file.url, '_blank')}
                                  />
                                ) : (
                                  <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-primary-foreground/10 text-xs hover:bg-primary-foreground/20 transition-colors"
                                  >
                                    <Paperclip className="w-4 h-4" />
                                    <span className="truncate max-w-[120px]">{file.name || 'Attachment'}</span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                        {msg.id === lastUserMessageId && !isTyping && (
                          <button
                            onClick={() => handleEdit(msg.id, msg.content)}
                            className="absolute -right-1 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-foreground/20 rounded"
                            title="Edit message"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-1">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-primary">{children}</h3>,
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                        code: ({ children, className }) => {
                          const isBlock = className?.includes('language-');
                          return isBlock ? (
                            <code className="block bg-muted text-primary font-mono text-xs p-3 rounded-lg my-2 overflow-x-auto">{children}</code>
                          ) : (
                            <code className="bg-muted text-primary font-mono text-xs px-1.5 py-0.5 rounded">{children}</code>
                          );
                        },
                        pre: ({ children }) => <pre className="bg-muted rounded-lg my-2 overflow-x-auto">{children}</pre>,
                        blockquote: ({ children }) => <blockquote className="border-l-2 border-primary pl-3 my-2 text-muted-foreground italic">{children}</blockquote>,
                        hr: () => <hr className="my-3 border-border" />,
                        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80">{children}</a>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
                {msg.role === 'ai' && !isTyping && (
                  <div className="flex justify-start mt-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => handleToggleSpeech(msg.id, msg.content)}
                      className={cn(
                        "p-1.5 rounded-lg transition-all duration-200",
                        isPlaying && speakingMessageId === msg.id
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      )}
                      title={isPlaying && speakingMessageId === msg.id ? "Stop reading" : "Read message"}
                    >
                      {isPlaying && speakingMessageId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 w-full flex-row"
          >
            <Avatar className="w-9 h-9 flex-shrink-0 border bg-muted shadow-inner">
              <AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback>
            </Avatar>
            <div className="px-5 py-4 rounded-2xl bg-card border rounded-tl-sm flex items-center gap-1.5 h-[48px] shadow-sm">
              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} className="h-4" />
      </div>
    </ScrollArea>
  );
}
