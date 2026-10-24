import React, { useState } from 'react';
import { ForecastModelResult, ForecastPoint } from '../../data/analyticsEngine';

interface ForecastChartProps {
  modelResult: ForecastModelResult;
  height?: number;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ modelResult, height = 280 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { allPoints, historicalPoints, forecastPoints, methodology } = modelResult;

  const svgWidth = 680;
  const svgHeight = height;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Max value including 95% confidence bands
  const maxVal = Math.max(
    ...allPoints.map((p) => p.upper95 || p.forecastValue || p.historicalValue || 0),
    1000
  );
  const maxY = Math.ceil(maxVal / 10000) * 10000 || 50000;

  const getX = (index: number) => padding.left + (index / (allPoints.length - 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - (value / maxY) * chartHeight;

  // Find index where forecast starts
  const forecastStartIndex = historicalPoints.length - 1;

  // Build points for historical solid line
  const histPoints = allPoints.slice(0, forecastStartIndex + 1).map((p, i) => ({
    x: getX(i),
    y: getY(p.historicalValue || 0),
  }));

  // Build points for forecast dashed line
  const forePoints = allPoints.slice(forecastStartIndex).map((p, i) => ({
    x: getX(forecastStartIndex + i),
    y: getY(p.forecastValue || p.historicalValue || 0),
  }));

  const generateLinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    return pts.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');
  };

  // Build 95% Confidence Band polygon (top forward, bottom backward)
  const foreSlice = allPoints.slice(forecastStartIndex);
  const upper95Pts = foreSlice.map((p, i) => ({
    x: getX(forecastStartIndex + i),
    y: getY(p.upper95 || p.forecastValue || 0),
  }));
  const lower95Pts = foreSlice.map((p, i) => ({
    x: getX(forecastStartIndex + i),
    y: getY(p.lower95 || p.forecastValue || 0),
  })).reverse();

  const band95Path =
    upper95Pts.length > 0
      ? `M ${upper95Pts[0].x} ${upper95Pts[0].y} ` +
        upper95Pts.map((p) => `L ${p.x} ${p.y}`).join(' ') +
        lower95Pts.map((p) => ` L ${p.x} ${p.y}`).join(' ') +
        ' Z'
      : '';

  // Active hover point
  const activeIndex = hoveredIndex !== null ? hoveredIndex : allPoints.length - 1;
  const activePoint: ForecastPoint = allPoints[activeIndex];
  const activeX = getX(activeIndex);
  const activeY = getY(
    activePoint?.isForecast
      ? activePoint?.forecastValue || 0
      : activePoint?.historicalValue || 0
  );

  const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2ECC71" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2ECC71" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Y Grid lines */}
        {yTicks.map((val, idx) => (
          <g key={idx}>
            <line
              x1={padding.left}
              y1={getY(val)}
              x2={padding.left + chartWidth}
              y2={getY(val)}
              stroke="#222826"
              strokeDasharray={idx === 0 ? 'none' : '3 3'}
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={getY(val) + 3}
              textAnchor="end"
              className="text-[10px] fill-[#8C9391] tabular-nums font-mono-num"
            >
              ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
            </text>
          </g>
        ))}

        {/* Vertical divider indicating forecast boundary */}
        <line
          x1={getX(forecastStartIndex)}
          y1={padding.top}
          x2={getX(forecastStartIndex)}
          y2={padding.top + chartHeight}
          stroke="#7ED321"
          strokeOpacity="0.3"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
        <text
          x={getX(forecastStartIndex) + 6}
          y={padding.top + 12}
          className="text-[9px] fill-[#7ED321] font-semibold tracking-wider uppercase font-mono-num"
        >
          Forecast Horizon
        </text>

        {/* 95% Confidence Band Polygon */}
        {band95Path && <path d={band95Path} fill="url(#bandGradient)" />}

        {/* Historical Line (Solid Green) */}
        <path
          d={generateLinePath(histPoints)}
          fill="none"
          stroke="#2ECC71"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Forecast Line (Dashed Lime) */}
        <path
          d={generateLinePath(forePoints)}
          fill="none"
          stroke="#7ED321"
          strokeWidth="2.5"
          strokeDasharray="5 5"
          strokeLinecap="round"
        />

        {/* Tracking vertical rule */}
        <line
          x1={activeX}
          y1={padding.top}
          x2={activeX}
          y2={padding.top + chartHeight}
          stroke="#CFF5DD"
          strokeOpacity="0.3"
          strokeWidth="1"
        />

        {/* Active Point Circle */}
        <circle cx={activeX} cy={activeY} r="7" fill="#2ECC71" fillOpacity="0.25" />
        <circle
          cx={activeX}
          cy={activeY}
          r="4.5"
          fill={activePoint?.isForecast ? '#7ED321' : '#2ECC71'}
          stroke="#0B0D0C"
          strokeWidth="2"
        />

        {/* Hover detection rects */}
        {allPoints.map((p, i) => {
          const sliceWidth = chartWidth / (allPoints.length - 1);
          return (
            <rect
              key={i}
              x={getX(i) - sliceWidth / 2}
              y={padding.top}
              width={sliceWidth}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
            />
          );
        })}

        {/* X-axis labels */}
        {allPoints.map((p, i) => (
          <text
            key={i}
            x={getX(i)}
            y={padding.top + chartHeight + 18}
            textAnchor="middle"
            className={`text-[10px] tabular-nums font-mono-num ${
              i === activeIndex
                ? 'fill-white font-bold'
                : p.isForecast
                ? 'fill-[#7ED321]'
                : 'fill-[#8C9391]'
            }`}
          >
            {p.label.split(' ')[0]}
          </text>
        ))}
      </svg>

      {/* Floating Hover Tooltip */}
      {activePoint && (
        <div
          className="absolute z-10 pointer-events-none bg-[#161918] border border-[#262B29] rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md"
          style={{
            left: `${Math.min(Math.max(activeX, 95), svgWidth - 115) * (100 / svgWidth)}%`,
            top: '0px',
            transform: 'translate(-50%, -10%)',
          }}
        >
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-[#262B29]">
            <span className="text-[11px] font-semibold text-white">{activePoint.label}</span>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                activePoint.isForecast ? 'bg-[#7ED321]/20 text-[#7ED321]' : 'bg-[#2ECC71]/20 text-[#2ECC71]'
              }`}
            >
              {activePoint.isForecast ? 'Forecast' : 'Historical'}
            </span>
          </div>
          <div className="flex flex-col gap-1 mt-1 text-[11px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#8C9391]">
                {activePoint.isForecast ? 'Projected Revenue:' : 'Actual Billed:'}
              </span>
              <span className="font-bold text-white tabular-nums">
                $
                {(activePoint.isForecast
                  ? activePoint.forecastValue
                  : activePoint.historicalValue
                )?.toLocaleString('en-US')}
              </span>
            </div>
            {activePoint.isForecast && (
              <>
                <div className="flex items-center justify-between gap-4 text-[10px]">
                  <span className="text-[#8C9391]">80% Conf. Interval:</span>
                  <span className="text-[#CFF5DD] tabular-nums">
                    ${activePoint.lower80?.toLocaleString()} – ${activePoint.upper80?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[10px]">
                  <span className="text-[#8C9391]">95% Conf. Interval:</span>
                  <span className="text-[#8C9391] tabular-nums">
                    ${activePoint.lower95?.toLocaleString()} – ${activePoint.upper95?.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
