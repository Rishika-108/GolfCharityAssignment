"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`pointer-events-auto px-6 py-4 rounded-xl shadow-2xl min-w-[280px] max-w-md transform transition-all duration-300 animate-in slide-in-from-right fade-in flex items-center justify-between gap-4 border ${
              toast.type === 'error' 
                ? 'bg-red-50 border-red-100 text-red-800' 
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-100 text-amber-800'
                : 'bg-white border-emerald/10 text-emerald-950'
            }`}
          >
            <div className="flex items-center gap-3 font-medium">
               <span className="text-xl">
                 {toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : '✅'}
               </span>
               <p className="text-sm">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
