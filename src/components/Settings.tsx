import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, ShieldCheck, AlertCircle } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (key: string) => void;
}

export default function Settings({ isOpen, onClose, apiKey, onSave }: SettingsProps) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSave = () => {
    onSave(tempKey);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white p-8 border border-editorial-border shadow-2xl z-[101] font-editorial-sans"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="font-editorial-serif font-bold text-2xl tracking-tight">系統設定</h2>
                <div className="w-8 h-[2px] bg-editorial-accent mt-2"></div>
              </div>
              <button onClick={onClose} className="text-[#999] hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Key size={14} className="text-editorial-accent" />
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#666]">
                    Gemini API Key
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="輸入您的 Google AI API Key..."
                    className="w-full px-4 py-3 bg-white border border-editorial-border rounded-none outline-none focus:border-editorial-ink transition-colors text-black text-sm pr-10"
                  />
                  {tempKey && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                      <ShieldCheck size={16} />
                    </div>
                  )}
                </div>
                <p className="mt-4 text-[11px] text-[#888] leading-relaxed">
                  為了確保隱私，您的 API Key 將僅儲存在瀏覽器的本機儲存空間 (Local Storage) 中，不會上傳至分享伺服器。
                </p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[11px] text-editorial-accent hover:underline decoration-editorial-accent/30 underline-offset-4"
                >
                  如何獲取 API Key?
                </a>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  className="w-full bg-editorial-ink text-white text-[11px] font-bold uppercase tracking-[0.2em] py-4 hover:bg-editorial-accent transition-colors flex items-center justify-center gap-2"
                >
                  {showConfirmation ? '設定已儲存 √' : '儲存設定'}
                </button>
                
                {!apiKey && !tempKey && (
                  <div className="flex items-center gap-2 text-editorial-accent bg-editorial-accent/5 p-3 text-[10px] font-bold uppercase tracking-wider">
                    <AlertCircle size={14} />
                    請設置 API Key 以開始導讀
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 text-center opacity-20">
              <p className="text-[8px] uppercase tracking-[0.4em]">System Configuration v1.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
