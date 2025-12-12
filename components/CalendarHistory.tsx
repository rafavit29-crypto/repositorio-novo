
import React, { useState } from 'react';
import { AppState, DailyStats, FoodItem } from '../types';
import { ChevronLeft, ChevronRight, Droplets, Flame, Footprints, Calendar as CalendarIcon, X } from 'lucide-react';

interface CalendarHistoryProps {
  state: AppState;
}

const CalendarHistory: React.FC<CalendarHistoryProps> = ({ state }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for days before start of month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 md:h-20 bg-transparent"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysCount; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate;
      const hasData = state.dailyStats[dateStr] || state.foodLog.some(f => f.date === dateStr);
      
      // Determine status color based on goal completion (simplified logic)
      const calories = state.foodLog.filter(f => f.date === dateStr).reduce((a, b) => a + b.calories, 0);
      let statusColor = '';
      if (hasData) {
          if (calories > 0 && Math.abs(calories - (state.goal?.dailyCalories || 2000)) < 200) {
              statusColor = 'bg-green-400';
          } else if (calories > 0) {
              statusColor = 'bg-orange-400';
          } else {
              statusColor = 'bg-gray-300';
          }
      }

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(dateStr)}
          className={`
            h-14 md:h-24 rounded-xl border flex flex-col items-center justify-start pt-2 cursor-pointer transition-all relative overflow-hidden
            ${isSelected 
              ? 'border-primary bg-primary/5 shadow-sm' 
              : 'border-gray-50 bg-white hover:border-gray-200'}
            ${isToday ? 'ring-2 ring-blue-200' : ''}
          `}
        >
          <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-gray-600'} ${isToday ? 'text-blue-500' : ''}`}>
            {day}
          </span>
          
          {hasData && (
             <div className="flex gap-1 mt-auto mb-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`}></div>
             </div>
          )}

          {/* Simple summary for desktop */}
          {hasData && (
             <div className="hidden md:flex flex-col gap-0.5 mb-2 w-full px-2">
                <div className="text-[9px] text-gray-400 flex justify-between">
                   <span>{calories}kcal</span>
                </div>
             </div>
          )}
        </div>
      );
    }
    return days;
  };

  // Get data for selected date
  const stats = selectedDate ? state.dailyStats[selectedDate] : null;
  const logs = selectedDate ? state.foodLog.filter(f => f.date === selectedDate) : [];
  const totalCals = logs.reduce((a, b) => a + b.calories, 0);
  const totalWater = stats?.waterIntake || 0;
  const totalSteps = stats?.steps || 0;

  const formatDate = (isoDate: string) => {
      const parts = isoDate.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-fade-in pb-10">
      
      {/* Calendar Area */}
      <div className="flex-1 card-saas p-6 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <CalendarIcon className="text-primary" /> Histórico
           </h2>
           <div className="flex items-center gap-2">
              <button 
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-bold bg-primary-light text-primary rounded-lg hover:bg-primary hover:text-white transition-colors mr-2"
              >
                Hoje
              </button>
              <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
                 <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"><ChevronLeft size={20} /></button>
                 <span className="text-sm font-bold text-gray-800 min-w-[120px] text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                 <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"><ChevronRight size={20} /></button>
              </div>
           </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day, i) => (
             <div key={i} className="text-center text-xs font-bold text-gray-400 py-2">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 overflow-y-auto custom-scrollbar pr-1 pb-2">
          {renderCalendar()}
        </div>
      </div>

      {/* Detail Sidebar */}
      {selectedDate && (
        <div className="w-full lg:w-80 card-saas flex flex-col animate-slide-up h-full">
           <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase">Resumo do dia</p>
                 <h3 className="text-lg font-bold text-gray-800">{formatDate(selectedDate)}</h3>
              </div>
              <button onClick={() => setSelectedDate(null)} className="lg:hidden text-gray-400">
                <X size={20} />
              </button>
           </div>

           <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              
              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-2">
                 <div className="bg-orange-50 p-3 rounded-xl text-center">
                    <Flame size={16} className="text-orange-500 mx-auto mb-1" />
                    <span className="block text-sm font-bold text-gray-800">{totalCals}</span>
                    <span className="text-[10px] text-gray-500">Kcal</span>
                 </div>
                 <div className="bg-blue-50 p-3 rounded-xl text-center">
                    <Droplets size={16} className="text-blue-500 mx-auto mb-1" />
                    <span className="block text-sm font-bold text-gray-800">{totalWater}</span>
                    <span className="text-[10px] text-gray-500">ml</span>
                 </div>
                 <div className="bg-green-50 p-3 rounded-xl text-center">
                    <Footprints size={16} className="text-green-500 mx-auto mb-1" />
                    <span className="block text-sm font-bold text-gray-800">{totalSteps}</span>
                    <span className="text-[10px] text-gray-500">Passos</span>
                 </div>
              </div>

              {/* Meals List */}
              <div>
                 <h4 className="font-bold text-sm text-gray-700 mb-3 border-b border-gray-50 pb-1">Refeições</h4>
                 {logs.length === 0 ? (
                   <p className="text-xs text-gray-400 italic">Nenhum registro.</p>
                 ) : (
                   <div className="space-y-2">
                     {logs.map(item => (
                       <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-[10px] text-gray-500 capitalize">{item.mealType}</p>
                          </div>
                          <span className="text-xs font-bold text-gray-600">{item.calories}</span>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
              
              {/* Mood (Placeholder) */}
              <div>
                 <h4 className="font-bold text-sm text-gray-700 mb-3 border-b border-gray-50 pb-1">Humor</h4>
                 <div className="flex gap-2">
                    {['happy', 'neutral', 'sad'].map(m => (
                       <div key={m} className={`p-2 rounded-lg text-xl opacity-50 ${stats?.mood === m ? 'opacity-100 bg-gray-100' : ''}`}>
                          {m === 'happy' ? '😄' : m === 'neutral' ? '😐' : '😔'}
                       </div>
                    ))}
                    {!stats?.mood && <span className="text-xs text-gray-400 py-2">Não registrado</span>}
                 </div>
              </div>

           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarHistory;
