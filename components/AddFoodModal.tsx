
import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Search, ScanLine, Camera, Edit3, Plus, AlertCircle, Leaf, Image as ImageIcon, Save, ChevronDown, ChevronUp, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { brazilianFoodDatabase } from '../data/foodDb';
import { analyzeFoodImage } from '../services/geminiService';
import { Micronutrients, FoodItem } from '../types';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (food: any) => void;
  mealType: string;
  initialData?: FoodItem | null;
}

// Banco de dados simulado para o modal
const MOCK_BARCODE_DB: Record<string, any> = {
  '7891000100103': { 
    name: 'Iogurte Natural Nestlé', 
    calories: 126, protein: 6.8, carbs: 9.1, fat: 7, portion: '1 pote (170g)',
    micronutrients: { calcium: 240, potassium: 300, magnesium: 20, vitaminC: 0, iron: 0 }
  },
  '7894900011517': { 
    name: 'Coca-Cola Zero', 
    calories: 0, protein: 0, carbs: 0, fat: 0, portion: '1 lata (350ml)',
    micronutrients: { calcium: 0, potassium: 0, magnesium: 0, vitaminC: 0, iron: 0 }
  },
  '7891000053508': { 
    name: 'Biscoito Nesfit Integral', 
    calories: 132, protein: 3, carbs: 20, fat: 4.5, portion: '3 biscoitos (30g)',
    micronutrients: { calcium: 10, potassium: 40, magnesium: 15, vitaminC: 0, iron: 1.2 }
  },
  '7622300990732': { 
    name: 'Chocolate Lacta Ao Leite', 
    calories: 133, protein: 1.8, carbs: 14, fat: 7.8, portion: '4 quadradinhos (25g)',
    micronutrients: { calcium: 30, potassium: 50, magnesium: 10, vitaminC: 0, iron: 0.5 }
  },
};

