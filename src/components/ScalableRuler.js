import React, { useState } from 'react';

const ScalableRuler = () => {
  const [length, setLength] = useState(100);
  const [unit, setUnit] = useState('mm');
  const [color, setColor] = useState('#4285F4'); // Blue color similar to image
  
  // Ruler dimensions
  const rulerWidth = 300;
  const rulerHeight = 40;
  const handleSize = 12;
  
  // Tick mark configuration
  const majorTickHeight = 16;
  const minorTickHeight = 8;
  const numTicks = 10; // Number of major divisions
  
  const renderTicks = () => {
    const ticks = [];
    const tickSpacing = rulerWidth / numTicks;
    
    // Create ticks
    for (let i = 0; i <= numTicks; i++) {
      const xPosition = i * tickSpacing;
      
      // Major tick
      ticks.push(
        <line 
          key={`major-${i}`}
          x1={xPosition} 
          y1={0} 
          x2={xPosition} 
          y2={majorTickHeight} 
          stroke="black" 
          strokeWidth="1"
        />
      );
      
      // Minor ticks (except at the last position)
      if (i < numTicks) {
        for (let j = 1; j < 5; j++) {
          const minorX = xPosition + (tickSpacing * j / 5);
          const height = j === 2.5 ? majorTickHeight * 0.75 : minorTickHeight;
          
          ticks.push(
            <line 
              key={`minor-${i}-${j}`}
              x1={minorX} 
              y1={0} 
              x2={minorX} 
              y2={height} 
              stroke="black" 
              strokeWidth="0.5"
            />
          );
        }
      }
    }
    
    return ticks;
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Length:
          </label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(Math.max(1, parseInt(e.target.value) || 0))}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            style={{ width: '80px' }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit:
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="in">in</option>
            <option value="ft">ft</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color:
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="p-1 border border-gray-300 rounded-md h-8 w-8"
          />
        </div>
      </div>
      
      <div className="relative">
        <svg width={rulerWidth + 20} height={rulerHeight + 40}>
          {/* Main ruler rectangle */}
          <rect
            x="10"
            y="0"
            width={rulerWidth}
            height={rulerHeight}
            fill={color}
            stroke="black"
            strokeWidth="1"
            fillOpacity="0.3"
          />
          
          {/* Tick marks */}
          <g transform="translate(10, 0)">
            {renderTicks()}
          </g>
          
          {/* Left handle */}
          <rect
            x="5"
            y={(rulerHeight - handleSize) / 2}
            width="10"
            height={handleSize}
            fill={color}
            stroke="black"
            strokeWidth="1"
          />
          
          {/* Right handle */}
          <rect
            x={rulerWidth + 5}
            y={(rulerHeight - handleSize) / 2}
            width="10"
            height={handleSize}
            fill={color}
            stroke="black"
            strokeWidth="1"
          />
          
          {/* Left vertical line */}
          <line
            x1="10"
            y1={rulerHeight - 5}
            x2="10"
            y2={rulerHeight + 15}
            stroke="black"
            strokeWidth="1"
          />
          
          {/* Right vertical line */}
          <line
            x1={rulerWidth + 10}
            y1={rulerHeight - 5}
            x2={rulerWidth + 10}
            y2={rulerHeight + 15}
            stroke="black"
            strokeWidth="1"
          />
          
          {/* Horizontal dimension line */}
          <line
            x1="10"
            y1={rulerHeight + 15}
            x2={rulerWidth + 10}
            y2={rulerHeight + 15}
            stroke="black"
            strokeWidth="1"
          />
          
          {/* Dimension arrows */}
          <polyline
            points={`20,${rulerHeight + 15} 10,${rulerHeight + 15} 15,${rulerHeight + 10}`}
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
          <polyline
            points={`${rulerWidth},${rulerHeight + 15} ${rulerWidth + 10},${rulerHeight + 15} ${rulerWidth + 5},${rulerHeight + 10}`}
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
          
          {/* Dimension text */}
          <text
            x={rulerWidth / 2 + 10}
            y={rulerHeight + 32}
            textAnchor="middle"
            fontSize="12"
            fontFamily="sans-serif"
          >
            {length} {unit}
          </text>
        </svg>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        This ruler can be used as a reference for setting scale in the PointSelector component.
      </div>
    </div>
  );
};

export default ScalableRuler;