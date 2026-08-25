import { useState, useEffect } from 'react';
import { Settings, ExternalLink, Key, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const [hasKey, setHasKey] = useState(true);
  const [currentModel, setCurrentModel] = useState('gemini-3-flash-preview');

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key');
    const model = localStorage.getItem('selected_gemini_model') || 'gemini-3-flash-preview';
    setHasKey(!!key);
    setCurrentModel(model);
  }, []);

  return (
    <header className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0 z-30 shadow-md">
      <div className="flex items-center gap-3 font-bold text-base">
        <div className="bg-gradient-to-br from-blue-500 to-orange-400 p-1.5 rounded-lg text-white">
          <BookOpen size={18} />
        </div>
        <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
          EduPlan AI
        </span>
        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-md font-semibold">
          CV 5512 • Năng lực số
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Red Warning Link: Lấy API key để sử dụng app */}
        <a 
          href="https://aistudio.google.com/api-keys"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 animate-pulse shadow-sm shadow-rose-950"
          title="Lấy API Key miễn phí từ Google AI Studio"
        >
          <span>Lấy API key để sử dụng app</span>
          <ExternalLink size={13} />
        </a>

        {/* Settings (API Key) Button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs"
        >
          <Key size={14} className="text-orange-400" />
          <span>Settings (API Key)</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded-md font-mono border border-slate-700">
            {currentModel.split('-')[0] + '-' + currentModel.split('-')[1]}
          </span>
        </button>
      </div>
    </header>
  );
}
