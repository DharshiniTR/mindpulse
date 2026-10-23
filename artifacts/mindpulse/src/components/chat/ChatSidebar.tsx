import { useState } from "react";
import { MessageSquare, Plus, Trash2, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  useListGeminiConversations, 
  useCreateGeminiConversation,
  useDeleteGeminiConversation 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListGeminiConversationsQueryKey } from "@workspace/api-client-react";

interface ChatSidebarProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function ChatSidebar({ selectedId, onSelect }: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  
  const { data: conversations, isLoading } = useListGeminiConversations();
  
  const createMutation = useCreateGeminiConversation({
    mutation: {
      onSuccess: (newConv) => {
        queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
        onSelect(newConv.id);
      }
    }
  });

  const deleteMutation = useDeleteGeminiConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
        if (selectedId) onSelect(0); // clear selection
      }
    }
  });

  const handleNewChat = () => {
    const title = `New Conversation ${format(new Date(), "MMM d")}`;
    createMutation.mutate({ data: { title } });
  };

  const filteredConversations = conversations?.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 border-r border-border bg-card/30 flex flex-col h-full backdrop-blur-sm">
      <div className="p-4 border-b border-border flex flex-col gap-4">
        <button
          onClick={handleNewChat}
          disabled={createMutation.isPending}
          className="flex items-center justify-center gap-2 w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl py-3 px-4 font-medium transition-all duration-200 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)]"
        >
          {createMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Chat
        </button>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations?.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground text-sm">
            No conversations found.
          </div>
        ) : (
          filteredConversations?.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "group relative flex flex-col gap-1 p-3 rounded-xl cursor-pointer transition-all duration-200 border",
                selectedId === conv.id
                  ? "bg-primary/10 border-primary/30 text-foreground shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]"
                  : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                  <span className="font-medium text-sm truncate">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm("Delete this conversation?")) {
                      deleteMutation.mutate({ id: conv.id });
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] opacity-60 ml-6">
                {format(new Date(conv.createdAt), "MMM d, yyyy • h:mm a")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
