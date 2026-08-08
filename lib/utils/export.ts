import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import * as XLSX from 'xlsx';

/**
 * Utility to export an array of arrays (rows) to a true Excel (.xlsx) file with auto-sized columns.
 * We keep the name exportToCSV to avoid changing references throughout the app.
 */
export const exportToCSV = (headers: string[], rows: any[][], fileName: string) => {
  const worksheetData = [headers, ...rows];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Auto-size columns based on maximum content length in each column
  const colWidths = headers.map((header, colIndex) => {
    let maxLength = header.length;
    rows.forEach(row => {
      const cellValue = String(row[colIndex] === null || row[colIndex] === undefined ? '' : row[colIndex]);
      if (cellValue.length > maxLength) {
        maxLength = cellValue.length;
      }
    });
    // Add some padding
    return { wch: maxLength + 2 };
  });
  
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Utility to export to PDF using jsPDF
 */
export const exportToPDF = (title: string, headers: string[], rows: any[][], fileName: string) => {
  const doc = new jsPDF() as any;
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(19, 18, 65); // #131241
  doc.text(title, 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  // Table
  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [19, 18, 65], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 247, 250] }
  });
  
  doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
};
