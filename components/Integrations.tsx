
import React, { useState } from 'react';
import { AppState } from '../types';
import { 
  Activity, Heart, Smartphone, Watch, RefreshCw, CheckCircle2, 
  MapPin, Zap, Flame, Moon, Footprints 
} from 'lucide-react';

interface IntegrationsProps {
  state: AppState;
  toggleIntegration: (key: keyof AppState['integrations']) => void;
  syncNow: () => void;
}

const Integrations: React.FC<IntegrationsProps> = ({ state, toggleIntegration, syncNow }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      syncNow();
      setIsSyncing(false);
    }, 2000);
  };

  const providers = [
    { 
      key: 'googleFit', 
      name: 'Google Fit', 
      icon: <Heart size={24} className="text-red-500" />, 
      color: 'bg-red-50', 
      description: 'Sincronizar passos e batimentos.' 
    },
    { 
      key: 'appleHealth', 
      name: 'Apple Health', 
      icon: <Heart size={24} className="text-pink-500 fill-pink-500" />, 
      color: 'bg-pink-50', 
      description: 'Dados de saúde do iOS.' 
    },
    { 
      key: 'fitbit', 
      name: 'Fitbit', 
      icon: <Activity size={24} className="text-teal-500" />, 
      color: 'bg-teal-50', 
      description: 'Sono e atividades diárias.' 
    },
    { 
      key: 'strava', 
      name: 'Strava', 
      icon: <MapPin size={24} className="text-orange-600" />, 
      color: 'bg-orange-50', 
      description: 'Corridas e pedaladas.' 
    },
    { 
      key: 'samsungHealth', 
      name: 'Samsung Health', 
      icon: <Activity size={24} className="text-blue-500" />, 
      color: 'bg-blue-50', 
      description: 'Dados de wearables Galaxy.' 
    },
    { 
      key: 'garmin', 
      name: 'Garmin', 
      icon: <Watch size={24} className="text-black" />, 
      color: 'bg-gray-100', 
      description: 'Performance de alta precisão.' 
    },
    { 
      key: 'xiaomi', 
      name: 'Xiaomi / Mi Fit', 
      icon: <Zap size={24} className="text-orange-500" />, 
      color: 'bg-orange-50', 
      description: 'Dados da Mi Band e Amazfit.' 
    },
    { 
      key: 'appleWatch', 
      name: 'Apple Watch', 
      icon: <Watch size={24} className="text-gray-800" />, 
      color: 'bg-gray-50', 
      description: 'Integração direta com o relógio.' 
    },
  ];

  const lastSyncTime = state.integrations.lastSync 
    ? new Date(state.integrations.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Nunca';

  // Count active integrations
  const activeCount = Object.values(state.integrations).filter(v => v === true).length;

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
         
         <div className="relative z-10 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-2">
              <RefreshCw className="text-primary" /> Central de Integrações
            </h1>
            <p className="text-gray-500 mt-2">
              Conecte seus dispositivos para sincronizar passos, treinos e sono automaticamente.
            </p>
         </div>

         <div className="flex flex-col items-end gap-2 relative z-10">
            <button 
              onClick={handleSync}
              disabled={isSyncing || activeCount === 0}
              className={`
                px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg
                ${isSyncing ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-black active:scale-95'}
                ${activeCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
               <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
               {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
            </button>
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
              {activeCount > 0 ? (
                <>
                  <CheckCircle2 size={12} className="text-green-500" />
                  Última sincronização: {lastSyncTime}
                </>
              ) : (
                'Nenhum dispositivo conectado'
              )}
            </span>
         </div>
      </div>

      {/* Stats Summary (Mock) */}
      {activeCount > 0 && (
         <div className="grid grid-cols-3 gap-4">
            <div className="card-saas p-4 flex flex-col items-center justify-center">
               <Footprints className="text-green-500 mb-2" size={24} />
               <span className="text-xl font-bold text-gray-800">4,230</span>
               <span className="text-[10px] text-gray-400 uppercase font-bold">Passos Importados</span>
            </div>
            <div className="card-saas p-4 flex flex-col items-center justify-center">
               <Flame className="text-orange-500 mb-2" size={24} />
               <span className="text-xl font-bold text-gray-800">320</span>
               <span className="text-[10px] text-gray-400 uppercase font-bold">Kcal Atividade</span>
            </div>
            <div className="card-saas p-4 flex flex-col items-center justify-center">
               <Moon className="text-indigo-500 mb-2" size={24} />
               <span className="text-xl font-bold text-gray-800">7h 12m</span>
               <span className="text-[10px] text-gray-400 uppercase font-bold">Sono Registrado</span>
            </div>
         </div>
      )}

      {/* Providers Grid */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4 px-2">Dispositivos Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {providers.map((provider) => {
            // @ts-ignore
            const isActive = state.integrations[provider.key];
            
            return (
              <div 
                key={provider.key}
                className={`
                  p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group
                  ${isActive ? 'bg-white border-primary shadow-md' : 'bg-white border-gray-100 hover:border-gray-200'}
                `}
              >
                {isActive && <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-8 -mt-8"></div>}
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${provider.color}`}>
                      {provider.icon}
                   </div>
                   
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={isActive}
                        onChange={() => toggleIntegration(provider.key as any)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                   </label>
                </div>

                <div className="relative z-10">
                   <h4 className={`font-bold text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{provider.name}</h4>
                   <p className="text-xs text-gray-400 mt-1 leading-relaxed">{provider.description}</p>
                   
                   {isActive && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                         Conectado
                      </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
         <Smartphone className="text-blue-500 flex-shrink-0 mt-1" size={20} />
         <div>
            <h4 className="font-bold text-blue-900 text-sm">Sincronização Automática</h4>
            <p className="text-xs text-blue-700 mt-1">
               O app tentará sincronizar seus dados automaticamente a cada 2 horas se houver uma integração ativa.
               Certifique-se de que as permissões foram concedidas no seu dispositivo.
            </p>
         </div>
      </div>

    </div>
  );
};

export default Integrations;
