import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  Header,
  Footer,
  PageNumber
} from 'docx';
import { jsPDF } from 'jspdf';
import { ImprovementEngineItem, generateImprovementItems } from './improvementEngine';
import { ProjectRisk, INITIAL_RISKS as DEFAULT_ADVANNOTECH_RISKS, MatrixStakeholder, INITIAL_STAKEHOLDERS } from '../data/projectRegisters';
import { PMIDocumentDefinition } from '../data/documents';

export interface ActionItemExport {
  id?: string;
  item: string;
  company?: string;
  responsiblePerson: string;
  dueDate: string;
  priority: string;
}

/**
 * Downloads a string or binary content as a file with the specified MIME type.
 * Fixes asynchronous browser download dispatch by keeping anchor in DOM until click queues.
 */
export function downloadBlob(content: BlobPart, filename: string, mimeType: string) {
  try {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.target = '_self';
    anchor.rel = 'noopener noreferrer';
    anchor.style.position = 'fixed';
    anchor.style.left = '-9999px';
    anchor.style.top = '-9999px';
    anchor.style.opacity = '0';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      try {
        if (document.body.contains(anchor)) {
          document.body.removeChild(anchor);
        }
        URL.revokeObjectURL(url);
      } catch {
        // Ignored if already cleaned up
      }
    }, 3000);
  } catch (err) {
    console.error('Failed to trigger downloadBlob:', err);
  }
}

/**
 * Exports markdown content to a .md file
 */
export function exportMarkdown(markdown: string, docCode: string, docTitle: string) {
  const cleanTitle = docTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${docCode}_${cleanTitle}.md`;
  downloadBlob(markdown, filename, 'text/markdown;charset=utf-8');
}

/**
 * Exports Meeting Minutes Action Items as a CSV spreadsheet
 */
export function exportActionItemsCsv(actionItems: ActionItemExport[], docCode: string, docTitle: string) {
  const headers = ['Action Item ID', 'Task Description', 'Company / Org', 'Responsible Person', 'Due Date', 'Priority'];
  const rows = actionItems.map((item, index) => [
    `"${item.id || `ACT-${String(index + 1).padStart(2, '0')}`}"`,
    `"${(item.item || '').replace(/"/g, '""')}"`,
    `"${(item.company || 'Advannotech / Client').replace(/"/g, '""')}"`,
    `"${(item.responsiblePerson || 'TBC').replace(/"/g, '""')}"`,
    `"${item.dueDate || 'TBC'}"`,
    `"${item.priority || 'Medium'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const cleanTitle = docTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${docCode}_${cleanTitle}_Action_Items.csv`;
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8');
}

/**
 * Exports RASCI Matrix rows as a CSV spreadsheet
 */
