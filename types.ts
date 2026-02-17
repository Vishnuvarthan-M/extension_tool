
export interface SiteUsage {
  id: string;
  domain: string;
  duration: number; // in minutes
  category: 'Productivity' | 'Social Media' | 'Entertainment' | 'Work' | 'Other';
  lastVisited: Date;
}

export interface BlockedSite {
  id: string;
  domain: string;
  addedAt: Date;
}

export interface AIAnalysis {
  productivityScore: number;
  summary: string;
  recommendations: string[];
  focusPlan: string;
}

export interface PomodoroState {
  isActive: boolean;
  timeLeft: number;
  mode: 'focus' | 'break';
}

export type TabType = 'dashboard' | 'tracker' | 'blocklist' | 'ai-coach';
