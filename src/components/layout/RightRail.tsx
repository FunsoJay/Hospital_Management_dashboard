import React from 'react';
import {
  AlertCircle,
  Clock,
  Send,
  X,
  Stethoscope,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { Doctor, EnrichedRecord } from '../../data/hospitalData';
import { MetricSummary } from '../../data/analyticsEngine';

interface RightRailProps {
  doctors: Doctor[];
  recentRecords: EnrichedRecord[];
  summary: MetricSummary;
  isOpen: boolean;
  onClose: () => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectRecord?: (record: EnrichedRecord) => void;
}

export const RightRail: React.FC<RightRailProps> = ({
  doctors,
  recentRecords,
  summary,
  isOpen,
  onClose,
  onSelectDoctor,
  onSelectRecord,
}) => {
  // 3 high-priority auto-generated operational alerts
  const alerts = [
    {
      id: 'alt-1',
      title: 'High Card Failure Velocity',
      description: 'Credit Card payment failure reaches 36.6%. Follow up on 26 unpaid bills.',
      time: 'Realtime Alert',
      type: 'critical',
      icon: TrendingDown,
    },
    {
      id: 'alt-2',
      title: 'Appointment Attrition Surge',
      description: '40.5% combined cancellation & no-show rate idling doctor clinic hours.',
      time: 'Operations Alert',
      type: 'warning',
      icon: AlertTriangle,
    },
    {
      id: 'alt-3',
      title: 'Aged Pending Claims',
      description: '$89k+ in pending insurance claims awaiting clearinghouse resolution over 60d.',
      time: 'Finance Alert',
      type: 'info',
      icon: AlertCircle,
    },
  ];

  // Top doctors this period (top 4)
  const topDoctors = doctors.slice(0, 4);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 xl:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed xl:static top-0 right-0 h-full w-80 bg-[#161918] border-l border-[#262B29] p-4 flex flex-col gap-6 z-40 overflow-y-auto transition-transform duration-300 shrink-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'
        } ${!isOpen ? 'hidden xl:flex' : 'flex'}`}
      >
        {/* Header with close button on mobile */}
        <div className="flex items-center justify-between pb-2 border-b border-[#262B29]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Operations Rail
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8C9391] hover:text-white xl:hidden"
            title="Close rail"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Auto-generated Alerts / Notifications */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8C9391] uppercase tracking-wider">
              System Alerts ({alerts.length})
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {alerts.map((alt) => {
              const Icon = alt.icon;
              const isCrit = alt.type === 'critical';
              const isWarn = alt.type === 'warning';
              return (
                <div
                  key={alt.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isCrit
                      ? 'bg-[#FF5C5C]/10 border-[#FF5C5C]/30'
                      : isWarn
                      ? 'bg-[#E5A93C]/10 border-[#E5A93C]/30'
                      : 'bg-[#1C201F] border-[#262B29]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isCrit ? 'text-[#FF5C5C]' : isWarn ? 'text-[#E5A93C]' : 'text-[#2ECC71]'
                      }`}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-white tracking-tight">
                        {alt.title}
                      </span>
                      <p className="text-[11px] text-[#C7CECB] leading-relaxed">
                        {alt.description}
                      </p>
                      <span className="text-[9px] text-[#8C9391] mt-1 font-mono-num">
                        {alt.time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Contact Your Doctors (with one highlighted green contact pill) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8C9391] uppercase tracking-wider">
              Contact Your Doctors
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {topDoctors.map((doc, idx) => {
              const isHighlighted = idx === 0; // Dr. David Taylor or top doc highlighted with green pill
              return (
                <div
                  key={doc.doctor_id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isHighlighted
                      ? 'bg-[#1FA463]/15 border-[#2ECC71]/40'
                      : 'bg-[#1C201F] border-[#262B29] hover:border-[#2ECC71]/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        isHighlighted
                          ? 'bg-[#2ECC71] text-black font-extrabold'
                          : 'bg-[#262B29] text-white'
                      }`}
                    >
                      {doc.first_name[0]}
                      {doc.last_name[0]}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">
                        {doc.fullName}
                      </span>
                      <span className="text-[10px] text-[#8C9391] truncate">
                        {doc.specialization} · {doc.hospital_branch.replace(' Clinic', '').replace(' Hospital', '')}
                      </span>
                    </div>
                  </div>

                  {isHighlighted ? (
                    <button
                      onClick={() => onSelectDoctor(doc)}
                      className="px-2.5 py-1 rounded-lg active-pill-gradient text-[11px] font-bold shrink-0 shadow-sm shadow-[#2ECC71]/30 hover:opacity-95 transition-all"
                    >
                      Contact
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectDoctor(doc)}
                      className="p-1.5 rounded-lg text-[#8C9391] hover:text-white hover:bg-[#262B29] transition-colors shrink-0"
                      title="View Doctor Scorecard"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Recent Activity Feed */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8C9391] uppercase tracking-wider">
              Recent Activity
            </span>
            <span className="text-[10px] text-[#2ECC71] font-mono-num">Latest Events</span>
          </div>

          <div className="flex flex-col gap-2">
            {recentRecords.slice(0, 5).map((rec, i) => {
              const bill = rec.bill;
              const app = rec.appointment;
              const doc = rec.doctor;
              const pat = rec.patient;
              const treat = rec.treatment;

              return (
                <div
                  key={i}
                  onClick={() => onSelectRecord && onSelectRecord(rec)}
                  className="p-2.5 rounded-xl bg-[#1C201F] border border-[#262B29] hover:border-[#2ECC71]/40 cursor-pointer transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white truncate max-w-[140px]">
                      {pat?.fullName || 'Patient'}
                    </span>
                    <span className="text-[10px] text-[#8C9391] font-mono-num tabular-nums">
                      {bill?.bill_date || app?.appointment_date || '2023'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8C9391]">
                    <span className="truncate max-w-[150px]">
                      {treat?.treatment_type || app?.reason_for_visit} · {doc?.fullName}
                    </span>
                    {bill && (
                      <span
                        className={`font-semibold tabular-nums ${
                          bill.isPaid
                            ? 'text-[#2ECC71]'
                            : bill.isPending
                            ? 'text-[#E5A93C]'
                            : 'text-[#FF5C5C]'
                        }`}
                      >
                        ${bill.amount.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};
