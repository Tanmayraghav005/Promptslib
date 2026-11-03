import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Sliders,
  Folder,
} from 'lucide-react';
import { Prompt, Category } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import { PromptCard } from '../components/PromptCard';
import { triggerHaptic } from '../utils/promptUtils';

interface CategoriesViewProps {
  categories: Category[];
  prompts: Prompt[];
  onOpenCreateCategory: () => void;
  onEditCategory: (category: Category) => void;
  onRequestDeleteCategory: (category: Category) => void;
  onOpenPrompt: (prompt: Prompt) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onCustomize: (prompt: Prompt, e: React.MouseEvent) => void;
  onCopySuccess: (title: string) => void;
  enableHaptics?: boolean;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  prompts,
  onOpenCreateCategory,
  onEditCategory,
  onRequestDeleteCategory,
  onOpenPrompt,
  onToggleFavorite,
  onCustomize,
  onCopySuccess,
  enableHaptics = true,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCatId);
  const isUncategorizedSelected = selectedCatId === 'uncategorized';

  // Calculate uncategorized prompt count
  const uncategorizedCount = prompts.filter(
    (p) => !p.categoryId || p.categoryId === 'uncategorized'
  ).length;

  const categoryPrompts = selectedCatId
    ? prompts.filter((p) => {
        if (selectedCatId === 'uncategorized') {
          return !p.categoryId || p.categoryId === 'uncategorized';
        }
        return p.categoryId === selectedCatId;
      })
    : [];

  const handleSelectCategory = (catId: string) => {
    triggerHaptic(enableHaptics, 10);
    setSelectedCatId(catId);
  };

  const handleBackToList = () => {
    triggerHaptic(enableHaptics, 10);
    setSelectedCatId(null);
  };

  // If viewing prompts inside a selected category
  if (selectedCatId) {
    const title = isUncategorizedSelected
      ? 'General / Uncategorized'
      : selectedCategory?.name || 'Category';
    const color = isUncategorizedSelected ? '#64748b' : selectedCategory?.color || '#3b82f6';
    const iconName = isUncategorizedSelected ? 'Folder' : selectedCategory?.iconName || 'Folder';

    return (
      <div className="flex-1 w-full overflow-y-auto pb-28 px-4 pt-3 space-y-4">
        {/* Detail Header */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>All Categories</span>
          </button>

          {!isUncategorizedSelected && selectedCategory && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onEditCategory(selectedCategory)}
                className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-white/10 cursor-pointer"
                title="Edit category"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onRequestDeleteCategory(selectedCategory)}
                className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 cursor-pointer"
                title="Delete category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Category Hero Capsule */}
        <div className="p-4 rounded-3xl bg-neutral-900/70 backdrop-blur-xl border border-white/10 flex items-center gap-3.5 shadow-lg">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
            style={{ backgroundColor: `${color}25`, color }}
          >
            <CategoryIcon name={iconName} color={color} className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">{title}</h2>
            <p className="text-xs text-neutral-400">
              {categoryPrompts.length} prompt{categoryPrompts.length === 1 ? '' : 's'} assigned
            </p>
          </div>
        </div>

        {/* Prompts list in this category */}
        {categoryPrompts.length > 0 ? (
          <div className="space-y-3">
            {categoryPrompts.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                category={selectedCategory}
                onSelect={onOpenPrompt}
                onToggleFavorite={onToggleFavorite}
                onCustomize={onCustomize}
                onCopySuccess={onCopySuccess}
                enableHaptics={enableHaptics}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-500 mx-auto">
              <Folder className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">No Prompts in this Category</p>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Assign existing prompts to this category or create a new one.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 w-full overflow-y-auto pb-28 px-4 pt-3 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Categories</h1>
          <p className="text-xs text-neutral-400">{categories.length + 1} total categories</p>
        </div>

        <button
          onClick={() => {
            triggerHaptic(enableHaptics, 20);
            onOpenCreateCategory();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Category</span>
        </button>
      </header>

      {/* Category List */}
      <div className="space-y-2.5">
        {/* Uncategorized system bucket */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelectCategory('uncategorized')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelectCategory('uncategorized');
            }
          }}
          className="p-3.5 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-100 group-hover:text-cyan-300 transition-colors">
                General / Uncategorized
              </p>
              <p className="text-xs text-neutral-500">
                {uncategorizedCount} prompt{uncategorizedCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
        </div>

        {/* Custom Categories */}
        {categories.map((cat) => {
          const count = prompts.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectCategory(cat.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectCategory(cat.id);
                }
              }}
              className="p-3.5 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900/90 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                >
                  <CategoryIcon name={cat.iconName} color={cat.color} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-100 group-hover:text-cyan-300 truncate transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-neutral-500">{count} prompt{count === 1 ? '' : 's'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic(enableHaptics, 15);
                    onEditCategory(cat);
                  }}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Edit category"
                  aria-label="Edit category"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic(enableHaptics, 15);
                    onRequestDeleteCategory(cat);
                  }}
                  className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Delete category"
                  aria-label="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors ml-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
