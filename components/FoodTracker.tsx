
import React, { useState, useRef, useEffect } from 'react';
import { AppState, FoodItem } from '../types';
import { Plus, Search, Camera, ScanLine, Image as ImageIcon, Check, Leaf, AlertCircle } from 'lucide-react';
import { brazilianFoodDatabase } from '../data/foodDb';
import { analyzeFoodImage } from '../services/geminiService';

interface FoodTrackerProps {
  state: AppState;
  addFood: (item: FoodItem) => void;
}

// Banco de dados simulado de códigos de barras
const MOCK_BARCODE_DB: Record<string, any> = {
  '7891000100103': { name: 'Iogurte Natural Nestlé', calories: 126, protein: 6.8, carbs: 9.1, fat: 7, portion: '1 pote (170g)' },
  '7894900011517': { name: 'Coca-Cola Zero', calories: 0, protein: 0, carbs: 0, fat: 0, portion: '1 lata (350ml)' },
  '7891000053508': { name: 'Biscoito Nesfit Integral', calories: 132, protein: 3, carbs: 20, fat: 4.5, portion: '3 biscoitos (30g)' },
  '7622300990732': { name: 'Chocolate Lacta Ao Leite', calories: 133, protein: 1.8, carbs: 14, fat: 7.8, portion: '4 quadradinhos (25g)' },
};

