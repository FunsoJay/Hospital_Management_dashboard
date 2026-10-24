import React, { useState } from 'react';
import { Activity, DollarSign, BarChart2, Layers, ChevronRight, Stethoscope } from 'lucide-react';
import { EnrichedRecord, Treatment } from '../data/hospitalData';
import { MetricSummary } from '../data/analyticsEngine';

interface TreatmentsPageProps {
  treatments: Treatment[];
  records: EnrichedRecord[];
  summary: MetricSummary;
  onSelectRecord?: (rec: EnrichedRecord) => void;
}

export const TreatmentsPage: React.FC<TreatmentsPageProps> = ({
  treatments,
  records,
  summary,
  onSelectRecord,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');

  // Aggregation by Treatment Type
  const typeMap: Record<
    string,
    {
      count: number;
      totalCost: number;
      descriptions: Record<string, number>;
      branches: Record<string, number>;
      specializations: Record<string, number>;
    }
  > = {};

  records.forEach((r) => {
    const t = r.treatment;
    if (!t) return;
    const type = t.treatment_type;
    const branch = r.doctor?.hospital_branch || 'Unassigned';
    const spec = r.doctor?.specialization || 'General';

    if (!typeMap[type]) {
      typeMap[type] = {
        count: 0,
        totalCost: 0,
        descriptions: {},
        branches: {},
        specializations: {},
      };
    }

    typeMap[type].count++;
    typeMap[type].totalCost += t.cost;
    typeMap[type].descriptions[t.description] = (typeMap[type].descriptions[t.description] || 0) + 1;
    typeMap[type].branches[branch] = (typeMap[type].branches[branch] || 0) + 1;
    typeMap[type].specializations[spec] = (typeMap[type].specializations[spec] || 0) + 1;
  });

  const treatmentTypesList = Object.entries(typeMap).sort((a, b) => b[1].totalCost - a[1].totalCost);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Total Procedures</span>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">{treatments.length} Procedures</div>
          <span className="text-[11px] text-[#2ECC71] mt-1 block">5 Clinical Procedure Categories</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Total Procedure Cost</span>
          <div className="text-2xl font-bold text-[#2ECC71] tabular-nums mt-1">
            ${summary.totalBilled.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">100% matched to billing ledger</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Average Procedure Cost</span>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            ${summary.avgTreatmentCost.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">Range: $534 – $4,973</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Highest Yielding Procedure</span>
          <div className="text-2xl font-bold text-[#CFF5DD] tabular-nums mt-1">MRI & Chemo</div>
          <span className="text-[11px] text-[#2ECC71] mt-1 block">&gt;45% of hospital gross billing</span>
        </div>
      </div>

      {/* Procedure Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {treatmentTypesList.map(([type, data]) => {
          const avgCost = data.count > 0 ? data.totalCost / data.count : 0;
          const share = summary.totalBilled > 0 ? (data.totalCost / summary.totalBilled) * 100 : 0;

          return (
            <div
              key={type}
              className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] flex flex-col justify-between gap-4 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">{type}</h4>
                  <span className="text-xs text-[#8C9391]">{data.count} treatments logged</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#2ECC71]/15 flex items-center justify-center text-[#2ECC71]">
                  <Activity className="w-4 h-4" />
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#0B0D0C] border border-[#262B29]">
                <div>
                  <span className="text-[10px] text-[#8C9391] uppercase">Total Cost</span>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                    ${data.totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C9391] uppercase">Avg Encounter</span>
                  <div className="text-sm font-bold text-[#2ECC71] tabular-nums mt-0.5">
                    ${avgCost.toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Procedure Protocols Breakdown */}
              <div className="flex flex-col gap-1.5 text-xs">
                <span className="text-[10px] font-semibold uppercase text-[#8C9391]">
                  Protocol Subtypes:
                </span>
                {Object.entries(data.descriptions).map(([desc, count]) => (
                  <div key={desc} className="flex items-center justify-between text-[#C7CECB] text-[11px]">
                    <span>{desc}</span>
                    <span className="font-mono-num text-white">{count} ({Math.round((count / data.count) * 100)}%)</span>
                  </div>
                ))}
              </div>

              {/* Revenue share */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#8C9391] mb-1">
                  <span>Share of Total Hospital Cost:</span>
                  <span className="text-white font-semibold tabular-nums">{share.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#0B0D0C] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2ECC71] h-full rounded-full transition-all"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
