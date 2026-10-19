import React, { useState } from 'react';
import {
  Radio,
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { triggerSimulatedWebhook } from '../api/client';

const SAMPLE_ERRORS = [
  { label: 'Bank Downtime (Silent Fast Retry)', value: 'Issuing bank server not responding - timeout' },
  { label: 'Insufficient Funds (Nudge Next Day)', value: 'Transaction declined - low balance in account' },
  { label: 'OTP / 3DS Timeout (Instant Nudge)', value: 'Customer did not complete 3DS/OTP authentication in time' },
  { label: 'Card Expired (Update Request via Email)', value: 'Card has expired - expiry date on card has passed' },
  { label: 'Invalid Card / CVV (Update Request)', value: 'Card verification failed - invalid CVV' },
  { label: 'Issuer Declined (Support Escalation)', value: 'Do not honour - declined by issuing bank' }
];

export default function WebhookSimulatorModal({ isOpen, onClose, onSuccess }) {
  const [eventType, setEventType] = useState('payment.failed');
  const [selectedError, setSelectedError] = useState(SAMPLE_ERRORS[0].value);
  const [customError, setCustomError] = useState('');
  const [amount, setAmount] = useState('2499');
  const [customerId, setCustomerId] = useState('cust_live_test');
  const [optedOut, setOptedOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const errorText = customError.trim() || selectedError;
      const res = await triggerSimulatedWebhook({
        event_type: eventType,
        raw_error_description: errorText,
        amount: parseFloat(amount) || 999,
        customer_id: customerId,
        customer_opted_out: optedOut
      });

      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Webhook simulation failed:', err);
      setError(err.response?.data?.error || err.message || 'Failed to dispatch simulated webhook.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live Razorpay Webhook Ingestion</h3>
              <p className="text-xs text-slate-400">Dispatch an event to test real-time agent diagnosis & compliance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Webhook Event Trigger
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="payment.failed">payment.failed (Standard Gateway Failure)</option>
                <option value="subscription.halted">subscription.halted (Recurring Charge Failure)</option>
                <option value="invoice.expired">invoice.expired (Unpaid B2B Invoice)</option>
              </select>
            </div>

            {/* Error Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Gateway Error Scenario
              </label>
              <select
                value={selectedError}
                onChange={(e) => {
                  setSelectedError(e.target.value);
                  setCustomError('');
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {SAMPLE_ERRORS.map((s, idx) => (
                  <option key={idx} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Error Override */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Or Type Custom Gateway Error String (Tests Keyword / LLM Fallback)
              </label>
              <input
                type="text"
                value={customError}
                onChange={(e) => setCustomError(e.target.value)}
                placeholder="e.g., Issuer bank timed out during 3DS redirect sequence"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Amount & Customer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Opt-Out Compliance Toggle */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Simulate Customer Opt-Out</div>
                  <div className="text-[11px] text-slate-400">Enforces TCPA/DNC compliance veto (stops recovery immediately)</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={optedOut}
                onChange={(e) => setOptedOut(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Autonomous Agent Pipeline...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Ingest Webhook & Execute Pipeline
                </>
              )}
            </button>
          </form>

          {/* Result Inspection */}
          {result && (
            <div className="p-4 bg-slate-950/70 border border-indigo-500/30 rounded-xl space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Webhook Ingested & Evaluated
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Payment ID: {result.event?.payment_id}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Diagnosis:</span>
                  <span className="font-bold text-indigo-300">{result.diagnosis?.reason_code}</span>
                  <span className="text-[10px] text-slate-400 block">via {result.diagnosis?.diagnosed_by}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Decision:</span>
                  <span className={`font-bold uppercase ${
                    result.decision?.decision === 'act'
                      ? 'text-emerald-400'
                      : result.decision?.decision === 'deferred'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}>
                    {result.decision?.decision}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate" title={result.decision?.why}>
                    {result.decision?.why}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Outcome:</span>
                  <span className="font-bold text-slate-200">{result.result?.outcome}</span>
                  <span className="text-[10px] text-slate-400 block">
                    {result.result?.channel_used ? `via ${result.result.channel_used}` : 'No outreach'}
                  </span>
                </div>
              </div>

              {/* Outreach message and link */}
              {result.result?.message_sent && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Generated Outreach Copy ({result.result?.channel_used?.toUpperCase()}):
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px] leading-relaxed">
                    {result.result?.message_sent}
                  </div>
                </div>
              )}

              {result.result?.payment_link && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Razorpay Payment Link:</span>
                  <a
                    href={result.result?.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-mono text-[11px]"
                  >
                    {result.result?.payment_link}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
