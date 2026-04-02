import React from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts } = useAppContext();

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border min-w-[280px]",
              toast.type === 'success' ? "bg-emerald-600 border-emerald-500 text-white" :
              toast.type === 'error' ? "bg-red-600 border-red-500 text-white" :
              "bg-slate-900 border-slate-800 text-white"
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
            
            <p className="text-sm font-bold flex-1">{toast.message}</p>
            
            <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
