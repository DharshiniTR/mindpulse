import React from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from "recharts";
import { Activity, Zap, Moon, CalendarDays } from "lucide-react";
import { useGetCheckinStats } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const { data: stats, isLoading } = useGetCheckinStats({ days: 30 });

  if (isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!stats) return null;

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border-white/20 !bg-background/90 text-sm">
          <p className="font-bold text-white mb-2">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-white/80">{p.name}: <span className="font-bold text-white">{p.value}</span></span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const stressData = [
    { name: 'Low', value: stats.stressDistribution.low, color: '#10b981' },
    { name: 'Medium', value: stats.stressDistribution.medium, color: '#eab308' },
    { name: 'High', value: stats.stressDistribution.high, color: '#f97316' },
    { name: 'Critical', value: stats.stressDistribution.critical, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Analytics</h1>
        <p className="text-white/60">Your wellbeing trends over the last 30 days.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 glass-card p-6 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Mood & Energy Trend</h3>
            <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/70 border border-white/10">Last 7 Days</div>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weeklyData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
                <Line type="monotone" name="Mood" dataKey="moodScore" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Energy" dataKey="energyLevel" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stress Distribution */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-bold text-white mb-6">Stress Distribution</h3>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stressData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#ffffff70" fontSize={12} tickLine={false} axisLine={false} width={60} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {stressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calendar Heatmap Placeholder */}
        <div className="lg:col-span-3 glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-white">30-Day Activity Heatmap</h3>
          </div>
          
          {/* Simple CSS Grid Heatmap */}
          <div className="flex flex-wrap gap-2">
            {stats.heatmapData.map((point, i) => {
              const intensity = point.value / 10; // 0 to 1
              return (
                <div 
                  key={i} 
                  title={`${point.date}: ${point.value.toFixed(1)} mood`}
                  className="w-8 h-8 rounded-md transition-all hover:scale-110 hover:ring-2 hover:ring-white/50 cursor-crosshair"
                  style={{
                    backgroundColor: point.count === 0 ? 'rgba(255,255,255,0.05)' : `hsla(191, 97%, 43%, ${0.2 + (intensity * 0.8)})`
                  }}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-white/40 justify-end">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-white/5" />
              <div className="w-3 h-3 rounded-sm bg-primary/40" />
              <div className="w-3 h-3 rounded-sm bg-primary/70" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </div>
            <span>More</span>
          </div>
        </div>

      </div>
    </div>
  );
}
