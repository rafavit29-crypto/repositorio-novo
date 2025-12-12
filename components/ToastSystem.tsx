
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface ToastSystemProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastSystem: React.FC<ToastSystemProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md shadow-lg shadow-gray-200 border border-gray-100 p-4 rounded-2xl flex items-center gap-3 animate-slide-up w-full max-w-sm"
        >
          <div className={`p-2 rounded-full ${
            toast.type === 'success' ? 'bg-green-100 text-green-600' :
            toast.type === 'warning' ? 'bg-orange-100 text-orange-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> :
             toast.type === 'warning' ? <AlertCircle size={18} /> :
             <Info size={18} />}
          </div>
          <p className="flex-1 text-sm font-medium text-gray-700 leading-tight">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastSystem;
