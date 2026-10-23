import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, Activity, Target, Compass, Award, Users, BookHeart, User, LogOut,
  Sparkles, Menu, X, MessageSquare, ScanFace
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/checkin", label: "Check-in", icon: Activity },
  { path: "/chat", label: "Mind Chat", icon: MessageSquare },
  { path: "/emotion", label: "Emotion Tracker", icon: ScanFace },
  { path: "/analytics", label: "Analytics", icon: Target },
  { path: "/insights", label: "Insights", icon: Compass },
  { path: "/achievements", label: "Achievements", icon: Award },
  { path: "/community", label: "Community", icon: Users },
  { path: "/resources", label: "Resources", icon: BookHeart },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 glass-panel z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">MindPulse</span>
        </div>

        <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "bg-white/10 text-white font-medium shadow-sm" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-r-full"
                  />
                )}
                <Icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "scale-110 text-primary" : "group-hover:scale-110 group-hover:text-white")} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5 space-y-1">
          <Link 
            href="/profile"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location === "/profile" ? "bg-white/10 text-white font-medium" : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {user?.name?.charAt(0) || "U"}
            </div>
            Profile
          </Link>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-panel z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">MindPulse</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-white/80 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm glass-panel border-l border-white/10 flex flex-col"
            >
              <div className="p-4 flex justify-end">
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white/60 hover:text-white bg-white/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200",
                      location === item.path ? "bg-primary/20 text-white border border-primary/30" : "text-white/70 hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", location === item.path && "text-primary")} />
                    <span className="font-medium text-lg">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t border-white/10 space-y-4">
                <Link href="/profile" className="flex items-center gap-4 text-white/80">
                  <User className="w-5 h-5" /> Profile
                </Link>
                <button onClick={() => logout()} className="flex items-center gap-4 text-red-400">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav (Optional secondary nav style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/5 z-20 pb-safe">
        <div className="flex justify-around items-center p-2">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg min-w-[64px] transition-all",
                location === item.path ? "text-primary" : "text-white/50 hover:text-white/80"
              )}
            >
              <item.icon className={cn("w-6 h-6 mb-1", location === item.path && "animate-pulse")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
