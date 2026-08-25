import { v4 as uuidv4 } from 'uuid';
import { LessonPlan, TeachingActivity } from '../types';

export function generateSmartLessonPlanFallback(title: string, subject: string, grade: string, duration: number): Partial<LessonPlan> {
  const cleanTitle = title.trim() || 'Bài học mới';
  
  let knowledge = `Học sinh nắm vững được các kiến thức cốt lõi, khái niệm, quy luật và ứng dụng thực tiễn của "${cleanTitle}" môn ${subject} ${grade} theo chương trình GDPT 2018.`;
  let competencies = `Năng lực tự chủ và tự học (tự tìm kiếm thông tin và giải quyết nhiệm vụ học tập); Năng lực giao tiếp và hợp tác (thảo luận nhóm, trao đổi sản phẩm); Năng lực đặc thù môn ${subject}.`;
  let digitalCompetencies = `NLS 2 (Khai thác thông tin số: Tìm kiếm tư liệu và học liệu số), NLS 3 (Giao tiếp & Hợp tác số: Thảo luận nhóm và nộp bài trên Padlet/Google Classroom), NLS 4 (Sáng tạo nội dung số: Thiết kế báo cáo/infographic trên Canva).`;
  let qualities = `Yêu nước, chăm chỉ tìm tòi tri thức, trung thực trong học tập và có trách nhiệm hoàn thành nhiệm vụ được giao.`;

  let matTeacher = `SGK ${subject} ${grade}, Máy tính xách tay, Máy chiếu/Màn hình tương tác, Bài trình chiếu PowerPoint/Canva, Đường link tương tác (Padlet, Quizizz, Kahoot).`;
  let matStudent = `SGK ${subject} ${grade}, Vở ghi, Bút viết, Phiếu học tập, Thiết bị thông minh có kết nối internet (điện thoại/máy tính bảng theo nhóm).`;

  if (subject === 'Toán học') {
    knowledge = `Học sinh nhận biết và vận dụng được các định nghĩa, tính chất, công thức toán học trong bài "${cleanTitle}"; rèn luyện kĩ năng tính toán và giải quyết bài toán thực tế.`;
    digitalCompetencies = `NLS 6 (Giải quyết vấn đề với công nghệ số: Ứng dụng GeoGebra để trực quan hóa hình học và đồ thị toán học), NLS 1 (Sử dụng thành thạo phần mềm tính toán và kiểm tra trắc nghiệm số).`;
    matTeacher += `, File mô phỏng phần mềm GeoGebra.`;
  } else if (subject === 'KHTN') {
    knowledge = `Học sinh giải thích được các hiện tượng tự nhiên, nguyên lí khoa học liên quan đến "${cleanTitle}"; tiến hành được thí nghiệm ảo và rút ra kết luận khoa học.`;
    digitalCompetencies = `NLS 6 (Sử dụng thí nghiệm mô phỏng ảo PhET Interactive Simulations), NLS 2 (Thu thập và biểu diễn số liệu thực nghiệm trên bảng tính số).`;
    matTeacher += `, Mô phỏng thí nghiệm ảo PhET.`;
  } else if (subject === 'Tin học') {
    knowledge = `Học sinh hiểu nguyên lý hoạt động, thao tác thành thạo phần mềm và giải quyết bài toán lập trình/xử lý dữ liệu trong chủ đề "${cleanTitle}".`;
    digitalCompetencies = `NLS 1 (Vận hành thiết bị & phần mềm số), NLS 5 (An toàn và bảo mật dữ liệu trên không gian số), NLS 6 (Tư duy máy tính và giải quyết vấn đề bằng công nghệ).`;
  } else if (subject === 'Ngữ văn') {
    knowledge = `Học sinh cảm thụ được vẻ đẹp ngôn từ, phân tích được nhân vật, chi tiết nghệ thuật và thông điệp nhân văn trong tác phẩm "${cleanTitle}".`;
    digitalCompetencies = `NLS 3 (Hợp tác trên Padlet/Google Docs xây dựng sơ đồ tư duy phân tích văn bản), NLS 4 (Sáng tạo video/poster thông điệp bài học bằng Canva).`;
  }

  const activities: TeachingActivity[] = [
    {
      id: uuidv4(),
      step: 'KHOI_DONG',
      title: `Hoạt động 1: Mở đầu/Khởi động - Kết nối và khơi gợi hứng thú với "${cleanTitle}"`,
      objective: `Tạo tâm thế tích cực, kết nối tri thức nền và khơi dậy tò mò của học sinh về chủ đề bài học.`,
      content: `Học sinh tham gia trò chơi tương tác khởi động trên Kahoot! hoặc Wordwall gồm 4 câu hỏi tình huống liên quan đến bài học.`,
      product: `Kết quả tham gia trò chơi trực tuyến và ý kiến phản hồi ngắn của học sinh.`,
      implementation: {
        step1_transfer: `GV chiếu mã PIN / QR Code trò chơi Kahoot/Wordwall lên màn hình, phổ biến thể lệ và thời gian 3 phút.`,
        step2_execute: `HS sử dụng thiết bị cá nhân hoặc theo cặp quét mã QR, tham gia trả lời nhanh các câu hỏi.`,
        step3_report: `Màn hình hiển thị bảng xếp hạng thành tích trực tiếp. GV gọi 1-2 HS giải thích nhanh lựa chọn của mình.`,
        step4_conclusion: `GV nhận xét không khí khởi động, tổng kết câu trả lời và dẫn dắt vào bài mới "${cleanTitle}".`
      },
      digitalTools: ['Kahoot!', 'Wordwall'],
      digitalCompetencyDomain: 'NLS 1',
      digitalNotes: `Học sinh quét mã QR và tương tác thời gian thực trên nền tảng đánh giá trò chơi số.`
    },
    {
      id: uuidv4(),
      step: 'HINH_THANH_KIEN_THUC',
      title: `Hoạt động 2: Hình thành kiến thức mới - Khám phá nội dung trọng tâm của "${cleanTitle}"`,
      objective: `Học sinh chủ động tìm hiểu, phân tích và làm chủ các kiến thức, khái niệm trọng tâm của bài học.`,
      content: `Các nhóm học sinh đọc SGK, thảo luận nhóm 4-6 người và hoàn thành Phiếu học tập số trên không gian chia sẻ Padlet.`,
      product: `Sản phẩm thảo luận nhóm (Bản đồ tư duy / Infographic / Bảng trả lời) được đăng tải hoàn chỉnh trên Padlet.`,
      implementation: {
        step1_transfer: `GV chia lớp thành 4 nhóm, gửi link Padlet chứa các câu hỏi hướng dẫn khám phá kiến thức cho từng nhóm.`,
        step2_execute: `HS làm việc nhóm, phân công nhiệm vụ: tìm dữ liệu trong SGK, gõ câu trả lời và đính kèm hình ảnh minh họa lên cột Padlet của nhóm mình.`,
        step3_report: `Đại diện các nhóm trình chiếu bài làm trên Padlet, thuyết trình ngắn gọn trong 2 phút. Các nhóm khác thả tim, bình luận nhận xét trực tuyến.`,
        step4_conclusion: `GV nhận xét, chuẩn hóa kiến thức trên slide bài giảng và hướng dẫn HS ghi bài vào vở.`
      },
      digitalTools: ['Padlet', 'Google Docs/Slides', 'Canva'],
      digitalCompetencyDomain: 'NLS 3',
      digitalNotes: `Học sinh làm việc nhóm cộng tác trực tuyến trên Padlet, cùng bình luận và phản biện sản phẩm số.`
    },
    {
      id: uuidv4(),
      step: 'LUYEN_TAP',
      title: `Hoạt động 3: Luyện tập - Củng cố và khắc sâu kiến thức`,
      objective: `Vận dụng trực tiếp kiến thức vừa học để giải quyết các bài tập, câu hỏi củng cố định lượng/định tính.`,
      content: `Học sinh làm bài tập trắc nghiệm và tự luận ngắn trên hệ thống Quizizz hoặc Liveworksheets.`,
      product: `Điểm số và báo cáo phân tích mức độ hiểu bài của học sinh trên hệ thống đánh giá tự động.`,
      implementation: {
        step1_transfer: `GV giao đường link bài luyện tập gồm 8-10 câu hỏi phân hóa từ nhận biết đến thông hiểu.`,
        step2_execute: `HS làm bài cá nhân trên thiết bị thông minh trong thời gian 7 phút.`,
        step3_report: `Hệ thống tự động chấm điểm và hiển thị biểu đồ những câu hỏi HS còn nhầm lẫn nhiều nhất.`,
        step4_conclusion: `GV sửa chữa trực tiếp các lỗi sai phổ biến, củng cố phương pháp giải bài chuẩn.`
      },
      digitalTools: ['Quizizz', 'Liveworksheets'],
      digitalCompetencyDomain: 'NLS 2',
      digitalNotes: `Sử dụng phần mềm khảo sát số để đánh giá thường xuyên và phản hồi tức thời lỗi sai cho người học.`
    },
    {
      id: uuidv4(),
      step: 'VAN_DUNG',
      title: `Hoạt động 4: Vận dụng - Mở rộng thực tiễn & Sáng tạo số`,
      objective: `Phát triển tư duy bậc cao, liên hệ thực tiễn đời sống và rèn luyện kĩ năng sáng tạo sản phẩm số.`,
      content: `Học sinh thực hiện dự án nhỏ: Thiết kế 1 poster/infographic trên Canva hoặc quay video ngắn 1-2 phút giới thiệu ứng dụng của "${cleanTitle}".`,
      product: `Sản phẩm số (Link Canva / Video / Ảnh Infographic) nộp trên Google Classroom hoặc Padlet lớp học.`,
      implementation: {
        step1_transfer: `GV hướng dẫn tiêu chí đánh giá (Rubric) sản phẩm và quy định hạn nộp bài về nhà.`,
        step2_execute: `HS làm việc cá nhân hoặc theo nhóm ở nhà, sử dụng Canva để thiết kế và xuất bản sản phẩm số.`,
        step3_report: `Sản phẩm được trưng bày trên phòng tranh số Padlet; học sinh toàn lớp tham gia bình chọn sản phẩm sáng tạo nhất.`,
        step4_conclusion: `GV tổng kết, tuyên dương các ý tưởng độc đáo và cộng điểm khuyến khích học tập.`
      },
      digitalTools: ['Canva', 'Trợ lý AI (Gemini/ChatGPT)'],
      digitalCompetencyDomain: 'NLS 4',
      digitalNotes: `Học sinh làm chủ công cụ thiết kế đồ họa số Canva để truyền tải thông điệp và kiến thức bài học.`
    }
  ];

  return {
    objectives: {
      knowledge,
      competencies,
      digitalCompetencies,
      qualities
    },
    materials: {
      teacher: matTeacher,
      student: matStudent
    },
    activities
  };
}
