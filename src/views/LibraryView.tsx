import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Heart,
  Plus,
  Tag,
  ArrowUpDown,
} from 'lucide-react';
import { Prompt, Category, AppSettings } from '../types';
import { searchPrompts, sortPrompts, triggerHaptic } from '../utils/promptUtils';
import { PromptCard } from '../components/PromptCard';
import { CategoryIcon } from '../components/CategoryIcon';

interface LibraryViewProps {
  prompts: Prompt[];
  categories: Category[];
  initialCategory?: string;
  initialQuery?: string;
  onOpenPrompt: (prompt: Prompt) => void;
  onOpenCreate: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onCustomize: (prompt: Prompt, e: React.MouseEvent) => void;
  onCopySuccess: (title: string) => void;
  enableHaptics?: boolean;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  prompts,
  categories,
  initialCategory = 'all',
  initialQuery = '',
  onOpenPrompt,
  onOpenCreate,
  onToggleFavorite,
  onCustomize,
  onCopySuccess,
  enableHaptics = true,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(initialQuery === 'filter:favorites');
  const [sortBy, setSortBy] = useState<AppSettings['sortBy']>('recent_added');
  const [isCompact, setIsCompact] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Extract all unique tags across prompts
  const allTags = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    const searchFiltered = searchPrompts(
      prompts,
      query === 'filter:favorites' ? '' : query,
      selectedCategory,
      selectedTag || undefined,
      onlyFavorites
    );
    return sortPrompts(searchFiltered, sortBy);
  }, [prompts, query, selectedCategory, selectedTag, onlyFavorites, sortBy]);

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div className="flex-1 w-full overflow-y-auto pb-28 px-4 pt-3 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Prompt Library</h1>
          <p className="text-xs text-neutral-400">
            {filteredPrompts.length} of {prompts.length} prompt{prompts.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <button
            onClick={() => {
              triggerHaptic(enableHaptics, 10);
              setIsCompact(!isCompact);
            }}
            className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/10 transition-colors cursor-pointer"
            title={isCompact ? 'Switch to Card view' : 'Switch to Compact view'}
            aria-label="Toggle view style"
          >
            {isCompact ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>

          {/* Filter disclosure toggle */}
          <button
            onClick={() => {
              triggerHaptic(enableHaptics, 10);
              setShowFilters(!showFilters);
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer border ${
              showFilters || selectedTag || onlyFavorites || selectedCategory !== 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
                : 'bg-neutral-900/80 text-neutral-300 border-white/10'
            }`}
            title="Filter options"
            aria-label="Filter options"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Instant Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
        <input
          type="text"
          value={query === 'filter:favorites' ? '' : query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, tag, or prompt keywords..."
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        />
        {query && query !== 'filter:favorites' && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Horizontal Filter Pills Rail */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        <button
          onClick={() => {
            triggerHaptic(enableHaptics, 10);
            setSelectedCategory('all');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-cyan-500 text-neutral-950 font-bold shadow-sm shadow-cyan-500/30'
              : 'bg-neutral-900/70 hover:bg-neutral-800 text-neutral-400 border border-white/5'
          }`}
        >
          All ({prompts.length})
        </button>

        <button
          onClick={() => {
            triggerHaptic(enableHaptics, 10);
            setOnlyFavorites(!onlyFavorites);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
            onlyFavorites
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
              : 'bg-neutral-900/70 hover:bg-neutral-800 text-neutral-400 border border-white/5'
          }`}
        >
          <Heart className={`w-3 h-3 ${onlyFavorites ? 'fill-white' : 'text-rose-400'}`} />
          <span>Favourites</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = prompts.filter((p) => p.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic(enableHaptics, 10);
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-100 text-neutral-950 shadow-md font-bold'
                  : 'bg-neutral-900/70 hover:bg-neutral-800 text-neutral-400 border border-white/5'
              }`}
            >
              <CategoryIcon name={cat.iconName} color={isSelected ? '#090d16' : cat.color} className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Extended Filters & Sort Drawer */}
      {showFilters && (
        <div className="p-3.5 rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              Sort By
            </span>
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'recent_added', label: 'Recent' },
                  { id: 'recent_used', label: 'Last Used' },
                  { id: 'most_used', label: 'Most Used' },
                  { id: 'alphabetical', label: 'A-Z' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    sortBy === opt.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags list if available */}
          {allTags.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Filter by Tag
                </span>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag('')}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Clear tag filter
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-cyan-500 text-neutral-950 font-bold'
                        : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prompts List / Grid */}
      {filteredPrompts.length > 0 ? (
        <div className={`space-y-3 ${isCompact ? 'space-y-2' : ''}`}>
          {filteredPrompts.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              category={getCategory(p.categoryId)}
              onSelect={onOpenPrompt}
              onToggleFavorite={onToggleFavorite}
              onCustomize={onCustomize}
              onCopySuccess={onCopySuccess}
              enableHaptics={enableHaptics}
              compact={isCompact}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-500 mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No Matching Prompts Found</h3>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Try adjusting your search keywords, clearing active tag filters, or select "All" categories.
          </p>
          {(query || selectedTag || onlyFavorites || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
                setSelectedTag('');
                setOnlyFavorites(false);
              }}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-cyan-300 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* Floating Action Button */}
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
