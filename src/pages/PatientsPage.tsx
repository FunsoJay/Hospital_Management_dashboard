import React, { useState } from 'react';
import {
  Users,
  Shield,
  Activity,
  AlertTriangle,
  Receipt,
  Search,
  Eye,
  EyeOff,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import {
  EnrichedRecord,
  Patient,
  maskAddress,
  maskEmail,
  maskInsurance,
  maskPhone,
} from '../data/hospitalData';
import { MetricSummary } from '../data/analyticsEngine';

interface PatientsPageProps {
  patients: Patient[];
  records: EnrichedRecord[];
  summary: MetricSummary;
  revealPii: boolean;
  onTogglePii: () => void;
  onSelectPatient: (pat: Patient) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  patients,
  records,
  summary,
  revealPii,
  onTogglePii,
  onSelectPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAge, setFilterAge] = useState<string>('all');
  const [filterInsurer, setFilterInsurer] = useState<string>('all');
  const [filterCohort, setFilterCohort] = useState<'all' | 'high_value' | 'repeat_cancellations' | 'unpaid'>(
    'all'
  );

  // Compute patient analytics
  const patientStats = patients.map((pat) => {
    const patRecords = records.filter((r) => r.patient?.patient_id === pat.patient_id);
    let totalBilled = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;
    let cancelledVisits = 0;
    let completedVisits = 0;

    patRecords.forEach((r) => {
      if (r.bill) {
        totalBilled += r.bill.amount;
        if (r.bill.isPaid) totalPaid += r.bill.amount;
        else totalUnpaid += r.bill.amount;
      }
      if (r.appointment) {
        if (r.appointment.isCancelled || r.appointment.isNoShow) cancelledVisits++;
        if (r.appointment.isCompleted) completedVisits++;
      }
    });

    const isHighValue = totalBilled >= 12000;
    const hasRepeatCancellations = cancelledVisits >= 2;
    const hasUnpaidBills = totalUnpaid > 0;

    return {
      patient: pat,
      totalBilled,
      totalPaid,
      totalUnpaid,
      visitsCount: patRecords.length,
      cancelledVisits,
      completedVisits,
      isHighValue,
      hasRepeatCancellations,
      hasUnpaidBills,
    };
  });

  // Filter & Search
  const filtered = patientStats.filter((ps) => {
    const pat = ps.patient;
    const matchesSearch =
      pat.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.insurance_provider.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterAge !== 'all' && pat.ageBand !== filterAge) return false;
    if (filterInsurer !== 'all' && pat.insurance_provider !== filterInsurer) return false;

    if (filterCohort === 'high_value' && !ps.isHighValue) return false;
    if (filterCohort === 'repeat_cancellations' && !ps.hasRepeatCancellations) return false;
    if (filterCohort === 'unpaid' && !ps.hasUnpaidBills) return false;

    return true;
  });

  // Demographics aggregation
  const ageDist: Record<string, number> = { '<30': 0, '30-44': 0, '45-59': 0, '60+': 0 };
  const genderDist: Record<string, number> = { M: 0, F: 0 };
  const insurerDist: Record<string, number> = {};

  patients.forEach((p) => {
    ageDist[p.ageBand] = (ageDist[p.ageBand] || 0) + 1;
    genderDist[p.gender] = (genderDist[p.gender] || 0) + 1;
    insurerDist[p.insurance_provider] = (insurerDist[p.insurance_provider] || 0) + 1;
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* Demographic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Registered Patients</span>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">{patients.length} Enrolled</div>
          <span className="text-[11px] text-[#2ECC71] mt-1 block">Active across 3 hospital centers</span>
        </div>

        {/* Gender Breakdown */}
        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Gender Distribution</span>
          <div className="text-lg font-bold text-white tabular-nums mt-1 flex items-center gap-3">
            <span>Male: {genderDist.M || 0}</span>
            <span className="text-[#8C9391]">·</span>
            <span className="text-[#2ECC71]">Female: {genderDist.F || 0}</span>
          </div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">Balanced demographic pool</span>
        </div>

        {/* Primary Insurer */}
        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Top Payer Coverage</span>
          <div className="text-2xl font-bold text-[#CFF5DD] tabular-nums mt-1">MedCare Plus</div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">
            {insurerDist['MedCare Plus'] || 0} policyholders
          </span>
        </div>

        {/* High-Value Patients */}
        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">High-Value Cohort</span>
          <div className="text-2xl font-bold text-[#2ECC71] tabular-nums mt-1">
            {patientStats.filter((p) => p.isHighValue).length} Patients
          </div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">$12,000+ billed lifetime</span>
        </div>
      </div>

      {/* Cohort Selector & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          {/* Cohort filter pills */}
          <div className="flex items-center gap-1 bg-[#0B0D0C] p-1 rounded-xl border border-[#262B29]">
            {[
              { id: 'all', label: 'All Patients' },
              { id: 'high_value', label: 'High-Value ($12k+)' },
              { id: 'repeat_cancellations', label: 'Repeat Cancellations' },
              { id: 'unpaid', label: 'Unpaid Balances' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setFilterCohort(c.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filterCohort === c.id ? 'active-pill-gradient text-black' : 'text-[#8C9391] hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Age filter */}
          <select
            value={filterAge}
            onChange={(e) => setFilterAge(e.target.value)}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Ages</option>
            <option value="<30">&lt;30 years</option>
            <option value="30-44">30-44 years</option>
            <option value="45-59">45-59 years</option>
            <option value="60+">60+ years</option>
          </select>
        </div>

        {/* Search & PII Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9391]" />
            <input
              type="text"
              placeholder="Search patients by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0B0D0C] border border-[#262B29] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8C9391] focus:outline-none focus:border-[#2ECC71]/60"
            />
          </div>

          <button
            onClick={onTogglePii}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              revealPii
                ? 'bg-[#FF5C5C]/20 border-[#FF5C5C]/40 text-[#FF5C5C]'
                : 'bg-[#1C201F] border-[#262B29] text-[#8C9391] hover:text-white'
            }`}
          >
            {revealPii ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#2ECC71]" />}
            <span>{revealPii ? 'PII Revealed' : 'Masked'}</span>
          </button>
        </div>
      </div>

      {/* Patient Ledger Table */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#262B29]">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Patient Demographics & Financial Ledger ({filtered.length})
          </h3>
          <span className="text-xs text-[#8C9391]">Showing real masked records</span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#262B29] text-[#8C9391] text-[10px] uppercase font-semibold">
                <th className="pb-3 pl-2">Patient</th>
                <th className="pb-3">Age & Gender</th>
                <th className="pb-3">Contact (Masked)</th>
                <th className="pb-3">Insurance Policy</th>
                <th className="pb-3">Visits & Attrition</th>
                <th className="pb-3">Collected</th>
                <th className="pb-3 text-right pr-2">Total Billed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262B29]/60">
              {filtered.map((item) => {
                const pat = item.patient;
                return (
                  <tr
                    key={pat.patient_id}
                    onClick={() => onSelectPatient(pat)}
                    className="hover:bg-[#1C201F] cursor-pointer transition-colors"
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#2ECC71]/20 text-[#2ECC71] flex items-center justify-center font-bold text-xs shrink-0">
                          {pat.first_name[0]}
                          {pat.last_name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{pat.fullName}</span>
                          <span className="text-[10px] text-[#8C9391]">{pat.patient_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#C7CECB]">
                      {pat.age} yrs · {pat.ageBand} ({pat.gender})
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col text-[11px]">
                        <span className="font-mono-num text-white">
                          {maskPhone(pat.contact_number, revealPii)}
                        </span>
                        <span className="text-[10px] text-[#8C9391]">
                          {maskEmail(pat.email, revealPii)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{pat.insurance_provider}</span>
                        <span className="text-[10px] text-[#8C9391]">
                          {maskInsurance(pat.insurance_number, revealPii)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white tabular-nums">
                          {item.visitsCount} visits
                        </span>
                        {item.cancelledVisits > 0 && (
                          <span className="text-[10px] text-[#FF5C5C] font-semibold tabular-nums">
                            ({item.cancelledVisits} cancel)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-[#2ECC71] tabular-nums">
                      ${item.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pr-2 text-right font-extrabold text-white tabular-nums">
                      ${item.totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
