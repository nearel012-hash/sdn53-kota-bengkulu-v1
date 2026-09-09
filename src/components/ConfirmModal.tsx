import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Hapus Sekarang',
  cancelText = 'Batal',
  isDestructive = true,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && !isProcessing) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
    } catch (err) {
      console.error('Confirmation action error', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 animate-fade-in"
      onClick={() => {
        if (!isProcessing) onCancel();
      }}
    >
      <div
        id="confirm-modal-box"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-7 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isDestructive
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isDestructive ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Konfirmasi Tindakan</p>
              </div>
            </div>

            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {message}
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={handleConfirmClick}
              disabled={isProcessing}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm transition-colors inline-flex items-center gap-2 ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
