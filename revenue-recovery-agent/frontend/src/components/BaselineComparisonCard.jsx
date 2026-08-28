import React from 'react';
import { TrendingUp, Zap, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function BaselineComparisonCard({ agentSummary, baselineSummary, upliftPct }) {
  const agentRecovered = agentSummary?.total_recovered_inr || 0;
  const baselineRecovered = baselineSummary?.total_recovered_inr || 0;
  const uplift = upliftPct !== undefined ? upliftPct : 0;
  const isPositive = uplift >= 0;

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 rounded-2xl border-2 border-indigo-500/40 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Performance Uplift Benchmark
          </div>
          <h2 className="text-lg lg:text-xl font-black text-white tracking-tight">
            Intelligent Agent vs. Naive Baseline Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time parallel simulation comparing the autonomous compliance pipeline against a blind 15% retry approach.
          </p>
        </div>

        {/* Dominant Uplift Badge */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-500/30 flex items-center gap-4 shadow-xl shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block">
              Net Recovery Uplift
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-3xl lg:text-4xl font-black tracking-tight ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}{uplift}%
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${isPositive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'}`}>
            <ArrowUpRight className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Comparison Figures Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/80">
        {/* Agent Card */}
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Autonomous Agent Pipeline
            </div>
            <div className="text-xl font-extrabold text-white mt-1">
              {formatCurrency(agentRecovered)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Recovery Rate: <span className="font-bold text-emerald-400">{agentSummary?.recovery_rate_pct || 0}%</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20">
              Compliant & Smart
            </span>
          </div>
        </div>

        {/* Baseline Card */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              Naive Blind Retry Baseline
            </div>
            <div className="text-xl font-semibold text-slate-300 mt-1">
              {formatCurrency(baselineRecovered)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Recovery Rate: <span className="font-bold text-slate-400">{baselineSummary?.recovery_rate_pct || 15}%</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
              Flat 15% Prob
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
