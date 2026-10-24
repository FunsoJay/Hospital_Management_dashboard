import React, { useState } from 'react';
import { X, Calendar, Activity, Receipt, User, Stethoscope, ArrowRight, Filter } from 'lucide-react';
import {
  Appointment,
  Bill,
  Doctor,
  EnrichedRecord,
  Patient,
  Treatment,
  maskAddress,
  maskEmail,
  maskInsurance,
  maskPhone,
} from '../../data/hospitalData';

export type DrillTarget =
  | { type: 'doctor'; data: Doctor }
  | { type: 'patient'; data: Patient }
  | { type: 'treatment_type'; name: string }
  | { type: 'branch'; name: string }
  | { type: 'record'; data: EnrichedRecord };

interface DrillThroughModalProps {
  target: DrillTarget | null;
  onClose: () => void;
  masterRecords: EnrichedRecord[];
  revealPii: boolean;
  onApplyFilter?: (type: string, value: string) => void;
}

export const DrillThroughModal: React.FC<DrillThroughModalProps> = ({
  target,
  onClose,
  masterRecords,
  revealPii,
  onApplyFilter,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'bills'>('overview');

  if (!target) return null;

  // Filter linked records based on target
  let linkedRecords: EnrichedRecord[] = [];
  let title = '';
  let subtitle = '';
  let typeLabel = '';

  if (target.type === 'doctor') {
    linkedRecords = masterRecords.filter((r) => r.doctor?.doctor_id === target.data.doctor_id);
    title = target.data.fullName;
    subtitle = `${target.data.specialization} · ${target.data.hospital_branch} · ${target.data.years_experience} years exp`;
    typeLabel = 'Doctor Detail Profile';
  } else if (target.type === 'patient') {
    linkedRecords = masterRecords.filter((r) => r.patient?.patient_id === target.data.patient_id);
    title = target.data.fullName;
    subtitle = `Patient ID: ${target.data.patient_id} · Age: ${target.data.age} (${target.data.ageBand}) · Gender: ${target.data.gender} · Insurer: ${target.data.insurance_provider}`;
    typeLabel = 'Patient Health Record & Billing History';
  } else if (target.type === 'treatment_type') {
    linkedRecords = masterRecords.filter((r) => r.treatment?.treatment_type === target.name);
    title = target.name;
    subtitle = `Clinical procedure breakdown and linked hospital billing`;
    typeLabel = 'Treatment Procedure Drill-down';
  } else if (target.type === 'branch') {
    linkedRecords = masterRecords.filter((r) => r.doctor?.hospital_branch === target.name);
    title = target.name;
    subtitle = `Branch-level operational workload and financial collections`;
    typeLabel = 'Branch Facility Drill-down';
  } else if (target.type === 'record') {
    linkedRecords = [target.data];
    title = `Case: ${target.data.appointment?.appointment_id || target.data.bill?.bill_id}`;
    subtitle = `${target.data.doctor?.fullName} with ${target.data.patient?.fullName}`;
    typeLabel = 'Individual Case Inspection';
  }

  // Aggregate metrics for this entity
  const totalBilled = linkedRecords.reduce((sum, r) => sum + (r.bill?.amount || 0), 0);
  const totalCollected = linkedRecords
    .filter((r) => r.bill?.isPaid)
    .reduce((sum, r) => sum + (r.bill?.amount || 0), 0);
  const totalOutstanding = totalBilled - totalCollected;
  const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#161918] border border-[#262B29] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#262B29] flex items-center justify-between gap-4 bg-[#1C201F]">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#2ECC71]">
              {typeLabel}
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight truncate">{title}</h2>
            <p className="text-xs text-[#8C9391] truncate">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onApplyFilter && target.type === 'doctor' && (
              <button
                onClick={() => {
                  onApplyFilter('doctorId', target.data.doctor_id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2ECC71]/15 text-[#2ECC71] text-xs font-semibold hover:bg-[#2ECC71]/25 transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Dashboard</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8C9391] hover:text-white hover:bg-[#262B29] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#0B0D0C] border-b border-[#262B29]">
          <div className="p-3 rounded-xl bg-[#161918] border border-[#262B29]">
            <span className="text-[10px] text-[#8C9391] uppercase">Total Billed</span>
            <div className="text-base font-bold text-white tabular-nums mt-0.5">
              ${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#161918] border border-[#262B29]">
            <span className="text-[10px] text-[#8C9391] uppercase">Total Collected</span>
            <div className="text-base font-bold text-[#2ECC71] tabular-nums mt-0.5">
              ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#161918] border border-[#262B29]">
            <span className="text-[10px] text-[#8C9391] uppercase">Outstanding</span>
            <div className="text-base font-bold text-[#FF5C5C] tabular-nums mt-0.5">
              ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#161918] border border-[#262B29]">
            <span className="text-[10px] text-[#8C9391] uppercase">Linked Visits</span>
            <div className="text-base font-bold text-[#CFF5DD] tabular-nums mt-0.5">
              {linkedRecords.length} records ({collectionRate.toFixed(1)}% coll.)
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#262B29] bg-[#161918]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#2ECC71] text-[#2ECC71]'
                : 'border-transparent text-[#8C9391] hover:text-white'
            }`}
          >
            History Ledger ({linkedRecords.length})
          </button>
          {target.type === 'patient' && (
            <button
              onClick={() => setActiveTab('appointments')}
              className={`pb-2.5 px-3 text-xs font-semibold transition-all border-b-2 ${
                activeTab === 'appointments'
                  ? 'border-[#2ECC71] text-[#2ECC71]'
                  : 'border-transparent text-[#8C9391] hover:text-white'
              }`}
            >
              Patient Profile & Masked PII
            </button>
          )}
        </div>

        {/* Modal Body / Table */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'overview' ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#262B29] text-[#8C9391] text-[10px] uppercase font-semibold">
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Appointment</th>
                    <th className="pb-2.5">Patient</th>
                    <th className="pb-2.5">Doctor</th>
                    <th className="pb-2.5">Treatment</th>
                    <th className="pb-2.5">Amount</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262B29]/60">
                  {linkedRecords.map((r, i) => {
                    const bill = r.bill;
                    const app = r.appointment;
                    const doc = r.doctor;
                    const pat = r.patient;
                    const treat = r.treatment;

                    return (
                      <tr key={i} className="hover:bg-[#1C201F]/60 transition-colors">
                        <td className="py-2.5 tabular-nums text-[#8C9391]">
                          {bill?.bill_date || app?.appointment_date}
                        </td>
                        <td className="py-2.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{app?.appointment_id}</span>
                            <span className="text-[10px] text-[#8C9391]">{app?.status}</span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{pat?.fullName}</span>
                            <span className="text-[10px] text-[#8C9391]">
                              {maskInsurance(pat?.insurance_number || '', revealPii)}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 text-[#C7CECB]">
                          {doc?.fullName}
                        </td>
                        <td className="py-2.5 text-[#C7CECB]">
                          {treat?.treatment_type}
                        </td>
                        <td className="py-2.5 font-bold tabular-nums text-white">
                          ${bill?.amount.toFixed(2)}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              bill?.isPaid
                                ? 'bg-[#2ECC71]/20 text-[#2ECC71]'
                                : bill?.isPending
                                ? 'bg-[#E5A93C]/20 text-[#E5A93C]'
                                : 'bg-[#FF5C5C]/20 text-[#FF5C5C]'
                            }`}
                          >
                            {bill?.payment_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : target.type === 'patient' ? (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#262B29] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase text-[#8C9391]">Full Name</span>
                  <div className="text-sm font-bold text-white mt-0.5">{target.data.fullName}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#8C9391]">Contact Number</span>
                  <div className="text-sm font-mono-num tabular-nums text-white mt-0.5">
                    {maskPhone(target.data.contact_number, revealPii)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#8C9391]">Email Address</span>
                  <div className="text-sm text-white mt-0.5">
                    {maskEmail(target.data.email, revealPii)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#8C9391]">Physical Address</span>
                  <div className="text-sm text-white mt-0.5">
                    {maskAddress(target.data.address, revealPii)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#8C9391]">Insurance Provider</span>
                  <div className="text-sm font-semibold text-[#2ECC71] mt-0.5">
                    {target.data.insurance_provider}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#8C9391]">Policy Number</span>
                  <div className="text-sm font-mono-num tabular-nums text-white mt-0.5">
                    {maskInsurance(target.data.insurance_number, revealPii)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
