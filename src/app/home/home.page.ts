import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Database, ref, onValue } from '@angular/fire/database';
import { PrintService } from 'src/app/service/print.service';
import { ModalController } from '@ionic/angular';
import { GardenReportComponent } from 'src/app/home/components/garden-report/garden-report.component';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from 'chart.js';
import { LocalNotifications, PermissionStatus, Channel, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { ToastController } from '@ionic/angular';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController);

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  lastStatus: Record<string, { moisture: string, temperature: string }> = {};

  gardens: any[] = [];
  labels: string[] = [];
  moistureData: number[] = [];
  temperatureData: number[] = [];

  moistureChart: any;
  temperatureChart: any;
  moistureGraph: string = '';
  temperatureGraph: string = '';

  constructor(
    private database: Database,
    private ngZone: NgZone,
    private router: Router,
    private printService: PrintService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.createNotificationChannel(); 
    this.requestNotificationPermission();
    this.loadGardensData();
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }

  async requestNotificationPermission() {
    const perm: PermissionStatus = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      console.warn('🚫 Local Notification permission not granted!');
    }
  }

  loadGardensData() {
    const gardensRef = ref(this.database, '/');
    onValue(gardensRef, (snapshot) => {
      this.ngZone.run(() => {
        const data = snapshot.val() as Record<string, any> | null;
        this.gardens = [];
        this.labels = [];
        this.moistureData = [];
        this.temperatureData = [];
  
        if (!data) return;
  
        for (let gardenName in data) {
          if (data.hasOwnProperty(gardenName)) {
            const rawADC = data[gardenName].Moisture || 0;
            const voltage = (rawADC / 4095) * 3.3;
            const moisturePercentage = parseFloat(this.convertVoltageToMoisture(voltage).toFixed(2));
  
            const gardenData = {
              name: gardenName,
              // Check if Temperature data exists, if not set it to 'N/A'
              temperature: data[gardenName].Temperature !== undefined ? data[gardenName].Temperature : 'N/A',
              moistureRaw: rawADC,
              moisture: moisturePercentage,
              lastUpdated: new Date().toLocaleTimeString(),
            };
  
            this.gardens.push(gardenData);
            this.labels.push(new Date().toLocaleTimeString());
            this.moistureData.push(moisturePercentage);
            
            // For temperature chart, we can push 'N/A' or a placeholder value (like null or -1)
            this.temperatureData.push(gardenData.temperature === 'N/A' ? null : gardenData.temperature);
  
            this.statusChecking(gardenData);
          }
        }
  
        this.updateCharts();
      });
    });
  }
  

  convertVoltageToMoisture(voltage: number): number {
    const V_DRY = 2.3;
    const V_MOIST = 1.8;
    if (voltage >= V_DRY) return 0.00;
    if (voltage <= V_MOIST) return 100.00;
    return parseFloat(((V_DRY - voltage) / (V_DRY - V_MOIST) * 100).toFixed(2));
  }

  async createNotificationChannel() {
    try {
      await LocalNotifications.createChannel({
        id: 'default',
        name: 'Default Channel',
        description: 'Used for AgriTrack alerts',
        importance: 5,
        sound: 'default',
        visibility: 1
      });
      console.log('✅ Notification channel created');
    } catch (err) {
      console.error('❌ Failed to create channel:', err);
    }
  }

  statusChecking(garden: any) {
    console.log('🧪 Running statusChecking for', garden.name);
  
    let alertMessage = '';
    let shouldNotify = false;
  
    const moistureLevel =
      garden.moisture < 30 ? 'dry' :
      garden.moisture > 80 ? 'wet' : 'optimal';
  
    const temperatureLevel =
      garden.temperature < 10 ? 'cold' :
      garden.temperature > 30 ? 'hot' : 'optimal';
  
    const previous = this.lastStatus[garden.name];
    console.log('🌡 Current Levels:', { moisture: moistureLevel, temperature: temperatureLevel });
    console.log('📦 Previous Levels:', previous);
  
    if (
      previous &&
      previous.moisture === moistureLevel &&
      previous.temperature === temperatureLevel
    ) {
      console.log('⛔ No change in status for', garden.name);
      return;
    }
  
    // Save new state
    this.lastStatus[garden.name] = {
      moisture: moistureLevel,
      temperature: temperatureLevel
    };
  
    if (moistureLevel === 'dry') {
      alertMessage += `⚠️ Moisture too low in ${garden.name} (${garden.moisture}%)\n`;
      shouldNotify = true;
    } else if (moistureLevel === 'wet') {
      alertMessage += `⚠️ Moisture too high in ${garden.name} (${garden.moisture}%)\n`;
      shouldNotify = true;
    }
  
    if (temperatureLevel === 'cold') {
      alertMessage += `❄️ Too cold in ${garden.name} (${garden.temperature}°C)\n`;
      shouldNotify = true;
    } else if (temperatureLevel === 'hot') {
      alertMessage += `🌡 Too hot in ${garden.name} (${garden.temperature}°C)\n`;
      shouldNotify = true;
    }
  
    if (shouldNotify) {
      console.log('📢 Notification triggered with message:\n', alertMessage);
      this.checkForLocalNotifications(alertMessage);
    } else {
      console.log(`✅ [${garden.name}] Status changed but still optimal — no notification.`);
    }
  }  

  async checkForLocalNotifications(alertMessage: string) {
    const notificationId = Math.floor(Math.random() * 100000); // ✅ Safe value
  
    console.log('📣 Trying to schedule local notification:', alertMessage);
  
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: '🌱 AgriTrack Alert',
            body: alertMessage.trim(),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            channelId: 'default',
          },
        ],
      });
  
      console.log('✅ Notification scheduled successfully!');
      const pending = await LocalNotifications.getPending();
      console.log('⏳ Pending notifications:', pending.notifications);
    } catch (error) {
      console.error('❌ Failed to schedule notification:', error);
    }
  }    

  updateCharts() {
    if (!this.moistureChart) {
      const moistureCanvas = document.createElement('canvas');
      moistureCanvas.width = 400;
      moistureCanvas.height = 200;
      document.body.appendChild(moistureCanvas);

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

      this.captureGraphImages(moistureCanvas, 'moistureGraph');
    }

    if (!this.temperatureChart) {
      const temperatureCanvas = document.createElement('canvas');
      temperatureCanvas.width = 400;
      temperatureCanvas.height = 200;
      document.body.appendChild(temperatureCanvas);

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

      this.captureGraphImages(temperatureCanvas, 'temperatureGraph');
    }
  }

  captureGraphImages(canvas: HTMLCanvasElement, type: string) {
    setTimeout(() => {
      const image = canvas.toDataURL('image/png');
      if (type === 'moistureGraph') this.moistureGraph = image;
      if (type === 'temperatureGraph') this.temperatureGraph = image;
      document.body.removeChild(canvas);
    }, 1000);
  }

  async openReportModal(gardenName: string) {
    const garden = this.gardens.find(g => g.name === gardenName);
    if (!garden) return;

    const modal = await this.modalCtrl.create({
      component: GardenReportComponent,
      componentProps: {
        gardenName,
        temperature: garden.temperature,
        moistureRaw: garden.moistureRaw,
        moistureCleanData: garden.moisture,
        temperatureCleanData: garden.temperature,
        gardenSummary: this.generateSummary(garden),
        currentTime: new Date().toLocaleTimeString(),
        currentDate: new Date().toLocaleDateString(),
        place: gardenName,
        moistureGraph: this.moistureGraph,
        temperatureGraph: this.temperatureGraph
      },
    });

    await modal.present();
  }

  viewDetails(garden: any) {
    this.router.navigate(['/garden-details', garden.name]);
  }

  generateSummary(garden: any): string {
    let summary = '';

    if (garden.moisture < 30) {
      summary += 'The garden has too little water. ';
    } else if (garden.moisture > 80) {
      summary += 'The garden has too much water. ';
    } else {
      summary += 'The garden has optimal water levels. ';
    }

    if (garden.temperature > 30) {
      summary += 'It is too hot. ';
    } else if (garden.temperature < 10) {
      summary += 'It is too cold. ';
    } else {
      summary += 'The temperature is ideal.';
    }

    return summary;
  }

  getTemperatureStatus(temp: number): string {
    if (temp > 35) return 'danger';
    if (temp > 30) return 'warning';
    return 'normal';
  }

  downloadReport(gardenName: string) {
    const garden = this.gardens.find(g => g.name === gardenName);
    if (!garden) return;

    this.printService.downloadReport({
      gardenName,
      temperature: garden.temperature,
      moistureRaw: garden.moistureRaw,
      moistureCleanData: garden.moisture,
      temperatureCleanData: garden.temperature,
      gardenSummary: this.generateSummary(garden),
      currentTime: new Date().toLocaleTimeString(),
      currentDate: new Date().toLocaleDateString(),
      place: gardenName,
      moistureGraph: this.moistureGraph,
      temperatureGraph: this.temperatureGraph
    });
  }
}