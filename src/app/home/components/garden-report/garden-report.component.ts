import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-garden-report',
  standalone: false,
  templateUrl: './garden-report.component.html',
  styleUrls: ['./garden-report.component.scss'],
})
export class GardenReportComponent implements AfterViewInit {
  @Input() gardenName?: string;
  @Input() temperature?: number;
  @Input() moistureRaw?: number;
  @Input() moistureCleanData?: number;
  @Input() temperatureCleanData?: number;
  @Input() gardenSummary?: string;
  @Input() currentTime?: string;
  @Input() currentDate?: string;
  @Input() place?: string;
  @Input() sensorUsed?: string;
  @Input() moistureGraph?: string;
  @Input() temperatureGraph?: string;

  @ViewChild('reportContent', { static: false }) reportContent!: ElementRef;

  constructor(private modalCtrl: ModalController) {}

  ngAfterViewInit() {
    if (!this.reportContent) {
      console.error("Error: Report content not found in AfterViewInit.");
    }
  }

  /** 🔹 Close the Modal */
  closeModal() {
    this.modalCtrl.dismiss();
  }

  /** 🔹 Print the Report (Ensuring Content is Loaded) */
  printReport() {
    setTimeout(() => {
      const reportElement = document.getElementById('reportContent');
  
      if (!reportElement) {
        console.error("Error: Report content not found!");
        return;
      }
  
      // Open a new print window
      const printWindow = window.open('', '', 'width=800,height=600');
  
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
          <html>
          <head>
            <title>Garden Monitoring Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                margin: 10px;
                padding: 0;
                background: white;
              }
              h1 {
                text-align: center;
                font-size: 20px;
                margin-bottom: 10px;
              }
              h3 {
                font-size: 14px;
                margin-top: 10px;
                border-bottom: 1px solid #000;
                padding-bottom: 5px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                margin-bottom: 10px;
              }
              table th, table td {
                padding: 8px;
                text-align: left;
                border: 1px solid black;
                color: black;
              }
              table th {
                background-color: black !important;
                color: white;
                font-weight: bold;
              }
              .graph-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                margin-top: 20px;
              }
              .graph {
                width: 45%;
                height: 200px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: white;
                border: 1px solid black;
                overflow: hidden;
              }
              .summary {
                background: #f4f4f4;
                padding: 10px;
                border: 1px solid #ddd;
                font-size: 12px;
                color: black;
              }
              .footer {
                text-align: center;
                margin-top: 10px;
                font-size: 10px;
                color: #777;
              }
              /* Ensure images fit correctly */
              img {
                max-width: 100%;
                height: auto;
              }
                 @media print {
              * {
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
              }
              table th {
                background-color: black !important; /* Ensure it prints */
                color: white !important;
              }
            </style>
          </head>
          <body>
            <div class="report-container">
              ${reportElement.innerHTML}
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
  
        // Ensure content is loaded before printing
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }
    }, 500);
  }    
}