const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose, onSave, mealType, initialData }) => {
  const [mode, setMode] = useState<'search' | 'barcode' | 'ai' | 'manual' | 'review'>('search');
  
  // Form States
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [portion, setPortion] = useState('1 porção');
  const [micronutrients, setMicronutrients] = useState<Micronutrients | undefined>(undefined);
  const [showMicros, setShowMicros] = useState(false);
  
  // Review List State (Items identified by AI)
  const [analyzedItems, setAnalyzedItems] = useState<any[]>([]);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Camera/Scanner State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);
  const [scanError, setScanError] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Reset states when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setMode('manual');
        setName(initialData.name);
        setCalories(initialData.calories.toString());
        setProtein(initialData.protein.toString());
        setCarbs(initialData.carbs.toString());
        setFat(initialData.fat.toString());
        setPortion(initialData.portion);
        setMicronutrients(initialData.micronutrients);
        if (initialData.micronutrients) setShowMicros(true);
      } else {
        setMode('search');
        resetForm();
      }
    } else {
      stopCamera();
    }
  }, [isOpen, initialData]);

  // Handle Camera Lifecycle based on mode
  useEffect(() => {
    if (mode === 'barcode' && isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedProduct(null);
      setScanError(false);
    }
  }, [mode, isOpen]);

  const resetForm = () => {
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setPortion('1 porção');
    setMicronutrients(undefined);
    setSearchTerm('');
    setScannedProduct(null);
    setScanError(false);
    setShowMicros(false);
    setAnalyzedItems([]);
  };

  const startCamera = async () => {
    setPermissionDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Erro ao acessar câmera traseira:", err);
      if (err.name !== 'NotAllowedError' && err.name !== 'PermissionDeniedError') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (fallbackErr) {
          console.error("Erro no fallback de câmera:", fallbackErr);
          setPermissionDenied(true);
        }
      } else {
        setPermissionDenied(true);
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const simulateScan = () => {
    const keys = Object.keys(MOCK_BARCODE_DB);
    const randomKey = Math.random() > 0.2 ? keys[Math.floor(Math.random() * keys.length)] : '0000';
    const product = MOCK_BARCODE_DB[randomKey];
    if (product) {
      setScannedProduct(product);
      setScanError(false);
    } else {
      setScannedProduct(null);
      setScanError(true);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeFoodImage(base64);
        setIsAnalyzing(false);
        
        if (result && result.name) {
          setAnalyzedItems([{
             id: Date.now().toString(),
             name: result.name,
             calories: result.calories,
             protein: result.protein || 0,
             carbs: result.carbs || 0,
             fat: result.fat || 0,
             portion: 'Porção estimada',
             micronutrients: result.micronutrients
          }]);
          setMode('review');
        } else {
          alert('Não foi possível identificar o alimento. Tente uma foto mais clara.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSingleItem = (item: any) => {
    onSave({
        name: item.name,
        calories: Number(item.calories),
        protein: Number(item.protein),
        carbs: Number(item.carbs),
        fat: Number(item.fat),
        mealType,
        portion: item.portion,
        feeling: 'satisfeita',
        micronutrients: item.micronutrients
    });
  };

  const handleAddItem = (index: number) => {
    const item = analyzedItems[index];
    saveSingleItem(item);
    
    const newItems = [...analyzedItems];
    newItems.splice(index, 1);
    setAnalyzedItems(newItems);

    if (newItems.length === 0) onClose();
  };

  const handleDeleteItem = (index: number) => {
    const newItems = [...analyzedItems];
    newItems.splice(index, 1);
    setAnalyzedItems(newItems);
    
    if (newItems.length === 0) setMode('ai');
  };

  const handleSaveAll = () => {
    analyzedItems.forEach(item => {
        saveSingleItem(item);
    });
    onClose();
  };

  const handleSaveInternal = () => {
    if (!name || !calories) return;
    
    const foodData = {
      ...initialData,
      name,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      mealType,
      portion,
      feeling: initialData?.feeling || 'satisfeita',
      micronutrients: micronutrients || undefined
    };
    
    onSave(foodData);
    onClose();
  };

  const selectFromSearch = (food: any) => {
    setName(food.name);
    setCalories(food.calories.toString());
    setProtein(food.protein.toString());
    setCarbs(food.carbs.toString());
    setFat(food.fat.toString());
    setPortion(food.portion);
    setMicronutrients(food.micronutrients);
    
    if (food.micronutrients) setShowMicros(true);
    
    setMode('manual');
  };

  const confirmScanned = () => {
    if (scannedProduct) {
      setName(scannedProduct.name);
      setCalories(scannedProduct.calories.toString());
      setProtein(scannedProduct.protein.toString());
      setCarbs(scannedProduct.carbs.toString());
      setFat(scannedProduct.fat.toString());
      setPortion(scannedProduct.portion);
      setMicronutrients(scannedProduct.micronutrients);

      if (scannedProduct.micronutrients) setShowMicros(true);

      setMode('manual');
    }
  };

  if (!isOpen) return null;

  const filteredFood = brazilianFoodDatabase.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mealTitle = mealType === 'cafe' ? 'Café da Manhã' : mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Use 90dvh for proper mobile height, handling address bars */}
      <div className="bg-white w-full max-w-md rounded-t-[30px] sm:rounded-[30px] z-10 animate-slide-up shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh] relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-2 flex-shrink-0">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                {initialData ? 'Editar Alimento' : 'Adicionar em'}
            </span>
            <h3 className="text-xl font-bold text-gray-800">{mealTitle}</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 active:bg-gray-300">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs - Hide in Review Mode */}
        {!initialData && mode !== 'review' && (
            <div className="px-6 pb-4 flex-shrink-0">
            <div className="flex bg-gray-50 p-1 rounded-xl overflow-x-auto no-scrollbar">
                <button onClick={() => setMode('search')} className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${mode === 'search' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}>
                <Search size={14} /> Buscar
                </button>
                <button onClick={() => setMode('barcode')} className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${mode === 'barcode' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}>
                <ScanLine size={14} /> Scanner
                </button>
                <button onClick={() => setMode('ai')} className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${mode === 'ai' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}>
                <Camera size={14} /> Foto IA
                </button>
                <button onClick={() => setMode('manual')} className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${mode === 'manual' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}>
                <Edit3 size={14} /> Manual
                </button>
            </div>
            </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-32 custom-scrollbar">
          
          {/* --- SEARCH MODE --- */}
          {mode === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-4 text-gray-300" size={18} />
                <input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Busque por nome (ex: Arroz)"
                  className="w-full pl-11 bg-gray-50 p-4 rounded-xl outline-none text-gray-700 focus:ring-2 ring-primary/20 transition-all text-base"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                {filteredFood.slice(0, 10).map((food, idx) => (
                  <div key={idx} onClick={() => selectFromSearch(food)} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-green-200 cursor-pointer active:bg-gray-50 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Leaf size={16} /></div>
                        <div>
                           <p className="font-bold text-gray-800 text-sm">{food.name}</p>
                           <p className="text-xs text-gray-400">{food.portion} • {food.calories} kcal</p>
                        </div>
                     </div>
                     <Plus size={18} className="text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- BARCODE MODE --- */}
          {mode === 'barcode' && (
            <div className="flex flex-col h-full min-h-[300px]">
               <div className="bg-black rounded-2xl relative overflow-hidden flex-1 flex items-center justify-center">
                  {permissionDenied ? (
                    <div className="text-white text-center p-4">
                      <AlertCircle className="mx-auto mb-2 text-red-500" />
                      <p className="text-sm">Sem acesso à câmera.</p>
                      <p className="text-xs text-gray-400 mt-2">Verifique as permissões do navegador.</p>
                    </div>
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                      {!scannedProduct && !scanError && (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-32 border-2 border-white/50 rounded-lg relative">
                               <div className="w-full h-0.5 bg-red-500 absolute top-1/2 animate-pulse shadow-[0_0_10px_red]"></div>
                            </div>
                         </div>
                      )}
                      
                      {!scannedProduct && (
                        <button onClick={simulateScan} className="absolute bottom-4 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold border border-white/30">
                          Simular Leitura
                        </button>
                      )}
                    </>
                  )}

                  {/* Resultados do Scanner */}
                  {scannedProduct && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-t-2xl animate-slide-up">
                       <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Check size={20} /></div>
                          <div>
                             <h4 className="font-bold text-gray-800 text-sm">{scannedProduct.name}</h4>
                             <p className="text-xs text-gray-500">{scannedProduct.calories} kcal • {scannedProduct.portion}</p>
                          </div>
                       </div>
                       <button onClick={confirmScanned} className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm">Adicionar</button>
                    </div>
                  )}

                  {scanError && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-t-2xl animate-slide-up">
                       <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600"><AlertCircle size={20} /></div>
                          <div>
                             <h4 className="font-bold text-gray-800 text-sm">Não encontrado</h4>
                             <p className="text-xs text-gray-500">Tente buscar manualmente.</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => setScanError(false)} className="flex-1 bg-gray-100 py-2 rounded-xl text-xs font-bold text-gray-600">Tentar de novo</button>
                         <button onClick={() => setMode('manual')} className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-xs font-bold">Manual</button>
                       </div>
                    </div>
                  )}
               </div>
               <p className="text-center text-xs text-gray-400 mt-2">Aponte para o código de barras</p>
            </div>
          )}

          {/* --- AI MODE --- */}
          {mode === 'ai' && (
            <div className="space-y-6 pt-2">
              {isAnalyzing ? (
                 <div className="flex flex-col items-center py-10">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="font-bold text-gray-700">Analisando sua foto...</p>
                    <p className="text-xs text-gray-400">Identificando calorias e nutrientes</p>
                 </div>
              ) : (
                <>
                  <div className="text-center bg-gray-50 p-6 rounded-2xl">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary mb-3 mx-auto shadow-sm">
                        <Camera size={32} />
                    </div>
                    <h4 className="font-bold text-gray-800 text-lg">Foto Inteligente</h4>
                    <p className="text-xs text-gray-400 px-4 mt-1 max-w-xs mx-auto leading-relaxed">
                        Tire foto ou envie da galeria. A IA identificará os alimentos e calculará as calorias e macros para você.
                    </p>
                  </div>
                  
                  <div className="w-full space-y-3">
                    <label className="bg-primary text-white p-4 rounded-2xl font-bold text-sm shadow-lg shadow-green-200 cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-3 w-full hover:bg-primary-dark">
                      <Camera size={20} />
                      <span>Usar Câmera</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                    </label>

                    <label className="bg-white border-2 border-gray-100 text-gray-700 p-4 rounded-2xl font-bold text-sm cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-3 w-full hover:bg-gray-50">
                      <ImageIcon size={20} />
                      <span>Abrir Galeria</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* --- REVIEW MODE (RESULTADOS DA IA) --- */}
          {mode === 'review' && (
             <div className="space-y-4">
               <div className="flex items-center gap-2 mb-4 bg-green-50 p-3 rounded-xl border border-green-100">
                  <Sparkles size={18} className="text-green-600" />
                  <p className="text-xs font-bold text-green-700">Alimentos Identificados - Pronto para adicionar!</p>
               </div>

               {analyzedItems.map((item, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                       <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                       <p className="text-xs text-gray-500">{item.calories} kcal</p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handleDeleteItem(idx)}
                         className="p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors active:scale-95"
                         title="Excluir"
                       >
                         <Trash2 size={18} />
                       </button>
                       <button 
                         onClick={() => handleAddItem(idx)}
                         className="p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors active:scale-95"
                         title="Adicionar"
                       >
                         <Check size={18} />
                       </button>
                    </div>
                 </div>
               ))}
             </div>
          )}

          {/* --- MANUAL MODE --- */}
          {mode === 'manual' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome do Alimento</label>
                <input value={name} onChange={e => setName(e.target.value)} className="input-saas w-full p-4 font-medium text-base" placeholder="Ex: Tapioca com Queijo" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Calorias (kcal)</label>
                    <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="input-saas w-full p-4 font-bold text-gray-800 text-base" placeholder="0" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Porção</label>
                    <input value={portion} onChange={e => setPortion(e.target.value)} className="input-saas w-full p-4 text-base" placeholder="Ex: 100g" />
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Macronutrientes (g)</label>
                 <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-400 uppercase block mb-1">Prot</span>
                        <input type="number" value={protein} onChange={e => setProtein(e.target.value)} className="bg-transparent w-full text-center font-bold outline-none text-base" placeholder="0" />
                    </div>
                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-400 uppercase block mb-1">Carb</span>
                        <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className="bg-transparent w-full text-center font-bold outline-none text-base" placeholder="0" />
                    </div>
                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center">
                        <span className="text-[10px] text-gray-400 uppercase block mb-1">Gord</span>
                        <input type="number" value={fat} onChange={e => setFat(e.target.value)} className="bg-transparent w-full text-center font-bold outline-none text-base" placeholder="0" />
                    </div>
                 </div>
              </div>

              {/* Micronutrients Accordion */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                 <button 
                   onClick={() => setShowMicros(!showMicros)}
                   className="w-full flex justify-between items-center p-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase hover:bg-gray-100 transition-colors"
                 >
                    <span className="flex items-center gap-2"><Leaf size={14} className="text-green-500" /> Micronutrientes (Opcional)</span>
                    {showMicros ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                 </button>
                 
                 {showMicros && (
                    <div className="p-3 bg-white grid grid-cols-3 gap-2 animate-fade-in">
                        {['VitaminC', 'Iron', 'Calcium', 'Potassium', 'Magnesium'].map((nutr) => (
                            <div key={nutr} className="bg-gray-50 p-2 rounded-lg">
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">{nutr.replace(/([A-Z])/g, ' $1').trim()}</label>
                                <input 
                                  type="number" 
                                  // @ts-ignore
                                  value={micronutrients?.[nutr.toLowerCase()] || ''} 
                                  // @ts-ignore
                                  onChange={e => setMicronutrients({...micronutrients, [nutr.toLowerCase()]: Number(e.target.value)})}
                                  className="w-full bg-transparent text-center font-medium text-xs outline-none"
                                  placeholder="0"
                                />
                            </div>
                        ))}
                    </div>
                 )}
              </div>
            </div>
          )}

        </div>
        
        {/* Footer Fixed Actions */}
        {mode === 'manual' && (
           <div className="absolute bottom-0 left-0 right-0 p-6 pt-4 border-t border-gray-50 bg-white rounded-b-[30px] z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] safe-pb">
              <button 
                onClick={handleSaveInternal} 
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Save size={18} /> {initialData ? 'Salvar Alterações' : 'Confirmar e Adicionar'}
              </button>
           </div>
        )}

        {mode === 'review' && (
           <div className="absolute bottom-0 left-0 right-0 p-6 pt-4 border-t border-gray-50 bg-white rounded-b-[30px] z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] safe-pb">
              <button 
                onClick={handleSaveAll} 
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Check size={18} /> Adicionar Alimentos Analisados
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default AddFoodModal;
