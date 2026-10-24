import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  TrendingDown,
  Building,
} from 'lucide-react';
import { HeatmapChart } from '../components/charts/HeatmapChart';
import { Appointment, Doctor, EnrichedRecord } from '../data/hospitalData';
import { computeHeatmapGrid, MetricSummary, MonthlyTrendPoint } from '../data/analyticsEngine';

interface AppointmentsPageProps {
  summary: MetricSummary;
  appointments: Appointment[];
  monthlyTrends: MonthlyTrendPoint[];
  records: EnrichedRecord[];
  doctors: Doctor[];
  onSelectRecord?: (rec: EnrichedRecord) => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  summary,
  appointments,
  monthlyTrends,
  records,
  doctors,
  onSelectRecord,
}) => {
  const [filterBreakdown, setFilterBreakdown] = useState<'reason' | 'specialization' | 'branch' | 'doctor'>('reason');
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<string | null>(null);

  // Compute Heatmap grid
  const heatmap = computeHeatmapGrid(appointments);

  // Attrition by Reason for Visit
  const reasonMap: Record<string, { total: number; completed: number; cancelled: number; noShow: number }> = {};
  // Attrition by Specialization
  const specMap: Record<string, { total: number; completed: number; cancelled: number; noShow: number }> = {};
  // Attrition by Branch
  const branchMap: Record<string, { total: number; completed: number; cancelled: number; noShow: number }> = {};
  // Attrition by Doctor
  const doctorMap: Record<string, { total: number; completed: number; cancelled: number; noShow: number; name: string }> = {};

  records.forEach((r) => {
    const app = r.appointment;
    const doc = r.doctor;
    if (!app) return;

    const reason = app.reason_for_visit || 'General';
    const spec = doc?.specialization || 'Unassigned';
    const branch = doc?.hospital_branch || 'Unassigned';
    const docId = doc?.doctor_id || 'Unknown';
    const docName = doc?.fullName || docId;

    const isComp = app.isCompleted ? 1 : 0;
    const isCanc = app.isCancelled ? 1 : 0;
    const isNo = app.isNoShow ? 1 : 0;

    // Reason
    if (!reasonMap[reason]) reasonMap[reason] = { total: 0, completed: 0, cancelled: 0, noShow: 0 };
    reasonMap[reason].total++;
    reasonMap[reason].completed += isComp;
    reasonMap[reason].cancelled += isCanc;
    reasonMap[reason].noShow += isNo;

    // Spec
    if (!specMap[spec]) specMap[spec] = { total: 0, completed: 0, cancelled: 0, noShow: 0 };
    specMap[spec].total++;
    specMap[spec].completed += isComp;
    specMap[spec].cancelled += isCanc;
    specMap[spec].noShow += isNo;

    // Branch
    if (!branchMap[branch]) branchMap[branch] = { total: 0, completed: 0, cancelled: 0, noShow: 0 };
    branchMap[branch].total++;
    branchMap[branch].completed += isComp;
    branchMap[branch].cancelled += isCanc;
    branchMap[branch].noShow += isNo;

    // Doctor
    if (!doctorMap[docId]) doctorMap[docId] = { total: 0, completed: 0, cancelled: 0, noShow: 0, name: docName };
    doctorMap[docId].total++;
    doctorMap[docId].completed += isComp;
    doctorMap[docId].cancelled += isCanc;
    doctorMap[docId].noShow += isNo;
  });

  const getActiveBreakdownList = () => {
    if (filterBreakdown === 'reason') return Object.entries(reasonMap).map(([k, v]) => ({ label: k, ...v }));
    if (filterBreakdown === 'specialization') return Object.entries(specMap).map(([k, v]) => ({ label: k, ...v }));
    if (filterBreakdown === 'branch') return Object.entries(branchMap).map(([k, v]) => ({ label: k, ...v }));
    return Object.entries(doctorMap).map(([k, v]) => ({ label: v.name, ...v }));
  };

  const breakdownList = getActiveBreakdownList().sort((a, b) => {
    const rateA = a.total > 0 ? (a.cancelled + a.noShow) / a.total : 0;
    const rateB = b.total > 0 ? (b.cancelled + b.noShow) / b.total : 0;
    return rateB - rateA;
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* KPI Status Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Total Bookings</span>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums mt-1">
            {summary.totalAppointments}
          </div>
          <span className="text-[11px] text-[#8C9391] mt-1 block">Full network volume</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Completed Visits</span>
            <CheckCircle className="w-4 h-4 text-[#2ECC71]" />
          </div>
          <div className="text-2xl font-bold text-[#2ECC71] tabular-nums mt-1">
            {summary.completedAppointments}
          </div>
          <span className="text-[11px] text-[#2ECC71] mt-1 block">
            {summary.completionRate.toFixed(1)}% fulfillment rate
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C9391] uppercase">Cancelled Visits</span>
            <XCircle className="w-4 h-4 text-[#FF5C5C]" />
          </div>
          <div className="text-2xl font-bold text-[#FF5C5C] tabular-nums mt-1">
            {summary.cancelledAppointments}
          </div>
          <span className="text-[11px] text-[#FF5C5C] mt-1 block">
            {summary.cancellationRate.toFixed(1)}% cancellation rate
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8C9391] uppercase">No-Show Attrition</span>
            <AlertTriangle className="w-4 h-4 text-[#E5A93C]" />
          </div>
          <div className="text-2xl font-bold text-[#E5A93C] tabular-nums mt-1">
            {summary.noShowAppointments}
          </div>
          <span className="text-[11px] text-[#E5A93C] mt-1 block">
            {summary.noShowRate.toFixed(1)}% unannounced no-show
          </span>
        </div>
      </div>

      {/* Peak Times Heatmap Section */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262B29]">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Peak Scheduling Heatmap (Weekday × Hourly Slot)
            </h3>
            <span className="text-xs text-[#8C9391]">
              Clinic appointment density distribution from 08:00 to 17:00 across all 3 branches
            </span>
          </div>
          {selectedSlotInfo && (
            <span className="px-2.5 py-1 rounded-lg bg-[#2ECC71]/20 text-[#2ECC71] text-xs font-semibold">
              {selectedSlotInfo}
            </span>
          )}
        </div>

        <HeatmapChart
          days={heatmap.days}
          hours={heatmap.hours}
          matrix={heatmap.matrix}
          maxVal={heatmap.maxVal}
          onSlotClick={(day, hour, count) => {
            setSelectedSlotInfo(`Selected: ${day} at ${hour}:00 — ${count} visits scheduled`);
          }}
        />
      </div>

      {/* Attrition & Cancellation Rate Analysis */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262B29]">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Cancellation & No-Show Attrition Analysis
            </h3>
            <span className="text-xs text-[#8C9391]">
              Identify operational leakage by visit purpose, department, and physician
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#0B0D0C] p-1 rounded-xl border border-[#262B29]">
            {(['reason', 'specialization', 'branch', 'doctor'] as const).map((dim) => (
              <button
                key={dim}
                onClick={() => setFilterBreakdown(dim)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  filterBreakdown === dim
                    ? 'active-pill-gradient text-black'
                    : 'text-[#8C9391] hover:text-white'
                }`}
              >
                {dim}
              </button>
            ))}
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {breakdownList.map((item) => {
            const cancRate = item.total > 0 ? (item.cancelled / item.total) * 100 : 0;
            const noShowRate = item.total > 0 ? (item.noShow / item.total) * 100 : 0;
            const totalAttrition = cancRate + noShowRate;

            return (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[190px]">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[#8C9391] font-mono-num">{item.total} visits</span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8C9391]">Completed:</span>
                    <span className="font-semibold text-[#2ECC71] tabular-nums">{item.completed}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8C9391]">Cancelled:</span>
                    <span className="font-semibold text-[#FF5C5C] tabular-nums">
                      {item.cancelled} ({cancRate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8C9391]">No-Show:</span>
                    <span className="font-semibold text-[#E5A93C] tabular-nums">
                      {item.noShow} ({noShowRate.toFixed(1)}%)
                    </span>
                  </div>

                  {/* Multi-tier progress bar */}
                  <div className="w-full bg-[#161918] h-2 rounded-full mt-1 overflow-hidden flex">
                    <div
                      className="bg-[#2ECC71] h-full"
                      style={{ width: `${item.total > 0 ? (item.completed / item.total) * 100 : 0}%` }}
                      title={`Completed: ${item.completed}`}
                    />
                    <div
                      className="bg-[#FF5C5C] h-full"
                      style={{ width: `${cancRate}%` }}
                      title={`Cancelled: ${item.cancelled}`}
                    />
                    <div
                      className="bg-[#E5A93C] h-full"
                      style={{ width: `${noShowRate}%` }}
                      title={`No-Show: ${item.noShow}`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#262B29]">
                  <span className="text-[#8C9391]">Combined Attrition:</span>
                  <span
                    className={`font-bold tabular-nums ${
                      totalAttrition >= 40 ? 'text-[#FF5C5C]' : 'text-[#E5A93C]'
                    }`}
                  >
                    {totalAttrition.toFixed(1)}%
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
