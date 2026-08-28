import React, { useState, useEffect } from 'react';
import { Sliders, Save, Check, RefreshCw } from 'lucide-react';

const REASON_LABELS = {
  insufficient_funds: 'Insufficient Funds',
  bank_downtime: 'Bank Downtime',
  otp_timeout: 'OTP Timeout',
  card_expired: 'Card Expired',
  invalid_card: 'Invalid Card',
  issuer_declined: 'Issuer Declined'
};

const CHANNEL_OPTIONS = ['none', 'sms', 'email', 'whatsapp'];
const ACTION_OPTIONS = ['retry_silent', 'retry_with_nudge', 'request_update', 'escalate', 'stop_no_recovery'];

export default function PolicyEditor({ rules = [], globalConstraints = {}, onPolicyUpdate, onSaveSuccess }) {
  const [editedRules, setEditedRules] = useState({});
  const [savingReason, setSavingReason] = useState(null);
  const [successReason, setSuccessReason] = useState(null);

  useEffect(() => {
    const map = {};
    rules.forEach((rule) => {
      map[rule.reason_code] = { ...rule };
    });
    setEditedRules(map);
  }, [rules]);

  const handleChange = (reasonCode, field, value) => {
    setEditedRules((prev) => ({
      ...prev,
      [reasonCode]: {
        ...prev[reasonCode],
        [field]: value
      }
    }));
  };

  const handleSave = async (reasonCode) => {
    const rule = editedRules[reasonCode];
    if (!rule) return;

    setSavingReason(reasonCode);
    try {
      await onPolicyUpdate(reasonCode, {
        max_attempts: Number(rule.max_attempts),
        retry_delay_hours: Number(rule.retry_delay_hours),
        channel: rule.channel,
        action: rule.action,
        recovery_probability: Number(rule.recovery_probability)
      });
      setSuccessReason(reasonCode);
      if (onSaveSuccess) onSaveSuccess(reasonCode);
      setTimeout(() => setSuccessReason(null), 2500);
    } catch (err) {
      console.error('Failed to save policy rule:', err);
    } finally {
      setSavingReason(null);
    }
  };

  return (
    <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Dynamic Policy Rules & Recovery Strategy Configurator
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify per-reason attempt caps, delay windows, and contact channels. Re-run simulation to evaluate policy changes live.
          </p>
        </div>
      </div>

      {/* Global Constraints Ribbon */}
      <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Quiet Hours</span>
          <span className="font-bold text-slate-200">
            {globalConstraints.quiet_hours_start}:00 – {globalConstraints.quiet_hours_end}:00 (9 PM – 9 AM)
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Max Total Contact Cap</span>
          <span className="font-bold text-slate-200">{globalConstraints.max_total_contact_attempts || 3} attempts</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Respect Customer Opt-Out</span>
          <span className="font-bold text-emerald-400">Enforced (Active)</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Case Expiry Window</span>
          <span className="font-bold text-slate-200">{globalConstraints.stop_after_days_open || 5} days</span>
        </div>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Reason Code</th>
              <th className="py-3 px-4">Action Type</th>
              <th className="py-3 px-4">Max Attempts</th>
              <th className="py-3 px-4">Retry Delay (Hrs)</th>
              <th className="py-3 px-4">Outreach Channel</th>
              <th className="py-3 px-4">Est. Recovery Prob</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rules.map((rule) => {
              const current = editedRules[rule.reason_code] || rule;
              const isSaving = savingReason === rule.reason_code;
              const isSuccess = successReason === rule.reason_code;

              return (
                <tr key={rule.reason_code} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    <div>{REASON_LABELS[rule.reason_code] || rule.reason_code}</div>
                    <div className="text-[10px] font-mono text-slate-500">{rule.reason_code}</div>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={current.action}
                      onChange={(e) => handleChange(rule.reason_code, 'action', e.target.value)}
                      className="bg-slate-900 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      {ACTION_OPTIONS.map((act) => (
                        <option key={act} value={act}>
                          {act}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={current.max_attempts}
                      onChange={(e) => handleChange(rule.reason_code, 'max_attempts', e.target.value)}
                      className="w-16 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500 text-center"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      max="168"
                      value={current.retry_delay_hours}
                      onChange={(e) => handleChange(rule.reason_code, 'retry_delay_hours', e.target.value)}
                      className="w-20 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500 text-center"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={current.channel}
                      onChange={(e) => handleChange(rule.reason_code, 'channel', e.target.value)}
                      className="bg-slate-900 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500 uppercase font-mono text-[11px]"
                    >
                      {CHANNEL_OPTIONS.map((ch) => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-300">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.05"
                        value={current.recovery_probability}
                        onChange={(e) => handleChange(rule.reason_code, 'recovery_probability', e.target.value)}
                        className="w-16 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500 text-center"
                      />
                      <span className="text-[10px] text-slate-500">
                        ({(current.recovery_probability * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSave(rule.reason_code)}
                      disabled={isSaving}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs transition-all ${
                        isSuccess
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 border border-indigo-500'
                      }`}
                    >
                      {isSaving ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : isSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save Rule
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
