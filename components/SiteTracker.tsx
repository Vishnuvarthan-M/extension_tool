
import React from 'react';
import { SiteUsage } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface SiteTrackerProps {
  usage: SiteUsage[];
  onClear: () => void;
}

const SiteTracker: React.FC<SiteTrackerProps> = ({ usage, onClear }) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Usage Log</h3>
          <p className="text-slate-400 text-sm">Every minute of activity captured by the simulation.</p>
        </div>
        <button 
          onClick={onClear}
          className="text-red-400 hover:text-red-300 text-sm font-semibold flex items-center gap-2"
        >
          <i className="fa-solid fa-trash-can text-xs"></i>
          Clear Logs
        </button>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        {usage.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
              <i className="fa-solid fa-hourglass-start text-2xl"></i>
            </div>
            <p className="text-slate-400 font-medium">No real-time data yet.</p>
            <p className="text-slate-500 text-sm mt-1">Visit a site using the address bar above to begin tracking.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-800/30 text-slate-400 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-bold">Domain</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Total Time</th>
                <th className="px-6 py-4 font-bold text-right">Last Tracked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {usage.sort((a, b) => b.duration - a.duration).map((site) => (
                <tr key={site.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center mr-3 text-xs font-bold text-sky-400 border border-slate-700">
                      {site.domain.charAt(0).toUpperCase()}
                    </div>
                    {site.domain}
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-2.5 py-1 rounded text-[10px] font-bold uppercase"
                      style={{ backgroundColor: `${CATEGORY_COLORS[site.category]}20`, color: CATEGORY_COLORS[site.category] }}
                    >
                      {site.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-mono">
                    {site.duration}m
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-500">
                    {new Date(site.lastVisited).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SiteTracker;
