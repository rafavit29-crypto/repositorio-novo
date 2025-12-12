import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { FoodItem } from '../types';

interface MealCardProps {
  title: string;
  items: FoodItem[];
  icon: React.ReactNode;
  onAddClick: () => void;
  onEditClick?: (item: FoodItem) => void;
  onRemove?: (id: string) => void;
}

const MealCard: React.FC<MealCardProps> = ({ title, items, icon, onAddClick, onEditClick, onRemove }) => {
  const totalCalories = items.reduce((acc, item) => acc + item.calories, 0);

  return (
    <div className="card-saas p-4 sm:p-5 hover:shadow-hover transition-shadow duration-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="text-secondary bg-gray-50 p-2 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-main text-sm">{title}</h3>
            <span className="text-xs text-gray-400 font-medium">{totalCalories} kcal</span>
          </div>
        </div>
        <button 
          onClick={onAddClick}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary-light transition-colors active:scale-95"
          title="Adicionar item"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-gray-300 gap-2 min-h-[100px]">
             <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <Plus size={20} className="opacity-50" />
             </div>
             <span className="text-xs">Sem registros</span>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm group relative p-2 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
              <div className="min-w-0 pr-3 flex-1">
                <p className="text-main truncate font-semibold text-xs sm:text-sm">{item.name}</p>
                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                   <p className="text-[10px] text-gray-400">{item.portion}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                 <span className="font-bold text-gray-700 whitespace-nowrap text-xs bg-gray-100 px-2 py-1 rounded-md min-w-[2.5rem] text-center">
                    {item.calories}
                 </span>
                 
                 <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    {onEditClick && (
                        <button 
                        onClick={() => onEditClick(item)} 
                        className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-white rounded-md"
                        title="Editar"
                        >
                        <Edit2 size={14} />
                        </button>
                    )}
                    {onRemove && (
                        <button 
                        onClick={() => onRemove(item.id)} 
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors hover:bg-white rounded-md"
                        title="Excluir"
                        >
                        <Trash2 size={14} />
                        </button>
                    )}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MealCard;