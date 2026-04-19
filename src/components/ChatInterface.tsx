import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Quote, ExternalLink } from 'lucide-react';
import { askQuestion, ChatResponse } from '../services/novelService';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | ChatResponse;
}

interface ChatInterfaceProps {
  onPageRequest: (page: number) => void;
  onQuoteRequest: (quote: string) => void;
  apiKey: string;
}

export default function ChatInterface({ onPageRequest, onQuoteRequest, apiKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!apiKey) {
        throw new Error('MISSING_API_KEY');
      }
      const response = await askQuestion(input, apiKey);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-navigate to the first reference if available
      if (response.references && response.references.length > 0) {
        onPageRequest(response.references[0].page_number);
        onQuoteRequest(response.references[0].quote);
      }
    } catch (error) {
      console.error(error);
      let errorMessageContent = "非常抱歉，系統目前忙碌中，請稍後再試。";
      
      if (error instanceof Error && error.message === 'MISSING_API_KEY') {
        errorMessageContent = "尚未設定 Gemini API Key。請點擊右上角設定圖標進行配置。";
      } else if (error instanceof Error && error.message.includes('API_KEY_INVALID')) {
        errorMessageContent = "API Key 無效或已過期，請檢查您的設定。";
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessageContent,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (page: number, quote: string) => {
    onPageRequest(page);
    onQuoteRequest(quote);
  };

  return (
    <div className="flex flex-col h-full bg-white font-editorial-sans">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
            <Bot size={48} className="text-editorial-ink" />
            <div className="font-editorial-serif">
              <p className="text-xl font-bold text-black italic">探索文學的深度</p>
              <p className="text-sm mt-1">請輸入您的問題，與 AI 導讀專家對話</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[95%]",
                m.role === 'user' ? "ml-auto" : "mr-auto"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-sm text-sm",
                m.role === 'user' 
                  ? "bg-editorial-bg border-r-[3px] border-editorial-accent self-end" 
                  : "self-start w-full"
              )}>
                {typeof m.content === 'string' ? (
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-editorial-accent tracking-widest mb-1">繁體中文回答</span>
                      <p className="text-[15px] leading-relaxed text-editorial-ink font-medium">{m.content.chinese_answer}</p>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-editorial-accent tracking-widest mb-1">English Summary</span>
                      <p className="text-sm text-[#666] leading-relaxed">{m.content.english_answer}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-editorial-border">
                      <span className="block text-[10px] uppercase font-bold text-editorial-accent tracking-widest mb-3">文本引述 (References)</span>
                      
                      <div className="space-y-6">
                        {m.content.references?.map((ref, idx) => (
                          <div key={idx} className="group/ref">
                            <div className="border-l-2 border-editorial-border group-hover/ref:border-editorial-accent pl-4 transition-colors">
                              <p className="text-sm text-[#555] leading-relaxed italic font-editorial-serif">
                                「{ref.quote}」
                              </p>
                            </div>
                            <button 
                              onClick={() => handleNavigate(ref.page_number, ref.quote)}
                              className="mt-2 flex items-center gap-1.5 text-editorial-ink hover:text-editorial-accent transition-colors"
                            >
                              <ExternalLink size={10} />
                              <span className="text-[10px] font-bold uppercase tracking-wider">定位至第 {ref.page_number} 頁</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-editorial-accent text-[10px] font-bold uppercase tracking-widest pt-2"
          >
            <Bot size={12} /> 正在分析文本...
          </motion.div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-editorial-border">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="輸入關於文本的問題..."
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white border border-editorial-border rounded-none outline-none focus:border-editorial-ink transition-colors text-black disabled:opacity-50 text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-editorial-ink hover:text-editorial-accent transition-colors disabled:opacity-30"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[9px] text-[#999] uppercase tracking-[0.2em] text-center mt-2">
            Literature Research Assistant &copy; 2026
          </p>
        </form>
      </div>
    </div>
  );
}
