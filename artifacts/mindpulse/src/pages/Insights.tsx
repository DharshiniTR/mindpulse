import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, Info, Sparkles, Heart } from "lucide-react";
import { useGetInsights } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { BreathingWidget } from "@/components/BreathingWidget";

export default function Insights() {
  const { data: insights, isLoading } = useGetInsights();

  if (isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!insights) return null;

  const getNudgeIcon = (type: string) => {
    switch(type) {
      case 'warning': return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'celebration': return <Sparkles className="w-6 h-6 text-yellow-400" />;
      case 'suggestion': return <Lightbulb className="w-6 h-6 text-cyan-400" />;
      default: return <Info className="w-6 h-6 text-blue-400" />;
    }
  };

  const getNudgeColor = (type: string) => {
    switch(type) {
      case 'warning': return "border-red-500/30 bg-red-500/10";
      case 'celebration': return "border-yellow-500/30 bg-yellow-500/10";
      case 'suggestion': return "border-cyan-500/30 bg-cyan-500/10";
      default: return "border-blue-500/30 bg-blue-500/10";
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">AI Insights</h1>
        <p className="text-white/60">Personalized nudges based on your check-in patterns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Nudges */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Your Nudges</h2>
          {insights.nudges.length === 0 ? (
            <div className="glass-card p-8 text-center text-white/50">
              Check in more often to get personalized insights.
            </div>
          ) : (
            insights.nudges.map((nudge, i) => (
              <motion.div
                key={nudge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn("p-5 rounded-2xl border backdrop-blur-md flex gap-4", getNudgeColor(nudge.type))}
              >
                <div className="shrink-0 pt-1">
                  {getNudgeIcon(nudge.type)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">{nudge.title}</h3>
                  <p className="text-white/80 leading-relaxed">{nudge.message}</p>
                </div>
              </motion.div>
            ))
          )}

          <div className="glass-card p-6 mt-8">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-400" /> Weekly Summary
            </h3>
            <p className="text-white/80 italic border-l-2 border-white/20 pl-4 py-1">
              "{insights.weeklyInsight}"
            </p>
          </div>
        </div>

        {/* Right Column - Interactive Tools */}
        <div className="space-y-6">
          {insights.breathingRecommended && (
            <div className="glass-card p-1 border-primary/30">
              <BreathingWidget isInline />
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-400" /> Wellness Tips
            </h3>
            <ul className="space-y-3">
              {insights.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-white/70 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
