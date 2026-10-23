import ReactMarkdown from "react-markdown";
import { User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChatMessageProps {
  role: "user" | "assistant" | string;
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isAi = role === "assistant" || role === "model";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full px-4 py-6 md:px-8",
        isAi ? "bg-card/40 border-y border-white/5" : "bg-transparent"
      )}
    >
      <div className="max-w-4xl mx-auto flex gap-4 md:gap-6 w-full">
        <div className={cn(
          "w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border shadow-sm mt-1",
          isAi 
            ? "bg-primary/20 border-primary/40 text-primary" 
            : "bg-secondary border-white/10 text-foreground"
        )}>
          {isAi ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>
        
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="font-medium text-sm text-muted-foreground">
            {isAi ? "Mind AI" : "You"}
          </div>
          <div className="prose prose-invert max-w-none break-words">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <div className="flex items-center gap-1 h-6">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            {isStreaming && content && (
              <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
