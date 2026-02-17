
import React, { useState } from 'react';
import { BlockedSite } from '../types';

interface BlockListProps {
  blockedSites: BlockedSite[];
  onAdd: (domain: string) => void;
  onRemove: (id: string) => void;
}

const BlockList: React.FC<BlockListProps> = ({ blockedSites, onAdd, onRemove }) => {
  const [newDomain, setNewDomain] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDomain.trim()) {
      onAdd(newDomain.trim().toLowerCase());
      setNewDomain('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass-card p-8 rounded-2xl">
        <h3 className="text-xl font-bold mb-2">Distraction Shield</h3>
        <p className="text-slate-400 mb-6">Add websites you want to block during focus hours to stay productive.</p>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g. facebook.com"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
          />
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            Add
          </button>
        </form>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <span className="font-semibold">{blockedSites.length} Sites Blocked</span>
          <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">Focus Mode Off</span>
        </div>
        <div className="divide-y divide-slate-700">
          {blockedSites.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <i className="fa-solid fa-shield-halved text-4xl mb-4 block opacity-20"></i>
              No sites blocked yet. Enjoy your focus!
            </div>
          ) : (
            blockedSites.map((site) => (
              <div key={site.id} className="p-4 flex justify-between items-center hover:bg-slate-700/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center text-red-500">
                    <i className="fa-solid fa-ban text-xs"></i>
                  </div>
                  <div>
                    <p className="font-medium text-white">{site.domain}</p>
                    <p className="text-xs text-slate-500">Added {site.addedAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(site.id)}
                  className="text-slate-500 hover:text-red-400 p-2 transition-colors"
                  title="Remove"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockList;
