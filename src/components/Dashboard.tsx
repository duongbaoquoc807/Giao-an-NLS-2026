import { useState, useEffect } from 'react';
import { 
  FileText, Clock, Plus, Trash2, Download, Search, Filter, 
  Sparkles, Copy, BookOpen, Layers, Laptop, CheckCircle2, ArrowRight
} from 'lucide-react';
import { LessonPlan } from '../types';
import { exportToDocx } from '../lib/exportDocx';
import { SAMPLE_LESSON_PLANS } from '../data/sampleLessons';

export function Dashboard({ onEdit, onCreateNew }: { onEdit: (id: string) => void, onCreateNew: () => void }) {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'my-plans' | 'samples'>('my-plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    const stored = localStorage.getItem('lesson_plans');
    if (stored) {
      try {
        setPlans(JSON.parse(stored));
      } catch (e) {
        setPlans(SAMPLE_LESSON_PLANS);
        localStorage.setItem('lesson_plans', JSON.stringify(SAMPLE_LESSON_PLANS));
      }
    } else {
      setPlans(SAMPLE_LESSON_PLANS);
      localStorage.setItem('lesson_plans', JSON.stringify(SAMPLE_LESSON_PLANS));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa giáo án này khỏi thư viện cá nhân?')) {
      const updated = plans.filter(p => p.id !== id);
      setPlans(updated);
      localStorage.setItem('lesson_plans', JSON.stringify(updated));
    }
  };

  const handleDuplicate = (plan: LessonPlan) => {
    const dup: LessonPlan = {
      ...plan,
      id: `copy-${Date.now()}`,
      title: `${plan.title} (Bản sao)`,
      updatedAt: new Date().toISOString()
    };
    const updated = [dup, ...plans];
    setPlans(updated);
    localStorage.setItem('lesson_plans', JSON.stringify(updated));
    onEdit(dup.id);
  };

  const handleUseSample = (sample: LessonPlan) => {
    const copy: LessonPlan = {
      ...sample,
      id: `sample-copy-${Date.now()}`,
      title: `${sample.title} (Biên soạn từ Mẫu)`,
      updatedAt: new Date().toISOString()
    };
    const updated = [copy, ...plans];
    setPlans(updated);
    localStorage.setItem('lesson_plans', JSON.stringify(updated));
    onEdit(copy.id);
  };

  const targetList = activeTab === 'my-plans' ? plans : SAMPLE_LESSON_PLANS;
  
  const filteredPlans = targetList.filter(p => {
    const matchSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = selectedSubject === 'ALL' || p.subject === selectedSubject;
    const matchGrade = selectedGrade === 'ALL' || p.grade === selectedGrade;
    return matchSearch && matchSubject && matchGrade;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Banner */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs font-semibold">
              <Sparkles size={14} className="text-amber-400" />
              <span>Chương trình GDPT 2018 & Khung Năng lực số</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Quản lý & Soạn thảo Giáo án CV 5512
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Hệ thống hỗ trợ giáo viên thiết kế Kế hoạch bài dạy chuẩn công văn 5512 của Bộ GD&ĐT có tích hợp Công cụ & Năng lực số thế hệ mới.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3">
            <button 
              onClick={onCreateNew}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-orange-500/25 shrink-0"
            >
              <Plus size={20} />
              Tạo Giáo án Mới
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{plans.length}</div>
              <div className="text-xs text-slate-500 font-medium">Giáo án đã lưu</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Laptop size={24} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">100%</div>
              <div className="text-xs text-slate-500 font-medium">Chuẩn Năng lực số</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">5512</div>
              <div className="text-xs text-slate-500 font-medium">Chuẩn CV BGD&ĐT</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{SAMPLE_LESSON_PLANS.length}</div>
              <div className="text-xs text-slate-500 font-medium">Giáo án Mẫu sẵn dùng</div>
            </div>
          </div>
        </div>

        {/* Search, Filter & Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
            <div className="flex bg-slate-200/70 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('my-plans')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'my-plans' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Giáo án của tôi ({plans.length})
              </button>
              <button 
                onClick={() => setActiveTab('samples')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'samples' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles size={14} className="text-amber-500" />
                Thư viện Mẫu ({SAMPLE_LESSON_PLANS.length})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài học, môn học..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <select 
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-medium"
              >
                <option value="ALL">Tất cả Môn học</option>
                <option value="Ngữ văn">Ngữ văn</option>
                <option value="Toán học">Toán học</option>
                <option value="KHTN">KHTN</option>
                <option value="Tin học">Tin học</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
              </select>

              <select 
                value={selectedGrade}
                onChange={e => setSelectedGrade(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 font-medium"
              >
                <option value="ALL">Tất cả Khối lớp</option>
                {[6,7,8,9,10,11,12].map(g => <option key={g} value={`Lớp ${g}`}>Lớp {g}</option>)}
              </select>
            </div>
          </div>

          {/* Lesson Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div 
                key={plan.id} 
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        {plan.subject}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-1 rounded-lg">
                        {plan.grade}
                      </span>
                    </div>

                    {activeTab === 'my-plans' && (
                      <button 
                        onClick={() => handleDelete(plan.id)} 
                        className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                        title="Xóa giáo án"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-base text-slate-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {plan.title || 'Chưa có tiêu đề'}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-400" />
                      <span>{plan.duration} tiết</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers size={14} className="text-slate-400" />
                      <span>{plan.activities.length} hoạt động</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 mb-6 space-y-1">
                    <div className="font-bold text-blue-700 flex items-center gap-1">
                      <Laptop size={12} /> Năng lực số lồng ghép:
                    </div>
                    <div className="line-clamp-2 text-slate-600">
                      {plan.objectives?.digitalCompetencies || 'NLS 1 - Vận hành thiết bị & phần mềm số'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  {activeTab === 'my-plans' ? (
                    <>
                      <button 
                        onClick={() => onEdit(plan.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
                      >
                        Chỉnh sửa
                      </button>
                      <button 
                        onClick={() => handleDuplicate(plan)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                        title="Nhân bản bản sao"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={() => exportToDocx(plan)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                        title="Xuất Word (.docx)"
                      >
                        <Download size={16} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleUseSample(plan)}
                      className="w-full bg-slate-900 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-2"
                    >
                      <span>Sử dụng mẫu này</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {filteredPlans.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">Không tìm thấy giáo án phù hợp</h3>
                <p className="text-xs text-slate-500 mb-4">Hãy thử tìm kiếm từ khóa khác hoặc tạo mới giáo án</p>
                <button 
                  onClick={onCreateNew} 
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus size={16} /> Tạo giáo án mới
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
