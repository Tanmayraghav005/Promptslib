import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { Attachment } from '../types';
import { formatFileSize } from '../utils/promptUtils';

interface AttachmentViewerModalProps {
  attachment: Attachment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttachmentViewerModal: React.FC<AttachmentViewerModalProps> = ({
  attachment,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !attachment) return null;

  const isImage = attachment.type.startsWith('image/');

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = attachment.dataUrl;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900/95 border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="min-w-0 pr-3">
            <h3 className="text-sm font-bold text-white truncate">{attachment.name}</h3>
            <p className="text-[11px] text-neutral-400">
              {attachment.type} • {formatFileSize(attachment.size)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto py-4 flex items-center justify-center">
          {isImage ? (
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              className="max-h-[55vh] max-w-full rounded-2xl object-contain border border-white/10 bg-black/50 shadow-lg"
            />
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-4 rounded-3xl bg-neutral-800 text-cyan-400 border border-white/10">
                <FileText className="w-12 h-12" />
              </div>
              <p className="text-sm font-semibold text-white">{attachment.name}</p>
              <p className="text-xs text-neutral-400 max-w-xs">
                This document is stored persistently in your offline IndexedDB library.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-cyan-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
