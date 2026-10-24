import React, { useState } from 'react';
import { Search, X, User, Stethoscope, Calendar, Receipt, Activity, ChevronRight } from 'lucide-react';
import { Doctor, EnrichedRecord, Patient } from '../../data/hospitalData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  masterRecords: EnrichedRecord[];
  onSelectDoctor: (doc: Doctor) => void;
  onSelectPatient: (pat: Patient) => void;
  onSelectRecord: (rec: EnrichedRecord) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
  masterRecords,
  onSelectDoctor,
  onSelectPatient,
  onSelectRecord,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingDoctors = q
    ? doctors.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.hospital_branch.toLowerCase().includes(q) ||
          d.doctor_id.toLowerCase().includes(q)
      )
    : [];

  const matchingPatients = q
    ? patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.patient_id.toLowerCase().includes(q) ||
          p.insurance_provider.toLowerCase().includes(q)
      )
    : [];

  const matchingRecords = q
    ? masterRecords.filter(
        (r) =>
          r.bill?.bill_id.toLowerCase().includes(q) ||
          r.appointment?.appointment_id.toLowerCase().includes(q) ||
          r.treatment?.treatment_type.toLowerCase().includes(q) ||
          r.appointment?.reason_for_visit.toLowerCase().includes(q) ||
          r.bill?.payment_method.toLowerCase().includes(q)
      ).slice(0, 8)
    : [];

  const totalResults = matchingDoctors.length + matchingPatients.length + matchingRecords.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-start justify-center p-4 pt-16 z-50 animate-in fade-in duration-150">
      <div className="bg-[#161918] border border-[#262B29] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#262B29] flex items-center gap-3 bg-[#1C201F]">
          <Search className="w-5 h-5 text-[#2ECC71] shrink-0" />
          <input
            type="text"
            placeholder="Search doctors, patients, appointment IDs, bills, or treatments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-[#8C9391] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#8C9391] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C9391] hover:text-white hover:bg-[#262B29]"
          >
            Esc
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 flex flex-col gap-4">
          {!q ? (
            <div className="py-8 text-center text-xs text-[#8C9391] flex flex-col items-center gap-2">
              <Search className="w-8 h-8 text-[#262B29]" />
              <span>Type a patient name, doctor, bill ID (e.g., B005), or treatment...</span>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-xs text-[#8C9391]">
              No records found matching "{query}".
            </div>
          ) : (
            <>
              {/* Doctors Section */}
              {matchingDoctors.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8C9391] tracking-wider">
                    Doctors ({matchingDoctors.length})
                  </span>
                  {matchingDoctors.map((doc) => (
                    <div
                      key={doc.doctor_id}
                      onClick={() => {
                        onSelectDoctor(doc);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-[#1C201F] hover:bg-[#2ECC71]/10 border border-[#262B29] hover:border-[#2ECC71]/40 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Stethoscope className="w-4 h-4 text-[#2ECC71]" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white">{doc.fullName}</span>
                          <span className="text-[10px] text-[#8C9391]">
                            {doc.specialization} · {doc.hospital_branch}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8C9391]" />
                    </div>
                  ))}
                </div>
              )}

              {/* Patients Section */}
              {matchingPatients.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8C9391] tracking-wider">
                    Patients ({matchingPatients.length})
                  </span>
                  {matchingPatients.map((pat) => (
                    <div
                      key={pat.patient_id}
                      onClick={() => {
                        onSelectPatient(pat);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-[#1C201F] hover:bg-[#2ECC71]/10 border border-[#262B29] hover:border-[#2ECC71]/40 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-[#2ECC71]" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white">{pat.fullName}</span>
                          <span className="text-[10px] text-[#8C9391]">
                            {pat.patient_id} · {pat.insurance_provider} · Age {pat.age}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8C9391]" />
                    </div>
                  ))}
                </div>
              )}

              {/* Visits & Billing Records */}
              {matchingRecords.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8C9391] tracking-wider">
                    Appointments & Bills ({matchingRecords.length})
                  </span>
                  {matchingRecords.map((rec, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        onSelectRecord(rec);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-[#1C201F] hover:bg-[#2ECC71]/10 border border-[#262B29] hover:border-[#2ECC71]/40 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className="w-4 h-4 text-[#2ECC71]" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white">
                            {rec.bill?.bill_id} · {rec.treatment?.treatment_type}
                          </span>
                          <span className="text-[10px] text-[#8C9391]">
                            {rec.patient?.fullName} · {rec.doctor?.fullName} · {rec.bill?.bill_date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tabular-nums">
                          ${rec.bill?.amount.toFixed(0)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#8C9391]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
