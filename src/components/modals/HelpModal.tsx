import React from 'react';
import { X, HelpCircle, Shield, TrendingUp, AlertTriangle, Layers, Zap } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#161918] border border-[#262B29] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-[#262B29] flex items-center justify-between bg-[#1C201F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2ECC71]/20 flex items-center justify-center text-[#2ECC71]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                How to Read This Dashboard
              </h3>
              <p className="text-[11px] text-[#8C9391]">
                Executive navigation guide, operational definitions, and analytic controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8C9391] hover:text-white hover:bg-[#262B29]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#C7CECB] leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex items-start gap-3">
            <Zap className="w-4 h-4 text-[#2ECC71] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">Interactive Cross-Filtering & Drill-Through</h4>
              <p className="text-[#8C9391]">
                Clicking any chart element (such as a donut segment for "Failed" payments or a month on the area chart) instantly filters the rest of the dashboard. Click on any doctor, patient, or procedure row to open the complete relational history modal.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex items-start gap-3">
            <TrendingUp className="w-4 h-4 text-[#7ED321] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">Financial Terms: Billed vs Collected vs Outstanding</h4>
              <p className="text-[#8C9391]">
                In this hospital group, <strong className="text-white">Revenue</strong> denotes total billed amounts from procedures. <strong className="text-white">Collected</strong> indicates bills marked with payment_status = Paid. <strong className="text-white">Outstanding</strong> aggregates Pending claims awaiting insurance clearance and Failed credit card or counter payments.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex items-start gap-3">
            <Shield className="w-4 h-4 text-[#2ECC71] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">HIPAA Patient Privacy & PII Masking</h4>
              <p className="text-[#8C9391]">
                By default, sensitive patient contact numbers, emails, addresses, and insurance policy IDs are masked (e.g. ***-***-5183). Authorized administrators can use the <strong className="text-white">PII: Masked/Revealed</strong> toggle in the top bar to audit exact patient contact details.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#FF5C5C] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">Clinical Boundary Note</h4>
              <p className="text-[#8C9391]">
                This dashboard analyzes hospital administrative, operational, and billing records. The dataset does not include inpatient bed days, discharge summaries, physician salaries, clinical pharmacology, or margins. No clinical prognoses or medical treatments should be inferred.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#1C201F] border-t border-[#262B29] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl active-pill-gradient text-xs font-bold text-black hover:opacity-95 transition-opacity"
          >
            Got it, continue
          </button>
        </div>
      </div>
    </div>
  );
};
