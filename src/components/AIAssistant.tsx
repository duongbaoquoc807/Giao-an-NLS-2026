import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles, Lightbulb } from 'lucide-react';
import { generateContent } from '../lib/gemini';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

export function AIAssistant({ context, onClose }: { context: string, onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      text: 'Kính chào Thầy/Cô! Tôi là Trợ lý AI Chuyên môn Sư phạm. Tôi có thể hỗ trợ Thầy/Cô thiết kế trò chơi khởi động, lồng ghép Năng lực số (Padlet, Kahoot, Canva, GeoGebra...), tạo Phiếu học tập hoặc lập Rubric đánh giá.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (customText?: string) => {
    const userMessage = (customText || input).trim();
    if (!userMessage || isLoading) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const prompt = `Bối cảnh bài học hiện tại: ${context}\nYêu cầu của giáo viên: ${userMessage}`;
      const response = await generateContent(
        prompt, 
        'Bạn là Chuyên gia Công nghệ Giáo dục (EdTech) và Phương pháp Dạy học theo CV 5512. Hãy trả lời ngắn gọn, cô đọng, định dạng trình bày rõ ràng có gạch đầu dòng.'
      );
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', text: `Lỗi kết nối AI: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Gợi ý trò chơi khởi động lồng ghép công cụ số',
    'Làm sao lồng ghép Năng lực số vào Hoạt động hình thành kiến thức?',
    'Tạo Rubric đánh giá sản phẩm làm việc nhóm số',
    'Gợi ý 3 công cụ số phù hợp bài học này'
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Sparkles size={18} className="text-amber-400" />
          <span>Trợ lý AI Sư phạm 5512</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'ai' ? 'bg-orange-100 text-orange-600' : 'bg-blue-600 text-white'
            }`}>
              {msg.role === 'ai' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`px-3.5 py-2.5 rounded-2xl max-w-[88%] ${
              msg.role === 'ai' 
                ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs' 
                : 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-xs">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 shrink-0 space-y-1.5">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Lightbulb size={12} className="text-amber-500" />
          <span>Gợi ý câu hỏi nhanh:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {quickPrompts.map((qp, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={isLoading}
              className="text-[11px] text-left px-2 py-1 bg-white hover:bg-orange-50 hover:text-orange-700 text-slate-600 border border-slate-200 rounded-md transition-colors leading-tight"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi AI về phương pháp & Năng lực số..."
            className="flex-1 px-3.5 py-2 bg-slate-100 border-transparent focus:bg-white border focus:border-orange-500 rounded-xl text-xs outline-none transition-colors"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
