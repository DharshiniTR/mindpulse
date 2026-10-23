import React from "react";
import { motion } from "framer-motion";
import { LogOut, User, Star, Flame, Activity, TrendingUp, Mail, Building, GraduationCap } from "lucide-react";
import { useGetCurrentUser, useGetAchievements, useGetCheckinStats } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: achievements } = useGetAchievements();
  const { data: stats } = useGetCheckinStats({ days: 30 });

  const earnedBadges = achievements?.badges.filter(b => b.earned) || [];
  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "MP";

  const progressPct = achievements
    ? Math.min(100, Math.round((achievements.points / achievements.nextLevelPoints) * 100))
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Profile</h1>
        <p className="text-white/60 mt-1">Your wellness journey at a glance.</p>
      </div>

      {/* Avatar + Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6"
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-violet-500/30 flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-display font-bold text-white">{user?.name}</h2>
          {achievements && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mt-2">
              <Star className="w-3.5 h-3.5" />
              Level {achievements.level} — {achievements.levelName}
            </div>
          )}
          <div className="mt-4 space-y-2 text-sm text-white/60">
            {user?.email && (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            )}
            {user?.university && (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Building className="w-4 h-4" />
                <span>{user.university}</span>
              </div>
            )}
            {user?.year && (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <GraduationCap className="w-4 h-4" />
                <span>{user.year}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Level Progress */}
      {achievements && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80 font-medium">Level {achievements.level} — {achievements.levelName}</span>
            <span className="text-white/50">{achievements.points} / {achievements.nextLevelPoints} XP</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-white/40">{achievements.nextLevelPoints - achievements.points} XP until next level</p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-4"
      >
        {[
          { icon: Flame, label: "Streak", value: `${user?.streakDays || 0} days`, color: "text-orange-400" },
          { icon: Activity, label: "Total Check-ins", value: user?.totalCheckins || 0, color: "text-cyan-400" },
          { icon: TrendingUp, label: "Avg Mood (30d)", value: stats ? `${stats.averageMood}/10` : "—", color: "text-violet-400" },
          { icon: Star, label: "Badges Earned", value: earnedBadges.length, color: "text-yellow-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 rounded-2xl text-center">
            <stat.icon className={cn("w-6 h-6 mx-auto mb-2", stat.color)} />
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/50 mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Recent Badges */}
      {earnedBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl space-y-4"
        >
          <h3 className="text-white font-display font-bold text-lg">Recent Badges</h3>
          <div className="flex flex-wrap gap-3">
            {earnedBadges.slice(0, 6).map(badge => (
              <div
                key={badge.id}
                title={badge.description}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-sm text-white/80"
              >
                <span className="text-lg">{badge.icon}</span>
                <span className="font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={logout}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200 font-medium"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </motion.button>
    </div>
  );
}
