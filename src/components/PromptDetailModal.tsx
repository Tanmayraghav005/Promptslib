import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Heart,
  Edit3,
  CopyPlus,
  Trash2,
  Share2,
  Sparkles,
  Paperclip,
  Clock,
  Download,
  Eye,
} from 'lucide-react';
import { Prompt, Category, Attachment } from '../types';
import {
  extractVariables,
  formatRelativeTime,
  formatFileSize,
  copyToClipboard,
  triggerHaptic,
} from '../utils/promptUtils';
import { CategoryIcon } from './CategoryIcon';

interface PromptDetailModalProps {
  prompt: Prompt | null;
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (prompt: Prompt) => void;
  onDuplicate: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCustomize: (prompt: Prompt) => void;
  onCopySuccess: (title: string) => void;
  onViewAttachment: (att: Attachment) => void;
  enableHaptics?: boolean;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  prompt,
  category,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onCustomize,
  onCopySuccess,
  onViewAttachment,
  enableHaptics = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !prompt) return null;

  const variables = extractVariables(prompt.content);
  const hasVariables = variables.length > 0;

  const handleCopy = async () => {
    const ok = await copyToClipboard(prompt.content);
    if (ok) {
      triggerHaptic(enableHaptics, 25);
      setCopied(true);
      onCopySuccess(prompt.title);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    triggerHaptic(enableHaptics, 15);
    if (navigator.share) {
      try {
        await navigator.share({
          title: prompt.title,
          text: prompt.content,
        });
        return;
      } catch (_e) {
        // Fallback
      }
    }
    await handleCopy();
  };

  const handleDeletePrompt = () => {
    triggerHaptic(enableHaptics, 25);
    onDelete(prompt.id);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-h-[92%] bg-neutral-900/95 backdrop-blur-2xl border-t border-white/15 rounded-t-[36px] p-5 shadow-[0_-15px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Android drag bar */}
        <div className="w-12 h-1.5 rounded-full bg-neutral-700/80 mx-auto mb-3 shrink-0" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {category ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800/80 border border-white/10 text-neutral-200">
                <CategoryIcon name={category.iconName} color={category.color} className="w-3.5 h-3.5" />
                <span>{category.name}</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-800/60 text-neutral-400">
                Uncategorized
              </span>
            )}

            {hasVariables && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {variables.length} Dynamic Variable{variables.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(prompt.id)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                prompt.isFavorite
                  ? 'text-rose-400 bg-rose-500/20'
                  : 'text-neutral-400 hover:text-white bg-neutral-800'
              }`}
              title="Toggle favorite"
            >
              <Heart className={`w-4 h-4 ${prompt.isFavorite ? 'fill-rose-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close sheet"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Title & Description */}
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight mb-1.5">
              {prompt.title}
            </h1>
            {prompt.description && (
              <p className="text-sm text-neutral-400 leading-relaxed">
                {prompt.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {prompt.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 rounded-lg bg-neutral-800/80 text-neutral-300 border border-white/5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Prompt Body Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
              <span>PROMPT CONTENT</span>
              <span>{prompt.content.length} characters</span>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-950/90 border border-white/10 font-sans text-xs sm:text-sm text-neutral-100 leading-relaxed whitespace-pre-wrap select-text max-h-72 overflow-y-auto shadow-inner">
              {/* Highlight variables */}
              {prompt.content.split(/(\{\{[^}]+\}\})/).map((chunk, i) => {
                if (chunk.startsWith('{{') && chunk.endsWith('}}')) {
                  return (
                    <mark
                      key={i}
                      className="bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 px-1 py-0.5 rounded font-mono font-semibold"
                    >
                      {chunk}
                    </mark>
                  );
                }
                return <span key={i}>{chunk}</span>;
              })}
            </div>
          </div>

          {/* Attachments Section */}
          {prompt.attachments && prompt.attachments.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                Attachments ({prompt.attachments.length})
              </span>
              <div className="grid grid-cols-2 gap-2">
                {prompt.attachments.map((att) => {
                  const isImage = att.type.startsWith('image/');
                  return (
                    <div
                      key={att.id}
                      onClick={() => onViewAttachment(att)}
                      className="group relative p-2.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isImage ? (
                        <img
                          src={att.dataUrl}
                          alt={att.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-900 border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-cyan-400">
                          <Download className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{att.name}</p>
                        <p className="text-[10px] text-neutral-400">{formatFileSize(att.size)}</p>
                      </div>
                      <Eye className="w-4 h-4 text-neutral-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata info */}
          <div className="flex items-center gap-3 text-xs text-neutral-500 pt-2 border-t border-white/5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Used {prompt.usageCount || 0} times
            </span>
            <span>•</span>
            <span>Last used: {formatRelativeTime(prompt.lastUsedAt || prompt.createdAt)}</span>
          </div>
        </div>

        {/* Delete confirmation banner if clicked */}
        {confirmDelete && (
          <div className="p-3 mb-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs text-rose-300">
            <span>Are you sure you want to delete this prompt?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePrompt}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-col gap-2 shrink-0">
          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            {hasVariables && (
              <button
                onClick={() => {
                  triggerHaptic(enableHaptics, 20);
                  onCustomize(prompt);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.15)] active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Customize & Copy</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg active:scale-98 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Action Icons Row */}
          <div className="flex items-center justify-around py-1 text-xs text-neutral-400">
            <button
              onClick={() => {
                triggerHaptic(enableHaptics, 15);
                onEdit(prompt);
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(enableHaptics, 15);
                onDuplicate(prompt);
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <CopyPlus className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
