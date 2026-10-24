import React, { useState } from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  key: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  totalLabel?: string;
  centerSubtext?: string;
  height?: number;
  onSegmentClick?: (segment: DonutSegment) => void;
  selectedKey?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  totalLabel,
  centerSubtext = 'Total',
  height = 240,
  onSegmentClick,
  selectedKey,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // SVG Geometry
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = -90; // Start at top

  const segments = data.map((item, index) => {
    const fraction = total > 0 ? item.value / total : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = 0;
    const currentAngle = cumulativeAngle;
    cumulativeAngle += fraction * 360;

    const isHovered = hoveredIndex === index;
    const isSelected = selectedKey === item.key;

    return {
      ...item,
      percentage: Math.round(fraction * 100),
      strokeDasharray,
      strokeDashoffset,
      angle: currentAngle,
      isHovered,
      isSelected,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
      {/* SVG Ring */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#1C211F"
            strokeWidth={strokeWidth}
          />

          {/* Data segments */}
          {segments.map((seg, i) => (
            <circle
              key={seg.key || i}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={seg.isHovered || seg.isSelected ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(${seg.angle} ${center} ${center})`}
              className="cursor-pointer transition-all duration-200"
              style={{
                filter: seg.isHovered || seg.isSelected ? `drop-shadow(0 0 8px ${seg.color})` : 'none',
                opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.6 : 1,
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSegmentClick && onSegmentClick(seg)}
            />
          ))}
        </svg>

        {/* Center Total / Hover detail */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[11px] uppercase tracking-wider text-[#8C9391] font-medium">
            {hoveredIndex !== null ? segments[hoveredIndex].label : centerSubtext}
          </span>
          <span className="text-xl font-bold text-white tabular-nums tracking-tight mt-0.5">
            {hoveredIndex !== null
              ? `$${segments[hoveredIndex].value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
              : totalLabel || `$${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          </span>
          {hoveredIndex !== null && (
            <span className="text-[11px] font-semibold text-[#2ECC71] tabular-nums mt-0.5">
              {segments[hoveredIndex].percentage}% of total
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 w-full min-w-[150px]">
        {segments.map((seg, i) => (
          <div
            key={seg.key || i}
            onClick={() => onSegmentClick && onSegmentClick(seg)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              seg.isSelected
                ? 'bg-[#2ECC71]/15 border border-[#2ECC71]/40'
                : hoveredIndex === i
                ? 'bg-[#1C201F]'
                : 'hover:bg-[#161918]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-xs font-medium text-[#C7CECB] truncate max-w-[110px]">
                {seg.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tabular-nums">
                ${seg.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[11px] text-[#8C9391] tabular-nums min-w-[28px] text-right">
                {seg.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
