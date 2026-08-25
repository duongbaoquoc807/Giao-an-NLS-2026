import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, Sparkles, RefreshCw, X, FileUp, 
  HelpCircle, Laptop, ArrowRight, Download, BookOpen, AlertCircle, Eye, ShieldCheck, Zap, FileCheck, Layers
} from 'lucide-react';
import { parseDocumentFile } from '../lib/fileParser';
import { integrateDigitalCompetenciesWithAI } from '../lib/digitalIntegrator';
import { LessonPlan } from '../types';
import { exportToDocx, exportIntegratedDocxFromOriginal } from '../lib/exportDocx';

interface DigitalIntegrationViewProps {
  onIntegrationComplete: (plan: LessonPlan, originalFile?: File | null) => void;
  onOpenSettings: () => void;
}

export function DigitalIntegrationView({ onIntegrationComplete, onOpenSettings }: DigitalIntegrationViewProps) {
  const [subject, setSubject] = useState('Toán');
  const [grade, setGrade] = useState('Lớp 12');
  const [school, setSchool] = useState('Trường THCS & THPT Khánh Lâm');
  const [teacherName, setTeacherName] = useState('Thầy Dương Bảo Quốc');

  // Uploaded Files State
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [ppctFile, setPpctFile] = useState<File | null>(null);
  const [nlsFile, setNlsFile] = useState<File | null>(null);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result Success State
  const [completedPlan, setCompletedPlan] = useState<LessonPlan | null>(null);

  // File Inputs Ref
  const lessonInputRef = useRef<HTMLInputElement>(null);
  const ppctInputRef = useRef<HTMLInputElement>(null);
  const nlsInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (type: 'lesson' | 'ppct' | 'nls', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'lesson') setLessonFile(file);
    if (type === 'ppct') setPpctFile(file);
    if (type === 'nls') setNlsFile(file);
    setErrorMessage(null);
    setCompletedPlan(null);
  };

  const handleStartIntegration = async () => {
    if (!lessonFile) {
      alert('Vui lòng tải lên File Giáo án (.docx, .pdf, .txt) trước khi thực hiện tích hợp!');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setCompletedPlan(null);
    setStatusStep('Đang đọc và phân tích cấu trúc, bảng biểu File Giáo án...');

    try {
      // 1. Parse Lesson Plan file
      const lessonText = await parseDocumentFile(lessonFile);
      if (!lessonText || !lessonText.trim()) {
        throw new Error('Không thể trích xuất văn bản từ file giáo án. Vui lòng kiểm tra lại định dạng file.');
      }

      // 2. Parse PPCT file (if uploaded)
      let ppctText = '';
      if (ppctFile) {
        setStatusStep('Đang đọc tài liệu Phân phối chương trình (PPCT)...');
        ppctText = await parseDocumentFile(ppctFile);
      }

      // 3. Parse NLS framework file (if uploaded)
      let nlsText = '';
      if (nlsFile) {
        setStatusStep('Đang đọc Khung Năng lực số...');
        nlsText = await parseDocumentFile(nlsFile);
      }

      // 4. Run AI Integration
      setStatusStep('AI (Gemini 3.7 Flash) đang phân tích và đính kèm Năng lực số vào các hoạt động...');
      const enrichedPlan = await integrateDigitalCompetenciesWithAI({
        lessonPlanText: lessonText,
        fileName: lessonFile.name,
        ppctText,
        nlsFrameworkText: nlsText,
        subject,
        grade,
        school,
        teacherName
      });

      // 5. Save to local storage
      const stored = localStorage.getItem('lesson_plans');
      const plans: LessonPlan[] = stored ? JSON.parse(stored) : [];
      const updated = [enrichedPlan, ...plans.filter(p => p.id !== enrichedPlan.id)];
      localStorage.setItem('lesson_plans', JSON.stringify(updated));

      setCompletedPlan(enrichedPlan);
      setStatusStep('Đã hoàn tất tích hợp Năng lực số!');

    } catch (err: any) {
      console.error('Integration failed:', err);
      setErrorMessage(err.message || 'Có lỗi xảy ra trong quá trình tích hợp Năng lực số.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportOriginalWithNls = async () => {
    if (!completedPlan || !lessonFile) return;
    await exportIntegratedDocxFromOriginal(lessonFile, completedPlan);
  };

  const handleExportStandardDocx = async () => {
    if (!completedPlan) return;
    await exportToDocx(completedPlan);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Processing Banner */}
        {isProcessing && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <RefreshCw size={20} className="animate-spin text-amber-300" />
              <span className="text-sm font-semibold">{statusStep}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* SUCCESS COMPLETED CARD & DOWNLOAD OPTIONS */}
        {completedPlan && (
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-500/30 space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 rounded-2xl flex items-center justify-center shrink-0">
                  <FileCheck size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                      Hoàn thành tích hợp 100%
                    </span>
                    <span className="text-xs text-emerald-300 font-medium">CV 5512 • Năng lực số</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {completedPlan.title}
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    Đã đính kèm Năng lực số (NLS 1 - NLS 6), công cụ số và 4 bước tổ chức dạy học số.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {/* 1. Export preserving original DOCX layout */}
                {lessonFile && lessonFile.name.endsWith('.docx') && (
                  <button
                    onClick={handleExportOriginalWithNls}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    title="Giữ nguyên 100% định dạng, cột, bảng biểu và font chữ của file gốc"
                  >
                    <Download size={16} />
                    <span>Xuất Word (Giữ 100% định dạng gốc)</span>
                  </button>
                )}

                {/* 2. Export standard 2-column docx */}
                <button
                  onClick={handleExportStandardDocx}
                  className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Xuất Word (Mẫu 2 cột chuẩn 5512)</span>
                </button>

                {/* 3. Open editor */}
                <button
                  onClick={() => onIntegrationComplete(completedPlan, lessonFile)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Eye size={16} />
                  <span>Xem & Chỉnh sửa chi tiết</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2 COLUMNS: INPUT FORMS & FILE UPLOADERS */}
          <div className="lg:col-span-2 space-y-6">

            {/* Section 1: Thông tin Kế hoạch bài dạy */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="font-bold text-base text-slate-900">Thông tin Kế hoạch bài dạy</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Môn học <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium outline-none focus:border-blue-500"
                  >
                    <option value="Toán">Toán</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="KHTN">KHTN</option>
                    <option value="Tin học">Tin học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
                    <option value="Lịch sử">Lịch sử</option>
                    <option value="Địa lý">Địa lý</option>
                    <option value="GDCD / GDKT&PL">GDCD / GDKT&PL</option>
                    <option value="Công nghệ">Công nghệ</option>
                    <option value="Hoạt động trải nghiệm">Hoạt động trải nghiệm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khối lớp <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium outline-none focus:border-blue-500"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={`Lớp ${g}`}>Lớp {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên trường</label>
                  <input 
                    type="text"
                    value={school}
                    onChange={e => setSchool(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
                    placeholder="Trường THCS & THPT Khánh Lâm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giáo viên biên soạn</label>
                  <input 
                    type="text"
                    value={teacherName}
                    onChange={e => setTeacherName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
                    placeholder="Thầy Dương Bảo Quốc"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Tài liệu đầu vào (Uploads) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="font-bold text-base text-slate-900">Tài liệu đầu vào (Kéo thả / Đính kèm)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. File Giáo án (Bắt buộc) */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span className="text-rose-500">*</span> File Giáo án (Bắt buộc)
                  </span>

                  <input 
                    type="file" 
                    ref={lessonInputRef} 
                    onChange={e => handleFileChange('lesson', e)}
                    accept=".docx,.pdf,.txt,.doc"
                    className="hidden" 
                  />

                  {lessonFile ? (
                    <div className="border-2 border-emerald-400 bg-emerald-50/50 p-4 rounded-2xl text-center space-y-2 relative group">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="px-2">
                        <div className="font-bold text-xs text-slate-900 truncate max-w-full" title={lessonFile.name}>
                          {lessonFile.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatFileSize(lessonFile.size)} • Giữ nguyên cấu trúc định dạng
                        </div>
                      </div>
                      <div className="flex justify-center gap-2 pt-1">
                        <button 
                          onClick={() => lessonInputRef.current?.click()} 
                          className="text-[11px] text-blue-600 hover:underline font-semibold"
                        >
                          Đổi file khác
                        </button>
                        <span className="text-slate-300">|</span>
                        <button 
                          onClick={() => setLessonFile(null)} 
                          className="text-[11px] text-rose-600 hover:underline font-semibold"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => lessonInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 p-6 rounded-2xl text-center cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 text-blue-600 rounded-full flex items-center justify-center mx-auto transition-colors">
                        <FileUp size={22} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Tải lên file Giáo án</div>
                        <div className="text-[10px] text-slate-500">Hỗ trợ: .docx, .pdf, .txt</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. File Phân phối chương trình (Tùy chọn) */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">
                    File Phân phối chương trình (Tùy chọn)
                  </span>

                  <input 
                    type="file" 
                    ref={ppctInputRef} 
                    onChange={e => handleFileChange('ppct', e)}
                    accept=".docx,.xlsx,.pdf,.txt"
                    className="hidden" 
                  />

                  {ppctFile ? (
                    <div className="border-2 border-blue-400 bg-blue-50/50 p-4 rounded-2xl text-center space-y-2 relative group">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="px-2">
                        <div className="font-bold text-xs text-slate-900 truncate max-w-full" title={ppctFile.name}>
                          {ppctFile.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatFileSize(ppctFile.size)} • Tài liệu tham chiếu PPCT
                        </div>
                      </div>
                      <div className="flex justify-center gap-2 pt-1">
                        <button 
                          onClick={() => ppctInputRef.current?.click()} 
                          className="text-[11px] text-blue-600 hover:underline font-semibold"
                        >
                          Đổi file khác
                        </button>
                        <span className="text-slate-300">|</span>
                        <button 
                          onClick={() => setPpctFile(null)} 
                          className="text-[11px] text-rose-600 hover:underline font-semibold"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => ppctInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 p-6 rounded-2xl text-center cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 rounded-full flex items-center justify-center mx-auto transition-colors">
                        <FileText size={22} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Tải lên PPCT</div>
                        <div className="text-[10px] text-slate-500">Tài liệu tham khảo năng lực (nếu có)</div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* 3. File Khung Năng lực số riêng (Tùy chọn) */}
              <div className="pt-2">
                <input 
                  type="file" 
                  ref={nlsInputRef} 
                  onChange={e => handleFileChange('nls', e)}
                  accept=".docx,.pdf,.txt"
                  className="hidden" 
                />
                
                {nlsFile ? (
                  <div className="border border-purple-300 bg-purple-50/50 p-3 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 truncate">
                      <CheckCircle2 size={16} className="text-purple-600 shrink-0" />
                      <span className="truncate">Khung NLS riêng: {nlsFile.name} ({formatFileSize(nlsFile.size)})</span>
                    </div>
                    <button onClick={() => setNlsFile(null)} className="text-xs text-rose-600 hover:underline font-bold shrink-0 ml-2">
                      Xóa
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => nlsInputRef.current?.click()}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 hover:underline"
                  >
                    <span>+ Tải lên Khung NLS riêng của trường/sở (Mặc định dùng chuẩn GDPT 2018 NLS1 - NLS6)</span>
                  </button>
                )}
              </div>

              {/* Main Action Submit Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleStartIntegration}
                  disabled={isProcessing || !lessonFile}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500 hover:from-blue-700 hover:via-indigo-700 hover:to-orange-600 disabled:opacity-50 text-white font-extrabold text-sm py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={20} className="animate-spin text-amber-300" />
                      <span>{statusStep}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="text-amber-300" />
                      <span>TỰ ĐỘNG TÍCH HỢP NĂNG LỰC SỐ VỚI AI (GEMINI 3.7 FLASH)</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT 1 COLUMN: QUICK GUIDE & DIGITAL COMPETENCIES CARD */}
          <div className="space-y-6">
            
            {/* Card 1: Hướng dẫn nhanh */}
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <HelpCircle size={20} className="text-amber-400" />
                <span>Hướng dẫn nhanh</span>
              </h3>

              <ol className="space-y-3 text-xs leading-relaxed text-slate-200">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/30 border border-blue-400 text-blue-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Chọn <strong>Môn học</strong> và <strong>Khối lớp</strong> tương ứng.</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span><strong>Bắt buộc:</strong> Kéo thả file giáo án (.docx, .pdf, .txt). Hệ thống <strong>giữ 100% định dạng, cột bảng biểu của file gốc</strong>.</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/30 border border-amber-400 text-amber-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span><strong>Tùy chọn:</strong> Tải file PPCT và Khung NLS riêng nếu muốn AI đối chiếu cụ thể.</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/30 border border-purple-400 text-purple-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    4
                  </span>
                  <span>Nhấn <strong>"Tự động Tích hợp NLS với AI"</strong> để AI đọc và chèn Năng lực số vào các vị trí chuẩn.</span>
                </li>
              </ol>
            </div>

            {/* Card 2: Miền năng lực số */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Laptop size={18} className="text-blue-600" />
                <span>Miền năng lực số (GDPT 2018)</span>
              </h3>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                  <span><strong>NLS 1:</strong> Vận hành thiết bị & phần mềm số</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span><strong>NLS 2:</strong> Khai thác dữ liệu, thông tin & tri thức</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                  <span><strong>NLS 3:</strong> Giao tiếp và Hợp tác trong môi trường số</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  <span><strong>NLS 4:</strong> Sáng tạo nội dung số (Canva, video...)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                  <span><strong>NLS 5:</strong> An toàn và bảo mật trên không gian số</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0"></span>
                  <span><strong>NLS 6:</strong> Giải quyết vấn đề với công nghệ số (GeoGebra, PhET...)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                  <span><strong>Ứng dụng AI:</strong> Tương tác học tập với Trợ lý AI</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
