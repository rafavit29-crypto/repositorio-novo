
import React, { useState } from 'react';
import { X, Bell, Plus, Trash2, Clock } from 'lucide-react';
import { Reminder } from '../types';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: Reminder[];
  setReminders: (reminders: Reminder[]) => void;
}

const RemindersModal: React.FC<RemindersModalProps> = ({ isOpen, onClose, reminders, setReminders }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<Reminder['type']>('meal');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newTitle || !newTime) return;
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      active: true,
      type: newType
    };
    setReminders([...reminders, newReminder]);
    setNewTitle('');
    setNewTime('');
  };

  const toggleActive = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const removeReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-sm rounded-[30px] p-6 relative z-10 animate-slide-up shadow-2xl h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-primary" size={24} /> Lembretes
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
          {reminders.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-10">Nenhum lembrete configurado.</p>
          )}
          {reminders.map(r => (
            <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-xl ${r.active ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-400'}`}>
                    <Clock size={18} />
                 </div>
                 <div>
                   <p className={`font-bold text-sm ${r.active ? 'text-gray-800' : 'text-gray-400'}`}>{r.title}</p>
                   <p className="text-xs text-gray-500">{r.time}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => toggleActive(r.id)}
                  className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${r.active ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${r.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <button onClick={() => removeReminder(r.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Form */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Novo Lembrete</p>
          <div className="flex gap-2 mb-2">
            <input 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Ex: Beber Água"
              className="flex-1 bg-gray-50 p-3 rounded-xl text-sm outline-none border border-transparent focus:border-primary transition-colors"
            />
            <input 
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="w-24 bg-gray-50 p-3 rounded-xl text-sm outline-none border border-transparent focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(['meal', 'water', 'workout'] as const).map(t => (
              <button 
                key={t} 
                onClick={() => setNewType(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${newType === t ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}
              >
                {t === 'meal' ? 'Refeição' : t === 'water' ? 'Água' : 'Treino'}
              </button>
            ))}
          </div>
          <button 
            onClick={handleAdd}
            className="w-full mt-3 bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemindersModal;
