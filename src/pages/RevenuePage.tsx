import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Stethoscope,
  Shield,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { AreaChart } from '../components/charts/AreaChart';
import { DonutChart } from '../components/charts/DonutChart';
import { EnrichedRecord } from '../data/hospitalData';
import { MetricSummary, MonthlyTrendPoint } from '../data/analyticsEngine';

interface RevenuePageProps {
  summary: MetricSummary;
  monthlyTrends: MonthlyTrendPoint[];
  records: EnrichedRecord[];
  onSelectRecord: (rec: EnrichedRecord) => void;
}

export const RevenuePage: React.FC<RevenuePageProps> = ({
  summary,
  monthlyTrends,
  records,
  onSelectRecord,
}) => {
  const [selectedDimension, setSelectedDimension] = useState<'branch' | 'specialization' | 'treatment' | 'insurer'>('branch');

  // Dimension aggregations
  const branchMap: Record<string, { billed: number; collected: number; count: number }> = {};
  const specMap: Record<string, { billed: number; collected: number; count: number }> = {};
  const treatMap: Record<string, { billed: number; collected: number; count: number }> = {};
  const insMap: Record<string, { billed: number; collected: number; count: number }> = {};

  records.forEach((r) => {
    const branch = r.doctor?.hospital_branch || 'Unassigned';
    const spec = r.doctor?.specialization || 'General';
    const treat = r.treatment?.treatment_type || 'Other';
    const ins = r.patient?.insurance_provider || 'Self-Pay';
    const amt = r.bill?.amount || 0;
    const paid = r.bill?.isPaid ? amt : 0;

    if (!branchMap[branch]) branchMap[branch] = { billed: 0, collected: 0, count: 0 };
    branchMap[branch].billed += amt;
    branchMap[branch].collected += paid;
    branchMap[branch].count++;

    if (!specMap[spec]) specMap[spec] = { billed: 0, collected: 0, count: 0 };
    specMap[spec].billed += amt;
    specMap[spec].collected += paid;
    specMap[spec].count++;

    if (!treatMap[treat]) treatMap[treat] = { billed: 0, collected: 0, count: 0 };
    treatMap[treat].billed += amt;
    treatMap[treat].collected += paid;
    treatMap[treat].count++;

    if (!insMap[ins]) insMap[ins] = { billed: 0, collected: 0, count: 0 };
    insMap[ins].billed += amt;
    insMap[ins].collected += paid;
    insMap[ins].count++;
  });

  const getActiveDimensionData = () => {
    if (selectedDimension === 'branch') return Object.entries(branchMap);
    if (selectedDimension === 'specialization') return Object.entries(specMap);
    if (selectedDimension === 'treatment') return Object.entries(treatMap);
    return Object.entries(insMap);
  };

  const activeDimensionList = getActiveDimensionData().sort((a, b) => b[1].billed - a[1].billed);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Total Invoiced</span>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            ${summary.totalBilled.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">200 billed procedures</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Realized Collections</span>
          <div className="text-2xl font-bold text-[#2ECC71] tabular-nums mt-1">
            ${summary.totalCollected.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-[#2ECC71] mt-1 block">
            {summary.collectionRate.toFixed(1)}% collection rate
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Average Invoice Value</span>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            ${summary.avgBillValue.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">Per treatment encounter</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Uncollected Exposure</span>
          <div className="text-2xl font-bold text-[#FF5C5C] tabular-nums mt-1">
            ${summary.totalOutstanding.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-[#E5A93C] mt-1 block">
            Pending ($169k) + Failed ($166k)
          </span>
        </div>
      </div>

      {/* Main Revenue Chart: Billed vs Collected Trend */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262B29]">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              12-Month Revenue & Collection Progression
            </h3>
            <span className="text-xs text-[#8C9391]">
              Historical tracking of gross billings versus deposited cash collections
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#2ECC71]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" />
              Gross Billed
            </span>
            <span className="flex items-center gap-1.5 text-[#0F7A43]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F7A43]" />
              Realized Cash
            </span>
          </div>
        </div>

        <AreaChart data={monthlyTrends} metricKey="both" height={240} />
      </div>

      {/* Breakdown by Dimension */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262B29]">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Revenue Breakdown by Dimension</h3>
            <span className="text-xs text-[#8C9391]">
              Compare total billed, collection efficiency, and invoice volume
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#0B0D0C] p-1 rounded-xl border border-[#262B29]">
            {(['branch', 'specialization', 'treatment', 'insurer'] as const).map((dim) => (
              <button
                key={dim}
                onClick={() => setSelectedDimension(dim)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  selectedDimension === dim
                    ? 'active-pill-gradient text-black'
                    : 'text-[#8C9391] hover:text-white'
                }`}
              >
                {dim}
              </button>
            ))}
          </div>
        </div>

        {/* Dimension Table & Progress bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeDimensionList.map(([key, data]) => {
            const collRate = data.billed > 0 ? (data.collected / data.billed) * 100 : 0;
            const pctOfTotal = summary.totalBilled > 0 ? (data.billed / summary.totalBilled) * 100 : 0;

            return (
              <div
                key={key}
                className="p-4 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[180px]">{key}</span>
                  <span className="text-[10px] text-[#8C9391] font-mono-num">{data.count} bills</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#8C9391]">Billed:</span>
                    <span className="font-bold text-white tabular-nums">
                      ${data.billed.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8C9391]">Collected:</span>
                    <span className="font-bold text-[#2ECC71] tabular-nums">
                      ${data.collected.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#161918] h-2 rounded-full mt-2.5 overflow-hidden flex">
                    <div
                      className="bg-[#2ECC71] h-full rounded-full transition-all"
                      style={{ width: `${collRate}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#262B29]">
                  <span className="text-[#8C9391]">{pctOfTotal.toFixed(1)}% of total revenue</span>
                  <span className="font-semibold text-[#2ECC71] tabular-nums">
                    {collRate.toFixed(1)}% collected
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
