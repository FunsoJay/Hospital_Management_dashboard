import React from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { DEFAULT_FILTERS, FilterState } from '../../data/analyticsEngine';
import { Doctor } from '../../data/hospitalData';

interface GlobalFiltersProps {
  filters: FilterState;
  onUpdateFilters: (partial: Partial<FilterState>) => void;
  doctors: Doctor[];
  isOpen: boolean;
  onClose: () => void;
  activeFilterCount: number;
}

export const GlobalFilters: React.FC<GlobalFiltersProps> = ({
  filters,
  onUpdateFilters,
  doctors,
  isOpen,
  onClose,
  activeFilterCount,
}) => {
  if (!isOpen) return null;

  const branches = ['Central Hospital', 'Westside Clinic', 'Eastside Clinic'];
  const specializations = ['Pediatrics', 'Dermatology', 'Oncology'];
  const treatmentTypes = ['Chemotherapy', 'MRI', 'ECG', 'Physiotherapy', 'X-Ray'];
  const appointmentStatuses = ['Completed', 'Scheduled', 'Cancelled', 'No-show'];
  const visitReasons = ['Consultation', 'Checkup', 'Therapy', 'Emergency', 'Follow-up'];
  const paymentMethods = ['Credit Card', 'Cash', 'Insurance'];
  const paymentStatuses = ['Paid', 'Pending', 'Failed'];
  const insurers = ['MedCare Plus', 'WellnessCorp', 'PulseSecure', 'HealthIndia'];
  const genders = [
    { id: 'M', label: 'Male' },
    { id: 'F', label: 'Female' },
  ];
  const ageBands = ['<30', '30-44', '45-59', '60+'];

  const resetAll = () => {
    onUpdateFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="bg-[#161918] border-b border-[#262B29] px-4 md:px-6 py-4 shadow-xl z-20 transition-all">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#262B29]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Global Filters & Slicers
          </span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#2ECC71]/20 text-[#2ECC71] text-[10px] font-bold">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 text-xs text-[#8C9391] hover:text-[#FF5C5C] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8C9391] hover:text-white hover:bg-[#1C201F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of slicers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Branch Slicer */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-semibold text-[#8C9391]">Branch</label>
          <select
            value={filters.branch || ''}
            onChange={(e) => onUpdateFilters({ branch: e.target.value || undefined })}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2ECC71]/50"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Specialization */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-semibold text-[#8C9391]">Specialization</label>
          <select
            value={filters.specialization || ''}
            onChange={(e) => onUpdateFilters({ specialization: e.target.value || undefined })}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2ECC71]/50"
          >
            <option value="">All Specializations</option>
            {specializations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-semibold text-[#8C9391]">Doctor</label>
          <select
            value={filters.doctorId || ''}
            onChange={(e) => onUpdateFilters({ doctorId: e.target.value || undefined })}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2ECC71]/50"
          >
            <option value="">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.doctor_id} value={d.doctor_id}>
                {d.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Treatment Type */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-semibold text-[#8C9391]">Treatment</label>
          <select
            value={filters.treatmentType || ''}
            onChange={(e) => onUpdateFilters({ treatmentType: e.target.value || undefined })}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2ECC71]/50"
          >
            <option value="">All Treatments</option>
            {treatmentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Appointment Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-semibold text-[#8C9391]">Appt Status</label>
          <select
            value={filters.appointmentStatus || ''}
            onChange={(e) => onUpdateFilters({ appointmentStatus: e.target.value || undefined })}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2ECC71]/50"
          >
            <option value="">All Statuses</option>
            {appointmentStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-semibold text-[#8C9391]">Payment Method</label>
          <select
            value={filters.paymentMethod || ''}
            onChange={(e) => onUpdateFilters({ paymentMethod: e.target.value || undefined })}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2ECC71]/50"
          >
            <option value="">All Methods</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-semibold text-[#8C9391]">Payment Status</label>
          <select
            value={filters.paymentStatus || ''}
            onChange={(e) => onUpdateFilters({ paymentStatus: e.target.value || undefined })}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2ECC71]/50"
          >
            <option value="">All Billing Statuses</option>
            {paymentStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Insurance Provider */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-semibold text-[#8C9391]">Insurer</label>
          <select
            value={filters.insuranceProvider || ''}
            onChange={(e) => onUpdateFilters({ insuranceProvider: e.target.value || undefined })}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2ECC71]/50"
          >
            <option value="">All Insurers</option>
            {insurers.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-semibold text-[#8C9391]">Gender</label>
          <select
            value={filters.gender || ''}
            onChange={(e) => onUpdateFilters({ gender: e.target.value || undefined })}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2ECC71]/50"
          >
            <option value="">All Genders</option>
            {genders.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Age Band */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-semibold text-[#8C9391]">Age Band</label>
          <select
            value={filters.ageBand || ''}
            onChange={(e) => onUpdateFilters({ ageBand: e.target.value || undefined })}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2ECC71]/50"
          >
            <option value="">All Age Bands</option>
            {ageBands.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Comparison toggle */}
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <label className="text-[10px] uppercase font-semibold text-[#8C9391]">Comparison</label>
          <button
            type="button"
            onClick={() => onUpdateFilters({ comparePreviousPeriod: !filters.comparePreviousPeriod })}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              filters.comparePreviousPeriod
                ? 'bg-[#2ECC71]/15 border-[#2ECC71]/50 text-[#2ECC71]'
                : 'bg-[#0B0D0C] border-[#262B29] text-[#8C9391]'
            }`}
          >
            <span>Compare Prev Period</span>
            {filters.comparePreviousPeriod && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
