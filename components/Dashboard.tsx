
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SiteUsage, PomodoroState } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface DashboardProps {
  usage: SiteUsage[];
  pomodoro: PomodoroState;
  onTogglePomodoro: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ usage, pomodoro, onTogglePomodoro }) => {
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    usage.forEach(item => {
      stats[item.category] = (stats[item.category] || 0) + item.duration;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [usage]);

  const totalTime = useMemo(() => 
    usage.reduce((acc, curr) => acc + curr.duration, 0)
  , [usage]);

  const productivityTime = useMemo(() => 
    usage
      .filter(u => u.category === 'Productivity' || u.category === 'Work')
      .reduce((acc, curr) => acc + curr.duration, 0)
  , [usage]);

  const productivityScore = Math.round((productivityTime / totalTime) * 100) || 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Total Active Time</p>
          <h2 className="text-3xl font-bold text-white">{Math.floor(totalTime / 60)}h {totalTime % 60}m</h2>
        </div>
        
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center border-emerald-500/20">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Productivity Score</p>
          <div className="flex items-baseline space-x-2">
            <h2 className={`text-3xl font-bold ${productivityScore > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {productivityScore}%
            </h2>
          </div>
        </div>

        <div className={`col-span-1 md:col-span-2 glass-card p-6 rounded-2xl flex items-center justify-between border-2 transition-all ${pomodoro.isActive ? 'border-sky-500 shadow-lg shadow-sky-500/10' : 'border-slate-800'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${pomodoro.mode === 'focus' ? 'bg-sky-500/10 text-sky-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <i className={`fa-solid ${pomodoro.mode === 'focus' ? 'fa-brain' : 'fa-mug-hot'} text-xl`}></i>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">{pomodoro.mode === 'focus' ? 'Focus Session' : 'Short Break'}</p>
              <h2 className="text-3xl font-mono font-bold text-white tabular-nums">{formatTime(pomodoro.timeLeft)}</h2>
            </div>
          </div>
          <button 
            onClick={onTogglePomodoro}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${pomodoro.isActive ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-sky-600 text-white hover:bg-sky-500'}`}
          >
            {pomodoro.isActive ? 'Stop' : 'Start Focus'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl h-80">
          <h3 className="text-lg font-semibold mb-4">Category Analysis</h3>
          {usage.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={500}
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm">No usage data to chart</div>
          )}
        </div>

        <div className="glass-card p-6 rounded-2xl h-80">
          <h3 className="text-lg font-semibold mb-4">Most Used Domains</h3>
          {usage.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...usage].sort((a, b) => b.duration - a.duration).slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="domain" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="duration" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm">No usage data to chart</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
