import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export interface ExtractedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  text: string;
  charCount: number;
  wordCount: number;
}

/**
 * Parses a single file client-side based on its extension/MIME type.
 * Zero data leaves the client at this stage; strictly memory-based.
 */
export async function parseFileClientSide(file: File): Promise<ExtractedFile> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  let extractedText = '';

  try {
    if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value || '';
    } else if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetTexts: string[] = [];

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        if (worksheet) {
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          sheetTexts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
        }
      });
      extractedText = sheetTexts.join('\n\n');
    } else if (extension === 'pdf') {
      extractedText = await extractPdfText(file);
    } else {
      // .txt, .md, .json, .vtt, .srt, and other text-based formats
      extractedText = await file.text();
    }
  } catch (error: any) {
    console.error(`Error parsing file ${file.name}:`, error);
    extractedText = `[Error extracting text from ${file.name}: ${error?.message || 'Unsupported or corrupted format'}]`;
  }

  const cleanText = extractedText.trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: file.name,
    size: file.size,
    type: file.type || `application/${extension}`,
    text: cleanText,
    charCount: cleanText.length,
    wordCount,
  };
}

/**
 * Resilient PDF extractor for client-side environments.
 * Uses pdfjs-dist if worker is available, with a text-stream fallback
 * to guarantee extraction in sandboxed iframes.
 */
async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    // Attempt pdfjs-dist import
    const pdfjs = await import('pdfjs-dist');
    // Set worker src or disable worker if needed in Vite
    if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '4.10.38'}/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const doc = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const pageString = textContent.items
        .map((item: any) => (item.str !== undefined ? item.str : ''))
        .join(' ');
      pageTexts.push(`--- Page ${i} ---\n${pageString}`);
    }

    return pageTexts.join('\n\n');
  } catch (err) {
    console.warn('pdfjs-dist standard extraction failed, using binary stream text decoder fallback:', err);
    // Fallback: decode text strings from PDF binary streams
    const uint8 = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder('latin1');
    const raw = textDecoder.decode(uint8);

    // Extract text between BT (Begin Text) and ET (End Text) or Tj / TJ tokens
    const textChunks: string[] = [];
    const textRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = textRegex.exec(raw)) !== null) {
      if (match[1] && match[1].length > 1) {
        textChunks.push(match[1]);
      }
    }

    if (textChunks.length > 0) {
      return textChunks.join(' ');
    }

    // Secondary fallback: printable ASCII sequences
    const asciiStrings = raw.match(/[\x20-\x7E]{5,}/g);
    if (asciiStrings && asciiStrings.length > 0) {
      return asciiStrings.filter((s) => !s.startsWith('/Font') && !s.startsWith('<<')).join('\n');
    }

    throw new Error('Could not parse PDF content textually.');
  }
}

/**
 * Format bytes into human-readable string (KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
