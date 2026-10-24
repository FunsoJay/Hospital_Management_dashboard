import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Database,
  Search,
} from 'lucide-react';
import { DataQualityReport } from '../data/hospitalData';

interface DataQualityPageProps {
  report: DataQualityReport;
}

export const DataQualityPage: React.FC<DataQualityPageProps> = ({ report }) => {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(report.issues[0]?.id || null);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* Audit Banner */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2ECC71]/20 flex items-center justify-center text-[#2ECC71]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Hospital Data Integrity & Automated Audit Report
            </h3>
            <p className="text-xs text-[#8C9391]">
              Automated reconciliation of 5 relational CSV files (660 total records evaluated)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[#0B0D0C] border border-[#262B29] text-xs">
            <span className="text-[#8C9391]">Clean Records Score: </span>
            <strong className="text-[#2ECC71] tabular-nums font-bold">
              {report.cleanPercentage}%
            </strong>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0B0D0C] border border-[#262B29]">
          <span className="text-[10px] text-[#8C9391] uppercase">Missing Values</span>
          <div className="text-xl font-bold text-[#2ECC71] tabular-nums mt-1">
            {report.summary.missingValues}
          </div>
          <span className="text-[10px] text-[#2ECC71]">Zero null entries</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0D0C] border border-[#262B29]">
          <span className="text-[10px] text-[#8C9391] uppercase">Duplicate Keys</span>
          <div className="text-xl font-bold text-[#2ECC71] tabular-nums mt-1">
            {report.summary.duplicateKeys}
          </div>
          <span className="text-[10px] text-[#2ECC71]">100% unique primary IDs</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0D0C] border border-[#262B29]">
          <span className="text-[10px] text-[#8C9391] uppercase">Cancelled Treatments</span>
          <div className="text-xl font-bold text-[#FF5C5C] tabular-nums mt-1">
            {report.summary.cancelledWithTreatments}
          </div>
          <span className="text-[10px] text-[#FF5C5C]">Procedures logged</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0D0C] border border-[#262B29]">
          <span className="text-[10px] text-[#8C9391] uppercase">Cancelled Bills</span>
          <div className="text-xl font-bold text-[#FF5C5C] tabular-nums mt-1">
            {report.summary.cancelledWithBills}
          </div>
          <span className="text-[10px] text-[#FF5C5C]">Invoices generated</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0D0C] border border-[#262B29]">
          <span className="text-[10px] text-[#8C9391] uppercase">Pre-Reg Appts</span>
          <div className="text-xl font-bold text-[#E5A93C] tabular-nums mt-1">
            {report.summary.appBeforeReg}
          </div>
          <span className="text-[10px] text-[#E5A93C]">Date sequencing defect</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0D0C] border border-[#262B29]">
          <span className="text-[10px] text-[#8C9391] uppercase">Cost Mismatches</span>
          <div className="text-xl font-bold text-[#2ECC71] tabular-nums mt-1">
            {report.summary.amountCostMismatches}
          </div>
          <span className="text-[10px] text-[#2ECC71]">100% cost-bill parity</span>
        </div>
      </div>

      {/* Audit Findings Accordion List */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col gap-3">
        <h3 className="text-sm font-bold text-white tracking-tight pb-2 border-b border-[#262B29]">
          Detailed Audit Findings & Root-Cause Diagnoses
        </h3>

        <div className="flex flex-col gap-3">
          {report.issues.map((iss) => {
            const isExpanded = expandedIssue === iss.id;
            const isHigh = iss.severity === 'high';
            const isMed = iss.severity === 'medium';

            return (
              <div
                key={iss.id}
                className="rounded-xl border border-[#262B29] bg-[#0B0D0C] overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedIssue(isExpanded ? null : iss.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#161918] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isHigh ? 'bg-[#FF5C5C]' : isMed ? 'bg-[#E5A93C]' : 'bg-[#2ECC71]'
                      }`}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{iss.title}</span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                            isHigh
                              ? 'bg-[#FF5C5C]/20 text-[#FF5C5C]'
                              : isMed
                              ? 'bg-[#E5A93C]/20 text-[#E5A93C]'
                              : 'bg-[#2ECC71]/20 text-[#2ECC71]'
                          }`}
                        >
                          {iss.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8C9391] mt-0.5">
                        {iss.count} affected records
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {iss.sampleIds.length > 0 && (
                      <span className="hidden sm:inline text-[10px] text-[#8C9391] font-mono-num">
                        Sample: {iss.sampleIds.slice(0, 2).join(', ')}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#8C9391]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#8C9391]" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 border-t border-[#262B29] bg-[#161918] flex flex-col gap-3 text-xs leading-relaxed">
                    <p className="text-[#C7CECB]">{iss.description}</p>

                    {iss.records.length > 0 && (
                      <div className="mt-2 w-full overflow-x-auto">
                        <span className="text-[10px] uppercase font-bold text-[#8C9391] block mb-1.5">
                          Affected Record Snapshot ({iss.records.length} total):
                        </span>
                        <table className="w-full text-left text-[11px] border-collapse bg-[#0B0D0C] rounded-lg overflow-hidden">
                          <thead>
                            <tr className="border-b border-[#262B29] text-[#8C9391] text-[10px] uppercase">
                              {Object.keys(iss.records[0] || {}).map((col) => (
                                <th key={col} className="p-2">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#262B29]/60">
                            {iss.records.slice(0, 5).map((rec, rIdx) => (
                              <tr key={rIdx}>
                                {Object.values(rec).map((val: any, vIdx) => (
                                  <td key={vIdx} className="p-2 tabular-nums text-white">
                                    {String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
