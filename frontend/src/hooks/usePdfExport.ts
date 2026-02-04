import { useState, RefObject } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToastStore } from '../stores/toastStore';

interface UsePdfExportOptions {
  tripName: string;
  startDate: string;
  endDate: string;
  countryName: string;
}

interface UsePdfExportReturn {
  exportPdf: (elementRef: RefObject<HTMLElement>) => Promise<void>;
  isExporting: boolean;
  error: string | null;
}

export function usePdfExport(options: UsePdfExportOptions): UsePdfExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addToast = useToastStore(state => state.addToast);

  const exportPdf = async (elementRef: RefObject<HTMLElement>) => {
    if (!elementRef.current) {
      setError('Element not found');
      addToast({ type: 'error', message: 'Failed to export PDF' });
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Capture timeline as canvas
      const canvas = await html2canvas(elementRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a', // Frost theme background
        logging: false
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add header
      pdf.setFontSize(18);
      pdf.setTextColor(240, 249, 255); // Frost white
      pdf.text(options.tripName, 20, 20);

      pdf.setFontSize(12);
      pdf.setTextColor(148, 163, 184); // Muted slate
      pdf.text(`${options.countryName} | ${options.startDate} - ${options.endDate}`, 20, 30);

      // Calculate image dimensions
      const imgWidth = 170; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add timeline image
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);

      // Add footer
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `Created with Travel Planner | ${new Date().toLocaleDateString()}`,
        20,
        pageHeight - 10
      );

      // Generate filename
      const filename = `${options.tripName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

      // Download
      pdf.save(filename);

      addToast({ type: 'success', message: 'PDF exported successfully' });
      setIsExporting(false);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      addToast({ type: 'error', message: 'Failed to export PDF' });
      setIsExporting(false);
    }
  };

  return { exportPdf, isExporting, error };
}
