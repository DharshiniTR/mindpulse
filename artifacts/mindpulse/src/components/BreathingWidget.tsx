import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function BreathingWidget({ isInline = false }: { isInline?: boolean }) {
  const [isOpen, setIsOpen] = useState(isInline);
  const [phase, setPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Hold Empty">("Inhale");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    let timeout: NodeJS.Timeout;
    
    const cycle = () => {
      setPhase("Inhale");
      timeout = setTimeout(() => {
        setPhase("Hold");
        timeout = setTimeout(() => {
          setPhase("Exhale");
          timeout = setTimeout(() => {
            setPhase("Hold Empty");
            timeout = setTimeout(cycle, 4000);
          }, 4000);
        }, 4000);
      }, 4000);
    };

    cycle();
    return () => clearTimeout(timeout);
  }, [isActive]);

  const circleVariants = {
    "Inhale": { scale: 1.5, backgroundColor: "hsla(191, 97%, 43%, 0.4)", transition: { duration: 4, ease: "linear" } },
    "Hold": { scale: 1.5, backgroundColor: "hsla(191, 97%, 43%, 0.6)", transition: { duration: 4, ease: "linear" } },
    "Exhale": { scale: 0.8, backgroundColor: "hsla(262, 83%, 58%, 0.4)", transition: { duration: 4, ease: "linear" } },
    "Hold Empty": { scale: 0.8, backgroundColor: "hsla(262, 83%, 58%, 0.2)", transition: { duration: 4, ease: "linear" } },
  };

  if (!isOpen && !isInline) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-white hover:scale-110 transition-transform z-40 group"
      >
        <Wind className="w-6 h-6 animate-pulse group-hover:animate-none" />
      </button>
    );
  }

  const Content = (
    <div className={cn(
      "flex flex-col items-center justify-center p-8",
      !isInline && "fixed inset-0 z-50 bg-background/90 backdrop-blur-xl"
    )}>
      {!isInline && (
        <button 
          onClick={() => { setIsOpen(false); setIsActive(false); }}
          className="absolute top-8 right-8 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="text-center mb-12">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Box Breathing</h2>
        <p className="text-white/60">4 seconds in, 4 hold, 4 out, 4 hold.</p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        {/* Decorative static border */}
        <div className="absolute inset-0 rounded-full border border-white/10" />
        
        {/* Animated breathing circle */}
        {isActive ? (
          <motion.div
            variants={circleVariants}
            animate={phase}
            className="w-32 h-32 rounded-full blur-md"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm border border-white/10" />
        )}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={isActive ? phase : "Ready"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-bold text-white drop-shadow-md"
            >
              {isActive ? phase : "Ready?"}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={() => setIsActive(!isActive)}
        className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold tracking-wide transition-all border border-white/10 shadow-lg"
      >
        {isActive ? "Stop Exercise" : "Start Exercise"}
      </button>
    </div>
  );

  if (isInline) return <div className="glass-card overflow-hidden">{Content}</div>;
  return Content;
}