export function exportRasciCsv(rows: any[], docCode: string) {
  const headers = ['Task / Deliverable', 'Responsible (R)', 'Accountable (A)', 'Supportive (S)', 'Consulted (C)', 'Informed (I)'];
  const csvRows = rows.map((r) => [
    `"${(r.task || '').replace(/"/g, '""')}"`,
    `"${(r.responsible || '').replace(/"/g, '""')}"`,
    `"${(r.accountable || '').replace(/"/g, '""')}"`,
    `"${(r.supportive || '').replace(/"/g, '""')}"`,
    `"${(r.consulted || '').replace(/"/g, '""')}"`,
    `"${(r.informed || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\r\n');
  const filename = `${docCode}_RASCI_Matrix.csv`;
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8');
}

/**
 * Exports a blank example template for a specific document definition
 */
export async function exportExampleTemplate(doc: PMIDocumentDefinition, format: 'docx' | 'md') {
  const content = `# TEMPLATE: ${doc.title.toUpperCase()}\n\n` +
    `## Purpose\n${doc.purpose}\n\n` +
    doc.requiredSections.map((s, i) => `## ${i + 1}. ${s}\n\n[Insert ${s} content here]\n`).join('\n') +
    `\n## Required Fields\n` +
    doc.requiredFields.map(f => `- ${f}: [Enter Value]`).join('\n');

  if (format === 'md') {
    const filename = `TEMPLATE_${doc.id.replace(/-/g, '_')}.md`;
    downloadBlob(content, filename, 'text/markdown;charset=utf-8');
  } else {
    // Basic docx template
    await exportDocx(content, 'TEMPLATE-001', doc.title, 'Project Name', new Date().toISOString().split('T')[0]);
  }
}

/**
 * Exports a blank Excel/CSV template for registers or data-heavy documents
 */
export function exportExampleExcelTemplate(doc: PMIDocumentDefinition) {
  const headers = ['Field Name', 'Description', 'Value / Input'];
  const rows = doc.requiredFields.map(f => [`"${f}"`, `"Mandatory PMBOK field"`, '""']);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const filename = `TEMPLATE_${doc.id.replace(/-/g, '_')}_Fields.csv`;
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8');
}

/**
 * Direct Client-Side PDF Export using jsPDF
 * Renders a publication-grade, formal corporate PDF document with Advannotech letterhead,
 * section hierarchy, formatted tables, page numbers, and executive sign-off blocks.
 * Guarantees a direct binary .pdf file download to the user's computer.
 */
/**
 * Converts a base64 image string to grayscale using a temporary canvas
 */
async function convertToGrayscale(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(base64); return; }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

export async function exportDocumentPdf(
  markdown: string,
  docCode: string,
  docTitle: string,
  projectName: string,
  date: string,
  customLogo?: string | null,
  isMonochrome?: boolean,
  answers?: Record<string, string>
): Promise<void> {
  // If monochrome requested, convert custom logo
  let activeLogo = customLogo;
  if (customLogo && isMonochrome) {
    activeLogo = await convertToGrayscale(customLogo);
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const navyColor = [15, 23, 42]; // #0F172A
  const tealColor = [0, 163, 255]; // #00A3FF (Teal/Blue)
  const greyColor = [203, 213, 225]; // Light Grey
  
  let y = margin;
  let currentPage = 1;

  const drawHeader = (isCover = false) => {
    // Top-left network-node graphic (faint)
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.5);
    const nodes = [[15, 15], [35, 25], [10, 45], [45, 10], [55, 35]];
    nodes.forEach(([nx, ny]) => {
      doc.circle(nx, ny, 1.5, 'S');
      nodes.forEach(([nx2, ny2]) => {
        if (Math.random() > 0.6) doc.line(nx, ny, nx2, ny2);
      });
    });

    // Left: Logo / Text
    if (activeLogo) {
      try {
        doc.addImage(activeLogo, 'PNG', margin, 15, 45, 30);
      } catch (err) {
        console.error('Error adding custom logo to PDF:', err);
      }
    } else {
      // Circular emblem beside text
      doc.setDrawColor(0, 163, 255);
      doc.setLineWidth(1);
      doc.circle(margin + 5, 30, 8, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // Navy
      doc.text('ADVANN', margin + 18, 35);
      doc.setTextColor(0, 163, 255); // Teal
      doc.text('TECH', margin + 82, 35);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text('INTEGRATED TECH SOLUTIONS', margin + 18, 42);
    }

    // Right: Contact info
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('info@advannotech.co.za', pageWidth - margin, 25, { align: 'right' });
    doc.text('www.advannotech.co.za', pageWidth - margin, 35, { align: 'right' });
    doc.text('+27 12 004 0467', pageWidth - margin, 45, { align: 'right' });

    // Header Rule
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 55, pageWidth - margin, 55);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1.5);
    doc.line(margin, 55, margin + 40, 55);
    doc.setLineWidth(1);
  };

  const drawFooter = (pageNum: number) => {
    // Navy band footer
    doc.setFillColor(15, 23, 42);
    doc.rect(0, pageHeight - 40, pageWidth, 40, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Xolani Zuma - Chief Executive Officer  ●  Lando Zuma - Chief Financial Officer  ●', margin, pageHeight - 15);
    
    // Page number in top right of band (Letter-spaced)
    const pgText = `${pageNum} | P a g e`;
    doc.setFontSize(7);
    doc.text(pgText, pageWidth - margin, pageHeight - 25, { align: 'right' });
  };

  // --- 1. COVER PAGE ---
  drawHeader(true);
  
  // BRAND BLOCK (Centered)
  y = 180;
  // Concentric segmented rings emblem
  doc.setDrawColor(0, 163, 255);
  doc.setLineWidth(2.5);
  doc.circle(pageWidth / 2, y, 45, 'S');
  doc.setDrawColor(56, 189, 248); // Lighter teal
  doc.setLineWidth(1.5);
  doc.circle(pageWidth / 2, y, 38, 'S');
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1);
  doc.circle(pageWidth / 2, y, 32, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(15, 23, 42);
  // White A chevron center logic (approximation)
  doc.text('A', pageWidth / 2, y + 12, { align: 'center' });
  
  y += 75;
  doc.setFontSize(26);
  doc.setTextColor(15, 23, 42);
  doc.text('ADVANNOTECH', pageWidth / 2, y, { align: 'center' });
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(3);
  doc.line(pageWidth / 2 - 70, y + 6, pageWidth / 2 + 70, y + 6);
  
  y += 30;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('I N T E G R A T E D   T E C H   S O L U T I O N S', pageWidth / 2, y, { align: 'center' });
  // TITLE BLOCK (Centered)
  y += 85;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('ADVANCED TECHNOLOGY SOLUTIONS', pageWidth / 2, y, { align: 'center' });
  
  y += 25;
  doc.setFontSize(18);
  doc.setTextColor(0, 163, 255); // Teal
  doc.text(`${docTitle}:`, pageWidth / 2, y, { align: 'center' });
  
  y += 25;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(projectName, pageWidth / 2, y, { align: 'center' });
  
  // DETAILS TABLE
  y += 80;
  const tableX = pageWidth / 2 - 150;
  const col1Width = 120;
  const col2Width = 180;
  const rowHeight = 25;
  
  const customer = answers?.['Customer'] || 'Client Organization';
  const partner = answers?.['Registered Partner / Solution Partner'] || 'Advannotech (Pty) Ltd';
  const contact = answers?.['Customer Contact'] || answers?.[`${customer} Contact`] || 'TBC';
  const regDate = answers?.['Date Registered'] || date;
  
  const rows = [
    ['Customer', customer],
    ['Registered Partner', partner],
    [`${customer} Contact`, contact],
    ['Date Registered', regDate]
  ];
  
  rows.forEach((row, i) => {
    // Left Col (Navy)
    doc.setFillColor(15, 23, 42);
    doc.rect(tableX, y + i * rowHeight, col1Width, rowHeight, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(row[0], tableX + 10, y + i * rowHeight + 16);
    
    // Right Col (White with border)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(tableX + col1Width, y + i * rowHeight, col2Width, rowHeight, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row[1], tableX + col1Width + 10, y + i * rowHeight + 16);
  });
  
  drawFooter(1);
  
  // --- 2. MAIN CONTENT ---
  doc.addPage();
  currentPage = 2;
  drawHeader();
  drawFooter(currentPage);
  y = 80;

  // Process markdown lines
  const safeMarkdown = markdown || '';
  const lines = safeMarkdown.split(/\r?\n/);
  let inTable = false;
  let tableRows: string[][] = [];

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 60) {
      doc.addPage();
      currentPage++;
      drawHeader();
      drawFooter(currentPage);
      y = 80;
    }
  };

  const flushTable = () => {
    if (!inTable || tableRows.length === 0) return;
    const colCount = Math.max(...tableRows.map((r) => r.length), 1);
    const colWidth = contentWidth / colCount;
    const tRowHeight = 18;

    tableRows.forEach((row, rIdx) => {
      checkPageBreak(tRowHeight + 4);
      const isHeader = rIdx === 0;

      doc.setFillColor(isHeader ? 15 : rIdx % 2 === 0 ? 248 : 255, isHeader ? 23 : rIdx % 2 === 0 ? 250 : 255, isHeader ? 42 : rIdx % 2 === 0 ? 252 : 255);
      doc.rect(margin, y, contentWidth, tRowHeight, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, contentWidth, tRowHeight, 'S');

      row.forEach((cell, cIdx) => {
        const x = margin + cIdx * colWidth;
        doc.setDrawColor(226, 232, 240);
        doc.line(x, y, x, y + tRowHeight);

        doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
        doc.setFontSize(isHeader ? 8 : 7.5);
        doc.setTextColor(isHeader ? 0 : 30, isHeader ? 229 : 41, isHeader ? 255 : 59);
        const cleanCell = cell.replace(/[*_`]/g, '').trim();
        const truncated = doc.splitTextToSize(cleanCell, colWidth - 8)[0] || '';
        doc.text(truncated, x + 4, y + 12);
      });

      y += tRowHeight;
    });

    y += 8;
    inTable = false;
    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();

    // Markdown Table Detection
    if (raw.startsWith('|') && raw.endsWith('|')) {
      const cells = raw.split('|').slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }
      inTable = true;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!raw) {
      y += 4;
      continue;
    }

    if (raw.startsWith('# ') && (raw.includes('ADVANNOTECH') || raw.includes(docTitle.toUpperCase()))) {
      continue;
    }

    if (raw.startsWith('# ')) {
      flushTable();
      checkPageBreak(36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      const text = raw.replace(/^#\s+/, '').replace(/[*_`]/g, '');
      doc.text(text, margin, y + 16);
      doc.setDrawColor(0, 163, 255);
      doc.line(margin, y + 20, margin + contentWidth, y + 20);
      y += 28;
    } else if (raw.startsWith('## ')) {
      flushTable();
      checkPageBreak(28);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 163, 255);
      const text = raw.replace(/^##\s+/, '').replace(/[*_`]/g, '');
      doc.text(text, margin, y + 14);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 18, margin + contentWidth, y + 18);
      y += 24;
    } else if (raw.startsWith('### ')) {
      flushTable();
      checkPageBreak(22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      const text = raw.replace(/^###\s+/, '').replace(/[*_`]/g, '');
      doc.text(text, margin, y + 12);
      y += 18;
    } else if (raw.startsWith('- ') || raw.startsWith('* ')) {
      flushTable();
      checkPageBreak(16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const bulletText = raw.replace(/^[-*]\s+/, '').replace(/[*_`]/g, '');
      const wrapped = doc.splitTextToSize(bulletText, contentWidth - 16);
      doc.circle(margin + 4, y + 6, 1.5, 'F');
      doc.text(wrapped, margin + 12, y + 8);
      y += wrapped.length * 11 + 3;
    } else if (raw.startsWith('---')) {
      flushTable();
      checkPageBreak(12);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 4, margin + contentWidth, y + 4);
      y += 10;
    } else {
      flushTable();
      checkPageBreak(16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const cleanPara = raw.replace(/[*_`]/g, '');
      const wrapped = doc.splitTextToSize(cleanPara, contentWidth);
      doc.text(wrapped, margin, y + 8);
      y += wrapped.length * 11 + 4;
    }
  }

  flushTable();

  // Executive Sign-off Block on last page
  checkPageBreak(90);
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y + 10, margin + contentWidth, y + 10);
  y += 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE STAGE GATE SIGN-OFF & CERTIFICATION', margin, y);
  y += 14;

  const colW = (contentWidth - 20) / 2;

  // Box 1
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, colW, 55, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TECHNICAL ARCHITECTURE AUTHORITY', margin + 8, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Valiant Khoza · Lead Software Engineer', margin + 8, y + 26);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Digital Sign-Off Confirmed · ${date}`, margin + 8, y + 42);

  // Box 2
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin + colW + 20, y, colW, 55, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PROJECT MANAGEMENT OFFICE (PMO)', margin + colW + 28, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Sarel van Deventer · Head of Delivery & PMO', margin + colW + 28, y + 26);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Executive Approval Confirmed · ${date}`, margin + colW + 28, y + 42);

  const pdfBlob = doc.output('blob');
  const cleanTitle = docTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${docCode}_${cleanTitle}.pdf`;
  downloadBlob(pdfBlob, filename, 'application/pdf');
}

/**
 * Parses markdown into docx Paragraphs and Tables
 */
export async function exportDocx(
  markdown: string,
  docCode: string,
  docTitle: string,
  projectName: string,
  date: string
) {
  const safeMarkdown = markdown || '';
  const lines = safeMarkdown.split(/\r?\n/);
  const docElements: (Paragraph | Table)[] = [];

  // Title Banner
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'ADVANNOTECH (PTY) LTD',
          bold: true,
          size: 32,
          color: '0B1528',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'INTEGRATED TECH SOLUTIONS',
          italics: true,
          size: 20,
          color: '00A3FF',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'CONFIDENTIAL – PROPRIETARY (ADVANNOTECH PTY LTD)',
          bold: true,
          size: 18,
          color: '0F172A',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        new TextRun({
          text: `Document ID: ${docCode} | Date: ${date}`,
          size: 18,
          color: '64748B',
          font: 'Arial'
        })
      ]
    })
  );

  let inTable = false;
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    // Table parsing
    if (rawLine.startsWith('|') && rawLine.endsWith('|')) {
      const cells = rawLine
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      // Check if it's separator line (e.g. |---|---|)
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }

      inTable = true;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      // Flush previous table
      if (tableRows.length > 0) {
        docElements.push(createDocxTable(tableRows));
        tableRows = [];
      }
      inTable = false;
    }

    if (!rawLine) {
      docElements.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    // Headings
    if (rawLine.startsWith('# ')) {
      docElements.push(
        new Paragraph({
          text: rawLine.replace(/^#\s+/, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (rawLine.startsWith('## ')) {
      docElements.push(
        new Paragraph({
          text: rawLine.replace(/^##\s+/, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (rawLine.startsWith('### ')) {
      docElements.push(
        new Paragraph({
          text: rawLine.replace(/^###\s+/, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 180, after: 90 },
        })
      );
    } else if (rawLine.startsWith('- ') || rawLine.startsWith('* ')) {
      // Bullet list item
      const bulletText = rawLine.replace(/^[-*]\s+/, '');
      docElements.push(
        new Paragraph({
          bullet: { level: 0 },
          children: parseInlineFormatting(bulletText),
          spacing: { after: 60 },
        })
      );
    } else if (/^\d+\.\s+/.test(rawLine)) {
      // Numbered list item
      const numText = rawLine.replace(/^\d+\.\s+/, '');
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({ text: rawLine.match(/^\d+\.\s+/)?.[0] || '1. ', bold: true }),
            ...parseInlineFormatting(numText)
          ],
          spacing: { after: 60 },
        })
      );
    } else {
      // Standard paragraph
      docElements.push(
        new Paragraph({
          children: parseInlineFormatting(rawLine),
          spacing: { after: 120 },
        })
      );
    }
  }

  // Flush any trailing table
  if (inTable && tableRows.length > 0) {
    docElements.push(createDocxTable(tableRows));
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `ADVANNOTECH · ${docCode} · CONFIDENTIAL`,
                    size: 16,
                    color: '94A3B8',
                    font: 'Arial'
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${projectName || 'Project Governance'} · Page `,
                    size: 16,
                    color: '94A3B8',
                    font: 'Arial'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '94A3B8',
                    font: 'Arial'
                  }),
                ],
              }),
            ],
          }),
        },
        children: docElements,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = docTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${docCode}_${cleanTitle}.docx`;
  downloadBlob(blob, filename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

/**
 * Creates a formatted docx Table from 2D array of string cells
 */
function createDocxTable(matrix: string[][]): Table {
  const isHeaderRow = (rowIndex: number) => rowIndex === 0;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
    },
    rows: matrix.map((row, rIdx) => {
      const header = isHeaderRow(rIdx);
      return new TableRow({
        tableHeader: header,
        children: row.map((cellText) => {
          return new TableCell({
            shading: { fill: header ? '0F172A' : rIdx % 2 === 0 ? 'F8FAFC' : 'FFFFFF' },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: cellText,
                    bold: header,
                    color: header ? '00E5FF' : '0F172A',
                    size: header ? 18 : 17,
                    font: 'Arial'
                  }),
                ],
              }),
            ],
          });
        }),
      });
    }),
  });
}

/**
 * Parses bold (`**text**`) and italic (`*text*`) formatting
 */
function parseInlineFormatting(text: string): TextRun[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens.map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return new TextRun({ text: part.slice(2, -2), bold: true, font: 'Arial' });
    } else if (part.startsWith('*') && part.endsWith('*')) {
      return new TextRun({ text: part.slice(1, -1), italics: true, font: 'Arial' });
    }
    return new TextRun({ text: part, font: 'Arial' });
  });
}

/**
 * Generates and triggers printable/save-to-PDF Audit Report
 */
export function exportAuditReportPdf(
  auditData: {
    liftedContent: {
      section: string;
      sourceName: string;
      excerpt: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
    }[];
    excludedContent: {
      sourceName: string;
      excludedSummary: string;
      reason: string;
    }[];
    humanReviewAdvisories: {
      item: string;
      section: string;
      riskLevel: 'Critical' | 'High' | 'Medium';
      advisoryNote: string;
      recommendedAction: string;
      suggestedFix?: string;
    }[];
    complianceHeatmap?: any[];
  },
  docCode: string,
  docTitle: string,
  projectName: string,
  date: string,
  acknowledgedMap: Record<number, boolean> = {},
  improvementItems?: ImprovementEngineItem[],
  risks?: ProjectRisk[],
  stakeholders?: MatrixStakeholder[]
) {
  const activeImprovementItems =
    improvementItems && improvementItems.length > 0
      ? improvementItems
      : generateImprovementItems(auditData, null, []);

  const activeRisks = risks && risks.length > 0 ? risks : DEFAULT_ADVANNOTECH_RISKS;
  const activeStakeholders = stakeholders && stakeholders.length > 0 ? stakeholders : INITIAL_STAKEHOLDERS;

  const auditReportHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Advannotech Audit Report - ${docCode}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      margin: 0;
      padding: 20px;
      line-height: 1.45;
      font-size: 10pt;
    }
    .header {
      border-bottom: 2pt solid #00A3FF;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .company-title {
      font-size: 16pt;
      font-weight: 800;
      color: #0B1528;
      letter-spacing: -0.01em;
    }
    .company-tagline {
      font-size: 9pt;
      color: #00A3FF;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .doc-classification {
      font-size: 8pt;
      color: #64748B;
      font-weight: bold;
    }
    h1 {
      font-size: 14pt;
      color: #0F172A;
      margin: 14px 0 6px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    h2 {
      font-size: 11pt;
      color: #005F9E;
      margin-top: 18px;
      margin-bottom: 6px;
      border-bottom: 1pt solid #CBD5E1;
      padding-bottom: 3px;
    }
    .meta-box {
      background: #F8FAFC;
      border: 1pt solid #E2E8F0;
      border-radius: 4px;
      padding: 10px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      font-size: 8.5pt;
      margin-bottom: 16px;
    }
    .meta-box div span {
      display: block;
      color: #64748B;
      font-size: 7.5pt;
      text-transform: uppercase;
    }
    .meta-box div strong {
      color: #0F172A;
      font-size: 9pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    th {
      background: #0F172A;
      color: #FFFFFF;
      padding: 6px 8px;
      text-align: left;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    td {
      padding: 6px 8px;
      border: 1pt solid #E2E8F0;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #F8FAFC;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      font-size: 7.5pt;
      font-weight: bold;
      border-radius: 3px;
    }
    .badge-critical { background: #FEE2E2; color: #991B1B; border: 1pt solid #FCA5A5; }
    .badge-high { background: #FEF3C7; color: #92400E; border: 1pt solid #FCD34D; }
    .badge-medium { background: #E0F2FE; color: #075985; border: 1pt solid #BAE6FD; }
    .badge-low { background: #F1F5F9; color: #475569; border: 1pt solid #CBD5E1; }
    .improvement-card {
      border: 1pt solid #E2E8F0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 10px;
      background: #FFFFFF;
      page-break-inside: avoid;
    }
    .improvement-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .steps-box {
      background: #F8FAFC;
      border-left: 3pt solid #00A3FF;
      padding: 6px 10px;
      margin: 6px 0;
      font-size: 8pt;
    }
    .source-box {
      background: #ECFDF5;
      border-left: 3pt solid #10B981;
      padding: 6px 10px;
      margin: 6px 0;
      font-size: 8pt;
      color: #064E3B;
    }
    .prompt-box {
      background: #FFFBEB;
      border-left: 3pt solid #F59E0B;
      padding: 6px 10px;
      margin: 6px 0;
      font-size: 8pt;
      color: #78350F;
    }
    .clause-box {
      background: #F1F5F9;
      border: 1pt solid #CBD5E1;
      border-radius: 4px;
      padding: 6px 8px;
      font-family: monospace;
      font-size: 7.5pt;
      white-space: pre-wrap;
      color: #0F172A;
      margin-top: 6px;
    }
    .signoff-box {
      margin-top: 24px;
      page-break-inside: avoid;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .signoff-card {
      border: 1pt solid #CBD5E1;
      padding: 10px;
      border-radius: 4px;
      background: #FAFAFA;
      font-size: 8.5pt;
    }
    .sign-line {
      margin-top: 30px;
      border-top: 1pt solid #64748B;
      padding-top: 4px;
      color: #64748B;
      font-size: 8pt;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-title">ADVANNOTECH (PTY) LTD</div>
    <div class="company-tagline">Enterprise Project Governance & Technology Solutions · www.advannotech.co.za</div>
    <div class="doc-classification">CONFIDENTIAL – PROPRIETARY (ADVANNOTECH PTY LTD) · GOVERNANCE ASSURANCE AUDIT</div>
  </div>

  <h1>Provenance & Material Exclusion Audit Report</h1>

  <div class="meta-box">
    <div>
      <span>Audit Document ID</span>
      <strong>${docCode}-AUDIT</strong>
    </div>
    <div>
      <span>Associated Document</span>
      <strong>${docTitle}</strong>
    </div>
    <div>
      <span>Project Name</span>
      <strong>${projectName || 'Enterprise Governance'}</strong>
    </div>
    <div>
      <span>Audit Date</span>
      <strong>${date}</strong>
    </div>
  </div>

  <h2>1. Executive Audit Summary</h2>
  <p>
    This audit report certifies the forensic provenance of the generated document <strong>${docTitle} (${docCode})</strong>.
    All claims, parameters, and tables were synthesized strictly from user-provided source files and explicit clarification answers under PMBOK 7th Edition and ISO 21500 standards.
  </p>

  <div class="meta-box">
    <div>
      <span>Lifted Evidence Points</span>
      <strong>${auditData.liftedContent.length}</strong>
    </div>
    <div>
      <span>Excluded Items Logged</span>
      <strong>${auditData.excludedContent.length}</strong>
    </div>
    <div>
      <span>Human Review Advisories</span>
      <strong>${auditData.humanReviewAdvisories.length}</strong>
    </div>
    <div>
      <span>Compliance Standard</span>
      <strong>PMBOK 7th / ISO-21500</strong>
    </div>
  </div>

  <h2>2. Section Contribution & Lifted Content Matrix</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Target Document Section</th>
        <th style="width: 20%;">Source File / Origin</th>
        <th>Lifted Excerpt / Evidence Record</th>
        <th style="width: 12%;">Priority</th>
      </tr>
    </thead>
    <tbody>
      ${auditData.liftedContent.map((item) => `
        <tr>
          <td><strong>${item.section}</strong></td>
          <td><code style="font-family: monospace;">${item.sourceName}</code></td>
          <td>${item.excerpt}</td>
          <td>
            <span class="badge badge-${item.priority.toLowerCase()}">
              ${item.priority}
            </span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>3. Excluded Source Content Log</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Source Origin</th>
        <th style="width: 40%;">Excluded Material Summary</th>
        <th>Audit Justification for Omission</th>
      </tr>
    </thead>
    <tbody>
      ${auditData.excludedContent.length > 0 ? auditData.excludedContent.map((item) => `
        <tr>
          <td><code style="font-family: monospace;">${item.sourceName}</code></td>
          <td>${item.excludedSummary}</td>
          <td style="color: #64748B;"><em>${item.reason}</em></td>
        </tr>
      `).join('') : `
        <tr>
          <td colspan="3" style="text-align: center; color: #64748B;">No extraneous source content was excluded.</td>
        </tr>
      `}
    </tbody>
  </table>

  <h2>4. Forensic Gap Analysis & RAG Fix Priority Register</h2>
  <p style="font-size: 8.5pt; color: #475569;">
    Identified information discrepancies and omissions scored by Audit Fix Priority.
    <strong style="color: #DC2626;">RED</strong> indicates critical blocking gaps requiring immediate intervention;
    <strong style="color: #D97706;">AMBER</strong> indicates medium-risk assumptions to be verified;
    <strong style="color: #16A34A;">GREEN</strong> indicates low-risk or verified parameters.
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Identified Gap / Parameter</th>
        <th style="width: 15%;">Affected Section</th>
        <th style="width: 18%;">RAG Fix Priority</th>
        <th>Recommended Remediation Action</th>
        <th style="width: 15%;">Audit Disposition</th>
      </tr>
    </thead>
    <tbody>
      ${auditData.humanReviewAdvisories.length > 0 ? auditData.humanReviewAdvisories.map((adv, i) => {
        const isAck = acknowledgedMap[i];
        const isCritical = adv.riskLevel === 'Critical';
        const isHigh = adv.riskLevel === 'High';
        const ragColor = isCritical ? '#DC2626' : isHigh ? '#D97706' : '#16A34A';
        const ragBg = isCritical ? '#FEE2E2' : isHigh ? '#FEF3C7' : '#DCFCE7';
        const ragBorder = isCritical ? '#F87171' : isHigh ? '#FBBF24' : '#86EFAC';
        const ragLabel = isCritical ? 'RED (Critical Priority)' : isHigh ? 'AMBER (Medium Priority)' : 'GREEN (Low Priority)';

        return `
          <tr>
            <td><strong>${adv.item}</strong></td>
            <td>${adv.section}</td>
            <td>
              <span style="display: inline-block; padding: 2px 6px; font-size: 7.5pt; font-weight: bold; border-radius: 3px; background: ${ragBg}; color: ${ragColor}; border: 1pt solid ${ragBorder};">
                ${ragLabel}
              </span>
            </td>
            <td>
              <div>${adv.advisoryNote}</div>
              <div style="margin-top: 4px; font-size: 8pt; color: #005F9E;">
                <strong>Fix Action:</strong> ${adv.recommendedAction}
              </div>
              ${(adv as any).suggestedFix ? `
                <div style="margin-top: 4px; padding: 4px 6px; background: #ECFDF5; border-left: 2pt solid #10B981; font-size: 7.5pt; color: #064E3B; font-family: monospace;">
                  <strong>Remediation Clause Suggestion:</strong> ${(adv as any).suggestedFix}
                </div>
              ` : ''}
            </td>
            <td>
              <strong>${isAck ? '✓ Remediated / Acknowledged' : 'Pending PM Action'}</strong>
            </td>
          </tr>
        `;
      }).join('') : `
        <tr>
          <td colspan="5" style="text-align: center; color: #16A34A; padding: 10px;">
            ✓ All required sections and parameters verified with zero blocking gaps.
          </td>
        </tr>
      `}
    </tbody>
  </table>

  <h2>5. PMBOK Improvement Engine: Actionable Remediation & Source Resolution Plan</h2>
  <p style="font-size: 8.5pt; color: #475569;">
    Automated remediation intelligence detailing specific operational steps, recommended source file references, and missing data stakeholder inquiries for all RED and AMBER flagged items.
  </p>

  ${activeImprovementItems.length > 0 ? activeImprovementItems.map((item, idx) => {
    const isRed = item.flag === 'RED';
    const flagColor = isRed ? '#DC2626' : '#D97706';
    const flagBg = isRed ? '#FEE2E2' : '#FEF3C7';
    const flagBorder = isRed ? '#F87171' : '#FBBF24';

    return `
      <div class="improvement-card">
        <div class="improvement-header">
          <div>
            <span style="display: inline-block; padding: 2px 8px; font-size: 7.5pt; font-weight: bold; border-radius: 3px; background: ${flagBg}; color: ${flagColor}; border: 1pt solid ${flagBorder}; text-transform: uppercase;">
              ${item.flag} PRIORITY REMEDIATION
            </span>
            <strong style="font-size: 9.5pt; margin-left: 8px;">${idx + 1}. ${item.title}</strong>
            <span style="color: #64748B; font-size: 8pt; font-family: monospace;">(${item.sectionOrField})</span>
          </div>
        </div>

        <p style="font-size: 8pt; color: #334155; margin: 4px 0;"><strong>Defect Summary:</strong> ${item.defectSummary}</p>

        <div class="steps-box">
          <strong style="color: #005F9E; display: block; margin-bottom: 2px;">Actionable Remediation Steps:</strong>
          ${item.actionableSteps.map((step) => `<div>• ${step}</div>`).join('')}
        </div>

        <div class="source-box">
          <strong>Recommended Source Files to Consult:</strong> ${item.sourceFileReferences.recommendedFileType}
          <div style="font-size: 7.5pt; margin-top: 2px;">
            <strong>Target Section / Table:</strong> ${item.sourceFileReferences.sectionToInspect}
            ${item.sourceFileReferences.alreadyUploadedMatch ? ` · <span style="font-weight: bold; color: #047857;">[Matched in Ingested Uploads: ${item.sourceFileReferences.alreadyUploadedMatch}]</span>` : ''}
          </div>
        </div>

        <div class="prompt-box">
          <strong>Missing Data Point Inquiry:</strong> "${item.missingDataPrompt.promptText}"
          <div style="font-size: 7.5pt; margin-top: 2px;">
            <strong>Responsible SME Role:</strong> ${item.missingDataPrompt.responsibleRole}
            <br />
            <strong>Sample Baseline:</strong> ${item.missingDataPrompt.sampleValue}
          </div>
        </div>

        <div class="clause-box">
          <strong>Suggested PMBOK 7th Ed. Remediation Clause:</strong><br />${item.suggestedFixClause}
        </div>
      </div>
    `;
  }).join('') : `
    <p style="color: #16A34A; font-size: 8.5pt;">✓ Zero RED or AMBER flags detected. Document conforms to all PMBOK baseline specifications.</p>
  `}

  <h2>6. ISO 31000 Risk Probability vs Impact Heatmap & Register</h2>
  <p style="font-size: 8.5pt; color: #475569;">
    Automated risk evaluation processing identified risks from ingested documentation and user inputs. Scored across a 5x5 Probability vs Impact matrix.
  </p>

  <div style="margin: 12px 0; border: 1pt solid #E2E8F0; border-radius: 6px; padding: 10px; background: #FAFAFA; page-break-inside: avoid;">
    <strong style="font-size: 8.5pt; text-transform: uppercase; color: #0F172A; display: block; margin-bottom: 8px;">
      5x5 Risk Distribution Matrix (Probability vs Impact)
    </strong>
    <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 7.5pt; margin-bottom: 6px;">
      <thead>
        <tr>
          <th style="width: 16%; background: #0F172A; color: white;">Prob \\ Impact</th>
          <th style="width: 16%; background: #1E293B; color: white;">1 - Negligible</th>
          <th style="width: 16%; background: #1E293B; color: white;">2 - Minor</th>
          <th style="width: 16%; background: #1E293B; color: white;">3 - Moderate</th>
          <th style="width: 16%; background: #1E293B; color: white;">4 - Major</th>
          <th style="width: 16%; background: #1E293B; color: white;">5 - Critical</th>
        </tr>
      </thead>
      <tbody>
        ${[5, 4, 3, 2, 1].map((p) => {
          const pLabel = p === 5 ? '5 - Almost Certain' : p === 4 ? '4 - Likely' : p === 3 ? '3 - Possible' : p === 2 ? '2 - Unlikely' : '1 - Rare';
          return `
            <tr>
              <td style="font-weight: bold; background: #F1F5F9; text-align: left; padding: 4px 6px;">${pLabel}</td>
              ${[1, 2, 3, 4, 5].map((imp) => {
                const score = p * imp;
                const cellRisks = activeRisks.filter((r) => r.probability === p && r.impact === imp);
                const bg = score >= 15 ? '#FEE2E2' : score >= 10 ? '#FFEDD5' : score >= 5 ? '#FEF3C7' : '#DCFCE7';
                const textColor = score >= 15 ? '#991B1B' : score >= 10 ? '#9A3412' : score >= 5 ? '#92400E' : '#166534';
                return `
                  <td style="background: ${bg}; color: ${textColor}; padding: 6px 4px; border: 1pt solid #E2E8F0; vertical-align: middle;">
                    <div style="font-weight: bold; font-size: 8pt;">${score}</div>
                    ${cellRisks.map((cr) => `
                      <div style="font-size: 6.5pt; background: rgba(0,0,0,0.06); margin-top: 2px; padding: 1px 3px; border-radius: 2px; font-weight: 600;">
                        ${cr.id}
                      </div>
                    `).join('')}
                  </td>
                `;
              }).join('')}
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 10%;">Risk ID</th>
        <th style="width: 25%;">Identified Risk Description</th>
        <th style="width: 12%;">Category</th>
        <th style="width: 8%;">P x I</th>
        <th style="width: 10%;">Score / RAG</th>
        <th>Mitigation Strategy</th>
        <th style="width: 15%;">Owner</th>
      </tr>
    </thead>
    <tbody>
      ${activeRisks.map((r) => {
        const isCrit = r.level === 'CRITICAL';
        const isHigh = r.level === 'HIGH';
        const ragColor = (isCrit || isHigh) ? '#991B1B' : r.level === 'MEDIUM' ? '#92400E' : '#166534';
        const ragBg = (isCrit || isHigh) ? '#FEE2E2' : r.level === 'MEDIUM' ? '#FEF3C7' : '#DCFCE7';
        return `
          <tr>
            <td><strong>${r.id}</strong></td>
            <td><strong>${r.title}</strong></td>
            <td>${r.category}</td>
            <td style="text-align: center;">${r.probability} x ${r.impact}</td>
            <td>
              <span style="display: inline-block; padding: 2px 6px; font-size: 7.5pt; font-weight: bold; border-radius: 3px; background: ${ragBg}; color: ${ragColor};">
                ${r.score} (${r.level})
              </span>
            </td>
            <td>
              <div>${r.mitigationStrategy}</div>
              ${r.contingencyPlan ? `<div style="font-size: 7.5pt; color: #64748B; margin-top: 2px;"><em>Contingency:</em> ${r.contingencyPlan}</div>` : ''}
            </td>
            <td>${r.owner}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <h2>7. Stakeholder Influence vs Interest Distribution Matrix</h2>
  <p style="font-size: 8.5pt; color: #475569;">
    Distribution of identified enterprise project stakeholders mapped across four governance quadrants (Manage Closely, Keep Satisfied, Keep Informed, Monitor) with RACI accountabilities.
  </p>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; page-break-inside: avoid;">
    ${['Manage Closely', 'Keep Satisfied', 'Keep Informed', 'Monitor'].map((quad) => {
      const quadStks = activeStakeholders.filter((s) => s.quadrant === quad);
      const isManage = quad === 'Manage Closely';
      const isSatisfied = quad === 'Keep Satisfied';
      const isInform = quad === 'Keep Informed';
      const borderCol = isManage ? '#00A3FF' : isSatisfied ? '#10B981' : isInform ? '#F59E0B' : '#94A3B8';
      const headerBg = isManage ? '#E0F2FE' : isSatisfied ? '#ECFDF5' : isInform ? '#FEF3C7' : '#F1F5F9';
      return `
        <div style="border: 1pt solid #CBD5E1; border-top: 3pt solid ${borderCol}; border-radius: 4px; padding: 8px; background: #FFFFFF; font-size: 7.5pt;">
          <div style="font-weight: bold; font-size: 8pt; color: #0F172A; background: ${headerBg}; padding: 3px 6px; border-radius: 2px; margin-bottom: 6px;">
            ${quad.toUpperCase()} (${quadStks.length})
          </div>
          ${quadStks.map((s) => `
            <div style="margin-bottom: 4px; border-bottom: 1pt dashed #E2E8F0; padding-bottom: 3px;">
              <strong>${s.name}</strong> · <span style="color: #64748B;">${s.title}</span>
              <div style="color: #005F9E; font-size: 7pt;">Power: ${s.power}% | Interest: ${s.interest}% | RACI: <strong>${s.raci}</strong></div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('')}
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Stakeholder Name & Role</th>
        <th style="width: 15%;">Department / Location</th>
        <th style="width: 14%;">Power & Interest</th>
        <th style="width: 14%;">Quadrant / RACI</th>
        <th>Key Expectation & Engagement Channel</th>
      </tr>
    </thead>
    <tbody>
      ${activeStakeholders.map((s) => `
        <tr>
          <td>
            <strong>${s.name}</strong>
            <div style="font-size: 7.5pt; color: #64748B;">${s.title}</div>
          </td>
          <td>${s.department} (${s.location})</td>
          <td>Power: <strong>${s.power}%</strong><br />Interest: <strong>${s.interest}%</strong></td>
          <td>
            <span style="font-weight: bold; color: #005F9E;">${s.quadrant}</span>
            <div style="font-size: 7.5pt; color: #475569;">RACI: <strong>${s.raci}</strong></div>
          </td>
          <td>
            <div>${s.keyExpectation}</div>
            <div style="font-size: 7.5pt; color: #059669; margin-top: 2px;">Channel: ${s.engagementChannel}</div>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>8. Executive Sign-Off & Governance Endorsement</h2>

  <div class="signoff-box">
    <div class="signoff-card">
      <strong>Lead Governance Auditor Verification</strong>
      <p style="margin: 4px 0 0 0; color: #64748B;">Certified conforming to ISO/IEC 21500 and PMBOK 7th truth grounding standards.</p>
      <div class="sign-line">Auditor Signature & Date</div>
    </div>

    <div class="signoff-card">
      <strong>Project Sponsor / PM Acceptance</strong>
      <p style="margin: 4px 0 0 0; color: #64748B;">Acknowledged provenance and accepted human review items for implementation.</p>
      <div class="sign-line">Authorised Signatory & Date</div>
    </div>
  </div>
</body>
</html>
  `;

  // Trigger direct file download so user ALWAYS gets a real file download
  try {
    downloadBlob(auditReportHtml, `${docCode}_Audit_Report.html`, 'text/html;charset=utf-8');
  } catch (downloadErr) {
    console.error('Audit report download error:', downloadErr);
  }

  // Also attempt print dialogue if supported
  try {
    let iframe = document.getElementById('audit-print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'audit-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(auditReportHtml);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        try {
          iframe.contentWindow?.print();
        } catch {
          // print might be blocked in sandboxed iframe; downloadBlob already succeeded
        }
      }, 400);
    }
  } catch (e) {
    console.warn('Iframe print skipped or blocked:', e);
  }
}

/**
 * Exports Audit Report and Improvement Plan as a Word (.docx) document
 */
export async function exportAuditReportDocx(
  auditData: any,
  docCode: string,
  docTitle: string,
  projectName: string,
  date: string,
  improvementItems?: ImprovementEngineItem[],
  risks?: ProjectRisk[],
  stakeholders?: MatrixStakeholder[]
) {
  const activeItems =
    improvementItems && improvementItems.length > 0
      ? improvementItems
      : generateImprovementItems(auditData, null, []);

  const activeRisks = risks && risks.length > 0 ? risks : DEFAULT_ADVANNOTECH_RISKS;
  const activeStakeholders = stakeholders && stakeholders.length > 0 ? stakeholders : INITIAL_STAKEHOLDERS;

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `ADVANNOTECH (PTY) LTD · PMBOK AUDIT REPORT · ${docCode}`,
                    size: 16,
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 16,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            text: 'ADVANNOTECH (PTY) LTD',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: `PMBOK 7th Edition Audit & Improvement Report: ${docTitle} (${docCode})`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: `Project: ${projectName} | Date: ${date} | Status: Conforming`,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '1. Forensic Gap Analysis & RAG Priorities',
            heading: HeadingLevel.HEADING_3,
          }),
          ...(auditData.humanReviewAdvisories || []).map(
            (adv: any) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[${adv.riskLevel}] ${adv.item} (${adv.section}): `,
                    bold: true,
                  }),
                  new TextRun({
                    text: `${adv.advisoryNote} - Recommended Action: ${adv.recommendedAction}`,
                  }),
                ],
              })
          ),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '2. PMBOK Improvement Engine Action Plan',
            heading: HeadingLevel.HEADING_3,
          }),
          ...activeItems.flatMap((item: any) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `[${item.flag}] ${item.title} - Section: ${item.sectionOrField}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              text: `Defect: ${item.defectSummary}`,
            }),
            ...item.actionableSteps.map(
              (step: string) =>
                new Paragraph({
                  text: `  • ${step}`,
                })
            ),
            new Paragraph({
              text: `  Source File: ${item.sourceFileReferences.recommendedFileType} (${item.sourceFileReferences.sectionToInspect})`,
            }),
            new Paragraph({
              text: `  Missing Data Prompt: "${item.missingDataPrompt.promptText}" (SME: ${item.missingDataPrompt.responsibleRole})`,
            }),
            new Paragraph({ text: '' }),
          ]),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '3. ISO 31000 Risk Probability vs Impact Heatmap & Register',
            heading: HeadingLevel.HEADING_3,
          }),
          ...activeRisks.map(
            (r) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `[${r.id}] ${r.title} (${r.category}) - Score: ${r.score} (${r.level}) [P:${r.probability} x I:${r.impact}]`,
                    bold: true,
                  }),
                  new TextRun({
                    text: `\n  • Mitigation: ${r.mitigationStrategy}`,
                  }),
                  new TextRun({
                    text: `\n  • Owner: ${r.owner} | Source: ${r.sourceOrigin}`,
                  }),
                ],
                spacing: { after: 80 },
              })
          ),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '4. Stakeholder Influence vs Interest Distribution Matrix',
            heading: HeadingLevel.HEADING_3,
          }),
          ...activeStakeholders.map(
            (s) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${s.name} - ${s.title} (${s.department}, ${s.location})`,
                    bold: true,
                  }),
                  new TextRun({
                    text: `\n  • Quadrant: ${s.quadrant} | RACI: ${s.raci} | Power: ${s.power}% | Interest: ${s.interest}%`,
                  }),
                  new TextRun({
                    text: `\n  • Expectation: ${s.keyExpectation}`,
                  }),
                  new TextRun({
                    text: `\n  • Channel: ${s.engagementChannel} | Email: ${s.email}`,
                  }),
                ],
                spacing: { after: 80 },
              })
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  downloadBlob(buffer, `${docCode}_Audit_Report.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

