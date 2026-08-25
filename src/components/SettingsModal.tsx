import { useState, useEffect, ChangeEvent } from 'react';
import { 
  X, Key, Save, Download, Upload, CheckCircle2, AlertCircle, Sparkles, RefreshCw, ExternalLink, Cpu, Zap, Star
} from 'lucide-react';
import { generateContent, DEFAULT_MODELS, fetchAvailableModels } from '../lib/gemini';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
  isMandatory?: boolean;
}

export const AI_MODELS_INFO = [
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    tag: 'Mới nhất - Siêu thông minh',
    desc: 'Model AI tân tiến nhất của Google, suy luận sư phạm vượt trội và biên soạn Giáo án 5512 tích hợp Năng lực số chuẩn GDPT 2018.',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-orange-400 font-bold'
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    tag: 'Tốc độ cực nhanh',
    desc: 'Tối ưu hóa khả năng phản hồi tức thời, phân tích nhanh cấu trúc bài dạy và gợi ý hoạt động số tương tác.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tag: 'Thế hệ 2.5 Flash',
    desc: 'Mô hình hiệu năng cao của thế hệ 2.5, cân bằng hoàn hảo giữa tốc độ và độ chuẩn xác mục tiêu bài học.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    tag: 'Rất ổn định',
    desc: 'Được hỗ trợ chính thức toàn cầu trên mọi API Key của Google AI Studio.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    tag: 'Chuyên sâu & Lý luận',
    desc: 'Thiết kế chuỗi hoạt động nâng cao, ma trận kiểm tra và phiếu học tập chuyên sâu.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  }
];

export function SettingsModal({ isOpen, onClose, onDataRestored, isMandatory }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('gemini_api_key') || '';
      const storedModel = localStorage.getItem('selected_gemini_model') || 'gemini-3.7-flash';
      setApiKey(storedKey);
      setSelectedModel(storedModel);
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKeyAndModel = async () => {
    if (!apiKey.trim()) {
      alert('Vui lòng nhập Gemini API Key để tiếp tục.');
      return;
    }
    const cleanKey = apiKey.trim();
    localStorage.setItem('gemini_api_key', cleanKey);
    localStorage.setItem('selected_gemini_model', selectedModel);
    window.dispatchEvent(new Event('storage'));
    
    // Auto-discover in background
    fetchAvailableModels(cleanKey).catch(() => {});

    setTestStatus('success');
    setTestMessage('Đã lưu Cấu hình Model AI & API Key thành công!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      alert('Vui lòng nhập API Key trước khi thử nghiệm.');
      return;
    }
    const cleanKey = apiKey.trim();
    setTestStatus('testing');
    setTestMessage(`Đang kiểm tra kết nối với ${selectedModel}...`);
    
    localStorage.setItem('gemini_api_key', cleanKey);
    localStorage.setItem('selected_gemini_model', selectedModel);
    window.dispatchEvent(new Event('storage'));

    try {
      await fetchAvailableModels(cleanKey);
      const result = await generateContent('Hãy trả lời ngắn: {"status": "success"}');
      if (result) {
        setTestStatus('success');
        setTestMessage(`Kết nối thành công với ${selectedModel}! Trợ lý AI sẵn sàng hoạt động mượt mà.`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Kết nối thất bại. Vui lòng kiểm tra lại API Key.');
    }
  };

  const handleExportBackup = () => {
    const data = localStorage.getItem('lesson_plans') || '[]';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduPlan_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          localStorage.setItem('lesson_plans', JSON.stringify(parsed));
          alert(`Đã khôi phục thành công ${parsed.length} giáo án!`);
          if (onDataRestored) onDataRestored();
        } else {
          alert('File sao lưu không đúng định dạng danh sách giáo án.');
        }
      } catch (err) {
        alert('Lỗi khi đọc file sao lưu JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              <Key size={18} />
            </div>
            <span>Thiết lập Model AI Thế Hệ Mới & API Key</span>
          </div>
          {!isMandatory && (
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* API Key Link Warning Box */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={16} /> Lấy API Key miễn phí từ Google AI Studio
              </span>
              <a 
                href="https://aistudio.google.com/api-keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-rose-600 hover:text-rose-800 underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs"
              >
                <span>Lấy API key tại đây</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              Nhấp vào nút trên để truy cập Google AI Studio, sao chép API Key miễn phí và dán vào ô bên dưới.
            </p>
          </div>

          {/* Model Selection Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu size={16} className="text-blue-600" />
              Chọn Model AI Mới Nhất (Gemini 3.7 Flash & 3.6 Flash)
            </label>
            
            <div className="grid grid-cols-1 gap-2.5">
              {AI_MODELS_INFO.map(model => {
                const isSelected = selectedModel === model.id;
                return (
                  <div 
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50/40 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="aiModel" 
                      checked={isSelected}
                      onChange={() => setSelectedModel(model.id)}
                      className="mt-1 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          {model.name}
                          {model.id.includes('3.7') && <Star size={14} className="text-amber-500 fill-amber-500" />}
                          {model.id.includes('3.6') && <Zap size={14} className="text-emerald-500 fill-emerald-500" />}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border ${model.badgeColor}`}>
                          {model.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">{model.desc}</p>
                      <code className="text-[10px] text-slate-400 font-mono mt-0.5 block">{model.id}</code>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * Tự động dò tìm thông minh: Hệ thống tự động kết nối mô hình tối ưu nhất trong danh mục cho API Key của Thầy/Cô.
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Dán Gemini API Key của bạn
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-mono"
            />

            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={handleSaveKeyAndModel}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
              >
                <Save size={16} /> Lưu Cấu Hình
              </button>
              <button 
                onClick={handleTestConnection}
                disabled={!apiKey.trim() || testStatus === 'testing'}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {testStatus === 'testing' ? (
                  <RefreshCw size={16} className="animate-spin text-orange-600" />
                ) : (
                  <Sparkles size={16} className="text-amber-500" />
                )}
                Kiểm tra kết nối
              </button>
            </div>

            {testStatus === 'success' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{testMessage}</span>
              </div>
            )}

            {testStatus === 'error' && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{testMessage}</span>
              </div>
            )}
          </div>

          {/* Backup & Restore */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quản lý Dữ liệu Giáo án (Backup JSON)</h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleExportBackup}
                className="p-3 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center gap-3 text-left hover:bg-slate-50 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Download size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Xuất Backup</div>
                  <div className="text-[10px] text-slate-500">Tải file .json</div>
                </div>
              </button>

              <label className="p-3 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center gap-3 text-left hover:bg-slate-50 transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Upload size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Phục hồi</div>
                  <div className="text-[10px] text-slate-500">Nhập file .json</div>
                </div>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          {!isMandatory && (
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
