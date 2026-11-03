import React, { useState } from 'react';
import { X, Smartphone, Terminal, Check, Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/promptUtils';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copySnippet = async (code: string, id: string) => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const capacitorCommands = `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Personal Prompt Library" com.promptvault.app --web-dir dist
npm run build
npx cap add android
npx cap sync
npx cap open android`;

  const bubblewrapCommands = `npm install -g @bubblewrap/cli
bubblewrap init --manifest=http://localhost:3000/manifest.json
bubblewrap build`;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900/95 border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Smartphone className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Android APK Packaging</h2>
              <p className="text-xs text-neutral-400">Convert this web app into a native Android APK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Guide */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs text-neutral-300">
          {/* Overview */}
          <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-white/10 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-white">100% Offline-Capable HTML-to-APK Ready</p>
            <p className="text-neutral-400">
              This app is already engineered for mobile screens with IndexedDB local persistence, haptic touch triggers, and safe-area insets.
            </p>
          </div>

          {/* Option 1: Capacitor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Method 1: Ionic Capacitor (Recommended)
              </span>
              <button
                onClick={() => copySnippet(capacitorCommands, 'cap')}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'cap' ? 'Copied!' : 'Copy Commands'}</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 font-mono text-[11px] text-emerald-400 border border-white/10 overflow-x-auto whitespace-pre leading-relaxed">
              {capacitorCommands}
            </div>
            <p className="text-[11px] text-neutral-400">
              This generates an Android Studio project inside <code className="text-cyan-300">/android</code>. Click "Build APK" or "Generate Signed Bundle" in Android Studio to produce your APK!
            </p>
          </div>

          {/* Option 2: Bubblewrap */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-200 text-sm flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-neutral-400" />
                Method 2: Google Bubblewrap (CLI Tool)
              </span>
              <button
                onClick={() => copySnippet(bubblewrapCommands, 'bw')}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === 'bw' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'bw' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-950 font-mono text-[11px] text-cyan-300 border border-white/10 overflow-x-auto whitespace-pre leading-relaxed">
              {bubblewrapCommands}
            </div>
            <p className="text-[11px] text-neutral-400">
              Generates a production Google Play-ready Android APK wrapper directly from the command line without opening Android Studio.
            </p>
          </div>

          {/* Offline Data Guarantee */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] space-y-1">
            <p className="font-semibold">Local Storage in APK</p>
            <p className="text-emerald-300/90">
              The IndexedDB database and all attachments remain saved across device reboots and app updates inside Android's WebView sandboxed storage.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
