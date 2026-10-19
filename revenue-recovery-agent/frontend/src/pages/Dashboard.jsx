import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Activity,
  Zap,
<<<<<<< HEAD
  CheckCircle
=======
  CheckCircle,
  Radio
>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
} from 'lucide-react';

import MetricCard from '../components/MetricCard';
import BaselineComparisonCard from '../components/BaselineComparisonCard';
import RecoveryByReasonChart from '../components/RecoveryByReasonChart';
import StoppedCasesPanel from '../components/StoppedCasesPanel';
import AuditLogTable from '../components/AuditLogTable';
import PolicyEditor from '../components/PolicyEditor';
import RunSimulationButton from '../components/RunSimulationButton';
<<<<<<< HEAD
=======
import WebhookSimulatorModal from '../components/WebhookSimulatorModal';
>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)

import {
  getSummary,
  simulateEvents,
  getAuditLogs,
  getPolicies,
<<<<<<< HEAD
  updatePolicyRule
=======
  updatePolicyRule,
  processDeferredQueue
>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
} from '../api/client';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stoppedCases, setStoppedCases] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [policies, setPolicies] = useState({ rules: [], global_constraints: {} });

  const [isSimulating, setIsSimulating] = useState(false);
<<<<<<< HEAD
=======
  const [isProcessingDeferred, setIsProcessingDeferred] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, polData] = await Promise.all([
        getSummary(),
        getPolicies()
      ]);
      setSummary(sumData);
      setPolicies(polData);

      // Fetch audit logs
      const auditRes = await getAuditLogs({
        page: currentPage,
        limit: 10,
        reason_code: selectedReason,
        decision: selectedDecision
      });
      setAuditLogs(auditRes.data || []);
      setStoppedCases(auditRes.stopped_cases || []);
      setPagination(auditRes.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to connect to backend server.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedReason, selectedDecision]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRunSimulation = async (count = 300) => {
    setIsSimulating(true);
    setError(null);
    try {
      const newSummary = await simulateEvents(count);
      setSummary(newSummary);

      // Refresh audit logs and policies
      const [auditRes, polData] = await Promise.all([
        getAuditLogs({
          page: 1,
          limit: 10,
          reason_code: selectedReason,
          decision: selectedDecision
        }),
        getPolicies()
      ]);
      setCurrentPage(1);
      setAuditLogs(auditRes.data || []);
      setStoppedCases(auditRes.stopped_cases || []);
      setPagination(auditRes.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
      setPolicies(polData);

      showToast(`Simulation complete! Processed ${count} synthetic payment events.`);
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.response?.data?.error || err.message || 'Simulation execution failed.');
    } finally {
      setIsSimulating(false);
    }
  };

<<<<<<< HEAD
=======
  const handleProcessDeferred = async () => {
    setIsProcessingDeferred(true);
    setError(null);
    try {
      const res = await processDeferredQueue();
      showToast(res.details || `Processed ${res.processed_count} deferred cases!`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Error processing deferred queue:', err);
      setError(err.response?.data?.error || err.message || 'Failed to process deferred queue.');
    } finally {
      setIsProcessingDeferred(false);
    }
  };

>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
  const handlePolicyUpdate = async (reasonCode, updateData) => {
    const updatedRule = await updatePolicyRule(reasonCode, updateData);
    setPolicies((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.reason_code === reasonCode ? updatedRule : r))
    }));
    showToast(`Updated policy for ${reasonCode}. Re-run simulation to test!`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const agentSummary = summary?.agentSummary || summary;
  const baselineSummary = summary?.baselineSummary;
  const upliftPct = summary?.upliftPct;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl shadow-2xl border border-indigo-400 animate-bounce text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl shadow-lg shadow-indigo-600/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  Revenue Recovery Agent
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold uppercase">
                  Autonomous System
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Root-cause error diagnosis, compliance restraint, & intelligent recovery execution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
<<<<<<< HEAD
=======
            {/* Live Webhook Simulator Trigger */}
            <button
              onClick={() => setIsWebhookModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
              Simulate Webhook
            </button>

>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
            <RunSimulationButton onRun={handleRunSimulation} isLoading={isSimulating} />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-10 pt-8 space-y-8">
        {/* Global Error Alert */}
        {error && (
          <div className="p-4 bg-rose-950/50 border border-rose-800/80 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <div className="flex-1">{error}</div>
            <button
              onClick={() => fetchDashboardData()}
              className="px-3 py-1 bg-rose-900/80 hover:bg-rose-800 text-white rounded-lg text-xs font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Feature 1: Naive Baseline Uplift Card */}
        <BaselineComparisonCard
          agentSummary={agentSummary}
          baselineSummary={baselineSummary}
          upliftPct={upliftPct}
        />

        {/* 1. Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total Revenue At Risk"
            value={formatCurrency(agentSummary?.total_at_risk_inr)}
            subtext={`Across ${agentSummary?.total_events || 0} failed payments`}
            icon={DollarSign}
            type="atRisk"
          />

          <MetricCard
            title="Total Recovered"
            value={formatCurrency(agentSummary?.total_recovered_inr)}
            subtext={`${agentSummary?.cases_acted_on || 0} cases acted on`}
            icon={TrendingUp}
            type="recovered"
            badgeText="Success"
          />

          <MetricCard
            title="Recovery Rate"
            value={`${agentSummary?.recovery_rate_pct || 0}%`}
            subtext="Of total lost revenue recovered"
            icon={Activity}
            type="rate"
          />

          <MetricCard
            title="Cases Stopped"
            value={agentSummary?.cases_stopped_by_compliance || 0}
            subtext="Halted by compliance rules"
            icon={ShieldCheck}
            type="stopped"
            badgeText="Restraint"
          />

          <MetricCard
            title="Cases Deferred"
            value={agentSummary?.cases_deferred_quiet_hours || 0}
            subtext="Deferred during 9PM-9AM"
            icon={Clock}
            type="deferred"
            badgeText="Quiet Hours"
          />
        </div>

        {/* 2. Chart Section */}
        <RecoveryByReasonChart byReasonData={agentSummary?.by_reason_code || {}} />

<<<<<<< HEAD
        {/* 3. Stopped Cases Highlight Panel */}
        <StoppedCasesPanel stoppedCases={stoppedCases} />
=======
        {/* 3. Stopped Cases Highlight Panel & Deferred Queue Processing */}
        <StoppedCasesPanel
          stoppedCases={stoppedCases}
          deferredCount={agentSummary?.cases_deferred_quiet_hours || 0}
          onProcessDeferred={handleProcessDeferred}
          isProcessingDeferred={isProcessingDeferred}
        />
>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)

        {/* 4. Audit Log Table */}
        <AuditLogTable
          logs={auditLogs}
          pagination={pagination}
          selectedReason={selectedReason}
          selectedDecision={selectedDecision}
          onReasonChange={(val) => {
            setSelectedReason(val);
            setCurrentPage(1);
          }}
          onDecisionChange={(val) => {
            setSelectedDecision(val);
            setCurrentPage(1);
          }}
          onPageChange={(p) => setCurrentPage(p)}
        />

        {/* 5. Policy Rules Editor */}
        <PolicyEditor
          rules={policies.rules}
          globalConstraints={policies.global_constraints}
          onPolicyUpdate={handlePolicyUpdate}
        />
      </main>
<<<<<<< HEAD
=======

      {/* Webhook Simulator Modal */}
      <WebhookSimulatorModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
          showToast('Simulated webhook ingested and processed live!');
        }}
      />
>>>>>>> ee84457 (The Recovery Agent project is completed end-to-end)
    </div>
  );
}
