import React, { useState } from 'react';
import { MonthlyTrendPoint } from '../../data/analyticsEngine';

interface AreaChartProps {
  data: MonthlyTrendPoint[];
  metricKey?: 'billed' | 'collected' | 'both';
  height?: number;
  onPointClick?: (point: MonthlyTrendPoint) => void;
  selectedMonth?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  metricKey = 'both',
  height = 220,
  onPointClick,
  selectedMonth,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-[#8C9391]">No data available</div>;
  }

  // Geometry
  const svgWidth = 600;
  const svgHeight = height;
  const padding = { top: 20, right: 25, bottom: 35, left: 45 };

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Max value calculation
  const maxBilled = Math.max(...data.map((d) => d.billed), 1000);
  const maxCollected = Math.max(...data.map((d) => d.collected), 1000);
  const maxY = Math.ceil(Math.max(maxBilled, maxCollected) / 10000) * 10000;

  // Coordinate scales
  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - (value / maxY) * chartHeight;

  // Build SVG path strings
  const billedPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.billed) }));
  const collectedPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.collected) }));

  const generateCurvedPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const billedLine = generateCurvedPath(billedPoints);
  const collectedLine = generateCurvedPath(collectedPoints);

  const bottomY = padding.top + chartHeight;
  const billedArea = `${billedLine} L ${billedPoints[billedPoints.length - 1].x} ${bottomY} L ${billedPoints[0].x} ${bottomY} Z`;
  const collectedArea = `${collectedLine} L ${collectedPoints[collectedPoints.length - 1].x} ${bottomY} L ${collectedPoints[0].x} ${bottomY} Z`;

  // Highlight data point: active hover, or latest month if none hovered
  const activeIndex = hoveredIndex !== null ? hoveredIndex : data.length - 1;
  const activePoint = data[activeIndex];
  const activeX = getX(activeIndex);
  const activeBilledY = getY(activePoint?.billed || 0);
  const activeCollectedY = getY(activePoint?.collected || 0);

  // Y-axis grid lines (4 tiers)
  const yTicks = [0, maxY * 0.33, maxY * 0.66, maxY];

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id="billedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2ECC71" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#2ECC71" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F7A43" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0F7A43" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
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

        {/* Shaded Areas */}
        {(metricKey === 'both' || metricKey === 'collected') && (
          <path d={collectedArea} fill="url(#collectedGradient)" />
        )}
        {(metricKey === 'both' || metricKey === 'billed') && (
          <path d={billedArea} fill="url(#billedGradient)" />
        )}

        {/* Collected Line */}
        {(metricKey === 'both' || metricKey === 'collected') && (
          <path d={collectedLine} fill="none" stroke="#0F7A43" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* Billed Line */}
        {(metricKey === 'both' || metricKey === 'billed') && (
          <path d={billedLine} fill="none" stroke="#2ECC71" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Vertical tracking line on active point */}
        <line
          x1={activeX}
          y1={padding.top}
          x2={activeX}
          y2={bottomY}
          stroke="#2ECC71"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Highlighted point circle for Billed */}
        {(metricKey === 'both' || metricKey === 'billed') && (
          <g className="cursor-pointer">
            <circle cx={activeX} cy={activeBilledY} r="8" fill="#2ECC71" fillOpacity="0.25" />
            <circle cx={activeX} cy={activeBilledY} r="4.5" fill="#2ECC71" stroke="#0B0D0C" strokeWidth="2" />
          </g>
        )}

        {/* Highlighted point circle for Collected */}
        {(metricKey === 'both' || metricKey === 'collected') && (
          <g className="cursor-pointer">
            <circle cx={activeX} cy={activeCollectedY} r="4" fill="#0F7A43" stroke="#0B0D0C" strokeWidth="1.5" />
          </g>
        )}

        {/* Invisible vertical hover slices for snappy touch/mouse interaction */}
        {data.map((d, i) => {
          const sliceWidth = chartWidth / data.length;
          const x = getX(i) - sliceWidth / 2;
          return (
            <rect
              key={i}
              x={x}
              y={padding.top}
              width={sliceWidth}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onClick={() => onPointClick && onPointClick(d)}
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={getX(i)}
            y={bottomY + 18}
            textAnchor="middle"
            className={`text-[10px] tabular-nums font-mono-num cursor-pointer transition-colors ${
              i === activeIndex || d.yearMonth === selectedMonth
                ? 'fill-[#2ECC71] font-semibold'
                : 'fill-[#8C9391]'
            }`}
            onClick={() => onPointClick && onPointClick(d)}
          >
            {d.monthName.split(' ')[0]}
          </text>
        ))}
      </svg>

      {/* Floating Tooltip Card */}
      {activePoint && (
        <div
          className="absolute z-10 pointer-events-none bg-[#161918] border border-[#262B29] rounded-xl px-3 py-2 shadow-xl backdrop-blur-md"
          style={{
            left: `${Math.min(Math.max(activeX, 90), svgWidth - 110) * (100 / svgWidth)}%`,
            top: '0px',
            transform: 'translate(-50%, -10%)',
          }}
        >
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-[#262B29]">
            <span className="text-[11px] font-semibold text-white">{activePoint.monthName}</span>
            <span className="text-[10px] text-[#8C9391] tabular-nums font-mono-num">
              {activePoint.appointments} visits
            </span>
          </div>
          <div className="flex flex-col gap-1 mt-1 text-[11px]">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[#C7CECB]">
                <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
                Billed:
              </span>
              <span className="font-bold text-white tabular-nums">
                ${activePoint.billed.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[#8C9391]">
                <span className="w-2 h-2 rounded-full bg-[#0F7A43]" />
                Collected:
              </span>
              <span className="font-semibold text-[#2ECC71] tabular-nums">
                ${activePoint.collected.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
