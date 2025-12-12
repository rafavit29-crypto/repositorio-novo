import React from 'react';

interface MacroDisplayProps {
  consumed: { protein: number; carbs: number; fat: number };
  target: { protein: number; carbs: number; fat: number };
}

const MacroBar = ({ label, current, max, colorClass }: { label: string, current: number, max: number, colorClass: string }) => {
  const percent = Math.min((current / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-secondary">{label}</span>
        <span className="font-semibold text-main">{current} <span className="text-gray-400 font-normal">/ {max}g</span></span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

const MacroDisplay: React.FC<MacroDisplayProps> = ({ consumed, target }) => {
  return (
    <div className="space-y-6 w-full">
      <MacroBar 
        label="Proteínas" 
        current={consumed.protein} 
        max={target.protein} 
        colorClass="bg-emerald-500" 
      />
      <MacroBar 
        label="Carboidratos" 
        current={consumed.carbs} 
        max={target.carbs} 
        colorClass="bg-blue-400" 
      />
      <MacroBar 
        label="Gorduras" 
        current={consumed.fat} 
        max={target.fat} 
        colorClass="bg-amber-400" 
      />
    </div>
  );
};

export default MacroDisplay;