import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GraduationStudent, GraduationConfig, SchoolIdentity } from '../types';
import { generateSklHtmlDocument } from '../services/storage';

/**
 * Exports a student's SKL as a high-quality A4 PDF.
 * If elementIdOrRef is provided, captures that element directly.
 * Otherwise, renders an offscreen container from generateSklHtmlDocument.
 */
export async function exportStudentSklToPdf(
  student: GraduationStudent,
  config: GraduationConfig,
  schoolIdentity: SchoolIdentity,
  customElement?: HTMLElement | null
): Promise<void> {
  // 1. If student has an uploaded PDF file, download that original PDF file directly
  if (student.sklFile && student.sklFile.dataUrl) {
    const isPdf =
      student.sklFile.fileType?.includes('pdf') ||
      student.sklFile.fileName?.toLowerCase().endsWith('.pdf') ||
      student.sklFile.dataUrl.startsWith('data:application/pdf');

    if (isPdf) {
      const a = document.createElement('a');
      a.href = student.sklFile.dataUrl;
      a.download = student.sklFile.fileName || `SKL_${student.name.replace(/\s+/g, '_')}_${student.nisn}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
  }

  // 2. Generate PDF from DOM element or HTML template
  let targetElement = customElement;
  let temporaryContainer: HTMLDivElement | null = null;

  if (!targetElement) {
    // Create temporary off-screen container with the exact styled SKL layout
    const htmlString = generateSklHtmlDocument(student, config, schoolIdentity);
    temporaryContainer = document.createElement('div');
    temporaryContainer.style.position = 'fixed';
    temporaryContainer.style.top = '-9999px';
    temporaryContainer.style.left = '-9999px';
    temporaryContainer.style.width = '794px'; // 210mm at 96 DPI
    temporaryContainer.style.backgroundColor = '#ffffff';
    temporaryContainer.style.zIndex = '-1000';
    temporaryContainer.innerHTML = htmlString;

    // Extract the skl-container inside
    const sklInner = temporaryContainer.querySelector('.skl-container') as HTMLElement;
    if (sklInner) {
      sklInner.style.boxShadow = 'none';
      sklInner.style.border = 'none';
      sklInner.style.margin = '0';
      sklInner.style.width = '794px';
    }

    document.body.appendChild(temporaryContainer);
    targetElement = (sklInner || temporaryContainer) as HTMLElement;
  }

  try {
    const canvas = await html2canvas(targetElement, {
      scale: 2, // 2x scale for crisp, professional high-res text
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate aspect ratio
    const imgHeight = (canvasHeight * pageWidth) / canvasWidth;

    if (imgHeight <= pageHeight) {
      // Single page fit
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, imgHeight);
    } else {
      // Multi-page handling if needed
      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }

    const safeName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `SKL_Resmi_${safeName}_${student.nisn}.pdf`;
    pdf.save(filename);
  } finally {
    if (temporaryContainer && document.body.contains(temporaryContainer)) {
      document.body.removeChild(temporaryContainer);
    }
  }
}
