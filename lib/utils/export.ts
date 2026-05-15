import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Utility to export an array of arrays (rows) to CSV and trigger a browser download.
 */
export const exportToCSV = (headers: string[], rows: any[][], fileName: string) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(val => {
        const stringVal = String(val === null || val === undefined ? '' : val).replace(/"/g, '""');
        return `"${stringVal}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
