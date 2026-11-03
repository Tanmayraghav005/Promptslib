import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Save, AlertCircle } from 'lucide-react';
import { Category } from '../types';
import { ICON_OPTIONS, COLOR_OPTIONS, CategoryIcon } from './CategoryIcon';
import { triggerHaptic } from '../utils/promptUtils';

interface CategoryEditorModalProps {
  initialCategory?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  enableHaptics?: boolean;
}

export const CategoryEditorModal: React.FC<CategoryEditorModalProps> = ({
  initialCategory,
  isOpen,
  onClose,
  onSave,
  enableHaptics = true,
}) => {
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('Folder');
  const [color, setColor] = useState('#06b6d4');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setIconName(initialCategory.iconName || 'Folder');
      setColor(initialCategory.color || '#06b6d4');
    } else {
      setName('');
      setIconName('Folder');
      setColor('#06b6d4');
    }
    setError('');
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please provide a category name.');
      return;
    }
    triggerHaptic(enableHaptics, 20);

    const record: Category = {
      id: initialCategory ? initialCategory.id : `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      iconName,
      color,
      order: initialCategory ? initialCategory.order : Date.now(),
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-h-[90%] bg-neutral-900/95 backdrop-blur-2xl border-t border-white/20 rounded-t-[36px] p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 rounded-full bg-neutral-700 mx-auto mb-3 shrink-0" />

        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-xl text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              <CategoryIcon name={iconName} className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <p className="text-xs text-neutral-400">Organize your prompt collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="cat-name-input" className="text-xs font-semibold text-neutral-300">Category Name *</label>
            <input
              id="cat-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 3D & Spatial Audio"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-800/80 border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-300">Category Accent Color</span>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    triggerHaptic(enableHaptics, 10);
                    setColor(c);
                  }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative ${
                    color === c ? 'scale-120 ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-300">Category Icon</span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {ICON_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = iconName.toLowerCase() === opt.name.toLowerCase();
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => {
                      triggerHaptic(enableHaptics, 10);
                      setIconName(opt.name);
                    }}
                    className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                        : 'bg-neutral-800/50 hover:bg-neutral-800 border-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-[10px] truncate max-w-full">{opt.label}</span>
                  </button>
                );
              })}
            </div>
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
            onClick={handleSave}
            className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Category</span>
          </button>
        </div>
      </div>
    </div>
  );
};
