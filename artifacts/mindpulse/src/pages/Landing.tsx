import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Activity, ShieldHalf, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Hero abstract" 
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="MindPulse Logo" className="w-10 h-10 object-contain" />
          <span className="font-display font-bold text-2xl text-white tracking-tight">MindPulse</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-white/80 hover:text-white font-medium px-4 py-2 transition-colors">
            Log In
          </Link>
          <Link href="/register" className="bg-white text-black hover:bg-white/90 font-semibold px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Sign Up Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-white/90">The #1 Mental Wellness App for Students</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-white leading-tight tracking-tighter mb-6 max-w-5xl"
        >
          Your Mind, Measured. <br />
          <span className="text-gradient">Your Wellbeing, Elevated.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mb-12"
        >
          Navigate college life with clarity. Track your mood, understand your stress patterns, and get AI-powered nudges when you need them most.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Link href="/register" className="bg-gradient-to-r from-primary to-accent text-white font-bold text-lg px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all hover:-translate-y-1">
            Start Your Journey <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="border border-white/20 text-white font-semibold text-lg px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
            Log In
          </Link>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left"
        >
          {[
            { icon: Brain, title: "Smart Insights", desc: "AI analyzes your patterns to provide actionable nudges before burnout hits." },
            { icon: Activity, title: "Mood Tracking", desc: "Beautiful sliders and visual tools make daily check-ins something you actually look forward to." },
            { icon: ShieldHalf, title: "Safe Space", desc: "Anonymous community sharing and instant access to verified campus resources." },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-8 group">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:text-primary transition-colors text-white/80">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
