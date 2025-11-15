import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface YearRangeSliderProps {
  startYear: number;
  endYear: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
  className?: string;
}

const YearRangeSlider: React.FC<YearRangeSliderProps> = ({
  startYear,
  endYear,
  value,
  onChange,
  className = '',
}) => {
  const { theme } = useTheme();
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const range = endYear - startYear;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
    const newValue = parseInt(e.target.value, 10);
    const updatedRange: [number, number] = [...localValue] as [number, number];
    updatedRange[index] = newValue;
    
    // Ensure min <= max
    if (index === 0 && newValue > updatedRange[1]) {
      updatedRange[1] = newValue;
    } else if (index === 1 && newValue < updatedRange[0]) {
      updatedRange[0] = newValue;
    }
    
    setLocalValue(updatedRange);
  };

  const handleSliderCommit = () => {
    onChange(localValue);
  };

  const getLeftPosition = (val: number) => {
    return ((val - startYear) / range) * 100;
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const trackBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
  const rangeBg = 'bg-purple-500';
  const thumbBg = theme === 'dark' ? 'bg-purple-400' : 'bg-purple-600';

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div className={`text-sm font-medium ${textColor}`}>{localValue[0]}</div>
        <div className={`text-sm font-medium ${textColor}`}>{localValue[1]}</div>
      </div>
      
      <div className="relative h-12 mt-4">
        {/* Track background */}
        <div className={`absolute top-1/2 transform -translate-y-1/2 h-2 w-full rounded-full ${trackBg}`}></div>
        
        {/* Active range */}
        <div 
          className={`absolute top-1/2 transform -translate-y-1/2 h-2 rounded-full ${rangeBg}`}
          style={{
            left: `${getLeftPosition(localValue[0])}%`,
            width: `${getLeftPosition(localValue[1]) - getLeftPosition(localValue[0])}%`
          }}
        ></div>
        
        {/* Year markers */}
        {Array.from({ length: range + 1 }, (_, i) => startYear + i).map((year) => (
          <div 
            key={year} 
            className="absolute top-1/2 transform -translate-y-1/2"
            style={{ left: `${getLeftPosition(year)}%` }}
          >
            {year % 5 === 0 && (
              <>
                <div className={`h-3 w-0.5 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'} mb-1`}></div>
                <div className={`text-xs ${textColor} absolute -left-4 top-4`}>{year}</div>
              </>
            )}
          </div>
        ))}
        
        {/* Sliders */}
        <input
          type="range"
          min={startYear}
          max={endYear}
          value={localValue[0]}
          onChange={(e) => handleSliderChange(e, 0)}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          className="absolute top-1/2 transform -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none z-10"
          style={{
            height: '20px',
            WebkitAppearance: 'none',
          }}
        />
        
        <input
          type="range"
          min={startYear}
          max={endYear}
          value={localValue[1]}
          onChange={(e) => handleSliderChange(e, 1)}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          className="absolute top-1/2 transform -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none z-10"
          style={{
            height: '20px',
            WebkitAppearance: 'none',
          }}
        />
        
        {/* Custom thumb styles - applied via CSS */}
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${thumbBg};
            cursor: pointer;
            pointer-events: auto;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 2px solid white;
          }
          
          input[type=range]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${thumbBg};
            cursor: pointer;
            pointer-events: auto;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 2px solid white;
          }
        `}</style>
      </div>
      
      <div className="flex justify-between mt-6">
        <div className={`text-sm ${textColor}`}>
          <span className="font-semibold">Period:</span> {localValue[0]} - {localValue[1]}
        </div>
      </div>
    </div>
  );
};

export default YearRangeSlider;
