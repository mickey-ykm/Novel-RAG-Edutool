import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Lock, BookOpen } from 'lucide-react';

interface LoginProps {
  onLogin: (password: string) => Promise<void>;
}

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(password);
    } catch (err) {
      setError('密碼錯誤，請再試一次。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-editorial-bg p-4 font-editorial-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white rounded-sm shadow-sm border border-editorial-border p-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="font-editorial-serif font-bold text-3xl tracking-tighter text-editorial-ink mb-2">
            惠安館文本查詢
          </div>
          <div className="w-12 h-[2px] bg-editorial-accent mb-6"></div>
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#999] text-center">
            AI 學習工具
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入教室密碼"
              className="w-full px-0 py-3 bg-transparent border-b border-editorial-border focus:border-editorial-ink transition-colors outline-none text-center font-editorial-serif text-lg italic"
              required
            />
          </div>
          {error && <p className="text-editorial-accent text-[10px] text-center uppercase font-bold tracking-widest">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-editorial-ink text-white py-3 rounded-none font-bold text-xs uppercase tracking-[0.2em] hover:bg-editorial-accent transition-colors disabled:opacity-50"
          >
            {loading ? '驗證中...' : '進入導讀介面'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[9px] text-[#ccc] uppercase tracking-[0.3em]">
            Copyright 李振邦導師 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
