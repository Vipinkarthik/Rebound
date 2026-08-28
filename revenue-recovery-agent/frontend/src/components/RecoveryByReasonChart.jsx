import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const REASON_LABELS = {
  insufficient_funds: 'Insufficient Funds',
  bank_downtime: 'Bank Downtime',
  otp_timeout: 'OTP Timeout',
  card_expired: 'Card Expired',
  invalid_card: 'Invalid Card',
  issuer_declined: 'Issuer Declined'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const atRisk = payload.find(p => p.dataKey === 'at_risk_inr')?.value || 0;
    const recovered = payload.find(p => p.dataKey === 'recovered_inr')?.value || 0;
    const rate = atRisk > 0 ? ((recovered / atRisk) * 100).toFixed(1) : 0;

    return (
      <div className="p-3 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md text-xs">
        <p className="font-bold text-slate-200 mb-1.5">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center gap-4 text-purple-400">
            <span>At Risk:</span>
            <span className="font-semibold">₹{Number(atRisk).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-emerald-400">
            <span>Recovered:</span>
            <span className="font-semibold">₹{Number(recovered).toLocaleString('en-IN')}</span>
          </div>
          <div className="pt-1 mt-1 border-t border-slate-800 flex justify-between items-center gap-4 text-indigo-300 font-medium">
            <span>Recovery Rate:</span>
            <span className="font-bold">{rate}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function RecoveryByReasonChart({ byReasonData }) {
  const chartData = Object.entries(byReasonData || {}).map(([code, stats]) => ({
    reason_code: code,
    name: REASON_LABELS[code] || code,
    at_risk_inr: stats.at_risk_inr || 0,
    recovered_inr: stats.recovered_inr || 0,
    count: stats.count || 0,
    rate: stats.recovery_rate_pct || 0
  }));

  return (
    <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Recovery Performance by Reason Code
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparison of total revenue at risk vs. actual amount recovered per failure diagnosis
          </p>
        </div>
      </div>

      <div className="h-72 sm:h-80 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No simulation data available. Run simulation to populate chart.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '15px', fontSize: '12px' }}
                formatter={(value) => (
                  <span className="text-slate-300 font-medium ml-1">
                    {value === 'at_risk_inr' ? 'At Risk (₹)' : 'Recovered (₹)'}
                  </span>
                )}
              />
              <Bar
                dataKey="at_risk_inr"
                name="at_risk_inr"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="recovered_inr"
                name="recovered_inr"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
