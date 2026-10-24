import React, { useState } from 'react';

interface HeatmapChartProps {
  days: string[];
  hours: number[];
  matrix: number[][]; // [dayIndex][hourIndex]
  maxVal: number;
  onSlotClick?: (day: string, hour: number, count: number) => void;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  days,
  hours,
  matrix,
  maxVal,
  onSlotClick,
}) => {
  const [hovered, setHovered] = useState<{ day: string; hour: number; count: number } | null>(null);

  // Intensity color generator
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-[#161918] border border-[#222826]';
    const ratio = count / maxVal;
    if (ratio < 0.25) return 'bg-[#0E5B36]/60 border border-[#1FA463]/30 text-white';
    if (ratio < 0.5) return 'bg-[#1FA463] text-black font-semibold';
    if (ratio < 0.75) return 'bg-[#2ECC71] text-black font-bold';
    return 'bg-[#7ED321] text-black font-extrabold shadow-sm shadow-[#7ED321]/30';
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Hours header */}
        <div className="flex items-center gap-1.5 mb-2 pl-12">
          {hours.map((h) => (
            <div key={h} className="flex-1 text-center text-[10px] text-[#8C9391] font-mono-num tabular-nums">
              {h}:00
            </div>
          ))}
        </div>

        {/* Days rows */}
        <div className="flex flex-col gap-1.5">
          {days.map((day, dIdx) => (
            <div key={day} className="flex items-center gap-1.5">
              <span className="w-10 text-[11px] font-medium text-[#8C9391] shrink-0 text-right pr-2">
                {day}
              </span>
              <div className="flex items-center gap-1.5 flex-1">
                {hours.map((h, hIdx) => {
                  const count = matrix[dIdx]?.[hIdx] || 0;
                  return (
                    <button
                      key={h}
                      type="button"
                      onMouseEnter={() => setHovered({ day, hour: h, count })}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => onSlotClick && onSlotClick(day, h, count)}
                      className={`flex-1 h-8 rounded-md flex items-center justify-center text-[11px] transition-all transform hover:scale-105 cursor-pointer ${getCellColor(
                        count
                      )}`}
                      title={`${day} at ${h}:00: ${count} appointments`}
                    >
                      {count > 0 ? count : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend & Hover Info */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#262B29] text-xs">
          <div className="flex items-center gap-2 text-[#8C9391] text-[11px]">
            <span>Low</span>
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-[#161918] border border-[#222826]" />
              <span className="w-3.5 h-3.5 rounded bg-[#0E5B36]/60 border border-[#1FA463]/30" />
              <span className="w-3.5 h-3.5 rounded bg-[#1FA463]" />
              <span className="w-3.5 h-3.5 rounded bg-[#2ECC71]" />
              <span className="w-3.5 h-3.5 rounded bg-[#7ED321]" />
            </div>
            <span>High Density</span>
          </div>

          <div className="text-[11px] text-right">
            {hovered ? (
              <span className="text-white font-medium">
                {hovered.day} at {hovered.hour}:00 —{' '}
                <strong className="text-[#2ECC71]">{hovered.count} visits</strong>
              </span>
            ) : (
              <span className="text-[#8C9391]">Hover cell to inspect slot density</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
