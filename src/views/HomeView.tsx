import React from 'react';
import {
  Search,
  Sparkles,
  Heart,
  Clock,
  Plus,
  Sliders,
  FolderKanban,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Prompt, Category } from '../types';
import { PromptCard } from '../components/PromptCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { triggerHaptic } from '../utils/promptUtils';

interface HomeViewProps {
  prompts: Prompt[];
  categories: Category[];
  onOpenPrompt: (prompt: Prompt) => void;
  onOpenCreate: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onCustomize: (prompt: Prompt, e: React.MouseEvent) => void;
  onCopySuccess: (title: string) => void;
  onNavigateToCategory: (categoryId: string) => void;
  onNavigateToLibrary: (initialQuery?: string) => void;
  enableHaptics?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  prompts,
  categories,
  onOpenPrompt,
  onOpenCreate,
  onToggleFavorite,
  onCustomize,
  onCopySuccess,
  onNavigateToCategory,
  onNavigateToLibrary,
  enableHaptics = true,
}) => {
  const favoritePrompts = prompts.filter((p) => p.isFavorite);
  const recentlyUsed = [...prompts]
    .filter((p) => p.lastUsedAt)
    .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0))
    .slice(0, 4);
  const recentlyAdded = [...prompts]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div className="flex-1 w-full overflow-y-auto pb-28 px-4 pt-3 space-y-6">
      {/* Liquid Glass Header */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-mono text-[11px] font-semibold uppercase tracking-widest">
              Prompt Vault
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Personal Library
          </h1>
        </div>

        {/* Quick stats capsule */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 text-xs text-neutral-300 shadow-sm">
          <span className="font-bold text-white">{prompts.length}</span>
          <span className="text-neutral-500 text-[11px]">Prompts</span>
          <span className="text-neutral-600">•</span>
          <span className="text-rose-400 font-semibold flex items-center gap-0.5">
            <Heart className="w-3 h-3 fill-rose-400" />
            {favoritePrompts.length}
          </span>
        </div>
      </header>

      {/* Prominent Search Bar (taps straight into library search) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          triggerHaptic(enableHaptics, 10);
          onNavigateToLibrary();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigateToLibrary();
          }
        }}
        className="w-full px-4 py-3 rounded-2xl bg-neutral-900/70 hover:bg-neutral-900/90 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 flex items-center justify-between text-neutral-400 text-xs sm:text-sm cursor-pointer shadow-lg transition-all"
      >
        <div className="flex items-center gap-2.5">
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Search prompts, tags, or content...</span>
        </div>
        <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] text-neutral-400 font-mono border border-white/5">
          Find
        </kbd>
      </div>

      {/* Empty State if no prompts exist */}
      {prompts.length === 0 && (
        <div className="p-8 rounded-3xl bg-neutral-900/60 backdrop-blur-xl border border-white/10 text-center space-y-4 my-6">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Your Prompt Vault is Empty</h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1 leading-relaxed">
              Capture your frequently used AI prompts, organize with dynamic variables, and copy them in one tap.
            </p>
          </div>
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Prompt</span>
          </button>
        </div>
      )}

      {/* Quick Access Favorites */}
      {favoritePrompts.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              Quick Favourites ({favoritePrompts.length})
            </h2>
            <button
              onClick={() => onNavigateToLibrary('filter:favorites')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 font-medium cursor-pointer"
            >
              <span>See all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {favoritePrompts.map((p) => {
              const cat = getCategory(p.categoryId);
              return (
                <div key={p.id} className="w-[280px] shrink-0">
                  <PromptCard
                    prompt={p}
                    category={cat}
                    onSelect={onOpenPrompt}
                    onToggleFavorite={onToggleFavorite}
                    onCustomize={onCustomize}
                    onCopySuccess={onCopySuccess}
                    enableHaptics={enableHaptics}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categories Horizontal Rail */}
      {categories.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
              Categories
            </h2>
            <span className="text-[11px] text-neutral-500">{categories.length} total</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categories.slice(0, 6).map((cat) => {
              const count = prompts.filter((p) => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    triggerHaptic(enableHaptics, 10);
                    onNavigateToCategory(cat.id);
                  }}
                  className="p-3 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900/80 backdrop-blur-md border border-white/5 hover:border-white/15 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                  >
                    <CategoryIcon name={cat.iconName} color={cat.color} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-200 group-hover:text-cyan-300 truncate transition-colors">
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-neutral-500">{count} prompt{count === 1 ? '' : 's'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently Used Prompts */}
      {recentlyUsed.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Recently Used
            </h2>
            <span className="text-[10px] text-neutral-500 font-mono">1-tap copy</span>
          </div>

          <div className="space-y-2">
            {recentlyUsed.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                category={getCategory(p.categoryId)}
                onSelect={onOpenPrompt}
                onToggleFavorite={onToggleFavorite}
                onCustomize={onCustomize}
                onCopySuccess={onCopySuccess}
                enableHaptics={enableHaptics}
                compact={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently Added Section */}
      {recentlyAdded.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Recently Added
            </h2>
            <button
              onClick={() => onNavigateToLibrary()}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 font-medium cursor-pointer"
            >
              <span>View Library</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentlyAdded.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                category={getCategory(p.categoryId)}
                onSelect={onOpenPrompt}
                onToggleFavorite={onToggleFavorite}
                onCustomize={onCustomize}
                onCopySuccess={onCopySuccess}
                enableHaptics={enableHaptics}
              />
            ))}
          </div>
        </section>
      )}

      {/* Floating Action Button (+ Prompt) */}
      <button
        onClick={() => {
          triggerHaptic(enableHaptics, 20);
          onOpenCreate();
        }}
        className="absolute bottom-20 right-4 z-20 p-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_8px_30px_rgba(6,182,212,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center border border-white/20"
        title="Add New Prompt"
        aria-label="Add New Prompt"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};
