interface DataPoint {
  date: string;
  hours: number;
  cycles: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  height?: number;
}

export function SimpleLineChart({ data, height = 200 }: SimpleLineChartProps) {
  if (!data || data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 600; // Arbitrary viewBox width
  
  // Calculate scales
  const maxHours = Math.max(...data.map(d => d.hours)) * 1.1; // Add 10% headroom
  const maxCycles = Math.max(...data.map(d => d.cycles)) * 1.1;
  
  // Use the larger scale to normalize both lines to the same chart height
  // or plot them on separate axes. Here we'll normalize to 0-1 range for plotting 
  // but show absolute values in tooltip/labels if we had them.
  // For simplicity in this demo, we'll scale them to fit the SVG height.

  const xScale = (index: number) => padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
  const yScaleHours = (val: number) => height - padding.bottom - (val / maxHours) * (height - padding.top - padding.bottom);
  const yScaleCycles = (val: number) => height - padding.bottom - (val / maxCycles) * (height - padding.top - padding.bottom);

  // Create path commands
  const createPath = (yScale: (val: number) => number, key: 'hours' | 'cycles') => {
    return data.map((d, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d[key])}`
    ).join(' ');
  };

  const hoursPath = createPath(yScaleHours, 'hours');
  const cyclesPath = createPath(yScaleCycles, 'cycles');

  return (
    <div className="w-full overflow-hidden">
      <div className="flex justify-end gap-6 mb-2 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Flight Hours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Cycles</span>
        </div>
      </div>
      
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto bg-white rounded-lg border border-gray-100">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = height - padding.bottom - tick * (height - padding.top - padding.bottom);
          return (
            <g key={tick}>
              <line 
                x1={padding.left} 
                y1={y} 
                x2={width - padding.right} 
                y2={y} 
                stroke="#f3f4f6" 
                strokeWidth="1" 
              />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400">
                {Math.round(maxHours * tick)}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <text 
            key={i} 
            x={xScale(i)} 
            y={height - 10} 
            textAnchor="middle" 
            className="text-[10px] fill-gray-500"
          >
            {d.date.split('-')[1]}
          </text>
        ))}

        {/* Data Lines */}
        <path d={hoursPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={cyclesPath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data Points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xScale(i)} cy={yScaleHours(d.hours)} r="3" fill="#fff" stroke="#3b82f6" strokeWidth="2" />
            <circle cx={xScale(i)} cy={yScaleCycles(d.cycles)} r="3" fill="#fff" stroke="#22c55e" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
}
