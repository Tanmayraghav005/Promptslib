import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, Sliders, ArrowRight } from 'lucide-react';
import { Prompt } from '../types';
import { extractVariables, replaceVariables, copyToClipboard, triggerHaptic } from '../utils/promptUtils';

interface CustomizeModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess: (title: string) => void;
  enableHaptics?: boolean;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  prompt,
  isOpen,
  onClose,
  onCopySuccess,
  enableHaptics = true,
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copiedCustom, setCopiedCustom] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);

  useEffect(() => {
    if (prompt) {
      const vars = extractVariables(prompt.content);
      const initial: Record<string, string> = {};
      vars.forEach((v) => {
        initial[v.key] = v.defaultValue || '';
      });
      setValues(initial);
      setCopiedCustom(false);
      setCopiedOriginal(false);
    }
  }, [prompt]);

  if (!isOpen || !prompt) return null;

  const variables = extractVariables(prompt.content);
  const compiledPrompt = replaceVariables(prompt.content, values, true);

  const handleValueChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleCopyCustomized = async () => {
    const finalContent = replaceVariables(prompt.content, values, false);
    const ok = await copyToClipboard(finalContent);
    if (ok) {
      triggerHaptic(enableHaptics, 30);
      setCopiedCustom(true);
      onCopySuccess(`${prompt.title} (Customized)`);
      setTimeout(() => {
        setCopiedCustom(false);
        onClose();
      }, 1200);
    }
  };

  const handleCopyOriginal = async () => {
    const ok = await copyToClipboard(prompt.content);
    if (ok) {
      triggerHaptic(enableHaptics, 20);
      setCopiedOriginal(true);
      onCopySuccess(`${prompt.title} (Original)`);
      setTimeout(() => setCopiedOriginal(false), 1200);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-h-[90%] bg-neutral-900/95 backdrop-blur-2xl border-t border-white/15 rounded-t-[32px] p-5 shadow-[0_-15px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Android drag bar */}
        <div className="w-12 h-1.5 rounded-full bg-neutral-700/80 mx-auto mb-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Customize & Copy</h2>
              <p className="text-xs text-neutral-400 truncate max-w-[240px]">{prompt.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable inputs & preview */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Variables list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Prompt Variables ({variables.length})
              </span>
              <span className="text-[11px] text-neutral-500">Repeated variables sync automatically</span>
            </div>

            <div className="space-y-2.5">
              {variables.map((v) => (
                <div
                  key={v.key}
                  className="p-3 rounded-2xl bg-neutral-800/60 border border-white/10 focus-within:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor={`var-input-${v.key}`}
                      className="text-xs font-semibold text-cyan-300 font-mono"
                    >
                      &#123;&#123;{v.key}&#125;&#125;
                    </label>
                    <span className="text-[11px] text-neutral-400 capitalize">{v.label}</span>
                  </div>
                  <input
                    id={`var-input-${v.key}`}
                    type="text"
                    value={values[v.key] ?? ''}
                    onChange={(e) => handleValueChange(v.key, e.target.value)}
                    placeholder={v.defaultValue ? `Default: ${v.defaultValue}` : `Enter value for ${v.label}...`}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900/90 border border-white/5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Live Compiled Preview */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Live Preview
            </span>
            <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-cyan-500/20 font-sans text-xs text-neutral-200 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap select-text">
              {compiledPrompt}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopyOriginal}
            className="flex-1 py-3 px-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedOriginal ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>Copy Original</span>
          </button>

          <button
            onClick={handleCopyCustomized}
            className={`flex-2 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg ${
              copiedCustom
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 active:scale-98'
            }`}
          >
            {copiedCustom ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Copy Customized Prompt</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-80" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
