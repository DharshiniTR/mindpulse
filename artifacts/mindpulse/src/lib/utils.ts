import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, formatStr: string = "MMM d, yyyy") {
  try {
    return format(parseISO(dateStr), formatStr);
  } catch (e) {
    return dateStr;
  }
}

export function getMoodColor(score: number): string {
  if (score >= 8) return "from-emerald-400 to-cyan-400";
  if (score >= 6) return "from-cyan-400 to-blue-500";
  if (score >= 4) return "from-yellow-400 to-orange-500";
  return "from-orange-500 to-red-500";
}

export function getMoodEmoji(score: number): string {
  if (score >= 9) return "🤩";
  if (score >= 7) return "😊";
  if (score >= 5) return "😐";
  if (score >= 3) return "😔";
  return "😫";
}

export function getStressColor(level: string): string {
  switch (level.toLowerCase()) {
    case "low": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "critical": return "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse";
    default: return "bg-white/10 text-white border-white/20";
  }
}
