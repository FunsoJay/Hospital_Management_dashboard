import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Filter,
  X,
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  Doctor,
  EnrichedRecord,
  loadAndProcessHospitalData,
  Patient,
} from './data/hospitalData';
import {
  computeMetricChanges,
  computeMonthlyTrends,
  computeSummaryMetrics,
  DEFAULT_FILTERS,
  filterHospitalData,
  FilterState,
  generateAutoInsights,
} from './data/analyticsEngine';
import { DashboardPage, Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { RightRail } from './components/layout/RightRail';
import { GlobalFilters } from './components/layout/GlobalFilters';
import { OverviewPage } from './pages/OverviewPage';
import { RevenuePage } from './pages/RevenuePage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { PatientsPage } from './pages/PatientsPage';
import { TreatmentsPage } from './pages/TreatmentsPage';
import { BillingPage } from './pages/BillingPage';
import { ForecastPage } from './pages/ForecastPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { DefinitionsPage } from './pages/DefinitionsPage';
import { DrillTarget, DrillThroughModal } from './components/modals/DrillThroughModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { HelpModal } from './components/modals/HelpModal';
import { AIAssistantModal } from './components/assistant/AIAssistantModal';

export default function App() {
  // Load and index master dataset
  const dataset = useMemo(() => loadAndProcessHospitalData(), []);

  // UI & Navigation State
  const [currentPage, setCurrentPage] = useState<DashboardPage>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightRailOpen, setRightRailOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [revealPii, setRevealPii] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [drillTarget, setDrillTarget] = useState<DrillTarget | null>(null);

  // Filters state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Keyboard shortcut for global search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply filtering
  const { filteredRecords, previousPeriodRecords } = useMemo(
    () => filterHospitalData(dataset.masterRecords, filters),
    [dataset.masterRecords, filters]
  );

  // Summary Metrics
  const currentSummary = useMemo(
    () => computeSummaryMetrics(filteredRecords),
    [filteredRecords]
  );
  const previousSummary = useMemo(
    () => computeSummaryMetrics(previousPeriodRecords),
    [previousPeriodRecords]
  );
  const changes = useMemo(
    () => computeMetricChanges(currentSummary, previousSummary),
    [currentSummary, previousSummary]
  );

  // Monthly Trends
  const monthlyTrends = useMemo(
    () => computeMonthlyTrends(filteredRecords),
    [filteredRecords]
  );

  // Auto-Generated Insights & Recommendations
  const { insights, recommendations } = useMemo(
    () => generateAutoInsights(filteredRecords, currentSummary),
    [filteredRecords, currentSummary]
  );

  // Count active filters (excluding default period 'all')
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: keyof FilterState; label: string; value: any }> = [];
    if (filters.branch) chips.push({ key: 'branch', label: 'Branch', value: filters.branch });
    if (filters.specialization) chips.push({ key: 'specialization', label: 'Specialization', value: filters.specialization });
    if (filters.doctorId) {
      const doc = dataset.doctorsMap.get(filters.doctorId);
      chips.push({ key: 'doctorId', label: 'Doctor', value: doc?.fullName || filters.doctorId });
    }
    if (filters.treatmentType) chips.push({ key: 'treatmentType', label: 'Treatment', value: filters.treatmentType });
    if (filters.appointmentStatus) chips.push({ key: 'appointmentStatus', label: 'Appt Status', value: filters.appointmentStatus });
    if (filters.paymentMethod) chips.push({ key: 'paymentMethod', label: 'Payment Method', value: filters.paymentMethod });
    if (filters.paymentStatus) chips.push({ key: 'paymentStatus', label: 'Payment Status', value: filters.paymentStatus });
    if (filters.insuranceProvider) chips.push({ key: 'insuranceProvider', label: 'Insurer', value: filters.insuranceProvider });
    if (filters.gender) chips.push({ key: 'gender', label: 'Gender', value: filters.gender === 'M' ? 'Male' : 'Female' });
    if (filters.ageBand) chips.push({ key: 'ageBand', label: 'Age', value: filters.ageBand });
    if (filters.period !== 'all') chips.push({ key: 'period', label: 'Period', value: filters.period });
    return chips;
  }, [filters, dataset.doctorsMap]);

  const activeFilterCount = activeFilterChips.length;

  const handleUpdateFilters = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleRemoveFilter = (key: keyof FilterState) => {
    if (key === 'period') {
      setFilters((prev) => ({ ...prev, period: 'all' }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleSelectPage = (page: DashboardPage) => {
    if (page === 'help') {
      setHelpModalOpen(true);
    } else {
      setCurrentPage(page);
    }
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1FA463] to-[#0E5B36] p-2 sm:p-4 md:p-6 flex flex-col items-center justify-center">
      {/* Main Glass/Dark Frame */}
      <div className="w-full max-w-[1720px] bg-[#0B0D0C] rounded-[24px] overflow-hidden shadow-2xl border border-[#262B29] flex flex-col min-h-[92vh] relative">
        <div className="flex-1 flex flex-row overflow-hidden relative">
          {/* Left Sidebar */}
          <div className={`${mobileSidebarOpen ? 'block' : 'hidden md:block'} z-30`}>
            <Sidebar
              currentPage={currentPage}
              onSelectPage={handleSelectPage}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Main Viewport Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0B0D0C]">
            {/* Top Bar */}
            <TopBar
              currentPage={currentPage}
              filters={filters}
              onUpdateFilters={handleUpdateFilters}
              onToggleFilterDrawer={() => setFilterDrawerOpen(!filterDrawerOpen)}
              activeFilterCount={activeFilterCount}
              revealPii={revealPii}
              onTogglePii={() => setRevealPii(!revealPii)}
              onOpenSearch={() => setSearchModalOpen(true)}
              onRefreshData={handleRefresh}
              isRefreshing={isRefreshing}
              onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              onToggleRightRail={() => setRightRailOpen(!rightRailOpen)}
              notificationCount={dataset.qualityReport.issues.length}
            />

            {/* Collapsible Global Filters Drawer */}
            <GlobalFilters
              filters={filters}
              onUpdateFilters={handleUpdateFilters}
              doctors={dataset.doctors}
              isOpen={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
              activeFilterCount={activeFilterCount}
            />

            {/* Removable Active Filter Chips Bar */}
            {activeFilterCount > 0 && (
              <div className="bg-[#121514] border-b border-[#262B29] px-4 md:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto shrink-0 text-xs">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] uppercase font-bold text-[#8C9391] shrink-0">
                    Active Filters:
                  </span>
                  {activeFilterChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C201F] border border-[#262B29] text-[11px] text-[#C7CECB] shrink-0"
                    >
                      <span>
                        <strong className="text-white font-medium">{chip.label}:</strong> {chip.value}
                      </span>
                      <button
                        onClick={() => handleRemoveFilter(chip.key)}
                        className="hover:text-[#FF5C5C] text-[#8C9391] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-[11px] text-[#8C9391] hover:text-[#FF5C5C] flex items-center gap-1 shrink-0 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>
            )}

            {/* Scrollable Page Viewport */}
            <main className="flex-1 overflow-y-auto">
              {currentPage === 'overview' && (
                <OverviewPage
                  summary={currentSummary}
                  changes={changes}
                  monthlyTrends={monthlyTrends}
                  records={filteredRecords}
                  doctors={dataset.doctors}
                  patients={dataset.patients}
                  insights={insights}
                  recommendations={recommendations}
                  revealPii={revealPii}
                  onSelectDoctor={(doc) => setDrillTarget({ type: 'doctor', data: doc })}
                  onSelectPatient={(pat) => setDrillTarget({ type: 'patient', data: pat })}
                  onSelectRecord={(rec) => setDrillTarget({ type: 'record', data: rec })}
                  onFilterByStatus={(status) => handleUpdateFilters({ paymentStatus: status })}
                />
              )}

              {currentPage === 'revenue' && (
                <RevenuePage
                  summary={currentSummary}
                  monthlyTrends={monthlyTrends}
                  records={filteredRecords}
                  onSelectRecord={(rec) => setDrillTarget({ type: 'record', data: rec })}
                />
              )}

              {currentPage === 'appointments' && (
                <AppointmentsPage
                  summary={currentSummary}
                  appointments={dataset.appointments}
                  monthlyTrends={monthlyTrends}
                  records={filteredRecords}
                  doctors={dataset.doctors}
                  onSelectRecord={(rec) => setDrillTarget({ type: 'record', data: rec })}
                />
              )}

              {currentPage === 'doctors' && (
                <DoctorsPage
                  doctors={dataset.doctors}
                  records={filteredRecords}
                  onSelectDoctor={(doc) => setDrillTarget({ type: 'doctor', data: doc })}
                />
              )}

              {currentPage === 'patients' && (
                <PatientsPage
                  patients={dataset.patients}
                  records={filteredRecords}
                  summary={currentSummary}
                  revealPii={revealPii}
                  onTogglePii={() => setRevealPii(!revealPii)}
                  onSelectPatient={(pat) => setDrillTarget({ type: 'patient', data: pat })}
                />
              )}

              {currentPage === 'treatments' && (
                <TreatmentsPage
                  treatments={dataset.treatments}
                  records={filteredRecords}
                  summary={currentSummary}
                  onSelectRecord={(rec) => setDrillTarget({ type: 'record', data: rec })}
                />
              )}

              {currentPage === 'billing' && (
                <BillingPage
                  bills={dataset.billing}
                  records={filteredRecords}
                  summary={currentSummary}
                  revealPii={revealPii}
                  onSelectRecord={(rec) => setDrillTarget({ type: 'record', data: rec })}
                />
              )}

              {currentPage === 'forecast' && (
                <ForecastPage monthlyTrends={monthlyTrends} />
              )}

              {currentPage === 'data-quality' && (
                <DataQualityPage report={dataset.qualityReport} />
              )}

              {currentPage === 'definitions' && <DefinitionsPage />}
            </main>
          </div>

          {/* Right Rail Panel */}
          <RightRail
            doctors={dataset.doctors}
            recentRecords={dataset.masterRecords}
            summary={currentSummary}
            isOpen={rightRailOpen}
            onClose={() => setRightRailOpen(false)}
            onSelectDoctor={(doc) => setDrillTarget({ type: 'doctor', data: doc })}
            onSelectRecord={(rec) => setDrillTarget({ type: 'record', data: rec })}
          />
        </div>

        {/* Floating AI Analytics Assistant Trigger Pill Button */}
        {!aiAssistantOpen && (
          <button
            onClick={() => setAiAssistantOpen(true)}
            className="fixed bottom-6 right-6 z-40 active-pill-gradient font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#7ED321]/50"
            title="Open AI Analytics Assistant"
          >
            <Sparkles className="w-4 h-4 fill-black stroke-black" />
            <span className="text-xs text-black font-extrabold tracking-tight">
              AI Analytics Assistant
            </span>
          </button>
        )}

        {/* Embedded Floating AI Assistant Chat Window */}
        <AIAssistantModal
          isOpen={aiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
          summary={currentSummary}
          records={filteredRecords}
        />

        {/* Drill Through Modal */}
        <DrillThroughModal
          target={drillTarget}
          onClose={() => setDrillTarget(null)}
          masterRecords={dataset.masterRecords}
          revealPii={revealPii}
          onApplyFilter={(type, val) => handleUpdateFilters({ [type]: val })}
        />

        {/* Global Search Modal */}
        <GlobalSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          patients={dataset.patients}
          doctors={dataset.doctors}
          masterRecords={dataset.masterRecords}
          onSelectDoctor={(doc) => setDrillTarget({ type: 'doctor', data: doc })}
          onSelectPatient={(pat) => setDrillTarget({ type: 'patient', data: pat })}
          onSelectRecord={(rec) => setDrillTarget({ type: 'record', data: rec })}
        />

        {/* Help Modal */}
        <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      </div>
    </div>
  );
}
