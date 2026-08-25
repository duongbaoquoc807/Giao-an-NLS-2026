import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle 
} from 'docx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { LessonPlan, STEP_LABELS } from '../types';

const FONT = 'Times New Roman';

/**
 * Direct DOCX XML Injection:
 * Preserves 100% of original tables, columns, margins, fonts, and headers,
 * while accurately weaving Digital Competencies (NLS) into matching sections.
 */
export async function exportIntegratedDocxFromOriginal(
  originalDocxFile: File | ArrayBuffer, 
  plan: LessonPlan
): Promise<void> {
  try {
    const arrayBuffer = originalDocxFile instanceof File 
      ? await originalDocxFile.arrayBuffer() 
      : originalDocxFile;

    const zip = await JSZip.loadAsync(arrayBuffer);
    let docXml = await zip.file('word/document.xml')?.async('text');

    if (!docXml) {
      // Fallback to standard docx generator if document.xml missing
      return exportToDocx(plan);
    }

    // 1. Inject Digital Competencies into Mục tiêu (Objectives)
    if (plan.objectives.digitalCompetencies) {
      const nlsObjectiveXml = `<w:p><w:pPr><w:pStyle w:val="Normal"/><w:spacing w:before="60" w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:color w:val="0070C0"/></w:rPr><w:t>b) Về Năng lực số: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="000000"/></w:rPr><w:t xml:space="preserve">${escapeXml(plan.objectives.digitalCompetencies)}</w:t></w:r></w:p>`;

      // Insert after Năng lực or Mục tiêu paragraph
      if (docXml.includes('Năng lực') || docXml.includes('năng lực')) {
        docXml = docXml.replace(/(<w:p[\s\S]*?(?:Năng lực|năng lực)[\s\S]*?<\/w:p>)/i, `$1\n${nlsObjectiveXml}`);
      } else if (docXml.includes('MỤC TIÊU') || docXml.includes('Mục tiêu')) {
        docXml = docXml.replace(/(<w:p[\s\S]*?(?:MỤC TIÊU|Mục tiêu)[\s\S]*?<\/w:p>)/i, `$1\n${nlsObjectiveXml}`);
      }
    }

    // 2. Inject Digital Materials into Thiết bị dạy học
    if (plan.materials?.teacher) {
      const nlsMaterialsXml = `<w:p><w:pPr><w:pStyle w:val="Normal"/><w:spacing w:before="40" w:after="40"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:color w:val="0070C0"/></w:rPr><w:t>- Thiết bị và học liệu số: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="000000"/></w:rPr><w:t xml:space="preserve">${escapeXml(plan.materials.teacher)}</w:t></w:r></w:p>`;

      if (docXml.includes('THIẾT BỊ') || docXml.includes('Thiết bị') || docXml.includes('Học liệu')) {
        docXml = docXml.replace(/(<w:p[\s\S]*?(?:THIẾT BỊ|Thiết bị|Học liệu)[\s\S]*?<\/w:p>)/i, `$1\n${nlsMaterialsXml}`);
      }
    }

    // 3. Inject NLS Badges and Tools into each Activity
    (plan.activities || []).forEach((act, idx) => {
      const actTitleKeyword = `Hoạt động ${idx + 1}`;
      const nlsBadgeXml = `<w:p><w:pPr><w:pStyle w:val="Normal"/><w:spacing w:before="80" w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:color w:val="C00000"/></w:rPr><w:t xml:space="preserve">[Tích hợp Năng lực số - ${escapeXml(act.digitalCompetencyDomain || 'NLS')}: ${escapeXml(act.digitalTools.join(', '))}]: </w:t></w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:color w:val="002060"/></w:rPr><w:t xml:space="preserve">${escapeXml(act.digitalNotes || 'Ứng dụng công nghệ số nâng cao hiệu quả học tập.')}</w:t></w:r></w:p>`;

      const regex = new RegExp(`(<w:p[\\s\\S]*?${actTitleKeyword}[\\s\\S]*?<\\/w:p>)`, 'i');
      if (regex.test(docXml)) {
        docXml = docXml.replace(regex, `$1\n${nlsBadgeXml}`);
      }
    });

    zip.file('word/document.xml', docXml);

    const modifiedBlob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE'
    });

    const safeTitle = (plan.title || 'GiaoAn_TichHop_NLS').replace(/[/\\?%*:|"<>]/g, '_');
    saveAs(modifiedBlob, `${safeTitle}_TichHop_NLS.docx`);
  } catch (err) {
    console.warn('Direct XML injection failed, falling back to standard 2-column docx generator:', err);
    await exportToDocx(plan);
  }
}

