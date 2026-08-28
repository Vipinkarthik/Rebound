import React from 'react';

const typeStyles = {
  atRisk: {
    bg: 'bg-slate-800/80 border-slate-700/60',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    accent: 'text-purple-400',
    badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
  },
  recovered: {
    bg: 'bg-emerald-950/30 border-emerald-800/40',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    accent: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
  },
  rate: {
    bg: 'bg-indigo-950/30 border-indigo-800/40',
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    accent: 'text-indigo-400',
    badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
  },
  stopped: {
    bg: 'bg-slate-900 border-slate-700/60',
    iconBg: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
    accent: 'text-slate-300',
    badge: 'bg-slate-800 text-slate-300 border-slate-700'
  },
  deferred: {
    bg: 'bg-amber-950/20 border-amber-800/30',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    accent: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
  }
};

export default function MetricCard({ title, value, subtext, icon: Icon, type = 'atRisk', badgeText }) {
  const styles = typeStyles[type] || typeStyles.atRisk;

  return (
    <div className={`p-5 rounded-2xl border ${styles.bg} backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:border-slate-600/80 group`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${styles.iconBg} transition-transform group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${styles.accent}`}>
          {value}
        </div>
        {badgeText && (
          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${styles.badge}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-slate-400 font-medium">
          {subtext}
        </p>
      )}
    </div>
  );
}
