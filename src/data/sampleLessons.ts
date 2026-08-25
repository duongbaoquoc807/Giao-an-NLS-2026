import { LessonPlan } from '../types';

export const SAMPLE_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'sample-ngu-van-6',
    title: 'Bài 1: Truyện truyền thuyết - Văn bản "Thánh Gióng"',
    subject: 'Ngữ văn',
    grade: 'Lớp 6',
    duration: 2,
    school: 'THCS Lê Quý Đôn',
    department: 'Tổ Ngữ Văn - Xã Hội',
    teacherName: 'Nguyễn Văn A',
    lessonOrder: 'Tiết 3 - 4',
    objectives: {
      knowledge: 'Nhận biết được một số yếu tố cốt truyện, nhân vật, lời kể và chi tiết kì ảo trong truyền thuyết Thánh Gióng; hiểu được ý nghĩa biểu tượng của hình tượng Thánh Gióng trong sự nghiệp dựng nước và giữ nước.',
      competencies: 'Năng lực tự chủ và tự học; Năng lực giao tiếp và hợp tác qua thảo luận nhóm; Năng lực văn học (cảm thụ tác phẩm).',
      digitalCompetencies: 'NLS 2 (Khai thác thông tin số: Tìm kiếm tư liệu hình ảnh/video về lễ hội Gióng), NLS 3 (Giao tiếp & Hợp tác số: Đóng góp ý kiến và nộp sơ đồ tư duy trên Padlet), NLS 4 (Sáng tạo nội dung số: Thiết kế infographic hoặc poster tóm tắt tác phẩm bằng Canva).',
      qualities: 'Yêu nước, có trách nhiệm bảo vệ Tổ quốc, trân trọng truyền thống lịch sử dân tộc.'
    },
    materials: {
      teacher: 'Sách giáo khoa Ngữ văn 6 (Bộ KNTT), Máy tính cá nhân, Máy chiếu, Bảng tương tác, Bài trình chiếu PowerPoint, Trang thảo luận Padlet, Video ngắn về Lễ hội Gióng (từ Youtube).',
      student: 'Sách giáo khoa, Vở ghi, Thiết bị di động hoặc máy tính bảng kết nối Wifi (để truy cập Padlet/Quizizz theo nhóm).'
    },
    activities: [
      {
        id: 'act-1',
        step: 'KHOI_DONG',
        title: 'Hoạt động 1: Mở đầu/Khởi động - Khám phá nhân vật anh hùng',
        objective: 'Tạo tâm thế hứng thú cho học sinh, kết nối tri thức nền về hình ảnh người anh hùng trong truyền thuyết dân gian.',
        content: 'Học sinh tham gia trò chơi "Nhìn hình đoán anh hùng" trên nền tảng Kahoot/Wordwall và xem video ngắn 1 phút về Lễ hội Phù Đổng Thiên Vương.',
        product: 'Câu trả lời trực tuyến của học sinh trên Kahoot và câu trả lời ngắn về cảm xúc sau khi xem video.',
        implementation: {
          step1_transfer: 'GV chiếu QR Code / đường link Kahoot lên máy chiếu. Yêu cầu các đội nhóm học sinh truy cập trò chơi gồm 4 câu hỏi hình ảnh liên quan đến các vị anh hùng dân tộc.',
          step2_execute: 'HS làm việc theo nhóm 4 người, dùng thiết bị thông minh chọn đáp án đúng nhanh nhất trên Kahoot.',
          step3_report: 'Bảng xếp hạng Kahoot tự động hiển thị trên máy chiếu. GV mời nhóm đạt điểm cao nhất chia sẻ hiểu biết về nhân vật Thánh Gióng.',
          step4_conclusion: 'GV nhận xét, tổng kết và dẫn dắt vào bài học mới: "Thánh Gióng - Biểu tượng sức mạnh tuổi trẻ Việt Nam".'
        },
        digitalTools: ['Kahoot!', 'Wordwall', 'Trợ lý AI (Gemini/ChatGPT)'],
        digitalCompetencyDomain: 'NLS 1',
        digitalNotes: 'HS thao tác quét mã QR và tương tác trực tuyến trên nền tảng kiểm tra đánh giá Kahoot!'
      },
      {
        id: 'act-2',
        step: 'HINH_THANH_KIEN_THUC',
        title: 'Hoạt động 2: Hình thành kiến thức - Tìm hiểu các chi tiết kì ảo và ý nghĩa hình tượng Thánh Gióng',
        objective: 'Phân tích được các sự kiện chính, chi tiết kì ảo (tiếng nói đầu tiên, lớn nhanh như thổi, vươn vai thành gióng, bay về trời) và ý nghĩa biểu tượng.',
        content: 'HS đọc văn bản, thảo luận nhóm 4 người hoàn thành Sơ đồ tư duy (Mindmap) về diễn biến cuộc đời Thánh Gióng trên Padlet.',
        product: 'Sơ đồ tư duy hoàn chỉnh được đăng tải trên bảng thảo luận nhóm Padlet của lớp.',
        implementation: {
          step1_transfer: 'GV chia lớp thành 4 nhóm, giao nhiệm vụ qua link Padlet: Nhóm 1 & 2 tìm hiểu sự ra đời kì lạ và tiếng nói đầu tiên; Nhóm 3 & 4 tìm hiểu quá trình lớn nhanh và chiến công đánh giặc.',
          step2_execute: 'HS đọc SGK, thảo luận nhóm, tìm hình ảnh/từ khóa minh họa và đính kèm lên cột tương ứng trên Padlet.',
          step3_report: 'Đại diện nhóm trình chiếu màn hình Padlet, trình bày nội dung thảo luận. Các nhóm khác thả tim, bình luận góp ý trực tiếp trên Padlet.',
          step4_conclusion: 'GV chốt kiến thức chuẩn trên slide trình chiếu, phân tích sâu ý nghĩa truyền thuyết.'
        },
        digitalTools: ['Padlet', 'Google Docs/Slides'],
        digitalCompetencyDomain: 'NLS 3',
        digitalNotes: 'HS hợp tác tạo lập tri thức nhóm trên không gian số Padlet, cùng bình luận và phản hồi nhận xét.'
      },
      {
        id: 'act-3',
        step: 'LUYEN_TAP',
        title: 'Hoạt động 3: Luyện tập - Củng cố tri thức ngữ văn',
        objective: 'Khái quát lại đặc trưng thể loại truyền thuyết và nghệ thuật kể chuyện trong văn bản.',
        content: 'Học sinh thực hiện bài trắc nghiệm củng cố 10 câu hỏi trên Quizizz.',
        product: 'Báo cáo kết quả và tỉ lệ trả lời đúng của học sinh trên Quizizz.',
        implementation: {
          step1_transfer: 'GV gửi mã bài tập Quizizz cho học sinh làm cá nhân hoặc theo cặp.',
          step2_execute: 'HS truy cập Quizizz trên thiết bị, hoàn thành bài tập trong 5 phút.',
          step3_report: 'Hệ thống Quizizz thống kê những câu hỏi HS hay trả lời sai nhất.',
          step4_conclusion: 'GV giải đáp các câu hỏi sai nhiều, khắc sâu kiến thức trọng tâm.'
        },
        digitalTools: ['Quizizz'],
        digitalCompetencyDomain: 'NLS 2',
        digitalNotes: 'Sử dụng công cụ kiểm tra tự động Quizizz để phân tích lỗi sai và đánh giá thường xuyên.'
      },
      {
        id: 'act-4',
        step: 'VAN_DUNG',
        title: 'Hoạt động 4: Vận dụng - Thông điệp truyền cảm hứng & Sáng tạo số',
        objective: 'Vận dụng tri thức bài học để viết đoạn văn suy nghĩ hoặc thiết kế sản phẩm truyền thông số.',
        content: 'Học sinh chọn 1 trong 2 nhiệm vụ: (1) Viết đoạn văn ngắn 150 chữ chia sẻ bài học về tinh thần yêu nước; (2) Dùng Canva thiết kế 1 Poster/Infographic giới thiệu hình tượng Thánh Gióng.',
        product: 'Sản phẩm poster Canva hoặc file đoạn văn nộp trên hệ thống Google Classroom / Padlet.',
        implementation: {
          step1_transfer: 'GV hướng dẫn tiêu chí đánh giá (Rubric) và hạn nộp bài trực tuyến trong 3 ngày.',
          step2_execute: 'HS làm việc cá nhân ở nhà, ứng dụng Canva chọn template thiết kế sản phẩm số.',
          step3_report: 'Sản phẩm được chia sẻ lên nhóm lớp để học sinh bình chọn poster ấn tượng nhất.',
          step4_conclusion: 'GV nhận xét, tuyên dương các sản phẩm sáng tạo xuất sắc.'
        },
        digitalTools: ['Canva', 'Google Docs/Slides'],
        digitalCompetencyDomain: 'NLS 4',
        digitalNotes: 'HS sử dụng công cụ thiết kế đồ họa số Canva để biểu đạt thẩm mỹ và lan tỏa thông điệp bài học.'
      }
    ],
    updatedAt: new Date().toISOString()
  },

  {
    id: 'sample-toan-8',
    title: 'Bài: Tọa độ phẳng & Hàm số bậc nhất y = ax + b',
    subject: 'Toán học',
    grade: 'Lớp 8',
    duration: 2,
    school: 'THCS Ngô Sĩ Liên',
    department: 'Tổ Toán - Tin',
    teacherName: 'Trần Thị B',
    lessonOrder: 'Tiết 25 - 26',
    objectives: {
      knowledge: 'Hiểu khái niệm mặt phẳng tọa độ, cách xác định tọa độ một điểm; vẽ đồ thị hàm số bậc nhất y = ax + b (a khác 0) và hiểu ý nghĩa hệ số góc a.',
      competencies: 'Năng lực tư duy và luận giải toán học; Năng lực giải quyết vấn đề toán học; Năng lực mô hình hóa toán học.',
      digitalCompetencies: 'NLS 6 (Giải quyết vấn đề với công nghệ: Sử dụng GeoGebra để khảo sát sự biến thiên đồ thị khi a, b thay đổi), NLS 1 (Thao tác thành thạo ứng dụng vẽ đồ thị tự động).',
      qualities: 'Chăm chỉ, trung thực, có tư duy logic và khoa học.'
    },
    materials: {
      teacher: 'Máy tính, máy chiếu, phần mềm GeoGebra Classic/Suite, Phiếu học tập số trực tuyến trên Liveworksheets.',
      student: 'SGK Toán 8, máy tính bỏ túi, điện thoại/máy tính có cài GeoGebra hoặc truy cập web geogebra.org.'
    },
    activities: [
      {
        id: 'act-toan-1',
        step: 'KHOI_DONG',
        title: 'Hoạt động 1: Khởi động - Đi tìm vị trí trên bản đồ tọa độ',
        objective: 'Tạo sự liên hệ giữa hệ tọa độ thực tế (Kinh độ, Vĩ độ / Ghế ngồi xem phim) và Hệ trục tọa độ Oxy.',
        content: 'Trò chơi tìm kho báu trên hệ trục tọa độ bằng phần mềm tương tác Wordwall.',
        product: 'Tọa độ các vị trí kho báu do học sinh xác định.',
        implementation: {
          step1_transfer: 'GV chiếu trò chơi Wordwall "Xác định tọa độ điểm trên lưới vuông".',
          step2_execute: 'HS xung phong lên bảng tương tác hoặc thao tác trên máy tính GV để chọn điểm.',
          step3_report: 'Cả lớp quan sát, nhận xét vị trí hoành độ x và tung độ y.',
          step4_conclusion: 'GV chốt định nghĩa Hệ trục tọa độ Oxy.'
        },
        digitalTools: ['Wordwall'],
        digitalCompetencyDomain: 'NLS 1',
        digitalNotes: 'Tương tác trực quan trên bản đồ lưới số'
      },
      {
        id: 'act-toan-2',
        step: 'HINH_THANH_KIEN_THUC',
        title: 'Hoạt động 2: Khám phá đồ thị hàm số y = ax + b bằng GeoGebra',
        objective: 'Học sinh tự khám phá dạng đồ thị đường thẳng và ảnh hưởng của hệ số a, b thông qua thanh trượt (slider) trên GeoGebra.',
        content: 'HS di chuyển thanh trượt a và b trong file GeoGebra được chuẩn bị sẵn, quan sát sự thay đổi của đường thẳng.',
        product: 'Nhận xét rút ra: Khi a > 0 hàm số đồng biến, a < 0 nghịch biến; b là tung độ gốc.',
        implementation: {
          step1_transfer: 'GV gửi đường link file GeoGebra trực tuyến: "Khao_sat_y_bang_ax_cong_b" cho các nhóm HS.',
          step2_execute: 'HS kéo thả thanh trượt a, b, quan sát góc tạo bởi đường thẳng với trục Ox và giao điểm với Oy.',
          step3_report: 'Các nhóm điền kết quả quan sát vào phiếu học tập trực tuyến Liveworksheets.',
          step4_conclusion: 'GV chuẩn hóa kiến thức về cách vẽ đồ thị hàm số bậc nhất.'
        },
        digitalTools: ['GeoGebra', 'Liveworksheets'],
        digitalCompetencyDomain: 'NLS 6',
        digitalNotes: 'Sử dụng công cụ mô phỏng động GeoGebra giúp HS trực quan hóa khái niệm toán học trừu tượng.'
      }
    ],
    updatedAt: new Date().toISOString()
  }
];
