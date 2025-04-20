import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Database, ref, onValue, getDatabase } from '@angular/fire/database';
import { NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { GardenReportComponent } from '../components/garden-report/garden-report.component';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from 'chart.js';
import { PrintService } from 'src/app/service/print.service'; // ✅ Import PrintService
import { initializeApp } from 'firebase/app';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController);

const firebaseConfig = {
  apiKey: "AIzaSyDPpQVmfgjF1c4LOF-Ttx2CFQkV7XWuXR8",
  authDomain: "agritrack-c6e2a.firebaseapp.com",
  databaseURL: "https://agritrack-c6e2a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "agritrack-c6e2a",
  storageBucket: "agritrack-c6e2a.firebasestorage.app",
  messagingSenderId: "679233035201",
  appId: "1:679233035201:web:ff05330e8a5ba61195ad40"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

@Component({
  selector: 'app-garden-detail',
  standalone: false,
  templateUrl: './garden-details.page.html',
  styleUrls: ['./garden-details.page.scss'],
})
export class GardenDetailPage implements OnInit {
  gardenName: string = '';
  temperature: number = 0;
  moisture: number = 0;
  lastUpdated: string = '';
  gardenSummary: string = '';
  
  // Additional state for validity check
  isValidTemperature: boolean = true; // Will indicate if the temperature is valid

  currentTime = new Date().toLocaleTimeString();
  currentDate = new Date().toLocaleDateString();
  place = 'Garden 1';

  moistureRaw: number = 0;
  temperatureRaw: number = 0;
  moistureCleanData: number = 0;
  temperatureCleanData: number = 0;

  moistureChart: any;
  temperatureChart: any;
  moistureGraph: string = '';
  temperatureGraph: string = '';

  labels: string[] = [];
  moistureData: number[] = [];
  temperatureData: number[] = [];

  constructor(
    private database: Database,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private http: HttpClient,
    private modalCtrl: ModalController,
    private printService: PrintService
  ) {}

  ngOnInit() {
    this.gardenName = this.route.snapshot.paramMap.get('gardenName') || 'Unknown';
    this.loadGardenData();
    this.setupFirebaseListener();
  }

  isNotANumber(value: any): boolean {
    return Number.isNaN(value);
  }
  
  loadGardenData() {
    const gardenRef = ref(this.database, `/${this.gardenName}`);
    onValue(gardenRef, (snapshot) => {
      this.ngZone.run(() => {
        const data = snapshot.val();
        if (data) {
          this.moistureRaw = data.Moisture || 0;
  
          // ✅ Convert ADC to Voltage (Sensor works from 0 to 3.3V)
          const voltage = (this.moistureRaw / 4095) * 3.3;
  
          // ✅ Convert Voltage to Moisture Percentage with 2 Decimal Places
          this.moisture = parseFloat(this.convertVoltageToMoisture(voltage).toFixed(2));
  
          // ✅ Check if Temperature data exists, if not set it to -1 (or NaN)
          this.temperature = data.Temperature !== undefined ? data.Temperature : -1; // Use -1 or NaN for missing data
          this.isValidTemperature = this.temperature !== -1; // Set validity flag
  
          // Assign the cleaned data
          this.moistureCleanData = this.moisture;
          this.temperatureCleanData = this.isValidTemperature ? this.temperature : NaN; // Handle invalid temperature
  
          this.lastUpdated = new Date().toLocaleTimeString();
  
          // Update Graph Data
          this.labels.push(this.lastUpdated);
          this.moistureData.push(this.moisture);
          this.temperatureData.push(this.isValidTemperature ? this.temperature : NaN);
  
          this.updateSummary();
          this.updateCharts();
        }
      });
    });
  }

  convertVoltageToMoisture(voltage: number): number {
    const V_DRY = 2.3;
    const V_MOIST = 1.8;

    if (voltage >= V_DRY) {
      return 0.00;
    } else if (voltage <= V_MOIST) {
      return 100.00;
    } else {
      return ((V_DRY - voltage) / (V_DRY - V_MOIST)) * 100;
    }
  }

  updateSummary() {
    this.gardenSummary = '';
  
    // 🌱 Moisture Summary
    if (this.moisture < 30) {
      this.gardenSummary +=
        'Moisture is too low, causing drought stress. Plants lose water faster than they absorb it, leading to wilting or leaf rolling. Water deeply in the early morning or evening. Prevent future dryness with mulch and regular soil checks.\n\n';
    } else if (this.moisture > 80) {
      this.gardenSummary +=
        'Moisture is too high, risking root rot or fungal diseases due to poor oxygen flow. Pause watering and improve drainage. Use well-draining soil and water only when the topsoil feels dry to avoid this issue again.\n\n';
    } else {
      this.gardenSummary +=
        'Moisture levels are optimal. Plants are absorbing water efficiently. Keep monitoring and maintain consistent watering habits.\n\n';
    }
  
    // 🌡 Temperature Summary
    if (this.isValidTemperature) {
      if (this.temperature > 30) {
        this.gardenSummary +=
          'Temperature is too high, causing heat stress. This speeds up water loss and may lead to flower drop or leaf burn. Shade plants and water them during cooler hours. Use mulch and grow heat-tolerant crops to reduce future risk.\n\n';
      } else if (this.temperature < 10) {
        this.gardenSummary +=
          'Temperature is too low, possibly causing cold stress. Growth may slow, and leaves can be damaged. Cover plants and avoid watering late in the day. Use mulch and choose cold-tolerant plants next time.\n\n';
      } else {
        this.gardenSummary +=
          'Temperature is ideal. Conditions are great for growth. Maintain current care and stay alert to weather changes.\n\n';
      }
    } else {
      this.gardenSummary += 'Temperature data is unavailable.\n\n';
    }
  }   

  updateCharts() {
    if (this.moistureChart) {
      this.moistureChart.data.labels = this.labels;
      this.moistureChart.data.datasets[0].data = this.moistureData;
      this.moistureChart.update();
    } else {
      const moistureCanvas = document.getElementById('moistureGraph') as HTMLCanvasElement;
      this.moistureChart = new Chart(moistureCanvas, {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: [{
            label: 'Moisture (%)',
            data: this.moistureData,
            borderColor: '#28a745',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
          }],
        },
        options: { responsive: true },
      });
    }
  
    if (this.temperatureChart) {
      this.temperatureChart.data.labels = this.labels;
      this.temperatureChart.data.datasets[0].data = this.temperatureData;
      this.temperatureChart.update();
    } else {
      const temperatureCanvas = document.getElementById('temperatureGraph') as HTMLCanvasElement;
      this.temperatureChart = new Chart(temperatureCanvas, {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: [{
            label: 'Temperature (°C)',
            data: this.temperatureData,
            borderColor: '#ff6347',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
          }],
        },
        options: { responsive: true },
      });
    }
  
    setTimeout(() => {
      this.captureGraphImages();
    }, 1000);
  }

  setupFirebaseListener() {
    const sensorRef = ref(db, '/sensorData');

    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.labels.push(new Date().toLocaleTimeString());
        this.moistureData.push(data.moisture);
        this.temperatureData.push(data.temperature);

        if (this.labels.length > 10) {
          this.labels.shift();
          this.moistureData.shift();
          this.temperatureData.shift();
        }

        this.updateCharts();
      }
    });
  }

  captureGraphImages() {
    const moistureCanvas = document.getElementById('moistureGraph') as HTMLCanvasElement;
    const temperatureCanvas = document.getElementById('temperatureGraph') as HTMLCanvasElement;
  
    if (moistureCanvas && temperatureCanvas) {
      this.moistureGraph = moistureCanvas.toDataURL('image/png');
      this.temperatureGraph = temperatureCanvas.toDataURL('image/png'); 
      console.log("✅ Graphs Captured Successfully");
    } else {
      console.warn("⚠️ Unable to find graph canvas elements.");
    }
  }

  async openReportModal() {
    this.captureGraphImages();

    const modal = await this.modalCtrl.create({
      component: GardenReportComponent,
      componentProps: {
        gardenName: this.gardenName,
        temperature: this.temperature,
        moistureRaw: this.moistureRaw,
        moistureCleanData: this.moistureCleanData,
        temperatureCleanData: this.temperatureCleanData,
        gardenSummary: this.gardenSummary,
        currentTime: this.currentTime,
        currentDate: this.currentDate,
        place: this.place,
        moistureGraph: this.moistureGraph,
        temperatureGraph: this.temperatureGraph
      },
    });

    return await modal.present();
  }

  downloadReport() {
    this.printService.downloadReport({
      gardenName: this.gardenName,
      temperature: this.temperature,
      moistureRaw: this.moistureRaw,
      moistureCleanData: this.moistureCleanData,
      temperatureCleanData: this.temperatureCleanData,
      gardenSummary: this.gardenSummary,
      currentTime: new Date().toLocaleTimeString(),
      currentDate: new Date().toLocaleDateString(),
      place: this.gardenName,
      moistureGraph: this.moistureGraph,
      temperatureGraph: this.temperatureGraph
    });
  }  
}