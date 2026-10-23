import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { useGetGeminiConversation, useListGeminiMessages } from "@workspace/api-client-react";
import { useGeminiStream } from "@/hooks/use-gemini-stream";

export function Chat() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: conversation, isLoading: isLoadingConv } = useGetGeminiConversation(selectedId || 0, {
    query: { enabled: !!selectedId }
  });
  
  const { data: messages, isLoading: isLoadingMessages } = useListGeminiMessages(selectedId || 0, {
    query: { enabled: !!selectedId }
  });

  const { sendMessage, isStreaming, streamedContent } = useGeminiStream();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedId || isStreaming) return;
    
    const userMessage = input.trim();
    setInput("");
    sendMessage(selectedId, userMessage);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] pt-16 bg-background relative z-10 overflow-hidden">
      <ChatSidebar selectedId={selectedId} onSelect={setSelectedId} />
      
      <div className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        {selectedId ? (
          <>
            <div className="h-14 border-b border-white/5 flex items-center px-6 bg-background/50 backdrop-blur-md sticky top-0 z-10">
              <h2 className="font-semibold text-lg">{conversation?.title || "Loading..."}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth pb-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-5 h-5" />
                    <span>Loading mindscape...</span>
                  </div>
                </div>
              ) : messages?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium">Start a conversation</p>
                  <p className="text-sm">Say hello to begin exploring.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {messages?.map((msg) => (
                    <ChatMessage 
                      key={msg.id} 
                      role={msg.role} 
                      content={msg.content} 
                    />
                  ))}
                  {isStreaming && (
                    <ChatMessage 
                      role="assistant" 
                      content={streamedContent} 
                      isStreaming={true} 
                    />
                  )}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              )}
            </div>

            <div className="p-4 bg-gradient-to-t from-background via-background to-transparent">
              <div className="max-w-4xl mx-auto relative">
                <form 
                  onSubmit={handleSubmit}
                  className="relative flex items-end gap-2 bg-card border border-white/10 rounded-2xl p-2 shadow-xl shadow-black/20 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all"
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Message Mind AI..."
                    className="w-full max-h-32 min-h-[44px] bg-transparent border-none resize-none px-4 py-3 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isStreaming}
                    className="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mb-1 mr-1"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
                <div className="text-center mt-2">
                  <span className="text-xs text-muted-foreground/60">Mind AI can make mistakes. Consider verifying important information.</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 mb-6 relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <img 
                src={`${import.meta.env.BASE_URL}images/ai-avatar.png`} 
                alt="AI Avatar"
                className="w-full h-full object-contain relative z-10 opacity-80"
              />
            </div>
            <h2 className="text-3xl font-display font-bold mb-3 glow-text">Mind Chat</h2>
            <p className="text-muted-foreground max-w-md">
              Select a conversation from the sidebar or start a new one to begin exploring ideas, analyzing thoughts, or just chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure MessageSquare is imported for the empty state
import { MessageSquare } from "lucide-react";
