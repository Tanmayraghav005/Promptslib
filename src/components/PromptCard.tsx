import React, { useState } from 'react';
import { Copy, Check, Heart, Sparkles, Sliders, Paperclip } from 'lucide-react';
import { Prompt, Category } from '../types';
import { extractVariables, formatRelativeTime, copyToClipboard, triggerHaptic } from '../utils/promptUtils';
import { CategoryIcon } from './CategoryIcon';

interface PromptCardProps {
  prompt: Prompt;
  category?: Category;
  onSelect: (prompt: Prompt) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onCustomize: (prompt: Prompt, e: React.MouseEvent) => void;
  onCopySuccess: (title: string) => void;
  enableHaptics?: boolean;
  compact?: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  category,
  onSelect,
  onToggleFavorite,
  onCustomize,
  onCopySuccess,
  enableHaptics = true,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const variables = extractVariables(prompt.content);
  const hasVariables = variables.length > 0;
  const hasAttachments = prompt.attachments && prompt.attachments.length > 0;

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyToClipboard(prompt.content);
    if (ok) {
      triggerHaptic(enableHaptics, 25);
      setCopied(true);
      onCopySuccess(prompt.title);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCustomizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(enableHaptics, 15);
    onCustomize(prompt, e);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(enableHaptics, 20);
    onToggleFavorite(prompt.id, e);
  };

  if (compact) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(prompt)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(prompt);
          }
        }}
        className="group relative w-full p-3 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900/80 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {category && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: category.color || '#3b82f6' }}
              />
            )}
            <h3 className="font-semibold text-sm text-neutral-100 truncate group-hover:text-cyan-300 transition-colors">
              {prompt.title}
            </h3>
          </div>
          <p className="text-xs text-neutral-400 line-clamp-1">
            {prompt.description || prompt.content.slice(0, 80)}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasVariables && (
            <button
              onClick={handleCustomizeClick}
              className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-all text-xs flex items-center gap-1 cursor-pointer"
              title="Customize variables"
              aria-label="Customize variables"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopyClick}
            className={`p-2 rounded-xl transition-all duration-200 border cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-neutral-800/80 hover:bg-neutral-700/80 border-white/10 text-neutral-300 hover:text-white'
            }`}
            title="Copy prompt"
            aria-label="Copy prompt content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(prompt)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(prompt);
        }
      }}
      className="group relative w-full p-4 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 shadow-[0_4px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] transition-all duration-200 cursor-pointer text-left flex flex-col justify-between"
    >
      <div>
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {category ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-800/80 border border-white/10 text-neutral-300">
                <CategoryIcon name={category.iconName} color={category.color} className="w-3 h-3" />
                <span>{category.name}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-800/60 text-neutral-400">
                General
              </span>
            )}

            {hasVariables && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Sliders className="w-2.5 h-2.5" />
                <span>{variables.length} var{variables.length > 1 ? 's' : ''}</span>
              </span>
            )}

            {hasAttachments && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-800 text-neutral-400">
                <Paperclip className="w-2.5 h-2.5" />
                <span>{prompt.attachments.length}</span>
              </span>
            )}
          </div>

          <button
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              prompt.isFavorite
                ? 'text-rose-400 bg-rose-500/15'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60'
            }`}
            title={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={prompt.isFavorite ? 'Favorited' : 'Add favorite'}
          >
            <Heart className={`w-4 h-4 ${prompt.isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-neutral-100 group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
          {prompt.title}
        </h3>

        {/* Description or content snippet */}
        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-3">
          {prompt.description || prompt.content}
        </p>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {prompt.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800/80 text-neutral-400 border border-white/5"
              >
                #{tag}
              </span>
            ))}
            {prompt.tags.length > 3 && (
              <span className="text-[10px] text-neutral-500">+{prompt.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Card footer actions */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
        <span className="text-[11px]">
          Used {prompt.usageCount || 0}x • {formatRelativeTime(prompt.lastUsedAt || prompt.createdAt)}
        </span>

        <div className="flex items-center gap-1.5">
          {hasVariables && (
            <button
              onClick={handleCustomizeClick}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              title="Customize and Copy"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Customize</span>
            </button>
          )}

          <button
            onClick={handleCopyClick}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-neutral-800/90 hover:bg-neutral-700/90 border-white/10 text-neutral-200 hover:text-white'
            }`}
            title="Quick Copy prompt"
            aria-label="Quick Copy"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-neutral-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
