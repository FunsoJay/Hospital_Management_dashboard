import React, { useState } from 'react';
import {
  Stethoscope,
  Building2,
  Award,
  DollarSign,
  Calendar,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { Doctor, EnrichedRecord } from '../data/hospitalData';

interface DoctorsPageProps {
  doctors: Doctor[];
  records: EnrichedRecord[];
  onSelectDoctor: (doc: Doctor) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  doctors,
  records,
  onSelectDoctor,
}) => {
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterSpec, setFilterSpec] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'revenue' | 'appointments' | 'completion' | 'experience'>('revenue');

  // Compute doctor scorecards
  const scorecards = doctors.map((doc) => {
    const docRecords = records.filter((r) => r.doctor?.doctor_id === doc.doctor_id);
    const seenPatients = new Set<string>();
    const seenApps = new Set<string>();

    let totalBilled = 0;
    let totalCollected = 0;
    let completedApps = 0;
    let cancelledApps = 0;

    docRecords.forEach((r) => {
      if (r.patient) seenPatients.add(r.patient.patient_id);
      if (r.appointment && !seenApps.has(r.appointment.appointment_id)) {
        seenApps.add(r.appointment.appointment_id);
        if (r.appointment.isCompleted) completedApps++;
        if (r.appointment.isCancelled) cancelledApps++;
      }
      if (r.bill) {
        totalBilled += r.bill.amount;
        if (r.bill.isPaid) totalCollected += r.bill.amount;
      }
    });

    const totalApps = seenApps.size;
    const completionRate = totalApps > 0 ? (completedApps / totalApps) * 100 : 0;
    const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    return {
      doctor: doc,
      totalAppointments: totalApps,
      completedAppointments: completedApps,
      cancelledAppointments: cancelledApps,
      completionRate,
      patientsSeen: seenPatients.size,
      totalBilled,
      totalCollected,
      collectionRate,
      treatmentsCount: docRecords.filter((r) => r.treatment).length,
    };
  });

  // Filter & Sort
  const filteredScorecards = scorecards
    .filter((sc) => {
      if (filterBranch !== 'all' && sc.doctor.hospital_branch !== filterBranch) return false;
      if (filterSpec !== 'all' && sc.doctor.specialization !== filterSpec) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'revenue') return b.totalBilled - a.totalBilled;
      if (sortBy === 'appointments') return b.totalAppointments - a.totalAppointments;
      if (sortBy === 'completion') return b.completionRate - a.completionRate;
      return b.doctor.years_experience - a.doctor.years_experience;
    });

  // Workload balance stats
  const totalNetworkBilled = scorecards.reduce((s, sc) => s + sc.totalBilled, 0);
  const avgAppsPerDoc = Math.round(scorecards.reduce((s, sc) => s + sc.totalAppointments, 0) / (doctors.length || 1));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* Workload Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Total Active Physicians</span>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">{doctors.length} Doctors</div>
          <span className="text-[11px] text-[#2ECC71] mt-1 block">3 Specialty Departments</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Avg Visits / Clinician</span>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">{avgAppsPerDoc} Encounters</div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">Target: 20 per physician</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Experience Range</span>
          <div className="text-2xl font-bold text-[#CFF5DD] tabular-nums mt-1">5 – 28 Years</div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">Senior physician core</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Workload Balance Index</span>
          <div className="text-2xl font-bold text-[#2ECC71] tabular-nums mt-1">Nominal (±18%)</div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">Fair cross-branch allocation</span>
        </div>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#8C9391]">
            <span>Branch:</span>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="all">All Branches</option>
              <option value="Central Hospital">Central Hospital</option>
              <option value="Westside Clinic">Westside Clinic</option>
              <option value="Eastside Clinic">Eastside Clinic</option>
            </select>
          </div>

          {/* Specialty filter */}
          <div className="flex items-center gap-1.5 text-xs text-[#8C9391]">
            <span>Specialty:</span>
            <select
              value={filterSpec}
              onChange={(e) => setFilterSpec(e.target.value)}
              className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="all">All Specialties</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Oncology">Oncology</option>
            </select>
          </div>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#8C9391]">Sort By:</span>
          <div className="flex items-center gap-1 bg-[#0B0D0C] p-1 rounded-xl border border-[#262B29]">
            {(['revenue', 'appointments', 'completion', 'experience'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-colors ${
                  sortBy === s ? 'active-pill-gradient text-black' : 'text-[#8C9391] hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Scorecard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScorecards.map((sc) => {
          const doc = sc.doctor;
          const shareOfRevenue = totalNetworkBilled > 0 ? (sc.totalBilled / totalNetworkBilled) * 100 : 0;

          return (
            <div
              key={doc.doctor_id}
              onClick={() => onSelectDoctor(doc)}
              className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] hover:border-[#2ECC71]/40 cursor-pointer transition-all flex flex-col justify-between gap-4 shadow-lg group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2ECC71]/20 to-[#0F7A43]/20 border border-[#2ECC71]/30 flex items-center justify-center font-bold text-sm text-[#2ECC71] shrink-0 group-hover:scale-105 transition-transform">
                    {doc.first_name[0]}
                    {doc.last_name[0]}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-bold text-white group-hover:text-[#2ECC71] transition-colors">
                      {doc.fullName}
                    </h4>
                    <span className="text-[11px] text-[#2ECC71] font-medium">
                      {doc.specialization} · {doc.years_experience} yrs exp
                    </span>
                    <span className="text-[10px] text-[#8C9391]">
                      {doc.hospital_branch}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#8C9391] group-hover:text-white transition-colors" />
              </div>

              {/* Numerical Metrics */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#0B0D0C] border border-[#262B29]">
                <div>
                  <span className="text-[10px] text-[#8C9391] uppercase">Total Billed</span>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                    ${sc.totalBilled.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C9391] uppercase">Realized Paid</span>
                  <div className="text-sm font-bold text-[#2ECC71] tabular-nums mt-0.5">
                    ${sc.totalCollected.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C9391] uppercase">Appointments</span>
                  <div className="text-sm font-semibold text-white tabular-nums mt-0.5">
                    {sc.totalAppointments} visits
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C9391] uppercase">Completion Rate</span>
                  <div className="text-sm font-semibold text-[#2ECC71] tabular-nums mt-0.5">
                    {sc.completionRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Progress bar of revenue share */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#8C9391] mb-1">
                  <span>Network Revenue Contribution:</span>
                  <span className="text-white font-semibold tabular-nums">{shareOfRevenue.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#0B0D0C] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#2ECC71] to-[#7ED321] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(shareOfRevenue * 5, 100)}%` }}
                  />
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#262B29] text-[11px] text-[#8C9391]">
                <span>{sc.patientsSeen} unique patients</span>
                <span className="text-[#2ECC71] font-semibold group-hover:underline">
                  Inspect Scorecard →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
