/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Login from './components/Login';
import ChatInterface from './components/ChatInterface';
import PdfViewer from './components/PdfViewer';
import Settings from './components/Settings';
import { LogOut, Settings as SettingsIcon, BookOpen, MessageSquare } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightText, setHighlightText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'pdf'>('chat'); // Mobile tab state

  useEffect(() => {
    checkAuth();
    // Load API Key from localStorage
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) {
      setGeminiApiKey(savedKey);
    }
  }, []);

  const saveApiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('GEMINI_API_KEY', key);
  };

  const checkAuth = async () => {
    // Replaced backend fetch with local session storage check for static deployment
    const authStatus = sessionStorage.getItem('auth_token');
    setIsAuthenticated(authStatus === 'class-access-granted');
  };

  const handleLogin = async (password: string) => {
    // Perform simple client-side check since we're now a static app
    if (password === 'pong') {
      sessionStorage.setItem('auth_token', 'class-access-granted');
      setIsAuthenticated(true);
    } else {
      throw new Error('Unauthorized');
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Automatically switch to PDF view on mobile when a page is requested by the bot
    setActiveTab('pdf');
  };

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-editorial-bg overflow-hidden font-editorial-sans">
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        apiKey={geminiApiKey}
        onSave={saveApiKey}
      />

      {/* Editorial Header */}
      <header className="h-[60px] border-b border-editorial-border flex items-center justify-between px-4 sm:px-6 bg-white shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="font-editorial-serif font-bold text-lg sm:text-xl tracking-tight truncate max-w-[180px] sm:max-w-none">惠安館文本查詢</div>
          <div className="h-4 w-[1px] bg-editorial-border hidden sm:block"></div>
          <div className="hidden sm:block text-[11px] uppercase tracking-[0.15em] text-[#666] font-medium">
            中文科 &nbsp; | &nbsp; 導讀助手
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-[#666] hover:text-editorial-accent transition-colors"
          >
            <span className="hidden sm:inline">設定</span> <SettingsIcon size={14} />
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-[#666] hover:text-editorial-accent transition-colors"
          >
            <span className="hidden sm:inline">登出</span> <LogOut size={14} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Pane: PDF Viewer */}
        <div className={cn(
          "flex-1 border-r border-editorial-border h-full relative group transition-all bg-editorial-viewer w-full md:w-auto",
          activeTab === 'pdf' ? "flex" : "hidden md:flex"
        )}>
          <PdfViewer 
            page={currentPage} 
            onPageChange={setCurrentPage}
            numPages={41}
            highlightText={highlightText}
          />
        </div>

        {/* Right Pane: Chat Interface */}
        <div className={cn(
          "md:w-[420px] lg:w-[480px] w-full h-full flex flex-col relative bg-white",
          activeTab === 'chat' ? "flex" : "hidden md:flex"
        )}>
          <ChatInterface 
            onPageRequest={handlePageChange} 
            onQuoteRequest={setHighlightText}
            apiKey={geminiApiKey}
          />
        </div>
      </main>

      {/* Mobile Bottom Navigation Menu */}
      <div className="md:hidden flex h-14 bg-white border-t border-editorial-border shrink-0 pb-safe">
        <button 
          onClick={() => setActiveTab('pdf')} 
          className={cn(
            "flex-1 flex flex-col justify-center items-center gap-1 text-[10px] uppercase font-bold tracking-widest transition-colors",
            activeTab === 'pdf' ? "text-editorial-accent" : "text-[#999] hover:text-[#666]"
          )}
        >
          <BookOpen size={18} />
          <span>閱讀文本</span>
        </button>
        <div className="w-[1px] h-full bg-editorial-border py-2" />
        <button 
          onClick={() => setActiveTab('chat')} 
          className={cn(
            "flex-1 flex flex-col justify-center items-center gap-1 text-[10px] uppercase font-bold tracking-widest transition-colors",
            activeTab === 'chat' ? "text-editorial-accent" : "text-[#999] hover:text-[#666]"
          )}
        >
          <MessageSquare size={18} />
          <span>導讀助手</span>
        </button>
      </div>
    </div>
  );
}