/**
 * Standard CV 5512 2-Column Word Exporter
 */
export const exportToDocx = async (plan: LessonPlan) => {
  const materialsTeacher = typeof plan.materials === 'object' && plan.materials !== null
    ? (plan.materials.teacher || 'SGK, máy tính, máy chiếu, bài giảng số...')
    : (typeof plan.materials === 'string' ? plan.materials : 'SGK, máy tính, máy chiếu...');

  const materialsStudent = typeof plan.materials === 'object' && plan.materials !== null
    ? (plan.materials.student || 'SGK, vở ghi, thiết bị kết nối internet...')
    : 'SGK, vở ghi, thiết bị kết nối internet...';

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
                          new TextRun({ text: `TRƯỜNG: ${plan.school || 'Trường THCS & THPT Khánh Lâm'}`, font: FONT, size: 24, bold: true }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: `TỔ CHUYÊN MÔN: ${plan.department || 'Tổ Toán - Tin'}`, font: FONT, size: 24, bold: true }),
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
                          new TextRun({ text: `Họ và tên GV: ${plan.teacherName || 'Thầy Dương Bảo Quốc'}`, font: FONT, size: 24, bold: true }),
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

          new Paragraph({ text: '', spacing: { before: 150 } }),

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
              new TextRun({ text: `TÊN BÀI DẠY: ${(plan.title || 'CHƯA ĐẶT TÊN').toUpperCase()}`, font: FONT, size: 26, bold: true, color: '002060' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Môn học/Hoạt động GD: ${plan.subject || 'Toán'}; Khối/Lớp: ${plan.grade || '12'}`, font: FONT, size: 24, italics: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Thời gian thực hiện: ${plan.duration || 2} tiết`, font: FONT, size: 24, italics: true }),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 200 } }),

          // I. MỤC TIÊU
          new Paragraph({
            children: [
              new TextRun({ text: 'I. MỤC TIÊU BÀI DẠY', font: FONT, size: 26, bold: true, color: '002060' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Về kiến thức:', font: FONT, size: 24, bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: plan.objectives.knowledge || 'Nắm vững kiến thức trọng tâm...', font: FONT, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Về năng lực:', font: FONT, size: 24, bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'a) Năng lực chung & đặc thù: ', font: FONT, size: 24, bold: true }),
              new TextRun({ text: plan.objectives.competencies || 'Năng lực tự chủ, giao tiếp...', font: FONT, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'b) Năng lực số (Tích hợp): ', font: FONT, size: 24, bold: true, color: '0070C0' }),
              new TextRun({ text: plan.objectives.digitalCompetencies || 'NLS 1, NLS 2, NLS 3, NLS 4...', font: FONT, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. Về phẩm chất:', font: FONT, size: 24, bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: plan.objectives.qualities || 'Chăm chỉ, trung thực, trách nhiệm.', font: FONT, size: 24 }),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 150 } }),

          // II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
          new Paragraph({
            children: [
              new TextRun({ text: 'II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU', font: FONT, size: 26, bold: true, color: '002060' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Giáo viên: ', font: FONT, size: 24, bold: true }),
              new TextRun({ text: materialsTeacher, font: FONT, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Học sinh: ', font: FONT, size: 24, bold: true }),
              new TextRun({ text: materialsStudent, font: FONT, size: 24 }),
            ],
          }),

          new Paragraph({ text: '', spacing: { before: 200 } }),

          // III. TIẾN TRÌNH DẠY HỌC (2-COLUMN CV 5512 TABLES)
          new Paragraph({
            children: [
              new TextRun({ text: 'III. TIẾN TRÌNH DẠY HỌC', font: FONT, size: 26, bold: true, color: '002060' }),
            ],
          }),

          ...generateActivityTables(plan.activities || [])
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeTitle = (plan.title || 'GiaoAn_5512_NangLucSo').replace(/[/\\?%*:|"<>]/g, '_');
  saveAs(blob, `${safeTitle}_5512_NLS.docx`);
};

/**
 * Generates Standard 2-Column CV 5512 Tables for Activities
 */
function generateActivityTables(activities: any[]): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  activities.forEach((act, index) => {
    // Activity Title Header
    elements.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: `${act.title || `Hoạt động ${index + 1}`}`,
            font: FONT,
            size: 25,
            bold: true,
            color: '002060'
          }),
        ],
      })
    );

    // Digital Competency Badge
    elements.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: `[Tích hợp NLS - ${act.digitalCompetencyDomain || 'NLS 1'}]: `, font: FONT, size: 23, bold: true, color: 'C00000' }),
          new TextRun({ text: `Công cụ số: ${(act.digitalTools || []).join(', ')} | ${act.digitalNotes || ''}`, font: FONT, size: 23, italics: true, color: '002060' }),
        ],
      })
    );

    // a) Mục tiêu
    elements.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'a) Mục tiêu: ', font: FONT, size: 24, bold: true }),
          new TextRun({ text: act.objective || '', font: FONT, size: 24 }),
        ],
      })
    );

    // b) Nội dung
    elements.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'b) Nội dung: ', font: FONT, size: 24, bold: true }),
          new TextRun({ text: act.content || '', font: FONT, size: 24 }),
        ],
      })
    );

    // c) Sản phẩm
    elements.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'c) Sản phẩm: ', font: FONT, size: 24, bold: true }),
          new TextRun({ text: act.product || '', font: FONT, size: 24 }),
        ],
      })
    );

    // d) Tổ chức thực hiện (Standard 2-Column Table)
    elements.push(
      new Paragraph({
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({ text: 'd) Tổ chức thực hiện:', font: FONT, size: 24, bold: true }),
        ],
      })
    );

    const step1 = act.implementation?.step1_transfer || '';
    const step2 = act.implementation?.step2_execute || '';
    const step3 = act.implementation?.step3_report || '';
    const step4 = act.implementation?.step4_conclusion || '';

    const actTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // Table Header
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { fill: 'F2F2F2' },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'HOẠT ĐỘNG CỦA GV VÀ HS', font: FONT, size: 23, bold: true })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { fill: 'F2F2F2' },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: 'DỰ KIẾN SẢN PHẨM / KẾT QUẢ', font: FONT, size: 23, bold: true })],
                }),
              ],
            }),
          ],
        }),
        // Bước 1
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Bước 1: Chuyển giao nhiệm vụ:', font: FONT, size: 23, bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: step1, font: FONT, size: 23 })] }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: act.content || act.product || 'Học sinh tiếp nhận nhiệm vụ...', font: FONT, size: 23 })] }),
              ],
            }),
          ],
        }),
        // Bước 2
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Bước 2: Thực hiện nhiệm vụ:', font: FONT, size: 23, bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: step2, font: FONT, size: 23 })] }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Học sinh làm việc cá nhân/nhóm trên môi trường số...', font: FONT, size: 23 })] }),
              ],
            }),
          ],
        }),
        // Bước 3
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Bước 3: Báo cáo, thảo luận:', font: FONT, size: 23, bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: step3, font: FONT, size: 23 })] }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: act.product || 'Sản phẩm báo cáo của học sinh...', font: FONT, size: 23 })] }),
              ],
            }),
          ],
        }),
        // Bước 4
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Bước 4: Kết luận, nhận định:', font: FONT, size: 23, bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: step4, font: FONT, size: 23 })] }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Kiến thức trọng tâm được chuẩn hóa ghi vào vở.', font: FONT, size: 23 })] }),
              ],
            }),
          ],
        }),
      ],
    });

    elements.push(actTable);
    elements.push(new Paragraph({ text: '', spacing: { before: 100 } }));
  });

  return elements;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
