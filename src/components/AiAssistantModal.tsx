import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Copy,
  RotateCcw,
  Sliders,
  Maximize2,
  Minimize2,
  AlertCircle,
  Wand2,
} from 'lucide-react';
import { AppSettings } from '../types';
import { requestAiAssist, AiActionType } from '../services/aiService';
import { copyToClipboard, triggerHaptic } from '../utils/promptUtils';

interface AiAssistantModalProps {
  currentPrompt: string;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (newPrompt: string) => void;
  settings: AppSettings;
  enableHaptics?: boolean;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  currentPrompt,
  isOpen,
  onClose,
  onAccept,
  settings,
  enableHaptics = true,
}) => {
  const [selectedAction, setSelectedAction] = useState<AiActionType>('improve');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const actions: { id: AiActionType; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'improve', label: 'Improve Prompt', icon: Sparkles, desc: 'Enhance structure, specificity and tone' },
    { id: 'suggest_variables', label: 'Suggest Variables', icon: Sliders, desc: 'Convert fixed values to {{VARIABLES}}' },
    { id: 'expand', label: 'Expand & Detail', icon: Maximize2, desc: 'Enrich with sensory details and modifiers' },
    { id: 'shorten', label: 'Shorten & Punch', icon: Minimize2, desc: 'Condense to high-impact essentials' },
    { id: 'fix_clarity', label: 'Clarify Instructions', icon: Wand2, desc: 'Fix ambiguities & improve model adherence' },
  ];

  const handleGenerate = async (action: AiActionType = selectedAction) => {
    setSelectedAction(action);
    setLoading(true);
    setErrorMessage('');
    triggerHaptic(enableHaptics, 15);

    const res = await requestAiAssist(action, currentPrompt, settings);
    setLoading(false);

    if (res.success && res.result) {
      setAiResult(res.result);
      triggerHaptic(enableHaptics, 25);
    } else {
      setErrorMessage(res.error || 'AI generation could not complete.');
    }
  };

  const handleCopyResult = async () => {
    if (!aiResult) return;
    const ok = await copyToClipboard(aiResult);
    if (ok) {
      triggerHaptic(enableHaptics, 20);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAccept = () => {
    if (!aiResult) return;
    triggerHaptic(enableHaptics, 30);
    onAccept(aiResult);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-h-[92%] bg-neutral-900/95 backdrop-blur-2xl border-t border-white/20 rounded-t-[36px] p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Android drag bar */}
        <div className="w-12 h-1.5 rounded-full bg-neutral-700 mx-auto mb-3 shrink-0" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Gemini AI Assistant</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Optional
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Intelligent prompt refinement & variable generator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Pills */}
        <div className="py-3 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-2">
          {actions.map((act) => {
            const Icon = act.icon;
            const isSelected = selectedAction === act.id;
            return (
              <button
                key={act.id}
                onClick={() => handleGenerate(act.id)}
                disabled={loading}
                className={`px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3 mb-2 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <p className="font-semibold">Notice</p>
              <p className="opacity-90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {/* Original prompt display */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Original Prompt
            </span>
            <div className="p-3 rounded-2xl bg-neutral-950/60 border border-white/5 text-xs text-neutral-300 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap select-text">
              {currentPrompt || '(Empty prompt)'}
            </div>
          </div>

          {/* AI Result display */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                AI Generated Suggestion
              </span>
              {aiResult && (
                <button
                  onClick={handleCopyResult}
                  className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="relative min-h-[140px] p-4 rounded-2xl bg-neutral-950/90 border border-cyan-500/30 text-xs sm:text-sm text-neutral-100 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-text shadow-inner">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-950/80 backdrop-blur-xs">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-neutral-400">Gemini is crafting suggestions...</span>
                </div>
              ) : aiResult ? (
                aiResult
              ) : (
                <div className="text-neutral-500 text-xs italic flex flex-col items-center justify-center h-28 text-center px-4">
                  <span>Select an action above to generate a refined prompt variation.</span>
                  <span className="text-[11px] text-neutral-600 mt-1">
                    Your original prompt remains untouched until you click "Accept".
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="p-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-white/10 transition-colors flex items-center justify-center cursor-pointer"
            title="Regenerate"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 px-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleAccept}
            disabled={!aiResult || loading}
            className={`flex-2 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
              aiResult && !loading
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Accept & Replace in Editor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
