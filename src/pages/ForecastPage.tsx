import React, { useState } from 'react';
import {
  LineChart,
  Sparkles,
  TrendingUp,
  Cpu,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BookOpen,
} from 'lucide-react';
import { ForecastChart } from '../components/charts/ForecastChart';
import { generateForecast, MonthlyTrendPoint } from '../data/analyticsEngine';

interface ForecastPageProps {
  monthlyTrends: MonthlyTrendPoint[];
}

export const ForecastPage: React.FC<ForecastPageProps> = ({ monthlyTrends }) => {
  const [metric, setMetric] = useState<'revenue' | 'collections' | 'appointments' | 'cancellations'>('revenue');
  const [modelType, setModelType] = useState<'holt_winters' | 'linear' | 'moving_avg'>('holt_winters');

  const modelResult = generateForecast({
    monthlyTrends,
    metric,
    modelType,
    horizonMonths: 6,
  });

  const { methodology, forecastPoints } = modelResult;

  const totalForecastValue = forecastPoints.reduce(
    (sum, p) => sum + (p.forecastValue || 0),
    0
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* Forecast Controls Bar */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7ED321]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Predictive Analytics Horizon (H1 2024 Projections)
            </h3>
          </div>
          <span className="text-xs text-[#8C9391]">
            Calibrated on 12-month 2023 hospital operating ledger with backtest validation
          </span>
        </div>

        {/* Metric and Model Switchers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Target Metric */}
          <div className="flex items-center gap-1 bg-[#0B0D0C] p-1 rounded-xl border border-[#262B29]">
            {[
              { id: 'revenue', label: 'Billed Revenue' },
              { id: 'collections', label: 'Collections' },
              { id: 'appointments', label: 'Appointments' },
              { id: 'cancellations', label: 'Cancellation Rate' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  metric === m.id ? 'active-pill-gradient text-black' : 'text-[#8C9391] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Model Algorithm */}
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value as any)}
            className="bg-[#0B0D0C] border border-[#262B29] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="holt_winters">Holt-Winters Exp Smoothing</option>
            <option value="linear">Linear Regression (OLS)</option>
            <option value="moving_avg">3-Mo Moving Average</option>
          </select>
        </div>
      </div>

      {/* Main Chart Card with Confidence Bands */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262B29]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {metric === 'revenue'
                ? 'Billed Revenue Projection'
                : metric === 'collections'
                ? 'Cash Collection Projection'
                : metric === 'appointments'
                ? 'Appointment Volume Projection'
                : 'Cancellation Rate Projection'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#7ED321]/20 text-[#7ED321] text-[10px] font-bold">
              6-Month Forward Horizon
            </span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#2ECC71]">
              <span className="w-3 h-0.5 bg-[#2ECC71]" />
              Historical Actual
            </span>
            <span className="flex items-center gap-1.5 text-[#7ED321]">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-[#7ED321]" />
              Projected Model
            </span>
            <span className="flex items-center gap-1.5 text-[#8C9391]">
              <span className="w-2.5 h-2.5 rounded bg-[#2ECC71]/20 border border-[#2ECC71]/40" />
              95% Confidence Band
            </span>
          </div>
        </div>

        <ForecastChart modelResult={modelResult} height={300} />
      </div>

      {/* 6-Month Projection Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {forecastPoints.map((fp) => (
          <div
            key={fp.period}
            className="p-3.5 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex flex-col justify-between"
          >
            <span className="text-[11px] font-bold text-white">{fp.label}</span>
            <div className="my-1.5">
              <span className="text-lg font-extrabold text-[#7ED321] tabular-nums">
                {metric === 'cancellations'
                  ? `${fp.forecastValue?.toFixed(1)}%`
                  : metric === 'appointments'
                  ? `${fp.forecastValue} visits`
                  : `$${fp.forecastValue?.toLocaleString()}`}
              </span>
            </div>
            <span className="text-[10px] text-[#8C9391] tabular-nums">
              80% CI: ${fp.lower80?.toLocaleString()} – ${fp.upper80?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* COMPREHENSIVE METHODOLOGY & AUDIT PANEL (Mandated by Section 7) */}
      <div className="p-5 rounded-2xl bg-[#161918] border border-[#262B29] shadow-lg flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#262B29]">
          <Cpu className="w-4 h-4 text-[#2ECC71]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Forecast Methodology, Accuracy Validation & Mathematical Assumptions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-[#C7CECB]">
          {/* Method Specs */}
          <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase text-[#8C9391]">Algorithm & Formula</span>
            <div className="text-sm font-bold text-white">{methodology.name}</div>
            <code className="text-[11px] font-mono-num bg-[#161918] p-2 rounded text-[#CFF5DD] break-all border border-[#262B29]">
              {methodology.formula}
            </code>
            <p className="text-[11px] text-[#8C9391] mt-1">{methodology.description}</p>
          </div>

          {/* Accuracy Metrics */}
          <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-[#8C9391]">
              Backtest Accuracy Metrics (Q4 2023 Validation)
            </span>
            <div className="flex flex-col gap-2 my-2">
              <div className="flex items-center justify-between text-xs">
                <span>Mean Absolute % Error (MAPE):</span>
                <span className="font-extrabold text-[#2ECC71] tabular-nums">
                  {methodology.mape}% (Low Variance)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Root Mean Squared Error (RMSE):</span>
                <span className="font-bold text-white tabular-nums">${methodology.rmse}</span>
              </div>
              {methodology.rSquared !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <span>Coefficient of Determination (R²):</span>
                  <span className="font-bold text-[#CFF5DD] tabular-nums">
                    {methodology.rSquared}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-[#8C9391]">
              Trained on: {methodology.trainingWindow}
            </span>
          </div>

          {/* Assumptions & Limitations */}
          <div className="p-4 rounded-xl bg-[#0B0D0C] border border-[#262B29] flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase text-[#8C9391]">
              Operational Assumptions & Limitations
            </span>
            <div className="flex flex-col gap-1.5 text-[11px]">
              {methodology.assumptions.map((ass, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[#C7CECB]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71] shrink-0 mt-0.5" />
                  <span>{ass}</span>
                </div>
              ))}
              {methodology.limitations.map((lim, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[#FF5C5C]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF5C5C] shrink-0 mt-0.5" />
                  <span>{lim}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
