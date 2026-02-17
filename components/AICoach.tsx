
import React, { useState } from 'react';
import { getProductivityAnalysis } from '../services/geminiService';
import { SiteUsage, AIAnalysis } from '../types';

interface AICoachProps {
  usage: SiteUsage[];
}

const AICoach: React.FC<AICoachProps> = ({ usage }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProductivityAnalysis(usage);
      setAnalysis(result);
    } catch (err) {
      setError("Failed to get AI coaching session. Please ensure your API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass-card p-8 rounded-2xl text-center relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -ml-16 -mb-16"></div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-sky-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-sky-400 ring-4 ring-sky-600/10">
            <i className="fa-solid fa-brain text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold mb-3">Meet Your AI Focus Coach</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Our Gemini-powered intelligence analyzes your browsing habits to provide personalized coaching and focus plans.
          </p>
          <button
            onClick={handleAnalysis}
            disabled={loading}
            className={`
              inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all
              ${loading 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-lg shadow-sky-900/20'}
            `}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                Thinking...
              </>
            ) : (
              <>
                <i className="fa-solid fa-bolt"></i>
                Generate Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <i className="fa-solid fa-circle-exclamation"></i>
          {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <h4 className="text-slate-400 uppercase text-xs tracking-widest font-bold mb-4">Focus Summary</h4>
              <p className="text-slate-200 leading-relaxed italic">
                "{analysis.summary}"
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 transition-all duration-1000" 
                    style={{ width: `${analysis.productivityScore}%` }}
                  ></div>
                </div>
                <span className="text-sky-400 font-bold">{analysis.productivityScore}% Score</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <h4 className="text-slate-400 uppercase text-xs tracking-widest font-bold mb-4">Key Recommendations</h4>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass-card p-8 rounded-2xl border-emerald-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                <i className="fa-solid fa-calendar-day"></i>
              </div>
              <h3 className="text-xl font-bold">Recommended Focus Plan</h3>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {analysis.focusPlan}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICoach;
