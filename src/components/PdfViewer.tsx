import { useState, useCallback } from 'react';
import { BookOpen, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker securely via Vite's static asset URL import
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface PdfViewerProps {
  page: number;
  onPageChange: (page: number) => void;
  numPages: number;
  highlightText?: string;
}

export default function PdfViewer({ page, onPageChange, numPages: totalPages, highlightText }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(totalPages);
  const [scale, setScale] = useState(1.1);
  
  // Use Vite's injected BASE_URL so it resolves relative to the GitHub Pages subpath at runtime
  // This avoids build errors when the file is excluded via .gitignore locally
  const pdfUrl = `${import.meta.env.BASE_URL}book.pdf`;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handlePrevPage = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNextPage = () => {
    if (page < numPages) onPageChange(page + 1);
  };

  // Custom text renderer to highlight matching text
  const textRenderer = useCallback((textItem: { str: string }) => {
    if (!highlightText) return textItem.str;
    
    // Use a fuzzy match or substring check
    // We escape special characters for regex
    const escapedHighlight = highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // We try to match the highlight text within the string segment
    // Note: If the sentence spans across multiple segments, this simple approach might only 
    // highlight parts of it. But for many PDFs, line-based segments work.
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    return textItem.str.replace(regex, (match) => `<mark style="background-color: #ffeb3b; color: inherit; padding: 2px 0;">${match}</mark>`);
  }, [highlightText]);

  return (
    <div className="w-full h-full bg-editorial-viewer flex flex-col items-center relative overflow-hidden font-editorial-sans">
      {/* Editorial Navigation Bar */}
      <div className="w-full bg-white border-b border-editorial-border py-2 px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between z-20 shrink-0 gap-2 sm:gap-0">
        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#999] truncate w-full text-center sm:text-left sm:w-auto">
          《城南舊事》-〈惠安館〉 — 文本導覽
        </div>
        
        <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-6">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 sm:gap-4 bg-[#f8f8f8] px-2 sm:px-3 py-1 rounded-sm border border-editorial-border">
            <button 
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
              className="text-[#666] hover:text-black transition-colors"
              title="縮小"
            >
              <ZoomOut size={16} className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>
            <span className="text-[10px] font-bold text-editorial-ink min-w-[32px] sm:min-w-[40px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
              className="text-[#666] hover:text-black transition-colors"
              title="放大"
            >
              <ZoomIn size={16} className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 bg-[#f8f8f8] px-2 py-1 rounded-sm border border-editorial-border">
            <button 
              onClick={handlePrevPage}
              disabled={page <= 1}
              className="text-[#666] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="上一頁"
            >
              <ChevronLeft size={16} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
            <div className="text-[10px] font-bold text-editorial-accent tracking-widest uppercase min-w-[60px] sm:min-w-[80px] text-center">
              P.<span className="sm:hidden">{page}</span><span className="hidden sm:inline">AGE {page} / {numPages}</span>
            </div>
            <button 
              onClick={handleNextPage}
              disabled={page >= numPages}
              className="text-[#666] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="下一頁"
            >
              <ChevronRight size={16} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Scrollable PDF Area */}
      <div className="flex-1 w-full overflow-auto flex justify-center p-2 sm:p-8 bg-editorial-viewer">
        <div className="shadow-[0_15px_50px_rgba(0,0,0,0.08)] bg-white">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => console.error('Error while loading document!', error.message || error)}
            onSourceError={(error) => console.error('Error while loading document source!', error.message || error)}
            loading={
              <div className="flex flex-col items-center justify-center p-20 text-[#999]">
                <div className="w-8 h-8 border-2 border-editorial-accent border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] uppercase tracking-widest font-bold">正在讀取文本...</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center p-20 text-center max-w-xs">
                <BookOpen size={48} className="text-[#ccc] mb-4" />
                <p className="font-editorial-serif text-lg font-bold mb-2 text-editorial-ink">無法載入文件</p>
                <p className="text-xs text-[#999] leading-relaxed">
                  請確認 <code className="bg-[#eee] px-1 rounded">public/book.pdf</code> 檔案已正確上傳。
                </p>
              </div>
            }
          >
            <Page 
              pageNumber={page} 
              scale={scale}
              renderAnnotationLayer={false}
              renderTextLayer={true}
              customTextRenderer={textRenderer}
              className="rounded-sm"
            />
          </Document>
        </div>
      </div>
      
      {/* Bottom Progress Rail */}
      <div className="w-full h-1 bg-editorial-border relative z-20">
        <div 
          className="absolute top-0 left-0 h-full bg-editorial-accent transition-all duration-500"
          style={{ width: `${(page / numPages) * 100}%` }}
        />
      </div>
    </div>
  );
}
