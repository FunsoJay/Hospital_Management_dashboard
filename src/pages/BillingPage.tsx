import React, { useState } from 'react';
import {
  Receipt,
  AlertOctagon,
  Clock,
  TrendingDown,
  DollarSign,
  ShieldAlert,
  CreditCard,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Bill, EnrichedRecord, maskInsurance } from '../data/hospitalData';
import { computeAgeingAnalysis, MetricSummary } from '../data/analyticsEngine';

interface BillingPageProps {
  bills: Bill[];
  records: EnrichedRecord[];
  summary: MetricSummary;
  revealPii: boolean;
  onSelectRecord?: (rec: EnrichedRecord) => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({
  bills,
  records,
  summary,
  revealPii,
  onSelectRecord,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'Paid' | 'Pending' | 'Failed'>('all');
  const [filterMethod, setFilterMethod] = useState<'all' | 'Credit Card' | 'Cash' | 'Insurance'>('all');

  // Compute Ageing Breakdown
  const ageingBuckets = computeAgeingAnalysis(bills);

  // Filter bills
  const filteredRecords = records.filter((r) => {
    if (!r.bill) return false;
    if (filterStatus !== 'all' && r.bill.payment_status !== filterStatus) return false;
    if (filterMethod !== 'all' && r.bill.payment_method !== filterMethod) return false;
    return true;
  });

  // Bills at high risk: Failed charges OR Pending > 60 days
  const highRiskBills = records.filter((r) => {
    if (!r.bill) return false;
    return r.bill.isFailed || (r.bill.isPending && r.bill.ageingDays > 60);
  });

  const highRiskTotal = highRiskBills.reduce((s, r) => s + (r.bill?.amount || 0), 0);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Total Billed Invoices</span>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            ${summary.totalBilled.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">200 billing entries</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Realized Paid Receipts</span>
          <div className="text-2xl font-bold text-[#2ECC71] tabular-nums mt-1">
            ${summary.totalCollected.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-[#2ECC71] mt-1 block">
            {summary.collectionRate.toFixed(1)}% collection efficiency
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Failed Payment Loss</span>
          <div className="text-2xl font-bold text-[#FF5C5C] tabular-nums mt-1">
            ${summary.totalFailed.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-[#FF5C5C] mt-1 block">
            {summary.failureRate.toFixed(1)}% gross failure velocity
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Bills at Immediate Risk</span>
          <div className="text-2xl font-bold text-[#E5A93C] tabular-nums mt-1">
            ${highRiskTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-[#E5A93C] mt-1 block">
            {highRiskBills.length} accounts &gt;60d or failed
          </span>
        </div>
      </div>

      {/* Unpaid Bills Ageing Analysis */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#262B29]">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Unpaid Accounts Ageing Schedule & Delinquency Exposure
            </h3>
            <span className="text-xs text-[#8C9391]">
              Distribution of pending insurance claims and failed payments across ageing brackets
            </span>
          </div>
          <span className="text-xs font-semibold text-[#FF5C5C] tabular-nums">
            Total Unpaid: ${summary.totalOutstanding.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* 4 Ageing Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ageingBuckets.map((bucket) => {
            const isHighAge = bucket.bucket === '90+ days';
            const isMedAge = bucket.bucket === '61-90 days';

            return (
              <div
                key={bucket.bucket}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                  isHighAge
                    ? 'bg-[#FF5C5C]/10 border-[#FF5C5C]/30'
                    : isMedAge
                    ? 'bg-[#E5A93C]/10 border-[#E5A93C]/30'
                    : 'bg-[#0B0D0C] border-[#262B29]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{bucket.bucket}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isHighAge
                        ? 'bg-[#FF5C5C]/20 text-[#FF5C5C]'
                        : isMedAge
                        ? 'bg-[#E5A93C]/20 text-[#E5A93C]'
                        : 'bg-[#2ECC71]/20 text-[#2ECC71]'
                    }`}
                  >
                    {bucket.count} bills
                  </span>
                </div>

                <div>
                  <div className="text-xl font-extrabold text-white tabular-nums">
                    ${bucket.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <span className="text-[11px] text-[#8C9391] mt-0.5 block">
                    {bucket.percentage.toFixed(1)}% of total unpaid debt
                  </span>
                </div>

                <div className="text-[10px] text-[#8C9391] pt-2 border-t border-[#262B29] flex items-center justify-between">
                  <span>Pending: ${bucket.statusBreakdown.pending.toFixed(0)}</span>
                  <span className="text-[#FF5C5C]">Failed: ${bucket.statusBreakdown.failed.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar & Ledger Table */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262B29]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Hospital Billing & Invoices Ledger ({filteredRecords.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Payment status filter */}
            <div className="flex items-center gap-1 bg-[#0B0D0C] p-1 rounded-xl border border-[#262B29]">
              {(['all', 'Paid', 'Pending', 'Failed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    filterStatus === st
                      ? 'active-pill-gradient text-black'
                      : 'text-[#8C9391] hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'All Statuses' : st}
                </button>
              ))}
            </div>

            {/* Payment method filter */}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as any)}
              className="bg-[#0B0D0C] border border-[#262B29] rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="all">All Payment Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#262B29] text-[#8C9391] text-[10px] uppercase font-semibold">
                <th className="pb-3 pl-2">Bill ID</th>
                <th className="pb-3">Bill Date</th>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Procedure</th>
                <th className="pb-3">Payment Method</th>
                <th className="pb-3">Ageing</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262B29]/60">
              {filteredRecords.map((r, idx) => {
                const b = r.bill!;
                return (
                  <tr
                    key={b.bill_id}
                    onClick={() => onSelectRecord && onSelectRecord(r)}
                    className="hover:bg-[#1C201F] cursor-pointer transition-colors"
                  >
                    <td className="py-3 pl-2 font-bold text-white">{b.bill_id}</td>
                    <td className="py-3 text-[#8C9391] tabular-nums">{b.bill_date}</td>
                    <td className="py-3 font-medium text-white">{r.patient?.fullName}</td>
                    <td className="py-3 text-[#C7CECB]">{r.treatment?.treatment_type}</td>
                    <td className="py-3 text-[#8C9391]">{b.payment_method}</td>
                    <td className="py-3">
                      <span
                        className={`text-[11px] font-mono-num tabular-nums ${
                          b.ageingDays > 60 ? 'text-[#FF5C5C]' : 'text-[#8C9391]'
                        }`}
                      >
                        {b.ageingDays} days
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          b.isPaid
                            ? 'bg-[#2ECC71]/20 text-[#2ECC71]'
                            : b.isPending
                            ? 'bg-[#E5A93C]/20 text-[#E5A93C]'
                            : 'bg-[#FF5C5C]/20 text-[#FF5C5C]'
                        }`}
                      >
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right font-extrabold text-white tabular-nums">
                      ${b.amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
