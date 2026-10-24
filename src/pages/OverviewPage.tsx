import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { DonutChart, DonutSegment } from '../components/charts/DonutChart';
import { AreaChart } from '../components/charts/AreaChart';
import { Doctor, EnrichedRecord, Patient, maskInsurance } from '../data/hospitalData';
import {
  AutoInsight,
  MetricChanges,
  MetricSummary,
  MonthlyTrendPoint,
  Recommendation,
} from '../data/analyticsEngine';

interface OverviewPageProps {
  summary: MetricSummary;
  changes: MetricChanges;
  monthlyTrends: MonthlyTrendPoint[];
  records: EnrichedRecord[];
  doctors: Doctor[];
  patients: Patient[];
  insights: AutoInsight[];
  recommendations: Recommendation[];
  revealPii: boolean;
  onSelectDoctor: (doc: Doctor) => void;
  onSelectPatient: (pat: Patient) => void;
  onSelectRecord: (rec: EnrichedRecord) => void;
  onFilterByStatus?: (status: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  summary,
  changes,
  monthlyTrends,
  records,
  doctors,
  patients,
  insights,
  recommendations,
  revealPii,
  onSelectDoctor,
  onSelectPatient,
  onSelectRecord,
  onFilterByStatus,
}) => {
  const [donutMode, setDonutMode] = useState<'status' | 'method' | 'treatment'>('status');
  const [tableMode, setTableMode] = useState<'patients' | 'doctors'>('patients');
  const [areaMetric, setAreaMetric] = useState<'both' | 'billed' | 'collected'>('both');

  // 1. Prepare Donut Segments
  let donutData: DonutSegment[] = [];
  let donutCenterSubtext = 'Total Billed';

  if (donutMode === 'status') {
    donutData = [
      {
        key: 'Paid',
        label: 'Paid (Collected)',
        value: summary.totalCollected,
        color: '#2ECC71',
      },
      {
        key: 'Pending',
        label: 'Pending Adjudication',
        value: summary.totalPending,
        color: '#E5A93C',
      },
      {
        key: 'Failed',
        label: 'Failed Charges',
        value: summary.totalFailed,
        color: '#FF5C5C',
      },
    ];
  } else if (donutMode === 'method') {
    const cardAmt = records
      .filter((r) => r.bill?.payment_method === 'Credit Card')
      .reduce((s, r) => s + (r.bill?.amount || 0), 0);
    const cashAmt = records
      .filter((r) => r.bill?.payment_method === 'Cash')
      .reduce((s, r) => s + (r.bill?.amount || 0), 0);
    const insAmt = records
      .filter((r) => r.bill?.payment_method === 'Insurance')
      .reduce((s, r) => s + (r.bill?.amount || 0), 0);

    donutData = [
      { key: 'Insurance', label: 'Insurance', value: insAmt, color: '#2ECC71' },
      { key: 'Credit Card', label: 'Credit Card', value: cardAmt, color: '#7ED321' },
      { key: 'Cash', label: 'Cash / Counter', value: cashAmt, color: '#0F7A43' },
    ];
    donutCenterSubtext = 'By Method';
  } else {
    // By treatment
    const typeTotals: Record<string, number> = {};
    records.forEach((r) => {
      const type = r.treatment?.treatment_type || 'Other';
      typeTotals[type] = (typeTotals[type] || 0) + (r.bill?.amount || 0);
    });

    const colors = ['#2ECC71', '#7ED321', '#0F7A43', '#CFF5DD', '#34D399'];
    donutData = Object.entries(typeTotals).map(([type, val], i) => ({
      key: type,
      label: type,
      value: val,
      color: colors[i % colors.length],
    }));
    donutCenterSubtext = 'By Treatment';
  }

  // 2. Compute Top Patients by Billed Amount
  const patientAgg: Record<
    string,
    { patient: Patient; billed: number; paid: number; visits: number }
  > = {};

  records.forEach((r) => {
    if (r.patient) {
      const pid = r.patient.patient_id;
      if (!patientAgg[pid]) {
        patientAgg[pid] = {
          patient: r.patient,
          billed: 0,
          paid: 0,
          visits: 0,
        };
      }
      patientAgg[pid].billed += r.bill?.amount || 0;
      if (r.bill?.isPaid) patientAgg[pid].paid += r.bill.amount;
      patientAgg[pid].visits++;
    }
  });

  const topPatients = Object.values(patientAgg)
    .sort((a, b) => b.billed - a.billed)
    .slice(0, 5);

  // 3. Compute Top Doctors by Revenue
  const doctorAgg: Record<
    string,
    { doctor: Doctor; billed: number; paid: number; procedures: number }
  > = {};

  records.forEach((r) => {
    if (r.doctor) {
      const did = r.doctor.doctor_id;
      if (!doctorAgg[did]) {
        doctorAgg[did] = {
          doctor: r.doctor,
          billed: 0,
          paid: 0,
          procedures: 0,
        };
      }
      doctorAgg[did].billed += r.bill?.amount || 0;
      if (r.bill?.isPaid) doctorAgg[did].paid += r.bill.amount;
      doctorAgg[did].procedures++;
    }
  });

  const topDoctors = Object.values(doctorAgg)
    .sort((a, b) => b.billed - a.billed)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* ROW 1: THREE LARGE KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Total Billed */}
        <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8C9391] uppercase tracking-wider">
              Total Billed Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2ECC71]/15 flex items-center justify-center text-[#2ECC71]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
              ${summary.totalBilled.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-[11px] text-[#8C9391] mt-1">
              Gross patient invoices from 200 clinical treatments
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#262B29] text-xs">
            <span
              className={`flex items-center font-bold tabular-nums ${
                changes.billedChange >= 0 ? 'text-[#2ECC71]' : 'text-[#FF5C5C]'
              }`}
            >
              {changes.billedChange >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {Math.abs(changes.billedChange).toFixed(1)}%
            </span>
            <span className="text-[#8C9391]">vs. previous 6-mo period</span>
          </div>
        </div>

        {/* KPI 2: Total Collected (Paid) */}
        <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8C9391] uppercase tracking-wider">
              Total Collected (Paid)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2ECC71]/25 flex items-center justify-center text-[#2ECC71]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-[#2ECC71] tabular-nums tracking-tight">
              ${summary.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-[11px] text-[#8C9391] mt-1">
              Realized cash receipts ({summary.collectionRate.toFixed(1)}% collection rate)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#262B29] text-xs">
            <span
              className={`flex items-center font-bold tabular-nums ${
                changes.collectedChange >= 0 ? 'text-[#2ECC71]' : 'text-[#FF5C5C]'
              }`}
            >
              {changes.collectedChange >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {Math.abs(changes.collectedChange).toFixed(1)}%
            </span>
            <span className="text-[#8C9391]">collected velocity</span>
          </div>
        </div>

        {/* KPI 3: Outstanding (Pending + Failed) */}
        <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8C9391] uppercase tracking-wider">
              Total Outstanding Debt
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FF5C5C]/20 flex items-center justify-center text-[#FF5C5C]">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl font-extrabold text-[#FF5C5C] tabular-nums tracking-tight">
              ${summary.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-[11px] text-[#8C9391] mt-1">
              Pending ($169k) + Failed ($166k) uncollected accounts
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#262B29] text-xs">
            <span className="text-[#E5A93C] font-semibold tabular-nums">
              {((summary.totalOutstanding / (summary.totalBilled || 1)) * 100).toFixed(1)}% of billed
            </span>
            <span className="text-[#8C9391]">requires dunning</span>
          </div>
        </div>
      </div>

      {/* ROW 2: OVERVIEW DONUT + SMALL STAT TILES + AREA CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Overview Donut Card (5 cols on lg) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#161918] border border-[#262B29] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#262B29]">
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white tracking-tight">Billing & Revenue Split</h3>
              <span className="text-[11px] text-[#8C9391]">
                Distribution of accounts receivable across network
              </span>
            </div>

            {/* Segment switch buttons */}
            <div className="flex items-center gap-1 bg-[#0B0D0C] p-1 rounded-lg border border-[#262B29]">
              <button
                onClick={() => setDonutMode('status')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  donutMode === 'status'
                    ? 'bg-[#1C201F] text-[#2ECC71]'
                    : 'text-[#8C9391] hover:text-white'
                }`}
              >
                Status
              </button>
              <button
                onClick={() => setDonutMode('method')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  donutMode === 'method'
                    ? 'bg-[#1C201F] text-[#2ECC71]'
                    : 'text-[#8C9391] hover:text-white'
                }`}
              >
                Method
              </button>
              <button
                onClick={() => setDonutMode('treatment')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  donutMode === 'treatment'
                    ? 'bg-[#1C201F] text-[#2ECC71]'
                    : 'text-[#8C9391] hover:text-white'
                }`}
              >
                Treatments
              </button>
            </div>
          </div>

          <div className="py-4">
            <DonutChart
              data={donutData}
              centerSubtext={donutCenterSubtext}
              onSegmentClick={(seg) => {
                if (donutMode === 'status' && onFilterByStatus) {
                  onFilterByStatus(seg.key);
                }
              }}
            />
          </div>

          <div className="pt-3 border-t border-[#262B29] flex items-center justify-between text-[11px] text-[#8C9391]">
            <span>Click any slice to cross-filter</span>
            <span className="text-white font-medium">200 Invoices Analyzed</span>
          </div>
        </div>

        {/* Small Stat Tiles + Area Chart (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Two small stat tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stat Tile 1: New Patients this period */}
            <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] flex items-center justify-between shadow-md">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[#8C9391] uppercase">
                  New Patient Inflow
                </span>
                <div className="text-2xl font-extrabold text-white tabular-nums mt-1">
                  {summary.newPatients}{' '}
                  <span className="text-xs font-normal text-[#8C9391]">
                    / {summary.uniquePatients} total
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                  <span
                    className={`flex items-center font-bold tabular-nums ${
                      changes.newPatientsChange >= 0 ? 'text-[#2ECC71]' : 'text-[#FF5C5C]'
                    }`}
                  >
                    {changes.newPatientsChange >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {Math.abs(changes.newPatientsChange).toFixed(1)}%
                  </span>
                  <span className="text-[#8C9391]">registration pace</span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#2ECC71]/15 flex items-center justify-center text-[#2ECC71]">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Stat Tile 2: Cancellation Rate */}
            <div className="p-4 rounded-2xl bg-[#161918] border border-[#262B29] flex items-center justify-between shadow-md">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[#8C9391] uppercase">
                  Cancellation Rate
                </span>
                <div className="text-2xl font-extrabold text-[#FF5C5C] tabular-nums mt-1">
                  {summary.cancellationRate.toFixed(1)}%
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                  <span
                    className={`flex items-center font-bold tabular-nums ${
                      changes.cancellationRateChange > 0 ? 'text-[#FF5C5C]' : 'text-[#2ECC71]'
                    }`}
                  >
                    {changes.cancellationRateChange > 0 ? '+' : ''}
                    {changes.cancellationRateChange.toFixed(1)} pts
                  </span>
                  <span className="text-[#8C9391]">
                    {summary.cancelledAppointments} visits cancelled
                  </span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#FF5C5C]/15 flex items-center justify-center text-[#FF5C5C]">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Area Chart Card: Revenue Trend Over Time */}
          <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] flex-1 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#262B29]">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Revenue Velocity (Billed vs. Collected)
                </h3>
                <span className="text-[11px] text-[#8C9391]">
                  12-month calendar comparison with highlighted peak
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-[#2ECC71] text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" />
                    Billed
                  </span>
                  <span className="flex items-center gap-1 text-[#0F7A43] text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0F7A43]" />
                    Collected
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <AreaChart data={monthlyTrends} metricKey={areaMetric} height={200} />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: WIDE TABLE CARD ("Top Patients" or "Top Doctors" toggle) */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262B29]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#0B0D0C] p-1 rounded-xl border border-[#262B29]">
              <button
                onClick={() => setTableMode('patients')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  tableMode === 'patients'
                    ? 'active-pill-gradient text-black'
                    : 'text-[#8C9391] hover:text-white'
                }`}
              >
                Top Patients by Billed Amount
              </button>
              <button
                onClick={() => setTableMode('doctors')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  tableMode === 'doctors'
                    ? 'active-pill-gradient text-black'
                    : 'text-[#8C9391] hover:text-white'
                }`}
              >
                Top Doctors by Revenue
              </button>
            </div>
          </div>

          <span className="text-xs text-[#8C9391]">
            Click any row for full drill-down audit
          </span>
        </div>

        {/* Responsive Table */}
        <div className="w-full overflow-x-auto">
          {tableMode === 'patients' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#262B29] text-[#8C9391] text-[10px] uppercase font-semibold">
                  <th className="pb-3 pl-2">Patient Name & ID</th>
                  <th className="pb-3">Age Band & Gender</th>
                  <th className="pb-3">Insurance Provider</th>
                  <th className="pb-3">Visits Count</th>
                  <th className="pb-3">Collected (Paid)</th>
                  <th className="pb-3 text-right pr-2">Total Billed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262B29]/60">
                {topPatients.map((item, idx) => (
                  <tr
                    key={item.patient.patient_id}
                    onClick={() => onSelectPatient(item.patient)}
                    className="hover:bg-[#1C201F] cursor-pointer transition-colors"
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#2ECC71]/20 text-[#2ECC71] flex items-center justify-center font-bold text-xs shrink-0">
                          {item.patient.first_name[0]}
                          {item.patient.last_name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">
                            {item.patient.fullName}
                          </span>
                          <span className="text-[10px] text-[#8C9391]">
                            {item.patient.patient_id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#C7CECB]">
                      {item.patient.age} yrs · {item.patient.ageBand} ({item.patient.gender})
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {item.patient.insurance_provider}
                        </span>
                        <span className="text-[10px] text-[#8C9391]">
                          {maskInsurance(item.patient.insurance_number, revealPii)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-semibold tabular-nums text-white">
                      {item.visits} visits
                    </td>
                    <td className="py-3 font-semibold tabular-nums text-[#2ECC71]">
                      ${item.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pr-2 text-right font-extrabold tabular-nums text-white">
                      ${item.billed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#262B29] text-[#8C9391] text-[10px] uppercase font-semibold">
                  <th className="pb-3 pl-2">Physician Name</th>
                  <th className="pb-3">Specialization</th>
                  <th className="pb-3">Hospital Branch</th>
                  <th className="pb-3">Experience</th>
                  <th className="pb-3">Procedures</th>
                  <th className="pb-3 text-right pr-2">Total Billed Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262B29]/60">
                {topDoctors.map((item, idx) => (
                  <tr
                    key={item.doctor.doctor_id}
                    onClick={() => onSelectDoctor(item.doctor)}
                    className="hover:bg-[#1C201F] cursor-pointer transition-colors"
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#2ECC71]/20 text-[#2ECC71] flex items-center justify-center font-bold text-xs shrink-0">
                          {item.doctor.first_name[0]}
                          {item.doctor.last_name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">
                            {item.doctor.fullName}
                          </span>
                          <span className="text-[10px] text-[#8C9391]">
                            {item.doctor.doctor_id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#2ECC71] font-medium">
                      {item.doctor.specialization}
                    </td>
                    <td className="py-3 text-[#C7CECB]">
                      {item.doctor.hospital_branch}
                    </td>
                    <td className="py-3 text-[#8C9391] tabular-nums">
                      {item.doctor.years_experience} years
                    </td>
                    <td className="py-3 font-semibold tabular-nums text-white">
                      {item.procedures} treatments
                    </td>
                    <td className="py-3 pr-2 text-right font-extrabold tabular-nums text-white">
                      ${item.billed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ROW 4: AUTO-GENERATED KEY INSIGHTS & RECOMMENDED ACTIONS PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Key Insights Panel */}
        <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#262B29]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2ECC71]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Auto-Generated Key Insights
              </h3>
            </div>
            <span className="text-[10px] text-[#8C9391] font-mono-num">Grounding: 2023 Ledger</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {insights.slice(0, 3).map((ins) => (
              <div
                key={ins.id}
                className="p-3 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white tracking-tight">
                    {ins.title}
                  </span>
                  <span className="text-[10px] font-bold text-[#2ECC71] tabular-nums">
                    {ins.metric}
                  </span>
                </div>
                <p className="text-[11px] text-[#8C9391] leading-relaxed">
                  {ins.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions Panel */}
        <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[#262B29]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#7ED321]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Recommended Operational Actions
              </h3>
            </div>
            <span className="text-[10px] text-[#2ECC71] font-bold">5 Action Plans</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        rec.priority === 'High'
                          ? 'bg-[#FF5C5C]/20 text-[#FF5C5C]'
                          : 'bg-[#2ECC71]/20 text-[#2ECC71]'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <span className="text-xs font-semibold text-white">{rec.title}</span>
                  </div>
                  <span className="text-[10px] text-[#8C9391]">{rec.area}</span>
                </div>
                <p className="text-[11px] text-[#C7CECB] leading-relaxed">
                  {rec.recommendation}
                </p>
                <div className="text-[10px] text-[#2ECC71] font-medium pt-1 border-t border-[#262B29]/60">
                  Impact: {rec.estimatedImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
