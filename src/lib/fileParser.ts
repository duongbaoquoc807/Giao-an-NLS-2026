import mammoth from 'mammoth';
import JSZip from 'jszip';

/**
 * Extracts plain text from various file formats (.docx, .txt, .pdf, .md, .json)
 */
export async function parseDocumentFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim()) {
        return result.value.trim();
      }
    } catch (e) {
      console.warn('Mammoth extraction failed, trying JSZip XML fallback:', e);
      return await extractTextFromDocxZip(file);
    }
  }

  if (extension === 'txt' || extension === 'md' || extension === 'json' || extension === 'csv') {
    return await file.text();
  }

  // Fallback text reader
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text || '');
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

/**
 * Fallback raw XML text extraction for .docx using JSZip
 */
async function extractTextFromDocxZip(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXml = await zip.file('word/document.xml')?.async('text');
    if (!docXml) return '';

    // Strip XML tags and clean up
    const text = docXml
      .replace(/<w:p[^>]*>/g, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  } catch (err) {
    console.error('Docx zip extraction error:', err);
    return '';
  }
}