const FoodTracker: React.FC<FoodTrackerProps> = ({ state, addFood }) => {
  const [mode, setMode] = useState<'search' | 'ai' | 'barcode' | 'manual'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Barcode Scanner State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);
  const [scanError, setScanError] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  const today = new Date().toISOString().split('T')[0];
  const todaysLog = state.foodLog.filter(f => f.date === today);
  const totalCalories = todaysLog.reduce((acc, curr) => acc + curr.calories, 0);

  // Stop camera when component unmounts or mode changes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (mode === 'barcode') {
      startCamera();
    } else {
      stopCamera();
      setScannedProduct(null);
      setScanError(false);
      setPermissionDenied(false);
    }
  }, [mode]);

  const startCamera = async () => {
    setPermissionDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setPermissionDenied(true);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const simulateScan = () => {
    // Simula a leitura de um código aleatório (com chance de falha)
    const keys = Object.keys(MOCK_BARCODE_DB);
    const randomKey = Math.random() > 0.2 
      ? keys[Math.floor(Math.random() * keys.length)] 
      : '0000000000000'; // Código inexistente

    const product = MOCK_BARCODE_DB[randomKey];

    if (product) {
      setScannedProduct(product);
      setScanError(false);
    } else {
      setScannedProduct(null);
      setScanError(true);
    }
  };

  const confirmScannedProduct = () => {
    if (scannedProduct) {
      addFood({
        id: Date.now().toString(),
        name: scannedProduct.name,
        calories: scannedProduct.calories,
        protein: scannedProduct.protein,
        carbs: scannedProduct.carbs,
        fat: scannedProduct.fat,
        portion: scannedProduct.portion,
        feeling: 'satisfeita',
        date: today,
        mealType: 'lanche', // Poderia ser selecionável
        timestamp: Date.now()
      });
      setMode('search');
    }
  };

  // File Upload for AI
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeFoodImage(base64);
        setIsAnalyzing(false);
        if (result && result.name) {
          addFood({
            id: Date.now().toString(),
            name: result.name,
            calories: result.calories,
            protein: result.protein || 0,
            carbs: result.carbs || 0,
            fat: result.fat || 0,
            portion: 'Porção estimada',
            feeling: 'satisfeita',
            date: today,
            mealType: 'almoco',
            timestamp: Date.now(),
            micronutrients: result.micronutrients
          });
          setMode('search');
        } else {
          alert('Não consegui identificar a comida. Tente uma foto mais clara ou adicione manualmente.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredFood = brazilianFoodDatabase.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Diário Alimentar</h1>
           <p className="text-gray-400 text-sm">Registre cada detalhe 🥗</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
          <span className="text-primary font-bold text-xl">{totalCalories}</span>
          <span className="text-primary/70 text-xs ml-1">kcal</span>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={() => setMode('search')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === 'search' ? 'bg-primary text-white shadow-md' : 'text-gray-400'}`}>Buscar</button>
        <button onClick={() => setMode('barcode')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === 'barcode' ? 'bg-primary text-white shadow-md' : 'text-gray-400'}`}><ScanLine size={18} className="mx-auto" /></button>
        <button onClick={() => setMode('ai')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === 'ai' ? 'bg-primary text-white shadow-md' : 'text-gray-400'}`}><Camera size={18} className="mx-auto" /></button>
      </div>

      {/* Content Areas */}
      <div className="min-h-[300px]">
        
        {/* --- SEARCH MODE --- */}
        {mode === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-4 text-gray-300" size={20} />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Ex: Arroz, Frango, Maçã..."
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm outline-none text-gray-700 placeholder-gray-300"
              />
            </div>
            <div className="space-y-2">
              {filteredFood.slice(0, 5).map((food, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-50 hover:border-green-100 transition-colors cursor-pointer"
                     onClick={() => addFood({
                       id: Date.now().toString(),
                       name: food.name,
                       calories: food.calories,
                       protein: food.protein,
                       carbs: food.carbs,
                       fat: food.fat,
                       portion: food.portion,
                       feeling: 'satisfeita',
                       date: today,
                       mealType: 'lanche',
                       timestamp: Date.now(),
                       micronutrients: food.micronutrients
                     })}
                >
                   <div>
                     <h4 className="font-bold text-gray-800 text-sm">{food.name}</h4>
                     <p className="text-xs text-gray-400">{food.portion} • {food.calories} kcal</p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                     <Plus size={16} />
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- AI MODE --- */}
        {mode === 'ai' && (
           <div className="bg-white p-8 rounded-[30px] border-2 border-dashed border-gray-200 text-center flex flex-col items-center justify-center min-h-[300px] gap-6">
              {isAnalyzing ? (
                 <div className="flex flex-col items-center animate-fade-in">
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                    <p className="font-bold text-gray-700">Analisando sua foto...</p>
                    <p className="text-xs text-gray-400">Identificando calorias e nutrientes</p>
                 </div>
              ) : (
                <>
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-primary mb-2 mx-auto">
                    <Camera size={40} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Foto Inteligente</h3>
                    <p className="text-gray-400 text-xs px-8 mt-1">
                      Aponte a câmera para o prato ou envie uma foto da galeria. A IA identifica tudo para você!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <label className="bg-primary text-white px-6 py-4 rounded-xl font-bold text-sm shadow-lg shadow-green-200 cursor-pointer active:scale-95 transition-transform flex flex-col items-center justify-center gap-2">
                      <Camera size={24} />
                      Tirar Foto Agora
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        onChange={handleImageUpload} 
                      />
                    </label>

                    <label className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-bold text-sm shadow-sm cursor-pointer active:scale-95 transition-transform flex flex-col items-center justify-center gap-2 hover:bg-gray-50">
                      <ImageIcon size={24} />
                      Escolher da Galeria
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                      />
                    </label>
                  </div>
                </>
              )}
           </div>
        )}

        {/* --- BARCODE MODE --- */}
        {mode === 'barcode' && (
          <div className="space-y-4">
            <div className="bg-black rounded-[30px] h-80 relative overflow-hidden flex items-center justify-center shadow-lg">
               
               {permissionDenied ? (
                 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
                    <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-3">
                      <Camera size={24} />
                    </div>
                    <h4 className="font-bold mb-1">Acesso à câmera negado</h4>
                    <p className="text-xs text-gray-400 mb-4">Verifique as permissões do seu navegador para usar o scanner.</p>
                    <button 
                      onClick={() => setMode('search')}
                      className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold"
                    >
                      Voltar
                    </button>
                 </div>
               ) : (
                 <>
                   {/* Video Feed */}
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     className="absolute inset-0 w-full h-full object-cover"
                   />
                   
                   {/* Overlay Scanner UI */}
                   <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                      <div className="w-64 h-40 border-2 border-white/50 rounded-2xl relative">
                         <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1 rounded-tl-lg"></div>
                         <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1 rounded-tr-lg"></div>
                         <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1 rounded-bl-lg"></div>
                         <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1 rounded-br-lg"></div>
                         
                         {/* Scanning Laser */}
                         {!scannedProduct && !scanError && (
                            <div className="w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)] animate-pulse absolute top-1/2 -translate-y-1/2"></div>
                         )}
                      </div>
                      {!scannedProduct && !scanError && (
                         <p className="text-white text-xs font-bold mt-4 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                           Aponte para o código de barras
                         </p>
                      )}
                   </div>
    
                   {/* Simulated Action Trigger */}
                   {!scannedProduct && !scanError && (
                     <button 
                       onClick={simulateScan}
                       className="absolute bottom-6 z-20 bg-white/90 backdrop-blur text-gray-900 px-6 py-2 rounded-full text-xs font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2"
                     >
                       <ScanLine size={16} /> Simular Leitura
                     </button>
                   )}
    
                   {/* Result Card (Success) */}
                   {scannedProduct && (
                     <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-2xl shadow-2xl z-30 animate-slide-up">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                              <Check size={20} />
                           </div>
                           <div>
                              <h4 className="font-bold text-gray-800 text-sm">{scannedProduct.name}</h4>
                              <p className="text-xs text-gray-500">{scannedProduct.portion} • {scannedProduct.calories} kcal</p>
                           </div>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-400 mb-3 bg-gray-50 p-2 rounded-lg justify-between">
                           <span>P: {scannedProduct.protein}g</span>
                           <span>C: {scannedProduct.carbs}g</span>
                           <span>G: {scannedProduct.fat}g</span>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => setScannedProduct(null)} className="flex-1 py-2 text-gray-500 font-bold text-xs bg-gray-100 rounded-xl">Cancelar</button>
                           <button onClick={confirmScannedProduct} className="flex-1 py-2 bg-primary text-white font-bold text-xs rounded-xl shadow-lg shadow-green-200">Adicionar</button>
                        </div>
                     </div>
                   )}
    
                   {/* Error Card (Not Found) */}
                   {scanError && (
                     <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-2xl shadow-2xl z-30 animate-slide-up">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                              <AlertCircle size={20} />
                           </div>
                           <div>
                              <h4 className="font-bold text-gray-800 text-sm">Produto não encontrado</h4>
                              <p className="text-xs text-gray-500">O código não consta na base de dados.</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => setScanError(false)} className="flex-1 py-2 text-gray-500 font-bold text-xs bg-gray-100 rounded-xl">Tentar Novamente</button>
                           <button onClick={() => setMode('search')} className="flex-1 py-2 bg-gray-900 text-white font-bold text-xs rounded-xl">Adicionar Manualmente</button>
                        </div>
                     </div>
                   )}
                 </>
               )}
            </div>
            
            <div className="text-center px-6">
              <p className="text-xs text-gray-400">
                A câmera está ativa. Em um dispositivo real, a leitura seria automática.
                Use o botão "Simular" para testar o fluxo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Daily Log List */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider ml-2">Registros de Hoje</h3>
        {todaysLog.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-[20px] flex items-center justify-between shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                <Leaf size={18} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                <div className="flex gap-2 text-[10px] text-gray-400 font-medium">
                  <span>P: {item.protein}g</span>
                  <span>C: {item.carbs}g</span>
                  <span>G: {item.fat}g</span>
                </div>
              </div>
            </div>
            <span className="font-bold text-gray-800">{item.calories} <span className="text-xs font-normal text-gray-400">kcal</span></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodTracker;
