import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useCreateCheckin, type CreateCheckinRequestStressLevel } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { cn, getMoodEmoji, getMoodColor } from "@/lib/utils";

export default function CheckIn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    moodScore: 5,
    energyLevel: 5,
    stressLevel: "medium" as CreateCheckinRequestStressLevel,
    sleepHours: 7,
    exerciseMinutes: 0,
    gratitudeNote: "",
    journalNote: "",
    tags: [] as string[],
    shareAnonymously: false
  });

  const mutation = useCreateCheckin({
    mutation: {
      onSuccess: () => {
        setStep(4); // Success step
        setTimeout(() => setLocation("/dashboard"), 2500);
      },
      onError: (err) => {
        toast({ title: "Failed to save", description: err.message, variant: "destructive" });
      }
    }
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  const handleSubmit = () => {
    mutation.mutate({ data: formData });
  };

  const currentEmoji = getMoodEmoji(formData.moodScore);
  const currentColor = getMoodColor(formData.moodScore);

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col justify-center pb-20">
      
      {/* Progress Bar */}
      <div className="mb-8 px-4">
        <div className="flex justify-between text-xs font-medium text-white/50 mb-2">
          <span>The Basics</span>
          <span>Physical</span>
          <span>Notes</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: "33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <motion.div 
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="glass-card p-6 md:p-10"
      >
        {step === 1 && (
          <div className="space-y-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">How are you feeling?</h2>
              <div className="flex justify-center mt-6 mb-4">
                <motion.div 
                  key={currentEmoji}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  {currentEmoji}
                </motion.div>
              </div>
              <div className={cn("text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r", currentColor)}>
                {formData.moodScore}/10
              </div>
            </div>

            <div>
              <input 
                type="range" min="1" max="10" step="1"
                value={formData.moodScore}
                onChange={e => setFormData(p => ({ ...p, moodScore: parseInt(e.target.value) }))}
              />
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>Terrible</span>
                <span>Amazing</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-white text-center">Stress Level</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['low', 'medium', 'high', 'critical'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setFormData(p => ({ ...p, stressLevel: level }))}
                    className={cn(
                      "py-3 px-4 rounded-xl border text-sm font-bold capitalize transition-all",
                      formData.stressLevel === level 
                        ? level === 'critical' ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                        : level === 'high' ? 'bg-orange-500 text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                        : level === 'medium' ? 'bg-yellow-500 text-white border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                        : 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        : "bg-black/20 text-white/60 border-white/10 hover:border-white/30"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Physical Wellbeing</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="font-medium text-white">Energy Level</label>
                <span className="text-primary font-bold">{formData.energyLevel}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" step="1"
                value={formData.energyLevel}
                onChange={e => setFormData(p => ({ ...p, energyLevel: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="font-medium text-white">Sleep Last Night</label>
                <span className="text-accent font-bold">{formData.sleepHours} hrs</span>
              </div>
              <input 
                type="range" min="0" max="14" step="0.5"
                value={formData.sleepHours}
                onChange={e => setFormData(p => ({ ...p, sleepHours: parseFloat(e.target.value) }))}
              />
            </div>

            <div className="space-y-4">
              <label className="font-medium text-white block">Exercise</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 15, 30, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setFormData(p => ({ ...p, exerciseMinutes: mins }))}
                    className={cn(
                      "py-2 rounded-lg text-sm transition-colors border",
                      formData.exerciseMinutes === mins 
                        ? "bg-primary/20 text-primary border-primary" 
                        : "bg-black/20 text-white/60 border-white/10"
                    )}
                  >
                    {mins === 60 ? '60+' : mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Some Context</h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Gratitude (Optional)</label>
              <textarea 
                rows={2}
                value={formData.gratitudeNote}
                onChange={e => setFormData(p => ({ ...p, gratitudeNote: e.target.value }))}
                className="glass-input resize-none"
                placeholder="What are you grateful for today?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Journal Note (Optional)</label>
              <textarea 
                rows={3}
                value={formData.journalNote}
                onChange={e => setFormData(p => ({ ...p, journalNote: e.target.value }))}
                className="glass-input resize-none"
                placeholder="Any specific thoughts?"
              />
            </div>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input 
                type="checkbox" 
                checked={formData.shareAnonymously}
                onChange={e => setFormData(p => ({ ...p, shareAnonymously: e.target.checked }))}
                className="w-5 h-5 rounded border-white/20 bg-black/50 text-primary focus:ring-primary focus:ring-offset-0"
              />
              <div>
                <div className="font-medium text-white">Share to Community</div>
                <div className="text-xs text-white/60">Post anonymously to the support feed</div>
              </div>
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="py-12 flex flex-col items-center text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <CheckCircle2 className="w-24 h-24 text-emerald-400 mb-6" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Checked In!</h2>
            <p className="text-white/60">Your stats have been updated.</p>
          </div>
        )}

        {step < 4 && (
          <div className="mt-10 flex gap-4">
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="px-6 py-3 rounded-xl font-semibold bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button 
                onClick={handleNext}
                className="flex-1 px-6 py-3 rounded-xl font-bold bg-white text-black hover:bg-white/90 transition-colors shadow-lg shadow-white/20"
              >
                Continue
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-colors shadow-lg shadow-primary/30 flex items-center justify-center"
              >
                {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Check-in"}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
