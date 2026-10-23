import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HeartHandshake, Star, Send, X, Loader2 } from "lucide-react";
import { 
  useGetCommunityFeed, 
  useShareCommunityPost, 
  useReactToPost 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Community() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: posts, isLoading } = useGetCommunityFeed({ limit: 50 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postMsg, setPostMsg] = useState("");
  const [postMood, setPostMood] = useState("😊");

  const shareMutation = useShareCommunityPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/community/feed"] });
        setIsModalOpen(false);
        setPostMsg("");
        toast({ title: "Shared successfully", description: "Your post is now visible anonymously." });
      }
    }
  });

  const reactMutation = useReactToPost({
    mutation: {
      onMutate: async ({ data }) => {
        // Optimistic update
        await queryClient.cancelQueries({ queryKey: ["/api/community/feed"] });
        const previousPosts = queryClient.getQueryData<any[]>(["/api/community/feed"]);
        
        if (previousPosts) {
          queryClient.setQueryData(["/api/community/feed"], previousPosts.map(p => {
            if (p.id === data.postId) {
              return {
                ...p,
                reactions: {
                  ...p.reactions,
                  [data.reaction]: p.reactions[data.reaction as keyof typeof p.reactions] + 1
                }
              };
            }
            return p;
          }));
        }
        return { previousPosts };
      },
      onError: (err, variables, context) => {
        if (context?.previousPosts) {
          queryClient.setQueryData(["/api/community/feed"], context.previousPosts);
        }
      }
    }
  });

  if (isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0 max-w-3xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Community</h1>
          <p className="text-white/60">Anonymous support. You're not alone.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-background font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-primary/20"
        >
          <Send className="w-4 h-4" /> Share
        </button>
      </div>

      <div className="space-y-4">
        {posts?.map((post) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl shrink-0">
                {post.mood}
              </div>
              <div className="flex-1">
                <p className="text-white/90 text-lg leading-relaxed mb-3">{post.message}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/50">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-xs text-white/30">{formatDate(post.createdAt, "MMM d, h:mm a")}</span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => reactMutation.mutate({ data: { postId: post.id, reaction: "heart" } })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-500/10 text-white/50 hover:text-rose-400 transition-colors text-sm font-medium"
                    >
                      <Heart className="w-4 h-4" /> {post.reactions.heart}
                    </button>
                    <button 
                      onClick={() => reactMutation.mutate({ data: { postId: post.id, reaction: "hug" } })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-blue-500/10 text-white/50 hover:text-blue-400 transition-colors text-sm font-medium"
                    >
                      <HeartHandshake className="w-4 h-4" /> {post.reactions.hug}
                    </button>
                    <button 
                      onClick={() => reactMutation.mutate({ data: { postId: post.id, reaction: "star" } })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-yellow-500/10 text-white/50 hover:text-yellow-400 transition-colors text-sm font-medium"
                    >
                      <Star className="w-4 h-4" /> {post.reactions.star}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Share Anonymously</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/70 block mb-2">Current Mood</label>
                  <div className="flex gap-2">
                    {["🤩","😊","😐","😔","😫"].map(emoji => (
                      <button 
                        key={emoji}
                        onClick={() => setPostMood(emoji)}
                        className={cn(
                          "w-12 h-12 text-2xl rounded-full transition-transform",
                          postMood === emoji ? "bg-primary/30 border border-primary scale-110" : "bg-white/5 border border-white/10 opacity-60 hover:opacity-100"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/70 block mb-2">Your Message</label>
                  <textarea 
                    rows={4}
                    value={postMsg}
                    onChange={(e) => setPostMsg(e.target.value)}
                    className="glass-input resize-none"
                    placeholder="Express what's on your mind. This will be shared anonymously."
                  />
                </div>

                <button 
                  onClick={() => shareMutation.mutate({ data: { mood: postMood, message: postMsg, tags: ["vent"] } })}
                  disabled={!postMsg.trim() || shareMutation.isPending}
                  className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {shareMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post Anonymously"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
