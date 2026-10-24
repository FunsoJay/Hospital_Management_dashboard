import React, { useState } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  Calendar,
  UserCheck,
  Users,
  Activity,
  Receipt,
  LineChart,
  ShieldAlert,
  BookOpen,
  HelpCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';

export type DashboardPage =
  | 'overview'
  | 'revenue'
  | 'appointments'
  | 'doctors'
  | 'patients'
  | 'treatments'
  | 'billing'
  | 'forecast'
  | 'data-quality'
  | 'definitions'
  | 'help';

interface SidebarProps {
  currentPage: DashboardPage;
  onSelectPage: (page: DashboardPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  collapsed,
  onToggleCollapse,
}) => {
  const [navSearch, setNavSearch] = useState('');

  const dashboardItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'treatments', label: 'Treatments', icon: Activity },
    { id: 'billing', label: 'Billing & Risk', icon: Receipt },
    { id: 'forecast', label: 'Forecast', icon: LineChart },
  ];

  const settingsItems = [
    { id: 'data-quality', label: 'Data Quality', icon: ShieldAlert, badge: 'Audit' },
    { id: 'definitions', label: 'Definitions & KPIs', icon: BookOpen },
    { id: 'help', label: 'Help & Guide', icon: HelpCircle },
  ];

  const filteredDashboard = dashboardItems.filter((item) =>
    item.label.toLowerCase().includes(navSearch.toLowerCase())
  );
  const filteredSettings = settingsItems.filter((item) =>
    item.label.toLowerCase().includes(navSearch.toLowerCase())
  );

  return (
    <aside
      className={`relative flex flex-col justify-between bg-[#161918] border-r border-[#262B29] transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="p-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2ECC71] to-[#0E5B36] flex items-center justify-center shrink-0 shadow-lg shadow-[#2ECC71]/20">
              <Activity className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white tracking-tight truncate">
                  AegisHealth
                </span>
                <span className="text-[10px] text-[#8C9391] font-medium tracking-wide uppercase truncate">
                  Hospital Analytics
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-[#8C9391] hover:text-white hover:bg-[#1C201F] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card */}
        <div
          className={`flex items-center gap-3 p-2.5 rounded-xl bg-[#1C201F] border border-[#262B29] ${
            collapsed ? 'justify-center p-2' : ''
          }`}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-[#2ECC71]/20 border border-[#2ECC71]/40 flex items-center justify-center text-xs font-bold text-[#2ECC71]">
              AC
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#2ECC71] border-2 border-[#161918]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">Dr. Alexander Cole</span>
              <span className="text-[10px] text-[#8C9391] truncate">Medical Director</span>
            </div>
          )}
        </div>

        {/* Search input */}
        {!collapsed && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9391]" />
            <input
              type="text"
              placeholder="Search views..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-[#0B0D0C] border border-[#262B29] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8C9391] focus:outline-none focus:border-[#2ECC71]/60 transition-colors"
            />
          </div>
        )}

        {/* Navigation list */}
        <div className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
          {/* Dashboard Group */}
          <div className="flex flex-col gap-1">
            {!collapsed && (
              <span className="text-[10px] font-semibold text-[#8C9391] uppercase tracking-wider px-3 mb-1">
                Dashboard
              </span>
            )}
            {filteredDashboard.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectPage(item.id as DashboardPage)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'active-pill-gradient shadow-lg shadow-[#2ECC71]/20 font-bold'
                      : 'text-[#C7CECB] hover:text-white hover:bg-[#1C201F]'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black stroke-[2.3]' : 'text-[#8C9391]'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Settings Group */}
          <div className="flex flex-col gap-1">
            {!collapsed && (
              <span className="text-[10px] font-semibold text-[#8C9391] uppercase tracking-wider px-3 mb-1">
                Governance & Help
              </span>
            )}
            {filteredSettings.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectPage(item.id as DashboardPage)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'active-pill-gradient shadow-lg shadow-[#2ECC71]/20 font-bold'
                      : 'text-[#C7CECB] hover:text-white hover:bg-[#1C201F]'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black stroke-[2.3]' : 'text-[#8C9391]'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#2ECC71]/20 text-[#2ECC71] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Network Badge */}
      {!collapsed && (
        <div className="p-4 border-t border-[#262B29] text-[11px] text-[#8C9391] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>Hospital Network:</span>
            <span className="text-white font-medium">3 Branches</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#2ECC71]">
            <span>System Status:</span>
            <span>All systems nominal</span>
          </div>
        </div>
      )}
    </aside>
  );
};
