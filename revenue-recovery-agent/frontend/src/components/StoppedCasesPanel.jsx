import React from 'react';
import { ShieldAlert, UserX, AlertOctagon, Hash } from 'lucide-react';

const WHY_CONFIG = {
  customer_opted_out: {
    label: 'Customer Opted Out',
    desc: 'Customer explicitly opted out of payment recovery communications.',
    icon: UserX,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  global_max_attempts_reached: {
    label: 'Global Cap Reached',
    desc: 'Exceeded maximum total contact attempts (3 cap) across case history.',
    icon: AlertOctagon,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  },
  reason_specific_max_attempts_reached: {
    label: 'Reason Limit Exceeded',
    desc: 'Reached maximum retry allowance for this specific failure reason.',
    icon: ShieldAlert,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
  }
};

export default function StoppedCasesPanel({ stoppedCases = [] }) {
  return (
    <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-slate-400" />
            Compliance Restraint Log — Stopped Cases Highlight
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrating AI agent restraint: Halting outreach to respect privacy & global compliance policy limits
          </p>
        </div>
        <span className="text-xs px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-full font-medium self-start sm:self-auto">
          {stoppedCases.length} Exemplar Cases Highlighted
        </span>
      </div>

      {stoppedCases.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
          No compliance-stopped cases found in current run batch.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {stoppedCases.map((item, idx) => {
            const whyInfo = WHY_CONFIG[item.decision?.why] || {
              label: item.decision?.why || 'Compliance Stop',
              desc: item.result?.detail || 'Outreach halted per safety rule',
              icon: ShieldAlert,
              color: 'text-slate-400 border-slate-700 bg-slate-800'
            };
            const IconComponent = whyInfo.icon;

            return (
              <div
                key={item._id || idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-slate-500" />
                      {item.payment_id}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="my-2.5 p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                    <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                      "{item.raw_error}"
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className={`p-2.5 rounded-lg border ${whyInfo.color} flex items-start gap-2.5`}>
                    <IconComponent className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold tracking-wide uppercase">
                        {whyInfo.label}
                      </div>
                      <p className="text-[11px] opacity-80 mt-0.5 leading-tight">
                        {whyInfo.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
