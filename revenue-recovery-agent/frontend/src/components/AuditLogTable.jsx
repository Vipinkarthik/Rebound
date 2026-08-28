import React, { useState } from 'react';
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  OctagonX,
  HelpCircle,
  Loader2,
  ExternalLink,
  MessageSquareText,
  Sparkles
} from 'lucide-react';
import { explainDecision } from '../api/client';

const REASON_OPTIONS = [
  { value: '', label: 'All Reason Codes' },
  { value: 'insufficient_funds', label: 'Insufficient Funds' },
  { value: 'bank_downtime', label: 'Bank Downtime' },
  { value: 'otp_timeout', label: 'OTP Timeout' },
  { value: 'card_expired', label: 'Card Expired' },
  { value: 'invalid_card', label: 'Invalid Card' },
  { value: 'issuer_declined', label: 'Issuer Declined' }
];

const DECISION_OPTIONS = [
  { value: '', label: 'All Decision Types' },
  { value: 'act', label: 'Act (Initiate Recovery)' },
  { value: 'deferred', label: 'Deferred (Quiet Hours)' },
  { value: 'stop', label: 'Stop (Compliance Restraint)' }
];

export default function AuditLogTable({
  logs = [],
  pagination = {},
  selectedReason = '',
  selectedDecision = '',
  onReasonChange,
  onDecisionChange,
  onPageChange
}) {
  const { page = 1, pages = 1, total = 0 } = pagination;

  const [expandedId, setExpandedId] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const handleExplainClick = async (auditLogId) => {
    if (expandedId === auditLogId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(auditLogId);

    if (!explanations[auditLogId]) {
      setLoadingId(auditLogId);
      try {
        const res = await explainDecision(auditLogId);
        setExplanations((prev) => ({
          ...prev,
          [auditLogId]: res
        }));
      } catch (err) {
        console.error('Failed to fetch decision explanation:', err);
        setExplanations((prev) => ({
          ...prev,
          [auditLogId]: {
            explanation: 'Unable to fetch explanation. Please verify server logs.',
            generated_by: 'error'
          }
        }));
      } finally {
        setLoadingId(null);
      }
    }
  };

  const renderDecisionBadge = (dec) => {
    const decisionType = dec?.decision;
    if (decisionType === 'act') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          ACT
        </span>
      );
    }
    if (decisionType === 'deferred') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-3.5 h-3.5" />
          DEFERRED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
        <OctagonX className="w-3.5 h-3.5" />
        STOP
      </span>
    );
  };

  const renderOutcomeBadge = (res) => {
    const outcome = res?.outcome;
    if (outcome === 'recovered') {
      return <span className="text-emerald-400 font-semibold text-xs">✓ Recovered</span>;
    }
    if (outcome === 'deferred') {
      return <span className="text-amber-400 text-xs">⏳ Deferred ({res?.detail || 'Quiet hours'})</span>;
    }
    if (outcome === 'not_recovered') {
      return <span className="text-slate-400 text-xs">🛑 Stopped ({res?.detail || 'No recovery'})</span>;
    }
    return <span className="text-slate-400 text-xs">Attempted (Failed)</span>;
  };

  return (
    <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            Audit Trail & Execution Log
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable record of diagnosis, strategy decisions, and recovery execution outcomes ({total} records)
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedReason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500"
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={selectedDecision}
            onChange={(e) => onDecisionChange(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500"
          >
            {DECISION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Payment & Customer</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Raw Error</th>
              <th className="py-3 px-4">Diagnosis</th>
              <th className="py-3 px-4">Decision</th>
              <th className="py-3 px-4">Outcome</th>
              <th className="py-3 px-4 text-center">Explain</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No audit log entries matching filters.
                </td>
              </tr>
            ) : (
              logs.map((row) => {
                const isExpanded = expandedId === row._id;
                const explanationObj = explanations[row._id];
                const isLoadingExp = loadingId === row._id;

                return (
                  <React.Fragment key={row._id}>
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="font-semibold text-slate-200">{row.payment_id}</div>
                        <div className="text-slate-500 text-[10px]">{row.customer_id}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-100">
                        ₹{Number(row.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-400" title={row.raw_error}>
                        {row.raw_error}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                            {row.diagnosis?.reason_code}
                          </span>
                          {row.diagnosis?.diagnosed_by === 'llm' && (
                            <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] rounded font-semibold flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> LLM
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Conf: {(row.diagnosis?.confidence * 100).toFixed(0)}%
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {renderDecisionBadge(row.decision)}
                        <div className="text-[10px] font-mono text-slate-400 mt-1" title={row.decision?.why}>
                          why: {row.decision?.why}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {renderOutcomeBadge(row.result)}
                        {row.result?.payment_link && (
                          <div className="mt-1">
                            <a
                              href={row.result.payment_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> Razorpay Link
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleExplainClick(row._id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            isExpanded
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          {isExpanded ? 'Hide' : 'Explain'}
                        </button>
                      </td>
                    </tr>

                    {/* Inline Expandable Explanation Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-950/90 border-b border-indigo-500/30">
                        <td colSpan={7} className="p-4">
                          <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 shadow-inner space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                Agent Decision Explanation
                              </span>
                              {explanationObj?.generated_by === 'llm' ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                  LLM Generated
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  Rule-Based Compliance Log
                                </span>
                              )}
                            </div>

                            {isLoadingExp ? (
                              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                Generating decision explanation...
                              </div>
                            ) : (
                              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                                {explanationObj?.explanation}
                              </p>
                            )}

                            {/* Show Personalized Outreach Copy if available */}
                            {row.result?.message_sent && (
                              <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
                                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                                  <MessageSquareText className="w-3.5 h-3.5 text-emerald-400" />
                                  Customer Outreach Message Sent ({row.result.channel_used?.toUpperCase()}):
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300">
                                  "{row.result.message_sent}"
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
        <div>
          Showing page <span className="font-semibold text-slate-200">{page}</span> of{' '}
          <span className="font-semibold text-slate-200">{pages}</span> ({total} entries)
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-mono text-slate-300">{page}</span>
          <button
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
