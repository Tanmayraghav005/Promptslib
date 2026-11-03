import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Save,
  Plus,
  Paperclip,
  Trash2,
  Tag,
  Sliders,
  FileText,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { Prompt, Category, Attachment, AppSettings } from '../types';
import { triggerHaptic, formatFileSize } from '../utils/promptUtils';
import { CategoryIcon } from './CategoryIcon';
import { AiAssistantModal } from './AiAssistantModal';

interface PromptEditorModalProps {
  initialPrompt?: Prompt | null;
  categories: Category[];
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
  enableHaptics?: boolean;
}

export const PromptEditorModal: React.FC<PromptEditorModalProps> = ({
  initialPrompt,
  categories,
  settings,
  isOpen,
  onClose,
  onSave,
  enableHaptics = true,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [validationError, setValidationError] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setTitle(initialPrompt.title);
      setDescription(initialPrompt.description || '');
      setContent(initialPrompt.content);
      setCategoryId(initialPrompt.categoryId || '');
      setTags([...initialPrompt.tags]);
      setAttachments([...(initialPrompt.attachments || [])]);
    } else {
      setTitle('');
      setDescription('');
      setContent('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setTags([]);
      setAttachments([]);
    }
    setValidationError('');
  }, [initialPrompt, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleInsertPlaceholder = (placeholder: string) => {
    triggerHaptic(enableHaptics, 10);
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + ` {{${placeholder}}}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textToInsert = `{{${placeholder}}}`;
    const newContent = content.substring(0, start) + textToInsert + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Limit file size to 8MB each for IndexedDB stability
      if (file.size > 8 * 1024 * 1024) {
        setValidationError(`File "${file.name}" exceeds 8MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const newAtt: Attachment = {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            dataUrl,
            createdAt: Date.now(),
          };
          setAttachments((prev) => [...prev, newAtt]);
          triggerHaptic(enableHaptics, 15);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments(attachments.filter((a) => a.id !== attId));
  };

  const handleSave = () => {
    if (!title.trim()) {
      setValidationError('Please provide a prompt title.');
      return;
    }
    if (!content.trim()) {
      setValidationError('Please provide the prompt content.');
      return;
    }

    triggerHaptic(enableHaptics, 25);

    const now = Date.now();
    const promptRecord: Prompt = {
      id: initialPrompt ? initialPrompt.id : `prompt-${now}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      categoryId: categoryId || 'uncategorized',
      tags,
      isFavorite: initialPrompt ? initialPrompt.isFavorite : false,
      usageCount: initialPrompt ? initialPrompt.usageCount : 0,
      lastUsedAt: initialPrompt ? initialPrompt.lastUsedAt : undefined,
      createdAt: initialPrompt ? initialPrompt.createdAt : now,
      updatedAt: now,
      attachments,
    };

    onSave(promptRecord);
    onClose();
  };

  return (
    <>
      <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-h-[94%] bg-neutral-900/95 backdrop-blur-2xl border-t border-white/20 rounded-t-[36px] p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          {/* Android drag bar */}
          <div className="w-12 h-1.5 rounded-full bg-neutral-700 mx-auto mb-3 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialPrompt ? 'Edit Prompt' : 'Create New Prompt'}
              </h2>
              <p className="text-xs text-neutral-400">Save to your offline personal vault</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error Banner */}
          {validationError && (
            <div className="mt-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Scrollable Form Fields */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
            {/* Title */}
            <div className="space-y-1">
              <label htmlFor="prompt-title" className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>Prompt Title *</span>
                <span className="text-[10px] text-neutral-500">{title.length}/80</span>
              </label>
              <input
                id="prompt-title"
                type="text"
                maxLength={80}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="e.g. YouTube High-CTR Thumbnail Concept"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-800/80 border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label htmlFor="prompt-desc" className="text-xs font-semibold text-neutral-300">
                Short Description (Optional)
              </label>
              <input
                id="prompt-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary or use case note..."
                className="w-full px-3.5 py-2 rounded-2xl bg-neutral-800/80 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label htmlFor="prompt-category" className="text-xs font-semibold text-neutral-300">
                Category
              </label>
              <select
                id="prompt-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-800/80 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
              >
                <option value="uncategorized">📁 General / Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Input */}
            <div className="space-y-1.5">
              <label htmlFor="prompt-tags" className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-neutral-400" />
                  Tags
                </span>
                <span className="text-[10px] text-neutral-500">Press Enter or + to add</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="prompt-tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g. Midjourney, Cinematic..."
                  className="flex-1 px-3.5 py-2 rounded-2xl bg-neutral-800/80 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="p-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-cyan-400 border border-white/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 text-xs text-neutral-300 border border-white/10"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-400 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Prompt Content Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="prompt-content" className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Prompt Content *</span>
                </label>

                {/* AI Assistant button */}
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>AI Assistant</span>
                </button>
              </div>

              {/* Dynamic variable insertion helper toolbar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-[11px]">
                <span className="text-neutral-500 shrink-0 flex items-center gap-1">
                  <Sliders className="w-3 h-3" />
                  Insert:
                </span>
                {['ROLE', 'TOPIC', 'STYLE', 'OUTPUT_FORMAT', 'AUDIENCE', 'TONE'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleInsertPlaceholder(v)}
                    className="px-2 py-0.5 rounded-md bg-neutral-800/90 hover:bg-cyan-500/20 text-neutral-300 hover:text-cyan-300 border border-white/5 font-mono text-[10px] shrink-0 transition-colors cursor-pointer"
                  >
                    +&#123;&#123;{v}&#125;&#125;
                  </button>
                ))}
              </div>

              <textarea
                id="prompt-content"
                ref={textareaRef}
                rows={7}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Enter prompt content here... Use {{VARIABLE_NAME}} to define customizable parameters."
                className="w-full p-3.5 rounded-2xl bg-neutral-950/90 border border-white/10 text-xs sm:text-sm font-sans text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 leading-relaxed resize-none shadow-inner"
              />
            </div>

            {/* Attachments Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                  Attached Files ({attachments.length})
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium border border-white/10 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-cyan-400" />
                  <span>Attach File/Image</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,text/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {attachments.map((att) => {
                    const isImage = att.type.startsWith('image/');
                    return (
                      <div
                        key={att.id}
                        className="relative p-2 rounded-xl bg-neutral-800/80 border border-white/10 flex items-center gap-2"
                      >
                        {isImage ? (
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-8 h-8 rounded-lg object-cover bg-neutral-900 border border-white/10"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center text-cyan-400">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-white truncate">{att.name}</p>
                          <p className="text-[9px] text-neutral-400">{formatFileSize(att.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1 rounded-md text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 hover:bg-neutral-950/80 text-center cursor-pointer transition-colors"
                >
                  <p className="text-xs text-neutral-400">Attach reference images, styles, or guidelines</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Stored persistently in IndexedDB</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
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
              className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialPrompt ? 'Save Changes' : 'Save to Vault'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Sheet */}
      <AiAssistantModal
        currentPrompt={content}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAccept={(newContent) => {
          setContent(newContent);
          setIsAiModalOpen(false);
        }}
        settings={settings}
        enableHaptics={enableHaptics}
      />
    </>
  );
};
