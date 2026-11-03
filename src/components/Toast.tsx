import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-4"
    >
      <div
        className={`px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-2xl backdrop-blur-2xl border text-sm font-medium ${
          isSuccess
            ? 'bg-neutral-900/90 dark:bg-neutral-900/90 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10'
            : isError
            ? 'bg-neutral-900/90 text-rose-300 border-rose-500/30 shadow-rose-500/10'
            : 'bg-neutral-900/90 text-cyan-300 border-cyan-500/30 shadow-cyan-500/10'
        }`}
      >
        {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {isError && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
        <span className="text-white font-medium tracking-tight text-xs sm:text-sm">{toast.text}</span>
      </div>
    </div>
  );
};
