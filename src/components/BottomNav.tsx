import React from 'react';
import { Home, BookOpen, FolderKanban, Settings } from 'lucide-react';
import { triggerHaptic } from '../utils/promptUtils';

export type NavTab = 'home' | 'library' | 'categories' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  enableHaptics?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  enableHaptics = true,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: NavTab) => {
    if (tab !== activeTab) {
      triggerHaptic(enableHaptics, 15);
      onChangeTab(tab);
    }
  };

  return (
    <nav
      aria-label="Bottom navigation"
      className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-[390px]"
    >
      <div className="relative px-3 py-2 rounded-full bg-neutral-900/85 dark:bg-neutral-900/85 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 select-none cursor-pointer ${
                isActive ? 'text-cyan-300 font-semibold scale-105' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Liquid glass active background capsule */}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-cyan-500/15 border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.35)] -z-10 animate-in fade-in zoom-in-95 duration-200" />
              )}
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
