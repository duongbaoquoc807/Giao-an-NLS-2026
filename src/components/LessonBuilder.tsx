import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Sparkles, Download, Plus, Trash2, ChevronUp, ChevronDown, 
  Copy, Eye, RefreshCw, Layers, Laptop, BookOpen, AlertTriangle, CheckCircle2, Wrench
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { 
  LessonPlan, TeachingActivity, STEP_LABELS, 
  DIGITAL_COMPETENCY_DOMAINS, POPULAR_DIGITAL_TOOLS 
} from '../types';
import { exportToDocx } from '../lib/exportDocx';
import { AIAssistant } from './AIAssistant';
import { generateContent, cleanAndParseJson } from '../lib/gemini';
import { SAMPLE_LESSON_PLANS } from '../data/sampleLessons';
import { generateSmartLessonPlanFallback } from '../lib/smartTemplateGenerator';

interface LessonBuilderProps {
  lessonId: string | null;
  onBack: () => void;
  onOpenSettings?: () => void;
}

export function LessonBuilder({ lessonId, onBack, onOpenSettings }: LessonBuilderProps) {
  const [plan, setPlan] = useState<LessonPlan>({
    id: uuidv4(),
    title: '',
    subject: 'Ngữ văn',
    grade: 'Lớp 6',
    duration: 2,
    school: 'Trường THCS & THPT Khánh Lâm',
    department: 'Tổ Toán - Tin',
    teacherName: 'Thầy Dương Bảo Quốc',
    lessonOrder: 'Tiết 1',
    objectives: {
      knowledge: '',
      competencies: '',
      digitalCompetencies: '',
      qualities: ''
    },
    materials: {
      teacher: 'SGK, máy tính, máy chiếu, bài trình chiếu PowerPoint, bảng tương tác, phiếu học tập.',
      student: 'SGK, vở ghi, thiết bị kết nối internet (nếu làm bài tập số).'
    },
    activities: [],
    updatedAt: new Date().toISOString()
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (lessonId) {
      const stored = localStorage.getItem('lesson_plans');
      let found: LessonPlan | undefined;
      if (stored) {
        const plans: LessonPlan[] = JSON.parse(stored);
        found = plans.find(p => p.id === lessonId);
      }
      if (!found) {
        found = SAMPLE_LESSON_PLANS.find(s => s.id === lessonId);
      }

      if (found) {
        const migrated: LessonPlan = {
          ...found,
          objectives: {
            knowledge: found.objectives?.knowledge || '',
            competencies: found.objectives?.competencies || '',
            digitalCompetencies: found.objectives?.digitalCompetencies || '',
            qualities: found.objectives?.qualities || ''
          },
          materials: typeof found.materials === 'string' 
            ? { teacher: found.materials, student: 'SGK, vở ghi...' }
            : found.materials || { teacher: '', student: '' },
          activities: (found.activities || []).map((a: any) => ({
            ...a,
            implementation: typeof a.implementation === 'string'
              ? {
                  step1_transfer: a.implementation,
                  step2_execute: 'HS thảo luận nhóm thực hiện nhiệm vụ.',
                  step3_report: 'Đại diện HS/Nhóm nộp bài và trình bày.',
                  step4_conclusion: 'GV nhận xét và kết luận.'
                }
              : a.implementation || { step1_transfer: '', step2_execute: '', step3_report: '', step4_conclusion: '' },
            digitalTools: Array.isArray(a.digitalTools) ? a.digitalTools : (a.digitalTools ? [a.digitalTools] : []),
            digitalCompetencyDomain: a.digitalCompetencyDomain || 'NLS 1',
            digitalNotes: a.digitalNotes || ''
          }))
        };
        setPlan(migrated);
        const initExpand: Record<string, boolean> = {};
        migrated.activities.forEach(a => initExpand[a.id] = true);
        setExpandedActivities(initExpand);
      }
    }
  }, [lessonId]);

  const handleSave = () => {
    if (!plan.title.trim()) {
      alert('Vui lòng nhập Tên bài học trước khi lưu!');
      return;
    }
    const stored = localStorage.getItem('lesson_plans');
    let plans: LessonPlan[] = stored ? JSON.parse(stored) : [];
    
    const index = plans.findIndex(p => p.id === plan.id);
    const updatedPlan = { ...plan, updatedAt: new Date().toISOString() };

    if (index >= 0) {
      plans[index] = updatedPlan;
    } else {
      plans.unshift(updatedPlan);
    }
    
    localStorage.setItem('lesson_plans', JSON.stringify(plans));
    showToast('Đã lưu Kế hoạch bài dạy thành công!');
  };

  const autoGenerateFullPlan = async () => {
    if (!plan.title.trim()) {
      alert('Vui lòng nhập tên bài học trước khi tạo giáo án!');
      return;
    }

    const apiKey = localStorage.getItem('gemini_api_key') || '';
    
    if (!apiKey.trim()) {
      const fallback = generateSmartLessonPlanFallback(plan.title, plan.subject, plan.grade, plan.duration);
      setPlan(prev => ({
        ...prev,
        objectives: fallback.objectives || prev.objectives,
        materials: fallback.materials || prev.materials,
        activities: fallback.activities || prev.activities
      }));
      const expands: Record<string, boolean> = {};
      fallback.activities?.forEach(a => expands[a.id] = true);
      setExpandedActivities(expands);
      showToast('Đã tạo Giáo án 5512 chuẩn GDPT 2018 tích hợp Năng lực số!');
      return;
    }

    setIsAiLoading(true);
    setAiError(null);
    setAiStatusMessage('Đang kết nối Gemini AI tạo Kế hoạch bài dạy CV 5512...');

    try {
      const prompt = `Hãy soạn thảo Kế hoạch bài dạy (Giáo án CV 5512) có tích hợp Năng lực số chuẩn GDPT 2018 cho bài học sau:
Tên bài học: "${plan.title}"
Môn: ${plan.subject} | Lớp: ${plan.grade} | Thời lượng: ${plan.duration} tiết

Hãy trả về DUY NHẤT một chuỗi JSON thuần túy (không chứa mã markdown fence):
{
  "knowledge": "...",
  "competencies": "...",
  "digitalCompetencies": "...",
  "qualities": "...",
  "materialsTeacher": "...",
  "materialsStudent": "...",
  "activities": [
    {
      "step": "KHOI_DONG",
      "title": "...",
      "objective": "...",
      "content": "...",
      "product": "...",
      "step1_transfer": "...",
      "step2_execute": "...",
      "step3_report": "...",
      "step4_conclusion": "...",
      "digitalTools": ["Padlet", "Kahoot!"],
      "digitalCompetencyDomain": "NLS 1",
      "digitalNotes": "..."
    },
    {
      "step": "HINH_THANH_KIEN_THUC",
      "title": "...",
      "objective": "...",
      "content": "...",
      "product": "...",
      "step1_transfer": "...",
      "step2_execute": "...",
      "step3_report": "...",
      "step4_conclusion": "...",
      "digitalTools": ["Canva", "Google Docs/Slides"],
      "digitalCompetencyDomain": "NLS 3",
      "digitalNotes": "..."
    },
    {
      "step": "LUYEN_TAP",
      "title": "...",
      "objective": "...",
      "content": "...",
      "product": "...",
      "step1_transfer": "...",
      "step2_execute": "...",
      "step3_report": "...",
      "step4_conclusion": "...",
      "digitalTools": ["Quizizz"],
      "digitalCompetencyDomain": "NLS 2",
      "digitalNotes": "..."
    },
    {
      "step": "VAN_DUNG",
      "title": "...",
      "objective": "...",
      "content": "...",
      "product": "...",
      "step1_transfer": "...",
      "step2_execute": "...",
      "step3_report": "...",
      "step4_conclusion": "...",
      "digitalTools": ["Canva"],
      "digitalCompetencyDomain": "NLS 4",
      "digitalNotes": "..."
    }
  ]
}`;

      const res = await generateContent(
        prompt, 
        'Bạn là chuyên gia sư phạm hàng đầu biên soạn Kế hoạch bài dạy CV 5512.',
        (failedModel, nextModel, errorMsg) => {
          setAiStatusMessage(`Model ${failedModel} bận. Đang tự động chuyển sang ${nextModel}...`);
        }
      );

      const parsed = cleanAndParseJson<any>(res);

      const newActivities: TeachingActivity[] = (parsed.activities || []).map((a: any) => {
        const id = uuidv4();
        return {
          id,
          step: a.step || 'HINH_THANH_KIEN_THUC',
          title: a.title || 'Hoạt động dạy học',
          objective: a.objective || '',
          content: a.content || '',
          product: a.product || '',
          implementation: {
            step1_transfer: a.step1_transfer || '',
            step2_execute: a.step2_execute || '',
            step3_report: a.step3_report || '',
            step4_conclusion: a.step4_conclusion || ''
          },
          digitalTools: Array.isArray(a.digitalTools) ? a.digitalTools : [],
          digitalCompetencyDomain: a.digitalCompetencyDomain || 'NLS 1',
          digitalNotes: a.digitalNotes || ''
        };
      });

      setPlan(prev => ({
        ...prev,
        objectives: {
          knowledge: parsed.knowledge || prev.objectives.knowledge,
          competencies: parsed.competencies || prev.objectives.competencies,
          digitalCompetencies: parsed.digitalCompetencies || prev.objectives.digitalCompetencies,
          qualities: parsed.qualities || prev.objectives.qualities,
        },
        materials: {
          teacher: parsed.materialsTeacher || prev.materials.teacher,
          student: parsed.materialsStudent || prev.materials.student,
        },
        activities: newActivities.length > 0 ? newActivities : prev.activities
      }));

      const expands: Record<string, boolean> = {};
      newActivities.forEach(a => expands[a.id] = true);
      setExpandedActivities(expands);

      showToast('AI đã hoàn tất biên soạn Giáo án 5512!');
    } catch (e: any) {
      console.warn('AI call failed, applying smart fallback engine:', e.message);
      const fallback = generateSmartLessonPlanFallback(plan.title, plan.subject, plan.grade, plan.duration);
      setPlan(prev => ({
        ...prev,
        objectives: fallback.objectives || prev.objectives,
        materials: fallback.materials || prev.materials,
        activities: fallback.activities || prev.activities
      }));
      const expands: Record<string, boolean> = {};
      fallback.activities?.forEach(a => expands[a.id] = true);
      setExpandedActivities(expands);

      setAiError(`Đã dừng do lỗi API (${e.message}). Đã tự động kích hoạt bộ sinh thông minh hoàn thiện giáo án.`);
    } finally {
      setIsAiLoading(false);
      setAiStatusMessage('');
    }
  };

  const autoGenerateObjectivesOnly = async () => {
    if (!plan.title.trim()) {
      alert('Vui lòng nhập tên bài học trước!');
      return;
    }
    setIsAiLoading(true);
    setAiError(null);
    try {
      const prompt = `Hãy viết mục tiêu bài học (1. Kiến thức, 2a. Năng lực chung & đặc thù, 2b. Năng lực số, 3. Phẩm chất) và Thiết bị dạy học cho bài "${plan.title}" môn ${plan.subject} ${plan.grade}.
Trả về JSON thuần túy:
{
  "knowledge": "...",
  "competencies": "...",
  "digitalCompetencies": "...",
  "qualities": "...",
  "materialsTeacher": "...",
  "materialsStudent": "..."
}`;
      const res = await generateContent(prompt);
      const parsed = cleanAndParseJson<any>(res);
      setPlan(prev => ({
        ...prev,
        objectives: {
          knowledge: parsed.knowledge || prev.objectives.knowledge,
          competencies: parsed.competencies || prev.objectives.competencies,
          digitalCompetencies: parsed.digitalCompetencies || prev.objectives.digitalCompetencies,
          qualities: parsed.qualities || prev.objectives.qualities,
        },
        materials: {
          teacher: parsed.materialsTeacher || prev.materials.teacher,
          student: parsed.materialsStudent || prev.materials.student,
        }
      }));
      showToast('Đã cập nhật Mục tiêu & Thiết bị bài học!');
    } catch (e: any) {
      const fb = generateSmartLessonPlanFallback(plan.title, plan.subject, plan.grade, plan.duration);
      setPlan(prev => ({
        ...prev,
        objectives: fb.objectives || prev.objectives,
        materials: fb.materials || prev.materials
      }));
      showToast('Đã gợi ý Mục tiêu & Thiết bị chuẩn GDPT 2018!');
    } finally {
      setIsAiLoading(false);
    }
  };

  const autoGenerateActivitySteps = async (actId: string) => {
    const act = plan.activities.find(a => a.id === actId);
    if (!act) return;
    if (!act.title && !act.content) {
      alert('Vui lòng nhập Tên hoặc Nội dung hoạt động trước.');
      return;
    }
    setIsAiLoading(true);
    setAiError(null);
    try {
      const prompt = `Viết 4 bước tổ chức thực hiện chuẩn CV 5512 cho hoạt động dạy học:
- Tên hoạt động: "${act.title}"
- Mục tiêu: "${act.objective}"
- Nội dung: "${act.content}"
- Môn: ${plan.subject} ${plan.grade}

Trả về JSON thuần túy:
{
  "step1_transfer": "...",
  "step2_execute": "...",
  "step3_report": "...",
  "step4_conclusion": "..."
}`;
      const res = await generateContent(prompt);
      const parsed = cleanAndParseJson<any>(res);
      updateActivity(actId, a => ({
        ...a,
        implementation: {
          step1_transfer: parsed.step1_transfer || a.implementation.step1_transfer,
          step2_execute: parsed.step2_execute || a.implementation.step2_execute,
          step3_report: parsed.step3_report || a.implementation.step3_report,
          step4_conclusion: parsed.step4_conclusion || a.implementation.step4_conclusion,
        }
      }));
      showToast('Đã tạo xong 4 bước tổ chức thực hiện!');
    } catch (e: any) {
      updateActivity(actId, a => ({
        ...a,
        implementation: {
          step1_transfer: `GV chuyển giao nhiệm vụ học tập cho học sinh, hướng dẫn truy cập tài liệu và phiếu học tập.`,
          step2_execute: `Học sinh làm việc cá nhân / nhóm, trao đổi và hoàn thành nhiệm vụ theo yêu cầu.`,
          step3_report: `Đại diện học sinh/nhóm trình bày báo cáo; các thành viên khác lắng nghe, phản biện và góp ý.`,
          step4_conclusion: `Giáo viên nhận xét, đánh giá quá trình làm việc, chuẩn hóa kiến thức và chốt kết luận.`
        }
      }));
      showToast('Đã áp dụng mẫu 4 bước tổ chức CV 5512!');
    } finally {
      setIsAiLoading(false);
    }
  };

  const addActivity = (step: TeachingActivity['step']) => {
    const newId = uuidv4();
    const newAct: TeachingActivity = {
      id: newId,
      step,
      title: `Hoạt động ${plan.activities.length + 1}: ${STEP_LABELS[step].split(':')[1]?.trim() || 'Nội dung mới'}`,
      objective: 'Học sinh nắm vững kiến thức và kỹ năng...',
      content: 'Nhiệm vụ, câu hỏi thảo luận...',
      product: 'Câu trả lời, phiếu học tập hoàn thành...',
      implementation: {
        step1_transfer: 'GV giao nhiệm vụ cho HS...',
        step2_execute: 'HS làm việc cá nhân / thảo luận nhóm...',
        step3_report: 'Báo cáo kết quả thực hiện...',
        step4_conclusion: 'GV nhận xét và kết luận kiến thức...'
      },
      digitalTools: ['Padlet'],
      digitalCompetencyDomain: 'NLS 1',
      digitalNotes: 'Tương tác học tập trên môi trường số'
    };

    setPlan(prev => ({ ...prev, activities: [...prev.activities, newAct] }));
    setExpandedActivities(prev => ({ ...prev, [newId]: true }));
  };

  const updateActivity = (id: string, updater: (act: TeachingActivity) => TeachingActivity) => {
    setPlan(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === id ? updater(a) : a)
    }));
  };

  const deleteActivity = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hoạt động này?')) {
      setPlan(prev => ({ ...prev, activities: prev.activities.filter(a => a.id !== id) }));
    }
  };

  const duplicateActivity = (id: string) => {
    const act = plan.activities.find(a => a.id === id);
    if (!act) return;
    const dupId = uuidv4();
    const dup: TeachingActivity = {
      ...act,
      id: dupId,
      title: `${act.title} (Bản sao)`,
      implementation: { ...act.implementation }
    };
    const index = plan.activities.findIndex(a => a.id === id);
    const newActs = [...plan.activities];
    newActs.splice(index + 1, 0, dup);
    setPlan(prev => ({ ...prev, activities: newActs }));
    setExpandedActivities(prev => ({ ...prev, [dupId]: true }));
  };

  const moveActivity = (index: number, direction: 'up' | 'down') => {
    const newActs = [...plan.activities];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newActs.length) return;
    const temp = newActs[index];
    newActs[index] = newActs[targetIndex];
    newActs[targetIndex] = temp;
    setPlan(prev => ({ ...prev, activities: newActs }));
  };

  const toggleExpand = (id: string) => {
    setExpandedActivities(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const suggestDigitalToolsForActivity = async (id: string) => {
    const act = plan.activities.find(a => a.id === id);
    if (!act) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const prompt = `Gợi ý giải pháp ứng dụng công nghệ và lồng ghép Năng lực số cho hoạt động dạy học:
- Tên hoạt động: "${act.title}"
- Nội dung: "${act.content}"
- Môn học: ${plan.subject} ${plan.grade}

Trả về JSON ngắn gọn:
{
  "digitalTools": ["Padlet", "Canva"],
  "digitalCompetencyDomain": "NLS 3",
  "digitalNotes": "Mô tả ngắn gọn 1-2 câu cách học sinh thực hiện trên công cụ số."
}`;
      const res = await generateContent(prompt);
      const parsed = cleanAndParseJson<any>(res);
      updateActivity(id, a => ({
        ...a,
        digitalTools: parsed.digitalTools || a.digitalTools,
        digitalCompetencyDomain: parsed.digitalCompetencyDomain || a.digitalCompetencyDomain,
        digitalNotes: parsed.digitalNotes || a.digitalNotes
      }));
      showToast('Đã cập nhật gợi ý Công cụ số!');
    } catch (e: any) {
      const defaultTools = plan.subject === 'Toán học' 
        ? ['GeoGebra', 'Liveworksheets']
        : (plan.subject === 'KHTN' ? ['PhET Interactive', 'Google Docs/Slides'] : ['Padlet', 'Canva']);
      updateActivity(id, a => ({
        ...a,
        digitalTools: defaultTools,
        digitalCompetencyDomain: 'NLS 3',
        digitalNotes: 'Học sinh phối hợp làm bài tập và chia sẻ kết quả trực tuyến.'
      }));
      showToast('Đã gợi ý Công cụ số phù hợp môn học!');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 relative overflow-hidden">
      
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Toolbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
              <span>{plan.title || 'Kế hoạch bài dạy mới (CV 5512)'}</span>
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-md border border-blue-200">
                Tích hợp Năng lực số
              </span>
            </h2>
            <p className="text-xs text-slate-500">{plan.subject} • {plan.grade} • {plan.duration} tiết</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={autoGenerateFullPlan}
            disabled={isAiLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            title="Sinh toàn bộ Giáo án 5512 chuẩn kèm Năng lực số"
          >
            {isAiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>Tạo Giáo án 5512 với AI</span>
          </button>

          <button 
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Eye size={15} />
            <span>Xem trước</span>
          </button>

          <button 
            onClick={() => exportToDocx(plan)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download size={15} />
            <span>Xuất Word</span>
          </button>

          <button 
            onClick={handleSave} 
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Save size={15} />
            <span>Lưu giáo án</span>
          </button>

          <button 
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className={`p-2 rounded-xl transition-colors ${showAiAssistant ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            title="Mở Trợ lý AI Sư phạm"
          >
            <Sparkles size={16} />
          </button>
        </div>
      </header>

      {/* AI Processing Banner / Status Message */}
      {isAiLoading && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 font-medium">
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="animate-spin text-amber-600" />
            <span>{aiStatusMessage || 'Đang xử lý biên soạn Kế hoạch bài dạy...'}</span>
          </div>
        </div>
      )}

      {aiError && (
        <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center justify-between text-xs text-rose-800 font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{aiError}</span>
          </div>
          <button onClick={() => setAiError(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Main Content & AI Drawer */}
      <div className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6 pb-24">
          
          {/* Metadata Section */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
              Thông tin hành chính & Bài học
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên trường</label>
                <input 
                  type="text" 
                  value={plan.school || ''}
                  onChange={e => setPlan({...plan, school: e.target.value})}
                  placeholder="VD: Trường THCS & THPT Khánh Lâm"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tổ chuyên môn</label>
                <input 
                  type="text" 
                  value={plan.department || ''}
                  onChange={e => setPlan({...plan, department: e.target.value})}
                  placeholder="VD: Tổ Toán - Tin"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Giáo viên biên soạn</label>
                <input 
                  type="text" 
                  value={plan.teacherName || ''}
                  onChange={e => setPlan({...plan, teacherName: e.target.value})}
                  placeholder="VD: Thầy Dương Bảo Quốc"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tên bài học *</label>
                <input 
                  type="text" 
                  value={plan.title}
                  onChange={e => setPlan({...plan, title: e.target.value})}
                  placeholder="VD: Bài 1: Truyện truyền thuyết - Văn bản Thánh Gióng"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Môn học</label>
                <select 
                  value={plan.subject}
                  onChange={e => setPlan({...plan, subject: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500 font-medium"
                >
                  <option>Ngữ văn</option>
                  <option>Toán học</option>
                  <option>KHTN</option>
                  <option>Tin học</option>
                  <option>Tiếng Anh</option>
                  <option>Lịch sử & Địa lý</option>
                  <option>GDCD / GDKT&PL</option>
                  <option>Công nghệ</option>
                  <option>Nghệ thuật</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lớp & Số tiết</label>
                <div className="flex gap-2">
                  <select 
                    value={plan.grade}
                    onChange={e => setPlan({...plan, grade: e.target.value})}
                    className="w-1/2 px-2 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500 font-medium"
                  >
                    {[6,7,8,9,10,11,12].map(g => <option key={g}>Lớp {g}</option>)}
                  </select>
                  <input 
                    type="number" 
                    min={1} max={10}
                    value={plan.duration}
                    onChange={e => setPlan({...plan, duration: parseInt(e.target.value) || 1})}
                    className="w-1/2 px-2 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500 text-center font-bold"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section I: Objectives */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">I</span>
                Mục tiêu Bài học (CV 5512)
              </h3>

              <button
                type="button"
                onClick={autoGenerateObjectivesOnly}
                disabled={isAiLoading}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sparkles size={14} /> Gợi ý Mục tiêu & Học liệu
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  1. Về Kiến thức
                </label>
                <textarea 
                  rows={2}
                  value={plan.objectives?.knowledge || ''}
                  onChange={e => setPlan({...plan, objectives: {...plan.objectives, knowledge: e.target.value}})}
                  placeholder="Học sinh nêu được, nhận biết được, giải thích được các khái niệm/nội dung bài học..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  2a. Về Năng lực chung & Năng lực đặc thù
                </label>
                <textarea 
                  rows={2}
                  value={plan.objectives?.competencies || ''}
                  onChange={e => setPlan({...plan, objectives: {...plan.objectives, competencies: e.target.value}})}
                  placeholder="Năng lực tự chủ và tự học, giao tiếp và hợp tác, giải quyết vấn đề..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Laptop size={14} className="text-blue-600" />
                    2b. Tích hợp Năng lực số (Digital Competencies GDPT 2018)
                  </label>
                </div>
                <textarea 
                  rows={2}
                  value={plan.objectives?.digitalCompetencies || ''}
                  onChange={e => setPlan({...plan, objectives: {...plan.objectives, digitalCompetencies: e.target.value}})}
                  placeholder="NLS 1: Thao tác phần mềm; NLS 2: Khai thác thông tin; NLS 3: Hợp tác Padlet/Drive; NLS 4: Canva..."
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-blue-200 text-xs outline-none focus:border-blue-500 leading-relaxed"
                />
                
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium py-0.5">Gợi ý nhanh miền NLS:</span>
                  {DIGITAL_COMPETENCY_DOMAINS.map(d => (
                    <button 
                      key={d.id}
                      type="button"
                      onClick={() => {
                        const current = plan.objectives?.digitalCompetencies || '';
                        const addition = `${d.id} (${d.title.split(':')[1]?.trim()})`;
                        setPlan({
                          ...plan,
                          objectives: {
                            ...plan.objectives,
                            digitalCompetencies: current ? `${current}; ${addition}` : addition
                          }
                        });
                      }}
                      className="text-[11px] px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors"
                      title={d.desc}
                    >
                      +{d.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  3. Về Phẩm chất
                </label>
                <textarea 
                  rows={2}
                  value={plan.objectives?.qualities || ''}
                  onChange={e => setPlan({...plan, objectives: {...plan.objectives, qualities: e.target.value}})}
                  placeholder="Yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>
          </section>

          {/* Section II: Materials */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">II</span>
              Thiết bị Dạy học & Học liệu
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">1. Thiết bị & Học liệu Giáo viên</label>
                <textarea 
                  rows={3}
                  value={typeof plan.materials === 'object' ? plan.materials.teacher : plan.materials}
                  onChange={e => setPlan({...plan, materials: {...(typeof plan.materials === 'object' ? plan.materials : { student: '' }), teacher: e.target.value}})}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">2. Thiết bị & Học liệu Học sinh</label>
                <textarea 
                  rows={3}
                  value={typeof plan.materials === 'object' ? plan.materials.student : ''}
                  onChange={e => setPlan({...plan, materials: {...(typeof plan.materials === 'object' ? plan.materials : { teacher: '' }), student: e.target.value}})}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Section III: Teaching Activities */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">III</span>
                Tiến trình Dạy học ({plan.activities.length} hoạt động)
              </h3>

              <div className="flex flex-wrap gap-2">
                {(Object.keys(STEP_LABELS) as Array<keyof typeof STEP_LABELS>).map(step => (
                  <button 
                    key={step} 
                    onClick={() => addActivity(step)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus size={14} />
                    {STEP_LABELS[step].split(':')[0]}
                  </button>
                ))}
              </div>
            </div>

            {plan.activities.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <BookOpen size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-700 mb-1">Chưa có hoạt động dạy học nào</p>
                <p className="text-xs text-slate-500 mb-4">Nhấn nút bên trên hoặc nút AI để tạo tự động tiến trình dạy học</p>
                <button 
                  onClick={autoGenerateFullPlan}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all"
                >
                  <Sparkles size={14} /> Tạo toàn bộ tiến trình với AI
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {plan.activities.map((act, index) => {
                  const isExpanded = expandedActivities[act.id] !== false;
                  return (
                    <div key={act.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button 
                            onClick={() => toggleExpand(act.id)}
                            className="p-1 hover:bg-slate-200 rounded-md text-slate-500"
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg shrink-0">
                            {STEP_LABELS[act.step].split(':')[0]}
                          </span>
                          <input 
                            type="text" 
                            value={act.title}
                            onChange={e => updateActivity(act.id, a => ({ ...a, title: e.target.value }))}
                            placeholder="Tên hoạt động..."
                            className="font-bold text-slate-900 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none flex-1 truncate px-1 py-0.5"
                          />
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => moveActivity(index, 'up')} 
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" 
                            title="Di chuyển lên"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button 
                            onClick={() => moveActivity(index, 'down')} 
                            disabled={index === plan.activities.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" 
                            title="Di chuyển xuống"
                          >
                            <ChevronDown size={16} />
                          </button>
                          <button 
                            onClick={() => duplicateActivity(act.id)}
                            className="p-1 text-slate-400 hover:text-blue-600" 
                            title="Nhân bản"
                          >
                            <Copy size={16} />
                          </button>
                          <button 
                            onClick={() => deleteActivity(act.id)}
                            className="p-1 text-slate-400 hover:text-rose-600" 
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">a) Mục tiêu</label>
                              <textarea 
                                rows={3}
                                value={act.objective}
                                onChange={e => updateActivity(act.id, a => ({ ...a, objective: e.target.value }))}
                                placeholder="Học sinh thực hiện được..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">b) Nội dung</label>
                              <textarea 
                                rows={3}
                                value={act.content}
                                onChange={e => updateActivity(act.id, a => ({ ...a, content: e.target.value }))}
                                placeholder="Nhiệm vụ, câu hỏi, bài tập..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">c) Sản phẩm</label>
                              <textarea 
                                rows={3}
                                value={act.product}
                                onChange={e => updateActivity(act.id, a => ({ ...a, product: e.target.value }))}
                                placeholder="Câu trả lời, bảng nhóm, bài vẽ, bài làm số..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          {/* d) Tổ chức thực hiện 4 bước */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                            <div className="flex justify-between items-center">
                              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                d) Tổ chức thực hiện (CV 5512 - 4 bước chuẩn)
                              </h5>
                              <button
                                type="button"
                                onClick={() => autoGenerateActivitySteps(act.id)}
                                disabled={isAiLoading}
                                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors"
                              >
                                <Sparkles size={12} /> AI gợi ý 4 bước
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                                  Bước 1: Chuyển giao nhiệm vụ
                                </label>
                                <textarea 
                                  rows={2}
                                  value={act.implementation?.step1_transfer || ''}
                                  onChange={e => updateActivity(act.id, a => ({
                                    ...a,
                                    implementation: { ...a.implementation, step1_transfer: e.target.value }
                                  }))}
                                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                                  Bước 2: Thực hiện nhiệm vụ
                                </label>
                                <textarea 
                                  rows={2}
                                  value={act.implementation?.step2_execute || ''}
                                  onChange={e => updateActivity(act.id, a => ({
                                    ...a,
                                    implementation: { ...a.implementation, step2_execute: e.target.value }
                                  }))}
                                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                                  Bước 3: Báo cáo, thảo luận
                                </label>
                                <textarea 
                                  rows={2}
                                  value={act.implementation?.step3_report || ''}
                                  onChange={e => updateActivity(act.id, a => ({
                                    ...a,
                                    implementation: { ...a.implementation, step3_report: e.target.value }
                                  }))}
                                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                                  Bước 4: Kết luận, nhận định
                                </label>
                                <textarea 
                                  rows={2}
                                  value={act.implementation?.step4_conclusion || ''}
                                  onChange={e => updateActivity(act.id, a => ({
                                    ...a,
                                    implementation: { ...a.implementation, step4_conclusion: e.target.value }
                                  }))}
                                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* e) Digital Tools & Competency Integration */}
                          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Wrench size={14} className="text-amber-600" />
                                e) Tích hợp Công cụ số & Năng lực số
                              </label>
                              <button 
                                type="button"
                                onClick={() => suggestDigitalToolsForActivity(act.id)}
                                disabled={isAiLoading}
                                className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-md transition-colors"
                              >
                                <Sparkles size={12} /> AI gợi ý công cụ số
                              </button>
                            </div>

                            <div>
                              <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                                Chọn Công cụ số sử dụng:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {POPULAR_DIGITAL_TOOLS.map(t => {
                                  const isSelected = act.digitalTools.includes(t.name);
                                  return (
                                    <button 
                                      key={t.name}
                                      type="button"
                                      onClick={() => {
                                        const newTools = isSelected 
                                          ? act.digitalTools.filter(item => item !== t.name)
                                          : [...act.digitalTools, t.name];
                                        updateActivity(act.id, a => ({ ...a, digitalTools: newTools }));
                                      }}
                                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 font-medium ${
                                        isSelected 
                                          ? 'bg-amber-500 text-white border-amber-600 font-semibold shadow-xs' 
                                          : 'bg-white text-slate-700 border-slate-300 hover:border-amber-400'
                                      }`}
                                    >
                                      <span>{t.icon}</span>
                                      <span>{t.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Thành tố / Miền Năng lực số phát triển
                                </label>
                                <select 
                                  value={act.digitalCompetencyDomain}
                                  onChange={e => updateActivity(act.id, a => ({ ...a, digitalCompetencyDomain: e.target.value }))}
                                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs outline-none focus:border-amber-500"
                                >
                                  {DIGITAL_COMPETENCY_DOMAINS.map(d => (
                                    <option key={d.id} value={d.id}>
                                      {d.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Ghi chú lồng ghép công cụ số cụ thể
                                </label>
                                <input 
                                  type="text" 
                                  value={act.digitalNotes}
                                  onChange={e => updateActivity(act.id, a => ({ ...a, digitalNotes: e.target.value }))}
                                  placeholder="VD: Học sinh truy cập Padlet nộp sản phẩm sơ đồ tư duy nhóm..."
                                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* AI Assistant Drawer Panel */}
        {showAiAssistant && (
          <div className="w-80 md:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-xl z-20 animate-in slide-in-from-right duration-200">
             <AIAssistant 
              context={`Bài: ${plan.title || 'Chưa rõ'}, Môn: ${plan.subject}, Khối: ${plan.grade}`} 
              onClose={() => setShowAiAssistant(false)} 
            />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 font-bold text-base">
                <Eye size={18} className="text-blue-400" />
                <span>Xem trước Giáo án CV 5512 tích hợp Năng lực số</span>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto font-serif space-y-4 text-slate-900 text-sm leading-relaxed bg-slate-50">
              <div className="bg-white p-8 rounded-xl shadow-xs border border-slate-200 space-y-4">
                <div className="flex justify-between font-bold text-xs">
                  <div>
                    <p>TRƯỜNG: {plan.school || '..................'}</p>
                    <p>TỔ CHUYÊN MÔN: {plan.department || '..................'}</p>
                  </div>
                  <div className="text-right">
                    <p>GV: {plan.teacherName || '..................'}</p>
                    <p>Tiết: {plan.lessonOrder || plan.duration + ' tiết'}</p>
                  </div>
                </div>

                <div className="text-center py-2">
                  <h3 className="font-bold text-base tracking-wide">KẾ HOẠCH BÀI DẠY (CV 5512)</h3>
                  <h4 className="font-bold text-lg text-blue-900">{(plan.title || '').toUpperCase()}</h4>
                  <p className="text-xs italic">Môn: {plan.subject} | Lớp: {plan.grade} | Thời lượng: {plan.duration} tiết</p>
                </div>

                <div>
                  <h5 className="font-bold">I. MỤC TIÊU</h5>
                  <p className="pl-4"><strong>1. Kiến thức:</strong> {plan.objectives?.knowledge}</p>
                  <p className="pl-4"><strong>2. Năng lực:</strong></p>
                  <p className="pl-8">- Chung & Đặc thù: {plan.objectives?.competencies}</p>
                  <p className="pl-8 text-blue-700 font-semibold">- Năng lực số: {plan.objectives?.digitalCompetencies}</p>
                  <p className="pl-4"><strong>3. Phẩm chất:</strong> {plan.objectives?.qualities}</p>
                </div>

                <div>
                  <h5 className="font-bold">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h5>
                  <p className="pl-4"><strong>1. GV:</strong> {typeof plan.materials === 'object' ? plan.materials.teacher : plan.materials}</p>
                  <p className="pl-4"><strong>2. HS:</strong> {typeof plan.materials === 'object' ? plan.materials.student : ''}</p>
                </div>

                <div>
                  <h5 className="font-bold">III. TIẾN TRÌNH DẠY HỌC</h5>
                  {plan.activities.map((act, idx) => (
                    <div key={act.id} className="pl-4 my-3 border-l-2 border-blue-200 pl-3">
                      <p className="font-bold text-blue-900">{STEP_LABELS[act.step] || `Hoạt động ${idx + 1}`}: {act.title}</p>
                      <p className="pl-2">a) Mục tiêu: {act.objective}</p>
                      <p className="pl-2">b) Nội dung: {act.content}</p>
                      <p className="pl-2">c) Sản phẩm: {act.product}</p>
                      <p className="pl-2">d) Tổ chức thực hiện:</p>
                      <p className="pl-6"><em>- Bước 1:</em> {act.implementation?.step1_transfer}</p>
                      <p className="pl-6"><em>- Bước 2:</em> {act.implementation?.step2_execute}</p>
                      <p className="pl-6"><em>- Bước 3:</em> {act.implementation?.step3_report}</p>
                      <p className="pl-6"><em>- Bước 4:</em> {act.implementation?.step4_conclusion}</p>
                      <p className="pl-2 text-amber-700 font-semibold">
                        e) Công cụ/Năng lực số: [{Array.isArray(act.digitalTools) ? act.digitalTools.join(', ') : act.digitalTools}] ({act.digitalCompetencyDomain}) - {act.digitalNotes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
              <button 
                onClick={() => exportToDocx(plan)} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <Download size={16} /> Tải file Word (.docx)
              </button>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
