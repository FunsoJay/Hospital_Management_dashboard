import React, { useState } from 'react';
import {
  Bell,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  Calendar,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { DashboardPage } from './Sidebar';
import { FilterState } from '../../data/analyticsEngine';

interface TopBarProps {
  currentPage: DashboardPage;
  filters: FilterState;
  onUpdateFilters: (partial: Partial<FilterState>) => void;
  onToggleFilterDrawer: () => void;
  activeFilterCount: number;
  revealPii: boolean;
  onTogglePii: () => void;
  onOpenSearch: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  onToggleMobileSidebar: () => void;
  onToggleRightRail: () => void;
  notificationCount?: number;
}

const PAGE_TITLES: Record<DashboardPage, string> = {
  overview: 'Overview',
  revenue: 'Revenue & Collections',
  appointments: 'Appointment Operations',
  doctors: 'Doctor Performance & Workload',
  patients: 'Patient Demographics & Retention',
  treatments: 'Treatment Analysis & Costs',
  billing: 'Billing & Collection Risk',
  forecast: 'Predictive Horizon & Forecasting',
  'data-quality': 'Data Quality & Reconciliation',
  definitions: 'KPI Definitions & Metrics Dictionary',
  help: 'How to Read This Dashboard',
};

export const TopBar: React.FC<TopBarProps> = ({
  currentPage,
  filters,
  onUpdateFilters,
  onToggleFilterDrawer,
  activeFilterCount,
  revealPii,
  onTogglePii,
  onOpenSearch,
  onRefreshData,
  isRefreshing,
  onToggleMobileSidebar,
  onToggleRightRail,
  notificationCount = 3,
}) => {
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  const periods: Array<{ id: FilterState['period']; label: string }> = [
    { id: 'all', label: 'Full Year 2023' },
    { id: '90d', label: 'Last 90 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '7d', label: 'Last 7 Days' },
  ];

  const currentPeriodLabel =
    periods.find((p) => p.id === filters.period)?.label || 'Full Year 2023';

  return (
    <header className="h-16 px-4 md:px-6 bg-[#161918] border-b border-[#262B29] flex items-center justify-between gap-4 shrink-0 z-20">
      {/* Left: Mobile hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-[#8C9391] hover:text-white hover:bg-[#1C201F]"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#8C9391]">Dashboard</span>
          <span className="text-[#8C9391]">/</span>
          <span className="text-white font-semibold tracking-tight">
            {PAGE_TITLES[currentPage]}
          </span>
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0D0C] border border-[#262B29] text-xs text-[#8C9391] hover:text-white hover:border-[#2ECC71]/40 transition-colors"
          title="Search all records (Press ⌘K or click)"
        >
          <Search className="w-3.5 h-3.5 text-[#2ECC71]" />
          <span>Search patients, doctors, bills...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-[#1C201F] border border-[#262B29] text-[10px] text-[#8C9391]">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="sm:hidden p-2 rounded-xl bg-[#0B0D0C] border border-[#262B29] text-[#8C9391] hover:text-white"
          title="Search"
        >
          <Search className="w-4 h-4 text-[#2ECC71]" />
        </button>

        {/* Period Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1C201F] border border-[#262B29] text-xs font-medium text-white hover:border-[#2ECC71]/40 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-[#2ECC71]" />
            <span className="hidden md:inline">{currentPeriodLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8C9391]" />
          </button>

          {periodDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-[#161918] border border-[#262B29] shadow-2xl py-1 z-50">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onUpdateFilters({ period: p.id });
                    setPeriodDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                    filters.period === p.id
                      ? 'bg-[#2ECC71]/15 text-[#2ECC71] font-semibold'
                      : 'text-[#C7CECB] hover:bg-[#1C201F] hover:text-white'
                  }`}
                >
                  <span>{p.label}</span>
                  {filters.period === p.id && <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PII Masking Toggle */}
        <button
          onClick={onTogglePii}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
            revealPii
              ? 'bg-[#FF5C5C]/15 border-[#FF5C5C]/40 text-[#FF5C5C]'
              : 'bg-[#1C201F] border-[#262B29] text-[#8C9391] hover:text-white'
          }`}
          title={revealPii ? 'Sensitive patient PII revealed' : 'Patient PII is masked for confidentiality'}
        >
          {revealPii ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[#2ECC71]" />}
          <span className="hidden lg:inline">{revealPii ? 'PII: Revealed' : 'PII: Masked'}</span>
        </button>

        {/* Global Filters Trigger */}
        <button
          onClick={onToggleFilterDrawer}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
            activeFilterCount > 0
              ? 'bg-[#2ECC71]/15 border-[#2ECC71]/50 text-[#2ECC71]'
              : 'bg-[#1C201F] border-[#262B29] text-[#C7CECB] hover:text-white'
          }`}
          title="Open global filter drawer"
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#2ECC71] text-black text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefreshData}
          className="p-2 rounded-xl bg-[#1C201F] border border-[#262B29] text-[#8C9391] hover:text-white hover:border-[#2ECC71]/40 transition-colors"
          title="Refresh analytics dataset"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2ECC71]' : ''}`} />
        </button>

        {/* Notification Bell (toggles right rail on smaller screens or rings) */}
        <button
          onClick={onToggleRightRail}
          className="relative p-2 rounded-xl bg-[#1C201F] border border-[#262B29] text-[#8C9391] hover:text-white hover:border-[#2ECC71]/40 transition-colors"
          title="View recent alerts and activity"
        >
          <Bell className="w-3.5 h-3.5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF5C5C] ring-2 ring-[#161918]" />
          )}
        </button>
      </div>
    </header>
  );
};
