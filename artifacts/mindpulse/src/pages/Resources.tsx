import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Globe, Clock, MapPin, Star, AlertTriangle, BookHeart } from "lucide-react";
import { useGetResources } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  counselor: "Counselor",
  hotline: "Crisis Line",
  meditation: "Meditation",
  group: "Support Group",
  workshop: "Workshop",
  app: "App / Tool",
};

const TYPE_COLORS: Record<string, string> = {
  counselor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  hotline: "bg-red-500/20 text-red-400 border-red-500/30",
  meditation: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  group: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  workshop: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  app: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const FILTER_OPTIONS = ["all", "counselor", "hotline", "meditation", "group", "workshop", "app"];

export default function Resources() {
  const { data: resources, isLoading } = useGetResources();
  const [filter, setFilter] = useState("all");

  const filtered = resources?.filter(r =>
    filter === "all" || r.type === filter
  ) || [];

  const emergency = filtered.filter(r => r.isEmergency);
  const regular = filtered.filter(r => !r.isEmergency);

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Mental Health Resources</h1>
        <p className="text-white/60 mt-1">Find the support you need — you don't have to do this alone.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all border",
              filter === opt
                ? "bg-primary text-black border-primary shadow-lg shadow-primary/25"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
            )}
          >
            {opt === "all" ? "All" : TYPE_LABELS[opt]}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Emergency Resources */}
      {emergency.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-display font-bold text-lg">Emergency / Crisis Support</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergency.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5 border-red-500/30 bg-red-950/20 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{r.name}</h3>
                    <span className={cn("inline-block mt-1 text-xs px-2 py-0.5 rounded-full border", TYPE_COLORS[r.type])}>
                      {TYPE_LABELS[r.type]}
                    </span>
                  </div>
                  <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-full font-medium flex-shrink-0">
                    24/7
                  </span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{r.description}</p>
                {r.phone && (
                  <a
                    href={`tel:${r.phone}`}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 font-bold text-lg transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    {r.phone}
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Resources */}
      {regular.length > 0 && (
        <div className="space-y-4">
          {emergency.length > 0 && (
            <div className="flex items-center gap-2 text-white/80">
              <BookHeart className="w-5 h-5" />
              <h2 className="font-display font-bold text-lg">Campus & Wellness Resources</h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regular.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + (emergency.length > 0 ? 0.1 : 0) }}
                className="glass-card rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{r.name}</h3>
                    <span className={cn("inline-block mt-1 text-xs px-2 py-0.5 rounded-full border", TYPE_COLORS[r.type])}>
                      {TYPE_LABELS[r.type]}
                    </span>
                  </div>
                  {r.rating && (
                    <div className="flex items-center gap-1 text-yellow-400 text-sm flex-shrink-0">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      <span className="font-semibold">{r.rating}</span>
                    </div>
                  )}
                </div>

                <p className="text-white/60 text-sm leading-relaxed">{r.description}</p>

                <div className="space-y-1.5 text-sm text-white/50">
                  {r.hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{r.hours}</span>
                    </div>
                  )}
                  {r.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{r.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  {r.phone && (
                    <a
                      href={`tel:${r.phone}`}
                      className="flex items-center gap-1.5 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {r.phone}
                    </a>
                  )}
                  {r.website && (
                    <a
                      href={`https://${r.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                </div>

                {r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {r.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-white/40">
          <BookHeart className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No resources found for this filter.</p>
        </div>
      )}
    </div>
  );
}
