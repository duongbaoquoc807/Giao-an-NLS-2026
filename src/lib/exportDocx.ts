import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle 
} from 'docx';
import { saveAs } from 'file-saver';
import { LessonPlan, STEP_LABELS } from '../types';

export const exportToDocx = async (plan: LessonPlan) => {
  const FONT = 'Times New Roman';

  const materialsTeacher = typeof plan.materials === 'object' && plan.materials !== null
    ? (plan.materials.teacher || 'SGK, máy tính, máy chiếu, thiết bị dạy học...')
    : (typeof plan.materials === 'string' ? plan.materials : 'SGK, máy tính, máy chiếu...');

  const materialsStudent = typeof plan.materials === 'object' && plan.materials !== null
    ? (plan.materials.student || 'SGK, vở ghi, thiết bị thông minh (nếu có)...')
    : 'SGK, vở ghi, thiết bị thông minh (nếu có)...';

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134,    // 2cm ~ 1134 dxa
              bottom: 1134, // 2cm
              left: 1701,   // 3cm ~ 1701 dxa
              right: 1134,  // 2cm
            },
          },
        },
        children: [
          // Header Info Table (Trường & Giáo viên)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: `TRƯỜNG: ${plan.school || '....................................'}`, font: FONT, size: 24, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: `TỔ CHUYÊN MÔN: ${plan.department || '.......................'}`, font: FONT, size: 24, bold: true }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: `Họ và tên GV: ${plan.teacherName || '....................................'}`, font: FONT, size: 24, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: `Tiết thứ (KHDH): ${plan.lessonOrder || plan.duration + ' tiết'}`, font: FONT, size: 24, italics: true }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 200 } }),

          // Document Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'KẾ HOẠCH BÀI DẠY (GIÁO ÁN CV 5512)', font: FONT, size: 28, bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: plan.title ? plan.title.toUpperCase() : 'TÊN BÀI HỌC CHƯA ĐẶT', font: FONT, size: 26, bold: true, color: '1E3A8A' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: `Môn học: ${plan.subject} | Lớp: ${plan.grade} | Thời lượng: ${plan.duration} tiết`, font: FONT, size: 24, italics: true }),
            ],
          }),

          // SECTION I: MỤC TIÊU
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: 'I. MỤC TIÊU', font: FONT, size: 26, bold: true }),
            ],
          }),
          
          // 1. Kiến thức
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({ text: '1. Về kiến thức: ', font: FONT, size: 24, bold: true }),
              new TextRun({ text: plan.objectives?.knowledge || 'Đang cập nhật...', font: FONT, size: 24 }),
            ],
          }),

          // 2. Năng lực
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: '2. Về năng lực:', font: FONT, size: 24, bold: true }),
            ],
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'a) Năng lực chung & Năng lực đặc thù: ', font: FONT, size: 24, bold: true }),
              new TextRun({ text: plan.objectives?.competencies || 'Đang cập nhật...', font: FONT, size: 24 }),
            ],
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 100 },
            children: [
              new TextRun({ text: 'b) Năng lực số (Digital Competencies): ', font: FONT, size: 24, bold: true, color: '2563EB' }),
              new TextRun({ text: plan.objectives?.digitalCompetencies || 'Đang cập nhật...', font: FONT, size: 24 }),
            ],
          }),

          // 3. Phẩm chất
          new Paragraph({
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({ text: '3. Về phẩm chất: ', font: FONT, size: 24, bold: true }),
              new TextRun({ text: plan.objectives?.qualities || 'Đang cập nhật...', font: FONT, size: 24 }),
            ],
          }),

          // SECTION II: THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: 'II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU', font: FONT, size: 26, bold: true }),
            ],
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 60 },
            children: [
              new TextRun({ text: '1. Giáo viên: ', font: FONT, size: 24, bold: true }),
              new TextRun({ text: materialsTeacher, font: FONT, size: 24 }),
            ],
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 200 },
            children: [
              new TextRun({ text: '2. Học sinh: ', font: FONT, size: 24, bold: true }),
              new TextRun({ text: materialsStudent, font: FONT, size: 24 }),
            ],
          }),

          // SECTION III: TIẾN TRÌNH DẠY HỌC
          new Paragraph({
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({ text: 'III. TIẾN TRÌNH DẠY HỌC', font: FONT, size: 26, bold: true }),
            ],
          }),

          ...(plan.activities || []).flatMap((act, index) => {
            const stepLabel = (act.step && STEP_LABELS[act.step]) ? STEP_LABELS[act.step] : `Hoạt động ${index + 1}`;
            
            const impl = typeof act.implementation === 'object' && act.implementation !== null
              ? act.implementation
              : {
                  step1_transfer: typeof act.implementation === 'string' ? act.implementation : 'GV giao nhiệm vụ cho HS...',
                  step2_execute: 'HS thảo luận nhóm thực hiện nhiệm vụ.',
                  step3_report: 'Đại diện HS/Nhóm nộp bài và trình bày.',
                  step4_conclusion: 'GV nhận xét và kết luận.'
                };

            const digitalToolsStr = Array.isArray(act.digitalTools)
              ? (act.digitalTools.length > 0 ? act.digitalTools.join(', ') : 'Không sử dụng')
              : (typeof act.digitalTools === 'string' ? act.digitalTools : 'Không sử dụng');

            return [
              new Paragraph({
                spacing: { before: 250, after: 100 },
                children: [
                  new TextRun({ text: `${stepLabel.toUpperCase()}: ${(act.title || '').toUpperCase()}`, font: FONT, size: 25, bold: true, color: '1E40AF' }),
                ],
              }),

              // a) Mục tiêu
              new Paragraph({
                indent: { left: 360 },
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'a) Mục tiêu: ', font: FONT, size: 24, bold: true }),
                  new TextRun({ text: act.objective || 'Đang cập nhật...', font: FONT, size: 24 }),
                ],
              }),

              // b) Nội dung
              new Paragraph({
                indent: { left: 360 },
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'b) Nội dung: ', font: FONT, size: 24, bold: true }),
                  new TextRun({ text: act.content || 'Đang cập nhật...', font: FONT, size: 24 }),
                ],
              }),

              // c) Sản phẩm
              new Paragraph({
                indent: { left: 360 },
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'c) Sản phẩm: ', font: FONT, size: 24, bold: true }),
                  new TextRun({ text: act.product || 'Đang cập nhật...', font: FONT, size: 24 }),
                ],
              }),

              // d) Tổ chức thực hiện
              new Paragraph({
                indent: { left: 360 },
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'd) Tổ chức thực hiện:', font: FONT, size: 24, bold: true }),
                ],
              }),
              new Paragraph({
                indent: { left: 720 },
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: '- Bước 1: Chuyển giao nhiệm vụ: ', font: FONT, size: 24, bold: true, italics: true }),
                  new TextRun({ text: impl.step1_transfer || 'GV giao nhiệm vụ cho HS...', font: FONT, size: 24 }),
                ],
              }),
              new Paragraph({
                indent: { left: 720 },
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: '- Bước 2: Thực hiện nhiệm vụ: ', font: FONT, size: 24, bold: true, italics: true }),
                  new TextRun({ text: impl.step2_execute || 'HS thảo luận và làm bài...', font: FONT, size: 24 }),
                ],
              }),
              new Paragraph({
                indent: { left: 720 },
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: '- Bước 3: Báo cáo, thảo luận: ', font: FONT, size: 24, bold: true, italics: true }),
                  new TextRun({ text: impl.step3_report || 'Đại diện nhóm báo cáo kết quả...', font: FONT, size: 24 }),
                ],
              }),
              new Paragraph({
                indent: { left: 720 },
                spacing: { after: 100 },
                children: [
                  new TextRun({ text: '- Bước 4: Kết luận, nhận định: ', font: FONT, size: 24, bold: true, italics: true }),
                  new TextRun({ text: impl.step4_conclusion || 'GV chốt kiến thức chuẩn...', font: FONT, size: 24 }),
                ],
              }),

              // e) Lồng ghép Công cụ & Năng lực số
              new Paragraph({
                indent: { left: 360 },
                spacing: { before: 100, after: 150 },
                children: [
                  new TextRun({ text: 'e) Ứng dụng Công cụ & Năng lực số: ', font: FONT, size: 24, bold: true, color: 'D97706' }),
                  new TextRun({ 
                    text: `[Công cụ: ${digitalToolsStr}] ` +
                          `[Miền NLS: ${act.digitalCompetencyDomain || 'NLS 1'}] - ${act.digitalNotes || 'Ứng dụng công nghệ hỗ trợ dạy học'}`, 
                    font: FONT, 
                    size: 24 
                  }),
                ],
              }),

              new Paragraph({ text: '', spacing: { after: 150 } }),
            ];
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFilename = plan.title 
    ? plan.title.replace(/[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ_\s-]/g, '').trim().substring(0, 30)
    : '5512';
  saveAs(blob, `GiaoAn_5512_${cleanFilename}.docx`);
};
