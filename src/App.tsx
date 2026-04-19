/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Login from './components/Login';
import ChatInterface from './components/ChatInterface';
import PdfViewer from './components/PdfViewer';
import Settings from './components/Settings';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [highlightText, setHighlightText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');

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
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setIsAuthenticated(true);
    } else {
      throw new Error('Unauthorized');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-editorial-bg overflow-hidden font-editorial-sans">
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        apiKey={geminiApiKey}
        onSave={saveApiKey}
      />

      {/* Editorial Header */}
      <header className="h-[60px] border-b border-editorial-border flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-editorial-serif font-bold text-xl tracking-tight">惠安館文本查詢</div>
          <div className="h-4 w-[1px] bg-editorial-border hidden sm:block"></div>
          <div className="hidden sm:block text-[11px] uppercase tracking-[0.15em] text-[#666] font-medium">
            中文科 &nbsp; | &nbsp; 導讀助手
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#666] hover:text-editorial-accent transition-colors"
          >
            設定 <SettingsIcon size={14} />
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#666] hover:text-editorial-accent transition-colors"
          >
            登出 <LogOut size={14} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left Pane: PDF Viewer */}
        <div className="flex-1 border-r border-editorial-border h-full relative group">
          <PdfViewer 
            page={currentPage} 
            onPageChange={handlePageChange}
            numPages={41}
            highlightText={highlightText}
          />
        </div>

        {/* Right Pane: Chat Interface */}
        <div className="w-[420px] h-full flex flex-col relative bg-white">
          <ChatInterface 
            onPageRequest={handlePageChange} 
            onQuoteRequest={setHighlightText}
            apiKey={geminiApiKey}
          />
        </div>
      </main>
    </div>
  );
}
