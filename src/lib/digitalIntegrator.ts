import { v4 as uuidv4 } from 'uuid';
import { LessonPlan, TeachingActivity, STEP_LABELS } from '../types';
import { generateContent, cleanAndParseJson } from './gemini';

export interface IntegrationInput {
  lessonPlanText: string;
  fileName?: string;
  ppctText?: string;
  nlsFrameworkText?: string;
  subject: string;
  grade: string;
  school?: string;
  teacherName?: string;
}

/**
 * AI Engine to read an existing Lesson Plan and weave Digital Competencies & Tools into it
 */
export async function integrateDigitalCompetenciesWithAI(input: IntegrationInput): Promise<LessonPlan> {
  const { lessonPlanText, ppctText, nlsFrameworkText, subject, grade, school, teacherName } = input;

  const prompt = `Bạn là Chuyên gia Cao cấp về Phương pháp Dạy học GDPT 2018 và Tích hợp Năng lực số (Digital Competencies) theo Công văn 5512/BGDĐT-GDTrH.

Nhiệm vụ: Đọc kỹ Giáo án gốc bên dưới, GIỮ NGUYÊN 100% nội dung chuyên môn, kiến thức, câu hỏi và bài tập gốc của Giáo viên, sau đó TÍCH HỢP BỔ SUNG NĂNG LỰC SỐ VÀ CÔNG CỤ SỐ VÀO CÁC VỊ TRÍ HỢP LÝ NHẤT.

[THÔNG TIN BỔ TRỢ]
- Môn học: ${subject}
- Khối lớp: ${grade}
${ppctText ? `- Tài liệu Phân phối chương trình (PPCT) tham khảo:\n${ppctText.substring(0, 1500)}` : ''}
${nlsFrameworkText ? `- Khung Năng lực số trường tham chiếu:\n${nlsFrameworkText.substring(0, 1500)}` : ''}

[GIÁO ÁN GỐC CẦN TÍCH HỢP]
${lessonPlanText.substring(0, 9000)}

[YÊU CẦU ĐẦU RA]
Trả về DUY NHẤT một chuỗi JSON thuần túy (không chứa mã markdown fence):
{
  "title": "Tên bài học trích xuất từ giáo án gốc",
  "duration": 2,
  "school": "${school || 'Trường THCS & THPT Khánh Lâm'}",
  "department": "Tổ Toán - Tin",
  "teacherName": "${teacherName || 'Thầy Dương Bảo Quốc'}",
  "lessonOrder": "Tiết 1 - 2",
  "objectives": {
    "knowledge": "Kiến thức từ giáo án gốc",
    "competencies": "Năng lực chung & đặc thù từ giáo án gốc",
    "digitalCompetencies": "Năng lực số cụ thể (NLS 1, NLS 2, NLS 3, NLS 4, NLS 5, NLS 6) được AI bổ sung phù hợp bài học này",
    "qualities": "Phẩm chất từ giáo án gốc"
  },
  "materials": {
    "teacher": "Học liệu GV gốc + bổ sung thiết bị số (máy chiếu, bài giảng số, Padlet, Canva, GeoGebra...)",
    "student": "Học liệu HS gốc + bổ sung thiết bị số (điện thoại thông minh/máy tính bảng kết nối internet...)"
  },
  "activities": [
    {
      "step": "KHOI_DONG",
      "title": "Tên Hoạt động 1 từ giáo án gốc",
      "objective": "Mục tiêu HĐ 1 gốc",
      "content": "Nội dung HĐ 1 gốc",
      "product": "Sản phẩm HĐ 1 gốc",
      "step1_transfer": "Bước 1 chuyển giao nhiệm vụ (có lồng ghép thao tác số)",
      "step2_execute": "Bước 2 thực hiện nhiệm vụ (HS thao tác thiết bị số/tra cứu/làm việc nhóm)",
      "step3_report": "Bước 3 báo cáo, thảo luận (trình chiếu/nộp bài trên nền tảng số)",
      "step4_conclusion": "Bước 4 nhận xét, kết luận của giáo viên",
      "digitalTools": ["Kahoot!", "Padlet"],
      "digitalCompetencyDomain": "NLS 1: Vận hành thiết bị & phần mềm số",
      "digitalNotes": "Mô tả chi tiết cách HS và GV sử dụng công cụ số trong hoạt động này"
    },
    {
      "step": "HINH_THANH_KIEN_THUC",
      "title": "Tên Hoạt động 2 từ giáo án gốc",
      "objective": "Mục tiêu HĐ 2",
      "content": "Nội dung HĐ 2",
      "product": "Sản phẩm HĐ 2",
      "step1_transfer": "Bước 1...",
      "step2_execute": "Bước 2...",
      "step3_report": "Bước 3...",
      "step4_conclusion": "Bước 4...",
      "digitalTools": ["Padlet", "Canva"],
      "digitalCompetencyDomain": "NLS 3: Giao tiếp & Hợp tác trong môi trường số",
      "digitalNotes": "Mô tả..."
    },
    {
      "step": "LUYEN_TAP",
      "title": "Tên Hoạt động 3 từ giáo án gốc",
      "objective": "Mục tiêu HĐ 3",
      "content": "Nội dung HĐ 3",
      "product": "Sản phẩm HĐ 3",
      "step1_transfer": "Bước 1...",
      "step2_execute": "Bước 2...",
      "step3_report": "Bước 3...",
      "step4_conclusion": "Bước 4...",
      "digitalTools": ["Quizizz"],
      "digitalCompetencyDomain": "NLS 2: Khai thác dữ liệu, thông tin & tri thức",
      "digitalNotes": "Mô tả..."
    },
    {
      "step": "VAN_DUNG",
      "title": "Tên Hoạt động 4 từ giáo án gốc",
      "objective": "Mục tiêu HĐ 4",
      "content": "Nội dung HĐ 4",
      "product": "Sản phẩm HĐ 4",
      "step1_transfer": "Bước 1...",
      "step2_execute": "Bước 2...",
      "step3_report": "Bước 3...",
      "step4_conclusion": "Bước 4...",
      "digitalTools": ["Canva"],
      "digitalCompetencyDomain": "NLS 4: Sáng tạo nội dung số",
      "digitalNotes": "Mô tả..."
    }
  ]
}`;

  try {
    const rawResult = await generateContent(prompt);
    const parsed = cleanAndParseJson<any>(rawResult);

    const integratedActivities: TeachingActivity[] = (parsed.activities || []).map((a: any) => ({
      id: uuidv4(),
      step: a.step || 'HINH_THANH_KIEN_THUC',
      title: a.title || 'Hoạt động dạy học',
      objective: a.objective || '',
      content: a.content || '',
      product: a.product || '',
      implementation: {
        step1_transfer: a.step1_transfer || 'GV giao nhiệm vụ cho HS...',
        step2_execute: a.step2_execute || 'HS thảo luận và thực hiện...',
        step3_report: a.step3_report || 'Báo cáo kết quả trên bảng tương tác/Padlet...',
        step4_conclusion: a.step4_conclusion || 'GV nhận xét và chuẩn hóa...'
      },
      digitalTools: Array.isArray(a.digitalTools) ? a.digitalTools : ['Padlet'],
      digitalCompetencyDomain: a.digitalCompetencyDomain || 'NLS 1',
      digitalNotes: a.digitalNotes || 'Ứng dụng công nghệ số hỗ trợ dạy học'
    }));

    return {
      id: uuidv4(),
      title: parsed.title || extractTitleFromText(lessonPlanText) || 'Kế hoạch bài dạy đã tích hợp NLS',
      subject: subject || 'Toán học',
      grade: grade || 'Lớp 12',
      duration: parsed.duration || 2,
      school: parsed.school || school || 'Trường THCS & THPT Khánh Lâm',
      department: parsed.department || 'Tổ Toán - Tin',
      teacherName: parsed.teacherName || teacherName || 'Thầy Dương Bảo Quốc',
      lessonOrder: parsed.lessonOrder || 'Tiết 1',
      objectives: {
        knowledge: parsed.objectives?.knowledge || 'Nắm vững kiến thức trọng tâm của bài học.',
        competencies: parsed.objectives?.competencies || 'Năng lực tự học, giao tiếp và hợp tác.',
        digitalCompetencies: parsed.objectives?.digitalCompetencies || 'NLS 1 (Vận hành thiết bị số), NLS 3 (Giao tiếp & Hợp tác số trên Padlet), NLS 4 (Sáng tạo nội dung số với Canva).',
        qualities: parsed.objectives?.qualities || 'Chăm chỉ, trung thực, trách nhiệm.'
      },
      materials: {
        teacher: parsed.materials?.teacher || 'SGK, máy tính, máy chiếu, bài trình chiếu PowerPoint, bảng tương tác, link Padlet/Quizizz.',
        student: parsed.materials?.student || 'SGK, vở ghi, thiết bị thông minh có kết nối internet.'
      },
      activities: integratedActivities.length > 0 ? integratedActivities : generateFallbackActivities(lessonPlanText, subject),
      updatedAt: new Date().toISOString()
    };
  } catch (err) {
    console.warn('AI integration error, applying smart local integration:', err);
    return buildSmartFallbackIntegratedPlan(input);
  }
}

