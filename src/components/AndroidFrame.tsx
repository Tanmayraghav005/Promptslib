import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-start overflow-hidden relative">
      {/* Top desktop banner with device frame toggle */}
      <header className="hidden lg:flex w-full items-center justify-between px-6 py-2.5 bg-neutral-900/60 backdrop-blur-xl border-b border-white/5 z-30 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-neutral-200">Android APK Preview Mode</span>
          <span className="text-neutral-500 font-mono text-[11px]">(IndexedDB Persistent • Liquid Glass UI)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-200 border border-white/10 transition-all text-xs font-medium cursor-pointer"
            title={isPhoneFrame ? 'Expand to Full Window' : 'Switch to Android Shell'}
          >
            {isPhoneFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Screen View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Android Shell View</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div
        className={`w-full flex-1 flex items-center justify-center ${
          isPhoneFrame ? 'lg:py-6 lg:px-4' : 'p-0'
        }`}
      >
        <div
          className={`relative w-full flex flex-col overflow-hidden bg-neutral-950 text-neutral-100 ${
            isPhoneFrame
              ? 'lg:max-w-[430px] lg:h-[890px] lg:rounded-[44px] lg:border-[10px] lg:border-neutral-800 lg:shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)]'
              : 'h-full min-h-screen'
          }`}
        >
          {/* Android Status Bar */}
          <div className="h-10 w-full px-7 flex items-center justify-between text-[13px] font-medium text-neutral-300 select-none z-40 bg-neutral-950/70 backdrop-blur-md shrink-0">
            <span className="font-semibold tracking-tight">{currentTime}</span>

            {/* Android Camera Hole (visible in phone shell) */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-800/80 shadow-inner hidden lg:block" />

            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-mono text-neutral-400">5G</span>
              </div>
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Applet content area */}
          <div className="flex-1 w-full flex flex-col overflow-hidden relative">
            {children}
          </div>

          {/* Android Gesture Navigation Bar */}
          <div className="h-4 w-full flex items-center justify-center bg-neutral-950/80 backdrop-blur-md pb-1 shrink-0 z-40">
            <div className="w-28 h-1 rounded-full bg-neutral-600/70" />
          </div>
        </div>
      </div>
    </div>
  );
};
