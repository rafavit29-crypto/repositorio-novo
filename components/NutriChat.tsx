
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToNutri } from '../services/geminiService';

const NutriChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Olá! 👋 Sou sua inteligência nutricional. Estou aqui para te ajudar com dieta, treinos e saúde. Qual é o nosso foco hoje? 💪🍎',
      timestamp: Date.now()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await sendMessageToNutri(userMsg.text, messages);

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, modelMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in relative">
      {/* Header Info */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center p-2 mb-4">
         <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-600">NutriOnline • IA</span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-4 px-2 pt-12">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`flex max-w-[85%] gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white ${isUser ? 'bg-gray-200' : 'bg-gradient-to-tr from-primary to-emerald-600'}`}>
                  {isUser ? <User size={14} className="text-gray-500" /> : <Sparkles size={14} className="text-white" />}
                </div>
                <div>
                   <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isUser 
                        ? 'bg-white text-gray-700 rounded-tr-none border border-gray-100' 
                        : 'bg-primary text-white rounded-tl-none shadow-green-200'
                    }`}>
                      {msg.text}
                   </div>
                   <span className="text-[10px] text-gray-300 mt-1 block px-1 opacity-70">
                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </span>
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start animate-pulse">
             <div className="flex items-center gap-1 bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none ml-10">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-3 pb-2">
        <div className="bg-white p-2 rounded-[25px] shadow-lg border border-gray-100 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua dúvida..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700 placeholder-gray-400 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-all disabled:opacity-50 hover:bg-gray-800"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NutriChat;