/**
 * Heuristic extractor for lesson title
 */
function extractTitleFromText(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 15)) {
    if (/^(bài|chủ đề|tiết|kế hoạch bài dạy|tên bài)/i.test(line) && line.length > 5) {
      return line.replace(/^(bài\s*\d*[:.-]?|chủ đề[:.-]?|kế hoạch bài dạy[:.-]?)/i, '').trim();
    }
  }
  return lines[0] || 'Kế hoạch bài dạy';
}

/**
 * Smart offline integration fallback
 */
function buildSmartFallbackIntegratedPlan(input: IntegrationInput): LessonPlan {
  const title = extractTitleFromText(input.lessonPlanText);
  return {
    id: uuidv4(),
    title: title || 'Kế hoạch bài dạy đã tích hợp Năng lực số',
    subject: input.subject,
    grade: input.grade,
    duration: 2,
    school: input.school || 'Trường THCS & THPT Khánh Lâm',
    department: 'Tổ Toán - Tin',
    teacherName: input.teacherName || 'Thầy Dương Bảo Quốc',
    lessonOrder: 'Tiết 1 - 2',
    objectives: {
      knowledge: `Học sinh nắm vững kiến thức cốt lõi, khái niệm và phương pháp giải quyết vấn đề của "${title}" môn ${input.subject}.`,
      competencies: `Năng lực tự chủ và tự học; Năng lực giao tiếp và hợp tác nhóm; Năng lực đặc thù môn ${input.subject}.`,
      digitalCompetencies: `NLS 2 (Khai thác thông tin số: Tìm kiếm tư liệu học tập), NLS 3 (Giao tiếp & Hợp tác số: Thảo luận và nộp sản phẩm nhóm trên Padlet), NLS 4 (Sáng tạo nội dung số: Thiết kế báo cáo/sơ đồ tư duy bằng Canva).`,
      qualities: `Chăm chỉ, trung thực, có trách nhiệm và tinh thần vượt khó trong học tập.`
    },
    materials: {
      teacher: `SGK, Máy tính, Máy chiếu/Màn hình tương tác, Bài giảng điện tử Canva/PowerPoint, Không gian tương tác Padlet, Trò chơi Kahoot/Quizizz.`,
      student: `SGK, Vở ghi, Thiết bị thông minh có kết nối internet (điện thoại/máy tính bảng theo nhóm).`
    },
    activities: generateFallbackActivities(input.lessonPlanText, input.subject),
    updatedAt: new Date().toISOString()
  };
}

