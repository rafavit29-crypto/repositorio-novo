
import React from 'react';
import { Plus } from 'lucide-react';

interface MicronutrientRowProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon?: React.ReactNode;
  onAdd: () => void;
}

const MicronutrientRow: React.FC<MicronutrientRowProps> = ({ 
  label, 
  current, 
  target, 
  unit, 
  color, 
  icon,
  onAdd 
}) => {
  const percent = Math.min((current / target) * 100, 100);

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Icon Area */}
      <div className={`p-2 rounded-xl bg-opacity-10 ${color.replace('bg-', 'bg-').replace('500', '50')} ${color.replace('bg-', 'text-')}`}>
        {icon}
      </div>

      {/* Bar Area */}
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-700">{label}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {current}/{target} {unit}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${color}`} 
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      {/* Add Button */}
      <button 
        onClick={onAdd}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors active:scale-95"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

export default MicronutrientRow;
