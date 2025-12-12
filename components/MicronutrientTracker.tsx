
import React, { useState } from 'react';
import { Micronutrients } from '../types';
import MicronutrientRow from './MicronutrientRow';
import { Zap, Pill, Milk, HeartPulse, Banana, X, Check } from 'lucide-react';

interface MicronutrientTrackerProps {
  data?: Micronutrients;
  onUpdate: (key: keyof Micronutrients, value: number) => void;
}

const MicronutrientTracker: React.FC<MicronutrientTrackerProps> = ({ data, onUpdate }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNutrient, setSelectedNutrient] = useState<{key: keyof Micronutrients, label: string, unit: string} | null>(null);
  const [amount, setAmount] = useState('');

  // Default targets (generic averages for adult women)
  const targets = {
    vitaminC: 75, // mg
    iron: 18, // mg
    calcium: 1000, // mg
    potassium: 2600, // mg
    magnesium: 320, // mg
  };

  const currentData = data || {
    vitaminC: 0,
    iron: 0,
    calcium: 0,
    potassium: 0,
    magnesium: 0,
  };

  const openAddModal = (key: keyof Micronutrients, label: string, unit: string) => {
    setSelectedNutrient({ key, label, unit });
    setAmount('');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (selectedNutrient && amount) {
      onUpdate(selectedNutrient.key, Number(amount));
      setModalOpen(false);
    }
  };

  return (
    <div className="glass-card bg-white/70 p-5 rounded-[24px] border border-green-50/50 shadow-sm animate-fade-in">
      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Zap size={16} className="text-teal-500" /> Micronutrientes
      </h3>

      <div className="space-y-1">
        <MicronutrientRow 
          label="Vitamina C" 
          current={currentData.vitaminC} 
          target={targets.vitaminC} 
          unit="mg" 
          color="bg-orange-400" 
          icon={<Pill size={16} />}
          onAdd={() => openAddModal('vitaminC', 'Vitamina C', 'mg')}
        />
        <MicronutrientRow 
          label="Ferro" 
          current={currentData.iron} 
          target={targets.iron} 
          unit="mg" 
          color="bg-red-400" 
          icon={<HeartPulse size={16} />}
          onAdd={() => openAddModal('iron', 'Ferro', 'mg')}
        />
        <MicronutrientRow 
          label="Cálcio" 
          current={currentData.calcium} 
          target={targets.calcium} 
          unit="mg" 
          color="bg-blue-400" 
          icon={<Milk size={16} />}
          onAdd={() => openAddModal('calcium', 'Cálcio', 'mg')}
        />
        <MicronutrientRow 
          label="Potássio" 
          current={currentData.potassium} 
          target={targets.potassium} 
          unit="mg" 
          color="bg-purple-400" 
          icon={<Banana size={16} />}
          onAdd={() => openAddModal('potassium', 'Potássio', 'mg')}
        />
        <MicronutrientRow 
          label="Magnésio" 
          current={currentData.magnesium} 
          target={targets.magnesium} 
          unit="mg" 
          color="bg-teal-400" 
          icon={<Zap size={16} />}
          onAdd={() => openAddModal('magnesium', 'Magnésio', 'mg')}
        />
      </div>

      {/* Simple Input Modal */}
      {modalOpen && selectedNutrient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="bg-white p-6 rounded-[24px] shadow-2xl w-full max-w-xs relative z-10 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-800">Adicionar {selectedNutrient.label}</h4>
              <button onClick={() => setModalOpen(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            
            <div className="relative mb-6">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
                className="w-full bg-gray-50 p-4 rounded-xl text-center text-2xl font-bold text-gray-800 outline-none focus:ring-2 ring-teal-100"
              />
              <span className="absolute right-4 top-5 text-sm text-gray-400 font-medium">{selectedNutrient.unit}</span>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-teal-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-teal-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check size={18} /> Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MicronutrientTracker;