function generateFallbackActivities(text: string, subject: string): TeachingActivity[] {
  const defaultTools = subject === 'Toán' || subject === 'Toán học'
    ? ['GeoGebra', 'Padlet', 'Quizizz']
    : (subject === 'KHTN' ? ['PhET Interactive', 'Canva', 'Padlet'] : ['Padlet', 'Kahoot!', 'Canva']);

  return [
    {
      id: uuidv4(),
      step: 'KHOI_DONG',
      title: 'Hoạt động 1: Mở đầu/Khởi động - Kết nối tri thức và tạo hứng thú',
      objective: 'Tạo tâm thế tích cực, khơi gợi hứng thú và kết nối kiến thức nền của học sinh.',
      content: 'Học sinh tham gia trò chơi tương tác trực tuyến trên Kahoot! hoặc Wordwall gồm 4 câu hỏi khởi động.',
      product: 'Kết quả tham gia trò chơi số của học sinh trên hệ thống đánh giá trực tiếp.',
      implementation: {
        step1_transfer: 'GV trình chiếu mã PIN / QR Code trò chơi Kahoot lên màn hình, phổ biến thể lệ và thời gian.',
        step2_execute: 'HS sử dụng thiết bị cá nhân hoặc theo nhóm quét mã QR tham gia trả lời nhanh các câu hỏi.',
        step3_report: 'Hệ thống tự động xếp hạng. GV mời đại diện HS chia sẻ cảm nhận và liên hệ bài mới.',
        step4_conclusion: 'GV nhận xét, tổng kết điểm số và dẫn dắt vào bài học mới.'
      },
      digitalTools: ['Kahoot!', 'Wordwall'],
      digitalCompetencyDomain: 'NLS 1: Vận hành thiết bị & phần mềm số',
      digitalNotes: 'Học sinh thao tác quét mã QR và tham gia đánh giá trực tuyến thời gian thực.'
    },
    {
      id: uuidv4(),
      step: 'HINH_THANH_KIEN_THUC',
      title: 'Hoạt động 2: Hình thành kiến thức mới - Khám phá và làm chủ nội dung trọng tâm',
      objective: 'Học sinh chủ động tìm hiểu, phân tích và làm chủ các kiến thức, khái niệm trọng tâm.',
      content: 'Học sinh thảo luận nhóm, tra cứu tài liệu số và hoàn thành Phiếu học tập trên bảng tương tác Padlet.',
      product: 'Sản phẩm thảo luận nhóm (Bản đồ tư duy / Infographic / Bảng trả lời) được đăng tải hoàn chỉnh trên Padlet.',
      implementation: {
        step1_transfer: 'GV chia nhóm, gửi đường link không gian thảo luận Padlet chứa các câu hỏi gợi mở.',
        step2_execute: 'HS làm việc nhóm, tra cứu SGK và học liệu số, thảo luận và cùng ghi câu trả lời lên Padlet.',
        step3_report: 'Đại diện nhóm trình chiếu màn hình Padlet báo cáo. Các nhóm khác bình luận, thả tim nhận xét.',
        step4_conclusion: 'GV nhận xét, chuẩn hóa kiến thức trên slide bài giảng và hướng dẫn HS chốt kiến thức vào vở.'
      },
      digitalTools: ['Padlet', 'Canva', 'Google Docs/Slides'],
      digitalCompetencyDomain: 'NLS 3: Giao tiếp & Hợp tác trong môi trường số',
      digitalNotes: 'Học sinh hợp tác trực tuyến trên Padlet, cùng chia sẻ và phản biện sản phẩm số của nhóm.'
    },
    {
      id: uuidv4(),
      step: 'LUYEN_TAP',
      title: 'Hoạt động 3: Luyện tập - Củng cố và khắc sâu kiến thức',
      objective: 'Vận dụng trực tiếp kiến thức vừa học để giải quyết các bài tập củng cố định lượng và định tính.',
      content: 'Học sinh thực hiện bài tập trắc nghiệm và tự luận ngắn trên Quizizz hoặc Liveworksheets.',
      product: 'Bảng điểm và báo cáo phân tích mức độ hiểu bài tự động của hệ thống.',
      implementation: {
        step1_transfer: 'GV giao bài tập luyện tập gồm 8-10 câu hỏi phân hóa trên Quizizz.',
        step2_execute: 'HS làm bài cá nhân trên thiết bị thông minh trong thời gian 7 phút.',
        step3_report: 'Hệ thống tự động chấm điểm và hiển thị biểu đồ phân tích những câu hỏi HS còn nhầm lẫn.',
        step4_conclusion: 'GV sửa chữa trực tiếp các lỗi sai phổ biến và củng cố phương pháp giải chuẩn.'
      },
      digitalTools: ['Quizizz', 'Liveworksheets'],
      digitalCompetencyDomain: 'NLS 2: Khai thác dữ liệu, thông tin & tri thức',
      digitalNotes: 'Sử dụng hệ thống đánh giá số tự động để nhận phản hồi tức thời về kết quả học tập.'
    },
    {
      id: uuidv4(),
      step: 'VAN_DUNG',
      title: 'Hoạt động 4: Vận dụng - Mở rộng thực tiễn & Sáng tạo số',
      objective: 'Phát triển tư duy bậc cao, liên hệ thực tiễn đời sống và rèn luyện kĩ năng sáng tạo sản phẩm số.',
      content: 'Học sinh thực hiện dự án nhỏ: Thiết kế Infographic/Poster trên Canva hoặc quay video ngắn 1-2 phút giới thiệu ứng dụng thực tế.',
      product: 'Sản phẩm số (Link Canva / Video / Ảnh) nộp trên Google Classroom hoặc Padlet lớp.',
      implementation: {
        step1_transfer: 'GV hướng dẫn tiêu chí đánh giá (Rubric) sản phẩm và quy định thời hạn nộp bài về nhà.',
        step2_execute: 'HS làm việc cá nhân hoặc theo nhóm ở nhà, sử dụng Canva thiết kế sản phẩm số.',
        step3_report: 'Sản phẩm được trưng bày trên phòng tranh số Padlet; học sinh bình chọn sản phẩm sáng tạo nhất.',
        step4_conclusion: 'GV tổng kết, tuyên dương các ý tưởng độc đáo và đánh giá quá trình học tập.'
      },
      digitalTools: ['Canva', 'Trợ lý AI (Gemini/ChatGPT)'],
      digitalCompetencyDomain: 'NLS 4: Sáng tạo nội dung số',
      digitalNotes: 'Học sinh ứng dụng công cụ thiết kế đồ họa số Canva để truyền tải thông điệp và tri thức bài học.'
    }
  ];
}
