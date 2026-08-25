import { useState, useEffect } from 'react';
import { Settings, ExternalLink, Key, Sparkles, BookOpen, Zap, Star, GraduationCap } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const [currentModel, setCurrentModel] = useState('gemini-3.7-flash');

  useEffect(() => {
    const updateModelDisplay = () => {
      const model = localStorage.getItem('selected_gemini_model') || 'gemini-3.7-flash';
      setCurrentModel(model);
    };
    updateModelDisplay();
    window.addEventListener('storage', updateModelDisplay);
    return () => window.removeEventListener('storage', updateModelDisplay);
  }, []);

  const getDisplayModelName = (modelId: string) => {
    if (modelId === 'gemini-3.7-flash') return 'Gemini 3.7 Flash';
    if (modelId === 'gemini-3.6-flash') return 'Gemini 3.6 Flash';
    if (modelId === 'gemini-2.5-flash') return 'Gemini 2.5 Flash';
    if (modelId === 'gemini-2.0-flash') return 'Gemini 2.0 Flash';
    if (modelId.includes('3.7')) return 'Gemini 3.7 Flash';
    if (modelId.includes('3.6')) return 'Gemini 3.6 Flash';
    return 'Gemini 3.7 Flash';
  };

  return (
    <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-6 py-3 flex items-center justify-between border-b border-blue-800 shrink-0 z-30 shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-white/15 p-2 rounded-2xl text-white border border-white/20 shadow-xs">
          <GraduationCap size={24} className="text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base tracking-tight uppercase text-white">
              SOẠN GIÁO ÁN NĂNG LỰC SỐ
            </h1>
            <span className="text-[10px] bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full font-semibold">
              CV 5512
            </span>
          </div>
          <p className="text-[11px] text-blue-100 font-medium">
            Hỗ trợ tích hợp Năng lực số toàn cấp bởi Thầy Dương Bảo Quốc
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Red Warning Link: Lấy API key để sử dụng app */}
        <a 
          href="https://aistudio.google.com/api-keys"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-rose-300 hover:text-white bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          title="Lấy API Key miễn phí từ Google AI Studio"
        >
          <Key size={13} className="text-amber-400" />
          <span>Lấy API key để sử dụng app</span>
          <ExternalLink size={12} />
        </a>

        {/* Settings (API Key) Button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
        >
          <Settings size={14} className="text-amber-300" />
          <span>Settings</span>
          <span className="text-[10px] px-2 py-0.5 bg-blue-900/80 text-amber-300 rounded-md font-bold border border-blue-400/30 flex items-center gap-1">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            {getDisplayModelName(currentModel)}
          </span>
        </button>

        {/* Powered by Gemini Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-100 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
          <Sparkles size={14} className="text-amber-300" />
          <span>Powered by Gemini</span>
        </div>
      </div>
    </header>
  );
}
