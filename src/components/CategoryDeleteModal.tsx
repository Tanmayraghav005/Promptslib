import React, { useState } from 'react';
import { X, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';
import { Category } from '../types';
import { triggerHaptic } from '../utils/promptUtils';

interface CategoryDeleteModalProps {
  category: Category | null;
  allCategories: Category[];
  affectedPromptCount: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (categoryId: string, reassignTargetId: string) => void;
  enableHaptics?: boolean;
}

export const CategoryDeleteModal: React.FC<CategoryDeleteModalProps> = ({
  category,
  allCategories,
  affectedPromptCount,
  isOpen,
  onClose,
  onConfirmDelete,
  enableHaptics = true,
}) => {
  const [targetCategoryId, setTargetCategoryId] = useState('uncategorized');

  if (!isOpen || !category) return null;

  const otherCategories = allCategories.filter((c) => c.id !== category.id);

  const handleConfirm = () => {
    triggerHaptic(enableHaptics, 30);
    onConfirmDelete(category.id, targetCategoryId);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full bg-neutral-900/95 backdrop-blur-2xl border-t border-white/20 rounded-t-[36px] p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 rounded-full bg-neutral-700 mx-auto mb-3 shrink-0" />

        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-rose-400">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Delete Category</h2>
              <p className="text-xs text-neutral-400">"{category.name}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-white/10 space-y-2 text-xs text-neutral-300">
            <p className="font-semibold text-white">
              Prompts will not be deleted!
            </p>
            <p>
              There {affectedPromptCount === 1 ? 'is' : 'are'}{' '}
              <strong className="text-cyan-300">{affectedPromptCount} prompt{affectedPromptCount === 1 ? '' : 's'}</strong>{' '}
              currently assigned to this category. Select where you want to move them:
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reassign-select" className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              Move affected prompts to:
            </label>
            <select
              id="reassign-select"
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-800 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="uncategorized">📁 General / Uncategorized</option>
              {otherCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Category</span>
          </button>
        </div>
      </div>
    </div>
  );
};
