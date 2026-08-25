import { useState, useEffect, ChangeEvent } from 'react';
import { 
  X, Key, Save, Download, Upload, CheckCircle2, AlertCircle, Sparkles, RefreshCw, ExternalLink, Cpu, Zap, Flame
} from 'lucide-react';
import { generateContent, VALID_FALLBACK_MODELS } from '../lib/gemini';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
  isMandatory?: boolean;
}

export const AI_MODELS_INFO = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tag: 'Khuyên dùng - Mới nhất',
    desc: 'Model thế hệ 2.5 siêu tốc của Google, tối ưu biên soạn Kế hoạch bài dạy CV 5512 tích hợp Năng lực số chuẩn GDPT 2018.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    tag: 'Chuyên sâu & Lý luận cao',
    desc: 'Model cao cấp thế hệ 2.5 với khả năng tư duy sư phạm sâu sắc, thiết kế ma trận, Rubric đánh giá và chuỗi hoạt động nâng cao.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    tag: 'Tốc độ phản hồi tức thì',
    desc: 'Thế hệ 2.0 phản hồi cực nhanh, xử lý mượt mà trên mọi tác vụ soạn giáo án và gợi ý công cụ số.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'gemini-2.0-pro',
    name: 'Gemini 2.0 Pro',
    tag: 'Chuyên đề liên môn & STEM',
    desc: 'Thiết kế các dự án dạy học tích hợp liên môn, chủ đề STEM/STEAM và kế hoạch giáo dục toàn diện.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash (Preview)',
    tag: 'Thế hệ AI tương lai',
    desc: 'Phiên bản tiên phong của thế hệ 3.0, hỗ trợ tự động kết nối mô hình mới nhất khi Google triển khai.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
  }
];

export function SettingsModal({ isOpen, onClose, onDataRestored, isMandatory }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('gemini_api_key') || '';
      const storedModel = localStorage.getItem('selected_gemini_model') || 'gemini-2.5-flash';
      setApiKey(storedKey);
      setSelectedModel(storedModel);
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKeyAndModel = () => {
    if (!apiKey.trim()) {
      alert('Vui lòng nhập Gemini API Key để tiếp tục.');
      return;
    }
    localStorage.setItem('gemini_api_key', apiKey.trim());
    localStorage.setItem('selected_gemini_model', selectedModel);
    window.dispatchEvent(new Event('storage'));
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
    setTestStatus('testing');
    setTestMessage(`Đang thử nghiệm kết nối với model ${selectedModel}...`);
    
    localStorage.setItem('gemini_api_key', apiKey.trim());
    localStorage.setItem('selected_gemini_model', selectedModel);
    window.dispatchEvent(new Event('storage'));

    try {
      const result = await generateContent('Hãy trả lời ngắn gọn: "Kết nối thành công!"');
      if (result) {
        setTestStatus('success');
        setTestMessage(`Kết nối thành công với ${selectedModel}! Trợ lý AI sẵn sàng biên soạn giáo án.`);
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
              Chọn Model AI Thế Hệ Mới (Từ Gemini 2.5 Flash trở lên)
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
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="aiModel" 
                      checked={isSelected}
                      onChange={() => setSelectedModel(model.id)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          {model.name}
                          {model.id.includes('2.5') && <Zap size={14} className="text-amber-500 fill-amber-500" />}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${model.badgeColor}`}>
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
              * Quy trình Fallback tự động thông minh: Hệ thống ưu tiên model đã chọn và tự động chuyển đổi mượt mà khi model đạt giới hạn hạn ngạch (quota).
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
