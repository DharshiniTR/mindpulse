import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, Lock, User, School, GraduationCap } from "lucide-react";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", university: "", year: ""
  });
  
  const { login } = useAuth();
  const { toast } = useToast();
  
  const registerMutation = useRegisterUser({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Account created!", description: "Welcome to MindPulse." });
        login(data.token, data.user);
      },
      onError: (error) => {
        toast({ 
          title: "Registration failed", 
          description: error.message || "Please check your inputs and try again.",
          variant: "destructive" 
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ data: formData });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative p-4 py-12">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-accent/20 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[150px]" />
      </div>

      <Link href="/" className="absolute top-8 left-8 text-white/60 hover:text-white flex items-center gap-2 transition-colors z-10">
        <ArrowLeft className="w-5 h-5" /> Back
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg glass-card p-8 sm:p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/60">Start your mental wellness journey today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="text" name="name" required value={formData.name} onChange={handleChange}
                className="glass-input pl-12" placeholder="Alex Student"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="email" name="email" required value={formData.email} onChange={handleChange}
                className="glass-input pl-12" placeholder="alex@university.edu"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange}
                className="glass-input pl-12" placeholder="Min 6 characters"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 ml-1">University</label>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input 
                  type="text" name="university" value={formData.university} onChange={handleChange}
                  className="glass-input pl-12" placeholder="State Univ"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 ml-1">Year</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <select 
                  name="year" value={formData.year} onChange={handleChange}
                  className="glass-input pl-12 appearance-none bg-black/20"
                >
                  <option value="" className="bg-secondary">Select Year</option>
                  <option value="Freshman" className="bg-secondary">Freshman</option>
                  <option value="Sophomore" className="bg-secondary">Sophomore</option>
                  <option value="Junior" className="bg-secondary">Junior</option>
                  <option value="Senior" className="bg-secondary">Senior</option>
                  <option value="Grad" className="bg-secondary">Graduate</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={registerMutation.isPending}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex justify-center items-center gap-2 mt-6"
          >
            {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-white font-semibold transition-colors">
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
