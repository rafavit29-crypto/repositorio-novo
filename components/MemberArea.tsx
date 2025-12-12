
import React, { useState, useRef } from 'react';
import { PlayCircle, MessageSquare, ChevronRight, Upload, X, Image as ImageIcon, Film, Check } from 'lucide-react';

interface VideoClass {
  id: string;
  title: string;
  duration: string;
  author: string;
  thumbnail: string;
  videoUrl?: string; // Blob URL for uploaded videos
  type: 'youtube' | 'upload';
}

const INITIAL_VIDEOS: VideoClass[] = [
  { 
    id: '1', 
    title: "Aula 01: O Segredo do Metabolismo", 
    duration: "12:00", 
    author: "Nutri Ana", 
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    type: 'youtube'
  },
  { 
    id: '2', 
    title: "Aula 02: Treino de Glúteos em Casa", 
    duration: "15:30", 
    author: "Coach Bia", 
    thumbnail: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
    type: 'youtube'
  }
];

const MemberArea: React.FC = () => {
  const [videos, setVideos] = useState<VideoClass[]>(INITIAL_VIDEOS);
  const [activeVideo, setActiveVideo] = useState<VideoClass | null>(null);
  
  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadThumb, setUploadThumb] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadThumb(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePublish = () => {
    if (!uploadTitle || !uploadFile) return;

    setIsUploading(true);

    // Simula tempo de upload
    setTimeout(() => {
      const newVideo: VideoClass = {
        id: Date.now().toString(),
        title: uploadTitle,
        duration: "Nova", // Em um app real, leríamos metadata do vídeo
        author: "Você",
        thumbnail: uploadThumb || "https://images.unsplash.com/photo-1626245347206-a94aa6373b37?w=800&q=80", // Fallback image
        videoUrl: URL.createObjectURL(uploadFile),
        type: 'upload'
      };

      setVideos([newVideo, ...videos]);
      
      // Reset
      setUploadTitle('');
      setUploadFile(null);
      setUploadThumb(null);
      setIsUploading(false);
      setIsUploadModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Header Area */}
      {!activeVideo && (
        <header className="relative bg-primary text-white -mx-5 -mt-6 p-10 rounded-b-[40px] shadow-lg shadow-pink-200 overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-900 opacity-20 rounded-full -ml-10 -mb-5 blur-xl"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold mb-1">Calorix TV 📺</h1>
            <p className="text-pink-100 text-sm font-medium opacity-90 mb-6">Conteúdo exclusivo para sua evolução.</p>
            
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
            >
              <Upload size={18} /> Carregar Nova Aula
            </button>
          </div>
        </header>
      )}

      {/* Video Player Section */}
      {activeVideo && (
        <div className="bg-black rounded-[24px] overflow-hidden shadow-2xl animate-slide-up sticky top-4 z-20 mb-6">
           <div className="aspect-video w-full relative bg-gray-900 flex items-center justify-center">
             {activeVideo.type === 'upload' && activeVideo.videoUrl ? (
               <video controls autoPlay className="w-full h-full">
                 <source src={activeVideo.videoUrl} type="video/mp4" />
                 Seu navegador não suporta vídeos.
               </video>
             ) : (
               <div className="text-white flex flex-col items-center">
                  <PlayCircle size={48} className="opacity-50" />
                  <p className="text-xs mt-2 opacity-50">Simulação de Player YouTube</p>
               </div>
             )}
             
             <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm z-30"
              >
                <X size={20} />
              </button>
           </div>
           <div className="p-5 bg-white border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">{activeVideo.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                 <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {activeVideo.author.charAt(0)}
                 </div>
                 <p className="text-sm text-gray-500">Postado por <span className="font-bold text-gray-700">{activeVideo.author}</span></p>
              </div>
           </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUploading && setIsUploadModalOpen(false)}></div>
          
          <div className="bg-white w-full max-w-lg rounded-[30px] shadow-2xl relative z-10 animate-slide-up flex flex-col max-h-[90vh]">
             <div className="p-6 border-b border-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                 <Upload className="text-primary" /> Carregar Aula
               </h3>
               {!isUploading && (
                 <button onClick={() => setIsUploadModalOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                   <X size={20} className="text-gray-500" />
                 </button>
               )}
             </div>

             <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                     <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                     <p className="font-bold text-gray-700">Enviando vídeo...</p>
                     <p className="text-xs text-gray-400">Isso pode levar alguns segundos.</p>
                  </div>
                ) : (
                  <>
                    {/* Title Input */}
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase">Título da Aula</label>
                       <input 
                         value={uploadTitle}
                         onChange={e => setUploadTitle(e.target.value)}
                         placeholder="Ex: Treino Intenso de Pernas"
                         className="w-full bg-gray-50 p-4 rounded-xl font-medium outline-none focus:ring-2 ring-primary/20 transition-all"
                       />
                    </div>

                    {/* Video File Input */}
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase">Arquivo de Vídeo</label>
                       <label className={`
                          border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all
                          ${uploadFile ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}
                       `}>
                          <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                          {uploadFile ? (
                            <>
                              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mb-2">
                                <Check size={24} />
                              </div>
                              <p className="text-sm font-bold text-primary">{uploadFile.name}</p>
                              <p className="text-xs text-gray-400">{(uploadFile.size / (1024*1024)).toFixed(1)} MB</p>
                            </>
                          ) : (
                            <>
                              <Film size={32} className="text-gray-300 mb-2" />
                              <p className="text-sm font-bold text-gray-600">Selecione o vídeo</p>
                              <p className="text-xs text-gray-400">MP4, MOV (Max 500MB)</p>
                            </>
                          )}
                       </label>
                    </div>

                    {/* Thumbnail Input */}
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase">Capa (Thumbnail)</label>
                       <label className="flex items-center gap-4 cursor-pointer bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-all">
                          <input type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
                          <div className="w-16 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                             {uploadThumb ? (
                               <img src={uploadThumb} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={16} /></div>
                             )}
                          </div>
                          <div className="flex-1">
                             <p className="text-sm font-bold text-gray-700">{uploadThumb ? 'Imagem selecionada' : 'Adicionar Capa'}</p>
                             <p className="text-xs text-gray-400">Recomendado: 1280x720</p>
                          </div>
                       </label>
                    </div>
                  </>
                )}
             </div>

             {!isUploading && (
               <div className="p-6 pt-2 border-t border-gray-50">
                  <button 
                    onClick={handlePublish}
                    disabled={!uploadTitle || !uploadFile}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-all"
                  >
                    Publicar Aula
                  </button>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Video List */}
      <div className="px-1">
        <h3 className="font-bold text-gray-800 ml-2 mb-4 flex items-center gap-2">
          <PlayCircle size={18} className="text-primary" /> Aulas Disponíveis
        </h3>
        
        <div className="space-y-4">
          {videos.map((vid) => (
            <div 
              key={vid.id} 
              onClick={() => setActiveVideo(vid)}
              className={`
                bg-white p-3 rounded-[20px] shadow-sm border border-gray-50 flex items-center gap-4 cursor-pointer group transition-all
                ${activeVideo?.id === vid.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-gray-200 hover:shadow-md'}
              `}
            >
              <div className="relative w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                 {vid.thumbnail ? (
                   <img src={vid.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="thumbnail" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white"><PlayCircle /></div>
                 )}
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                 {/* Play Icon Overlay */}
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                       <PlayCircle className="text-white" size={24} fill="currentColor" />
                    </div>
                 </div>
                 <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 rounded">
                   {vid.duration}
                 </div>
              </div>
              
              <div className="flex-1 min-w-0 py-1">
                <h3 className="font-bold text-sm text-gray-800 truncate group-hover:text-primary transition-colors">{vid.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[8px] font-bold text-gray-500">
                      {vid.author.charAt(0)}
                   </div>
                   <p className="text-xs text-gray-400">Por {vid.author}</p>
                </div>
              </div>
              
              <div className="pr-2">
                 <ChevronRight size={18} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Q&A Section */}
      <div className="bg-white p-6 rounded-[30px] mt-8 shadow-sm border border-pink-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full -mr-2 -mt-2"></div>
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 relative z-10">
          <div className="bg-purple-100 p-1.5 rounded-lg">
             <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
          Dúvidas da Comunidade
        </h3>
        <div className="space-y-5 relative z-10">
           <div className="text-sm">
             <div className="flex items-center gap-2 mb-1">
               <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">M</div>
               <p className="font-bold text-gray-700">Mariana Silva</p>
             </div>
             <p className="text-gray-500 bg-gray-50 p-3 rounded-xl rounded-tl-none">Amei a aula sobre metabolismo! Posso aplicar fazendo Low Carb?</p>
             <div className="flex items-center gap-2 mt-2 ml-4">
                <div className="w-1 h-8 border-l-2 border-gray-200"></div>
                <p className="text-primary text-xs font-medium bg-pink-50 px-3 py-2 rounded-xl">Resposta: Com certeza, Mari! Assista a aula 05...</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MemberArea;
