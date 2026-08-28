import React, { useState } from 'react';
import { Play, Loader2, Sparkles } from 'lucide-react';

export default function RunSimulationButton({ onRun, isLoading }) {
  const [count, setCount] = useState(300);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading && onRun) {
      onRun(Number(count));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 transition-colors shadow-inner">
        <label htmlFor="sim-count" className="text-xs text-slate-400 font-medium mr-2 whitespace-nowrap">
          Events:
        </label>
        <input
          id="sim-count"
          type="number"
          min="10"
          max="2000"
          step="50"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="w-16 bg-transparent text-slate-100 font-mono text-xs font-semibold focus:outline-none text-center"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-indigo-400/30"
      >
        <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Running Agentic Pipeline...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-white" />
            <span>Run Simulation</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          </>
        )}
      </button>
    </form>
  );
}
