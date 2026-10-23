import React from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Flame, Zap, Shield } from "lucide-react";
import { useGetAchievements } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export default function Achievements() {
  const { data: achievements, isLoading } = useGetAchievements();

  if (isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!achievements) return null;

  const progress = (achievements.points / (achievements.points + achievements.nextLevelPoints)) * 100;

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white">Achievements</h1>
        <p className="text-white/60">Your wellness journey milestones.</p>
      </div>

      {/* Level Banner */}
      <div className="glass-card p-6 md:p-8 bg-gradient-to-r from-accent/20 to-primary/20 border-white/10 relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-20px] opacity-10">
          <Trophy className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-black/40 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] shrink-0">
            <div className="text-center">
              <div className="text-sm text-white/60 uppercase tracking-widest font-bold">Level</div>
              <div className="text-5xl font-display font-black text-white">{achievements.level}</div>
            </div>
          </div>
          
          <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-1">{achievements.levelName}</h2>
            <p className="text-white/70 mb-4">{achievements.points} Total Points</p>
            
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10 mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
            <div className="text-xs text-white/50 text-right">
              {achievements.nextLevelPoints} points to Level {achievements.level + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Current Streak", val: achievements.streak, icon: Flame, color: "text-orange-500" },
          { label: "Total Badges", val: achievements.badges.filter(b => b.earned).length, icon: Shield, color: "text-emerald-400" },
          { label: "Points Earned", val: achievements.points, icon: Zap, color: "text-cyan-400" },
          { label: "Top Percentile", val: "Top 15%", icon: Star, color: "text-yellow-400" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 flex flex-col items-center justify-center text-center">
            <stat.icon className={cn("w-6 h-6 mb-2", stat.color)} />
            <div className="text-2xl font-bold text-white">{stat.val}</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6">Badge Collection</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.badges.map((badge) => (
            <motion.div 
              key={badge.id}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "glass-card p-6 flex flex-col items-center text-center transition-all duration-300",
                badge.earned 
                  ? "border-primary/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]" 
                  : "opacity-60 grayscale"
              )}
            >
              <div className="text-4xl mb-3 drop-shadow-lg">{badge.icon}</div>
              <h4 className="font-bold text-white mb-1">{badge.name}</h4>
              <p className="text-xs text-white/60 leading-tight">{badge.description}</p>
              {badge.earned && badge.earnedAt && (
                <div className="mt-3 text-[10px] text-primary/80 uppercase font-semibold bg-primary/10 px-2 py-1 rounded">
                  Earned
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
