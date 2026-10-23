import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Flame, ArrowRight, HeartPulse, Moon, Zap, AlertCircle, Activity, Wind } from "lucide-react";
import { 
  useGetTodayCheckin, 
  useGetCheckinStats, 
  useGetInsights 
} from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { cn, getMoodColor, getMoodEmoji, getStressColor } from "@/lib/utils";
import { BreathingWidget } from "@/components/BreathingWidget";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: todayRes, isLoading: todayLoading } = useGetTodayCheckin();
  const { data: statsRes, isLoading: statsLoading } = useGetCheckinStats({ days: 7 });
  const { data: insightsRes } = useGetInsights();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const hasCheckedIn = todayRes?.hasCheckedIn;
  const checkin = todayRes?.checkin;

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
            {greeting()}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-white/60 mt-1 text-lg">Here is your daily wellness summary.</p>
        </div>
        
        <div className="flex items-center gap-3 glass-card px-4 py-2">
          <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          <div>
            <div className="text-sm font-bold text-white">{user?.streakDays || 0} Day Streak</div>
            <div className="text-xs text-white/50">Keep it up!</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Action / Status */}
        <div className="lg:col-span-2 space-y-6">
          {!hasCheckedIn && !todayLoading ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-8 bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                <HeartPulse className="w-32 h-32" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">How are you feeling today?</h2>
              <p className="text-white/80 mb-6 max-w-md">Take 30 seconds to log your mood, stress, and energy levels. It helps build a better picture of your wellbeing.</p>
              <Link href="/checkin" className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
                Complete Check-in <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            checkin && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card p-8 relative overflow-hidden"
              >
                <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", getMoodColor(checkin.moodScore))} />
                <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Today's Check-in Complete</h2>
                    <p className="text-white/60 mb-4">Great job tracking your wellbeing today.</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="text-2xl">{getMoodEmoji(checkin.moodScore)}</span>
                        <div>
                          <div className="text-xs text-white/50">Mood</div>
                          <div className="font-bold text-white">{checkin.moodScore}/10</div>
                        </div>
                      </div>
                      
                      <div className={cn("px-4 py-2 rounded-lg border flex items-center gap-2", getStressColor(checkin.stressLevel))}>
                        <Activity className="w-5 h-5" />
                        <div>
                          <div className="text-xs opacity-70">Stress</div>
                          <div className="font-bold capitalize">{checkin.stressLevel}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex w-24 h-24 rounded-full border-4 border-white/10 items-center justify-center relative">
                     <div className={cn("absolute inset-0 rounded-full blur-md opacity-50 bg-gradient-to-tr", getMoodColor(checkin.moodScore))} />
                     <span className="text-5xl relative z-10">{getMoodEmoji(checkin.moodScore)}</span>
                  </div>
                </div>
              </motion.div>
            )
          )}

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Avg Mood", value: statsRes?.averageMood?.toFixed(1) || "-", icon: HeartPulse, color: "text-rose-400" },
              { label: "Avg Energy", value: statsRes?.averageEnergy?.toFixed(1) || "-", icon: Zap, color: "text-amber-400" },
              { label: "Avg Sleep", value: statsRes?.averageSleep ? `${statsRes.averageSleep}h` : "-", icon: Moon, color: "text-blue-400" },
              { label: "Check-ins", value: statsRes?.totalCheckins || 0, icon: Activity, color: "text-emerald-400" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 flex flex-col items-center justify-center text-center">
                <stat.icon className={cn("w-6 h-6 mb-2", stat.color)} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Insights & Actions */}
        <div className="space-y-6">
          {/* Priority Nudge */}
          {insightsRes?.nudges && insightsRes.nudges.length > 0 && (
            <div className={cn(
              "glass-card p-5 border-l-4",
              insightsRes.alertLevel >= 2 ? "border-l-red-500 bg-red-500/5" : "border-l-primary bg-primary/5"
            )}>
              <div className="flex gap-3 mb-2">
                <AlertCircle className={cn("w-5 h-5", insightsRes.alertLevel >= 2 ? "text-red-400" : "text-primary")} />
                <h3 className="font-bold text-white">{insightsRes.nudges[0].title}</h3>
              </div>
              <p className="text-sm text-white/70">{insightsRes.nudges[0].message}</p>
              <Link href="/insights" className="text-xs font-medium text-primary mt-3 inline-block hover:underline">
                View all insights &rarr;
              </Link>
            </div>
          )}

          {/* Quick Breathing Access */}
          <div className="glass-card p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 border border-cyan-500/30">
              <Wind className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-bold text-white mb-2">Take a Breather</h3>
            <p className="text-sm text-white/60 mb-4">Feeling overwhelmed? Take 60 seconds to reset your nervous system.</p>
            <Link href="/insights" className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-colors">
              Start Exercise
            </Link>
          </div>
        </div>
      </div>
      
      <BreathingWidget />
    </div>
  );
}
