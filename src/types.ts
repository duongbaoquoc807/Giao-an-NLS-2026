export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: number; // số tiết
  school?: string;
  department?: string;
  teacherName?: string;
  lessonOrder?: string; // Tiết thứ
  objectives: {
    knowledge: string; // 1. Kiến thức
    competencies: string; // 2. Năng lực chung và đặc thù
    digitalCompetencies: string; // Năng lực số lồng ghép
    qualities: string; // 3. Phẩm chất
  };
  materials: {
    teacher: string; // Thiết bị & Học liệu của Giáo viên
    student: string; // Thiết bị & Học liệu của Học sinh
  };
  activities: TeachingActivity[];
  updatedAt: string | Date;
}

export interface ActivityImplementation {
  step1_transfer: string;   // Bước 1: Chuyển giao nhiệm vụ
  step2_execute: string;    // Bước 2: Thực hiện nhiệm vụ
  step3_report: string;     // Bước 3: Báo cáo, thảo luận
  step4_conclusion: string; // Bước 4: Kết luận, nhận định
}

export interface TeachingActivity {
  id: string;
  step: 'KHOI_DONG' | 'HINH_THANH_KIEN_THUC' | 'LUYEN_TAP' | 'VAN_DUNG';
  title: string;
  objective: string;
  content: string;
  product: string;
  implementation: ActivityImplementation;
  digitalTools: string[]; // Danh sách công cụ số (e.g. ['Padlet', 'Kahoot'])
  digitalCompetencyDomain: string; // Miền/Thành tố Năng lực số (e.g. 'NLS2 - Giao tiếp & Hợp tác số')
  digitalNotes: string; // Ghi chú chi tiết cách thức lồng ghép Năng lực số
}

export const STEP_LABELS = {
  KHOI_DONG: 'Hoạt động 1: Mở đầu / Khởi động',
  HINH_THANH_KIEN_THUC: 'Hoạt động 2: Hình thành kiến thức mới',
  LUYEN_TAP: 'Hoạt động 3: Luyện tập',
  VAN_DUNG: 'Hoạt động 4: Vận dụng'
};

export const DIGITAL_COMPETENCY_DOMAINS = [
  { id: 'NLS 1', title: 'NLS 1: Vận hành thiết bị & phần mềm số', desc: 'Sử dụng thành thạo máy tính, máy chiếu, bảng tương tác, phần mềm dạy học' },
  { id: 'NLS 2', title: 'NLS 2: Khai thác dữ liệu, thông tin & tri thức', desc: 'Tìm kiếm, đánh giá, quản lý dữ liệu và thông tin trên môi trường số' },
  { id: 'NLS 3', title: 'NLS 3: Giao tiếp & Hợp tác trong môi trường số', desc: 'Thảo luận nhóm trực tuyến, chia sẻ tài liệu qua Padlet, Google Drive, Zalo' },
  { id: 'NLS 4', title: 'NLS 4: Sáng tạo nội dung số', desc: 'Tạo video, bài trình chiếu Canva/PowerPoint, bản đồ tư duy số, sơ đồ' },
  { id: 'NLS 5', title: 'NLS 5: An toàn & Bảo mật số', desc: 'Bảo vệ dữ liệu cá nhân, tuân thủ bản quyền tác giả và đạo đức số' },
  { id: 'NLS 6', title: 'NLS 6: Giải quyết vấn đề với công nghệ số', desc: 'Ứng dụng phần mềm mô phỏng (GeoGebra, PhET), lập trình, AI trong học tập' },
];

export const POPULAR_DIGITAL_TOOLS = [
  { name: 'Padlet', category: 'Thảo luận & Nộp bài', icon: '📋' },
  { name: 'Kahoot!', category: 'Trò chơi & Khởi động', icon: '🎮' },
  { name: 'Quizizz', category: 'Kiểm tra & Ôn tập', icon: '⚡' },
  { name: 'Canva', category: 'Sáng tạo & Thiết kế', icon: '🎨' },
  { name: 'GeoGebra', category: 'Mô phỏng Toán học', icon: '📐' },
  { name: 'PhET Interactive', category: 'Thí nghiệm ảo KHTN', icon: '🧪' },
  { name: 'Mentimeter', category: 'Khảo sát & Bình chọn', icon: '📊' },
  { name: 'Google Docs/Slides', category: 'Hợp tác trực tuyến', icon: '📄' },
  { name: 'Wordwall', category: 'Trò chơi tương tác', icon: '🧩' },
  { name: 'Trợ lý AI (Gemini/ChatGPT)', category: 'Hỗ trợ tìm kiếm & Sáng tạo', icon: '🤖' },
  { name: 'Liveworksheets', category: 'Phiếu bài tập tương tác', icon: '📝' },
];
