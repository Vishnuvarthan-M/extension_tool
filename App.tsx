
import React, { useState, useEffect, useCallback } from 'react';
import { TabType, SiteUsage, BlockedSite, PomodoroState } from './types';
import { INITIAL_USAGE_DATA } from './constants';
import Dashboard from './components/Dashboard';
import SiteTracker from './components/SiteTracker';
import BlockList from './components/BlockList';
import AICoach from './components/AICoach';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeSession, setActiveSession] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  
  const [usage, setUsage] = useState<SiteUsage[]>(() => {
    const saved = localStorage.getItem('focusflow_usage');
    return saved ? JSON.parse(saved) : INITIAL_USAGE_DATA;
  });

  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>(() => {
    const saved = localStorage.getItem('focusflow_blocked');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    isActive: false,
    timeLeft: 25 * 60,
    mode: 'focus'
  });

  // Helper to determine category based on domain
  const getCategory = (d: string): SiteUsage['category'] => {
    const lowD = d.toLowerCase();
    if (lowD.includes('github') || lowD.includes('jira') || lowD.includes('linear') || lowD.includes('gitlab')) return 'Work';
    if (lowD.includes('stack') || lowD.includes('notion') || lowD.includes('google') || lowD.includes('docs') || lowD.includes('figma')) return 'Productivity';
    if (lowD.includes('youtube') || lowD.includes('netflix') || lowD.includes('twitch') || lowD.includes('spotify')) return 'Entertainment';
    if (lowD.includes('facebook') || lowD.includes('twitter') || lowD.includes('x.com') || lowD.includes('instagram') || lowD.includes('reddit')) return 'Social Media';
    return 'Other';
  };

  // Function to add/increment usage
  const trackMinute = useCallback((domain: string) => {
    setUsage(prev => {
      const existing = prev.find(u => u.domain === domain);
      if (existing) {
        return prev.map(u => 
          u.domain === domain ? { ...u, duration: u.duration + 1, lastVisited: new Date() } : u
        );
      } else {
        return [...prev, {
          id: 'site-' + Date.now(),
          domain,
          duration: 1,
          category: getCategory(domain),
          lastVisited: new Date()
        }];
      }
    });
  }, []);

  // Real-time background tracking of the "Active Session"
  useEffect(() => {
    if (!activeSession) return;
    
    const interval = setInterval(() => {
      trackMinute(activeSession);
    }, 60000); 
    
    return () => clearInterval(interval);
  }, [activeSession, trackMinute]);

  // Pomodoro Timer Logic
  useEffect(() => {
    let timer: number | undefined;
    if (pomodoro.isActive && pomodoro.timeLeft > 0) {
      timer = window.setInterval(() => {
        setPomodoro(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (pomodoro.timeLeft === 0) {
      const newMode = pomodoro.mode === 'focus' ? 'break' : 'focus';
      setPomodoro({
        isActive: false,
        mode: newMode,
        timeLeft: newMode === 'focus' ? 25 * 60 : 5 * 60
      });
    }
    return () => clearInterval(timer);
  }, [pomodoro.isActive, pomodoro.timeLeft, pomodoro.mode]);

  useEffect(() => {
    localStorage.setItem('focusflow_usage', JSON.stringify(usage));
  }, [usage]);

  useEffect(() => {
    localStorage.setItem('focusflow_blocked', JSON.stringify(blockedSites));
  }, [blockedSites]);

  const handleVisitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      const domain = urlInput.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
      
      // Check if blocked
      if (blockedSites.some(s => s.domain === domain)) {
        alert(`ACCESS BLOCKED: ${domain} is on your distraction list!`);
        return;
      }

      // 1. Immediately add 1 minute for instant feedback
      trackMinute(domain);
      
      // 2. Set as active session for background tracking
      setActiveSession(domain);
      setUrlInput('');
    }
  };

  const togglePomodoro = () => {
    setPomodoro(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const clearAllData = () => {
    if (confirm("Clear all real-time usage history?")) {
      setUsage([]);
      setActiveSession('');
      localStorage.removeItem('focusflow_usage');
    }
  };

  const addBlockedSite = (domain: string) => {
    const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    if (blockedSites.some(s => s.domain === cleanDomain)) return;
    const newSite: BlockedSite = {
      id: Math.random().toString(36).substr(2, 9),
      domain: cleanDomain,
      addedAt: new Date(),
    };
    setBlockedSites([...blockedSites, newSite]);
  };

  const removeBlockedSite = (id: string) => {
    setBlockedSites(blockedSites.filter(s => s.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard usage={usage} pomodoro={pomodoro} onTogglePomodoro={togglePomodoro} />;
      case 'tracker':
        return <SiteTracker usage={usage} onClear={clearAllData} />;
      case 'blocklist':
        return <BlockList blockedSites={blockedSites} onAdd={addBlockedSite} onRemove={removeBlockedSite} />;
      case 'ai-coach':
        return <AICoach usage={usage} />;
      default:
        return <Dashboard usage={usage} pomodoro={pomodoro} onTogglePomodoro={togglePomodoro} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <i className="fa-solid fa-bolt text-white text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">FocusFlow</h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Extension Simulation</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="fa-gauge-high" label="Dashboard" />
          <NavItem active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')} icon="fa-clock-rotate-left" label="Usage Tracker" />
          <NavItem active={activeTab === 'blocklist'} onClick={() => setActiveTab('blocklist')} icon="fa-shield-halved" label="Blocklist" />
          <NavItem active={activeTab === 'ai-coach'} onClick={() => setActiveTab('ai-coach')} icon="fa-brain" label="AI Focus Coach" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-400 mb-2 font-medium">Daily Active Time</p>
            <h3 className="text-lg font-bold text-white">
              {Math.floor(usage.reduce((a, b) => a + b.duration, 0) / 60)}h {usage.reduce((a, b) => a + b.duration, 0) % 60}m
            </h3>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 bg-[#0f172a] overflow-y-auto custom-scrollbar">
        {/* Mock Browser Bar */}
        <div className="mb-10 glass-card p-4 rounded-2xl border-sky-500/30 shadow-xl shadow-sky-500/5">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg text-slate-400 text-[10px] font-black uppercase shrink-0 border border-slate-700">
              <i className="fa-solid fa-globe"></i>
              Simulation Mode
            </div>
            <form onSubmit={handleVisitUrl} className="flex-1 flex gap-2 w-full">
              <div className="relative flex-1">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-xs"></i>
                <input 
                  type="text" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Simulate visiting a site (e.g. stackoverflow.com)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm font-mono shadow-inner"
                />
              </div>
              <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-xl font-bold transition-all shrink-0 shadow-lg shadow-sky-600/20 active:scale-95">
                Visit
              </button>
            </form>
            {activeSession && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl shrink-0 group">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-0.5">Tracking Now</span>
                  <span className="text-xs font-bold text-emerald-400">{activeSession}</span>
                </div>
                <button 
                  onClick={() => setActiveSession('')}
                  className="ml-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Stop Tracking"
                >
                  <i className="fa-solid fa-circle-stop"></i>
                </button>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-3 px-1 flex items-center gap-2">
            <i className="fa-solid fa-lightbulb text-amber-500/50"></i>
            Enter a domain above. It will instantly add 1m to your logs and continue tracking every minute it stays active.
          </p>
        </div>

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
            <p className="text-slate-400 text-sm">Real-time productivity intelligence based on your session.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={clearAllData} className="text-slate-500 hover:text-red-400 text-xs px-3 py-2 border border-slate-800 rounded-xl transition-all hover:border-red-400/20">
                <i className="fa-solid fa-trash-can mr-2"></i>
                Reset History
             </button>
             <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shadow-lg shadow-black/20">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=productivity`} alt="avatar" />
             </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
      ${active 
        ? 'bg-sky-600/10 text-sky-400 border border-sky-400/20 font-bold shadow-lg shadow-sky-900/10' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}
    `}
  >
    <i className={`fa-solid ${icon} ${active ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors w-5`}></i>
    {label}
  </button>
);

export default App;
