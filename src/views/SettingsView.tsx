import React, { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Vibrate,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { AppSettings, Prompt, Category } from '../types';
import { testGeminiConnection } from '../services/aiService';
import { generateExportJSON, validateBackupData, triggerHaptic } from '../utils/promptUtils';
import { ApkGuideModal } from '../components/ApkGuideModal';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  prompts: Prompt[];
  categories: Category[];
  onImportData: (prompts: Prompt[], categories: Category[], mode: 'merge' | 'replace') => void;
  onResetData: () => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  enableHaptics?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  prompts,
  categories,
  onImportData,
  onResetData,
  onShowToast,
  enableHaptics = true,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey || '');
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (theme: AppSettings['theme']) => {
    triggerHaptic(enableHaptics, 10);
    onUpdateSettings({ ...settings, theme });
    onShowToast(`Theme changed to ${theme}`, 'info');
  };

  const handleToggleHaptics = () => {
    const next = !settings.enableHaptics;
    triggerHaptic(next, 20);
    onUpdateSettings({ ...settings, enableHaptics: next });
    onShowToast(next ? 'Haptic feedback enabled' : 'Haptic feedback disabled', 'info');
  };

  const handleToggleAi = () => {
    triggerHaptic(enableHaptics, 15);
    const next = !settings.enableAiFeatures;
    onUpdateSettings({ ...settings, enableAiFeatures: next });
    onShowToast(next ? 'AI features enabled' : 'AI features disabled', 'info');
  };

  const handleSaveApiKey = () => {
    triggerHaptic(enableHaptics, 20);
    onUpdateSettings({ ...settings, geminiApiKey: apiKeyInput.trim() });
    onShowToast('API key saved locally', 'success');
  };

  const handleTestKey = async () => {
    setTestingKey(true);
    setTestResult(null);
    triggerHaptic(enableHaptics, 15);
    const res = await testGeminiConnection(apiKeyInput);
    setTestingKey(false);
    setTestResult(res);
    triggerHaptic(enableHaptics, res.success ? 25 : 30);
  };

  const handleExportJSON = () => {
    triggerHaptic(enableHaptics, 20);
    try {
      const json = generateExportJSON(prompts, categories);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal-prompt-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast(`Exported ${prompts.length} prompts safely`, 'success');
    } catch (_e) {
      onShowToast('Failed to generate export file', 'error');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const validated = validateBackupData(parsed);

        if (!validated.valid || !validated.prompts) {
          onShowToast(validated.error || 'Invalid backup structure', 'error');
          return;
        }

        onImportData(validated.prompts, validated.categories || [], importMode);
        onShowToast(
          `Successfully ${importMode === 'replace' ? 'restored' : 'merged'} ${validated.prompts.length} prompts!`,
          'success'
        );
      } catch (err: any) {
        onShowToast(`Import failed: ${err.message || 'Invalid JSON file'}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    triggerHaptic(enableHaptics, 30);
    onResetData();
    setConfirmReset(false);
    onShowToast('Library reset to default starter prompts', 'info');
  };

  return (
    <div className="flex-1 w-full overflow-y-auto pb-28 px-4 pt-3 space-y-6">
      {/* Header */}
      <header className="pt-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-neutral-400">Appearance, storage & AI preferences</p>
      </header>

      {/* Appearance Section */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Appearance
        </h2>
        <div className="p-3.5 rounded-3xl bg-neutral-900/60 backdrop-blur-xl border border-white/10 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'system', label: 'System', icon: Laptop },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = settings.theme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleThemeChange(item.id as AppSettings['theme'])}
                  className={`py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-neutral-800 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                      : 'bg-neutral-900/50 hover:bg-neutral-800 border-white/5 text-neutral-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Haptics Switch */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Vibrate className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-xs font-semibold text-neutral-200">Haptic Vibration</p>
                <p className="text-[10px] text-neutral-500">Android touch feedback on actions</p>
              </div>
            </div>
            <button
              onClick={handleToggleHaptics}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                settings.enableHaptics ? 'bg-cyan-500' : 'bg-neutral-800'
              }`}
              aria-label="Toggle haptics"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.enableHaptics ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Gemini AI Configuration (Optional) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Gemini AI Integration (Optional)
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            Self-Contained
          </span>
        </div>

        <div className="p-3.5 rounded-3xl bg-neutral-900/60 backdrop-blur-xl border border-white/10 space-y-3.5">
          {/* Toggle AI Features */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-200">Enable AI Assistance</p>
              <p className="text-[10px] text-neutral-500">
                Improves, expands, and generates variables
              </p>
            </div>
            <button
              onClick={handleToggleAi}
              className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                settings.enableAiFeatures ? 'bg-cyan-500' : 'bg-neutral-800'
              }`}
              aria-label="Toggle AI features"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.enableAiFeatures ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <label htmlFor="gemini-key-input" className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Key className="w-3 h-3 text-cyan-400" />
                Personal Gemini API Key
              </span>
              <span className="text-[10px] text-neutral-500">Free tier compatible</span>
            </label>
            <div className="relative">
              <input
                id="gemini-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... (leave blank to use server environment key)"
                className="w-full pl-3.5 pr-20 py-2.5 rounded-2xl bg-neutral-800/80 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-white/10 transition-colors cursor-pointer"
              >
                Save Key
              </button>
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testingKey}
                className="py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                {testingKey ? (
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>Test Connection</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 mt-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          <div className="p-2.5 rounded-2xl bg-neutral-950/60 border border-white/5 text-[11px] text-neutral-400 leading-relaxed space-y-1">
            <p className="font-semibold text-neutral-300 flex items-center gap-1">
              <Info className="w-3 h-3 text-cyan-400" />
              Offline & Privacy Note
            </p>
            <p>
              Your key is saved locally inside IndexedDB. If Gemini is unreachable or no key is provided, the entire library continues working offline normally.
            </p>
          </div>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Data & Backup
        </h2>
        <div className="p-3.5 rounded-3xl bg-neutral-900/60 backdrop-blur-xl border border-white/10 space-y-3">
          {/* Export JSON */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-200">Export Library Backup</p>
              <p className="text-[10px] text-neutral-500">
                JSON backup with prompts, tags & categories
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-200">Import Backup</p>
                <p className="text-[10px] text-neutral-500">
                  Restore from JSON backup file
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                  className="px-2 py-1.5 rounded-lg bg-neutral-800 text-[11px] text-neutral-300 border border-white/10 focus:outline-none"
                >
                  <option value="merge">Merge</option>
                  <option value="replace">Replace All</option>
                </select>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Import</span>
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>

          {/* Reset / Reseed Data */}
          <div className="pt-2 border-t border-white/5">
            {confirmReset ? (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 space-y-2 text-xs">
                <p className="font-semibold text-rose-300">
                  Reset entire library to default demo prompts?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReset}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600 text-white font-bold"
                  >
                    Yes, Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-neutral-200">Reset to Starter Prompts</p>
                  <p className="text-[10px] text-neutral-500">Restore factory sample collection</p>
                </div>
                <button
                  onClick={() => setConfirmReset(true)}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Android Packaging Guide */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Mobile Deployment
        </h2>
        <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-cyan-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Smartphone className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Packaging into Android APK</p>
              <p className="text-[10px] text-neutral-400">Step-by-step Capacitor & Bubblewrap instructions</p>
            </div>
          </div>
          <button
            onClick={() => setIsApkGuideOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 text-neutral-950 font-bold text-xs shadow-md shadow-cyan-500/30 cursor-pointer active:scale-95"
          >
            View Guide
          </button>
        </div>
      </section>

      {/* App Info Footer */}
      <div className="pt-2 text-center text-xs text-neutral-500 space-y-1">
        <p className="font-semibold text-neutral-400">Personal Prompt Library for Android</p>
        <p className="text-[11px] font-mono">v1.0.0 • IndexedDB Persistent Engine</p>
      </div>

      <ApkGuideModal isOpen={isApkGuideOpen} onClose={() => setIsApkGuideOpen(false)} />
    </div>
  );
};
