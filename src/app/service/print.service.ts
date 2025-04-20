import { Injectable } from '@angular/core';
import { Database, ref, get } from '@angular/fire/database';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileService } from './file.service'; 

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  constructor(private database: Database, private fileService: FileService) {}

  /**
   * ✅ Converts ADC to Moisture Percentage (2 Decimal Places)
   */
  convertVoltageToMoisture(voltage: number): number {
    const V_DRY = 2.3;  
    const V_MOIST = 1.8; 

    if (voltage >= V_DRY) return 0.00; 
    if (voltage <= V_MOIST) return 100.00; 

    return parseFloat(((V_DRY - voltage) / (V_DRY - V_MOIST) * 100).toFixed(2));
  }

  /**
   * ✅ Accepts the entire garden object for report generation
   */
  async downloadReport(reportData: {
    gardenName: string;
    temperature: number;
    moistureRaw: number;
    moistureCleanData: number;
    temperatureCleanData: number;
    gardenSummary: string;
    currentTime: string;
    currentDate: string;
    place: string;
    moistureGraph: string;
    temperatureGraph: string;
  }) {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica', 'normal');

    const {
      gardenName,
      temperature,
      moistureRaw,
      moistureCleanData,
      temperatureCleanData,
      gardenSummary,
      currentTime,
      currentDate,
      place,
      moistureGraph,
      temperatureGraph
    } = reportData;

    await this.fileService.requestStoragePermission();

    // **Title**
    pdf.setFontSize(20);
    pdf.text("Garden Monitoring Report", 14, 15);

    // **Date and Time**
    pdf.setFontSize(10);
    pdf.text(`${currentDate} ${currentTime}`, 14, 22);

    // **Header Table**
    autoTable(pdf, {
      startY: 25,
      head: [['Date', 'Time Generated', 'Location']],
      body: [[currentDate, currentTime, gardenName]],
      theme: 'grid',
      styles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0], fillColor: [255, 255, 255] },
    });

    // **Garden Overview Section**
    autoTable(pdf, {
      startY: (pdf as any).lastAutoTable.finalY + 5,
      head: [['Garden Overview Section']],
      theme: 'grid',
      styles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    autoTable(pdf, {
      startY: (pdf as any).lastAutoTable.finalY,
      body: [['Garden Name', gardenName], ['Sensor Used', 'Soil Moisture Sensor']],
      theme: 'grid',
    });

    // **Garden Data Section**
    autoTable(pdf, {
      startY: (pdf as any).lastAutoTable.finalY + 5,
      head: [['Garden Data Section']],
      theme: 'grid',
      styles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    autoTable(pdf, {
      startY: (pdf as any).lastAutoTable.finalY,
      head: [['Type of Data', 'Moisture', 'Temperature']],
      body: [
        ['Raw Data (ADC)', moistureRaw, temperature],
        ['Cleaned Data (%)', moistureCleanData, temperatureCleanData],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0], fillColor: [255, 255, 255] },
    });

// **Graph Section Header**
autoTable(pdf, {
  startY: (pdf as any).lastAutoTable.finalY + 10,  // Increase spacing
  head: [['Graph Section']],
  theme: 'plain',
});

// **Graph Images**
if (moistureGraph && temperatureGraph) {
  setTimeout(async () => {
    try {
      const graphY = (pdf as any).lastAutoTable.finalY + 15; // Shift graphs further down

      pdf.addImage(moistureGraph, 'PNG', 20, graphY, 75, 50);
      pdf.addImage(temperatureGraph, 'PNG', 105, graphY, 75, 50);
    } catch (error) {
      console.error('❌ Error adding graphs to PDF:', error);
    }

    // **Summary Section**
    autoTable(pdf, {
      startY: (pdf as any).lastAutoTable.finalY + 70, // Ensure proper spacing after graphs
      head: [['Summary']],
      body: [[gardenSummary]],
      theme: 'grid',
      styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] }, // White background, black text
    });

    // **Convert PDF to Base64**
    const pdfOutput = pdf.output('datauristring');
    const base64Data = pdfOutput.split(',')[1]; // Extract base64 data

    try {
      // **Save the PDF using Capacitor Filesystem**
      await Filesystem.writeFile({
        path: `${gardenName}_Report.pdf`,
        data: base64Data,
        directory: Directory.Documents,
      });

      alert('✅ Report saved in Documents folder!');
    } catch (error) {
      console.error('❌ Error saving file:', error);
      alert('❌ Failed to save report!');
    }
  }, 800);
} else {
  console.warn('⚠️ Graph images are empty! Ensure they are captured properly before calling downloadReport.');
}
  }
}