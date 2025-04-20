import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { FirebaseApp } from '@angular/fire/app';
import { Database, ref, get } from '@angular/fire/database';
import { Firestore, getFirestore } from '@angular/fire/firestore';

import { AlertController } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-splash-screen',
  standalone: false,
  templateUrl: './splash-screen.page.html',
  styleUrls: ['./splash-screen.page.scss'],
})
export class SplashScreenPage {
  statusMessage: string = 'Initializing...';

  constructor(
    private router: Router,
    private firebaseApp: FirebaseApp,
    private realtimeDb: Database,
    private firestore: Firestore,
    private alertCtrl: AlertController,

  ) {
    this.initializeApp();
  }

  ngOnInit() {
    setTimeout(() => {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }, 2500); // Match animation delay
  }

  async initializeApp() {
    this.statusMessage = 'Checking internet connection...';
    const hasInternet = await this.checkInternetConnection();

    if (!hasInternet) {
      this.showNoInternetDialog();
      return;
    }

    this.statusMessage = 'Checking Firebase connection...';
    const firebaseConnected = await this.checkFirebaseConnection();

    if (!firebaseConnected) {
      this.statusMessage = '⚠️ Firebase connection failed!';
      return;
    }

    // If everything is fine, navigate to the home page
    this.statusMessage = 'Launching app...';
    setTimeout(() => this.router.navigate(['/home']), 2000);
  }

  // 🔹 Check Internet Connection
  async checkInternetConnection(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }

  // 🔹 Show No Internet Dialog
  async showNoInternetDialog() {
    const alert = await this.alertCtrl.create({
      header: 'No Internet Connection',
      message: 'You need to have internet connection to use this app.',
      buttons: [
        {
          text: 'Exit',
          role: 'cancel',
          handler: () => App.exitApp(), // Close the app
        },
      ],
    });
    await alert.present();
  }

  // 🔹 Check Firebase Connection (Realtime Database & Firestore)
  async checkFirebaseConnection(): Promise<boolean> {
    try {
      const dbRef = ref(this.realtimeDb, '/testConnection');
      await get(dbRef); // Realtime Database Test
      await getFirestore(this.firebaseApp); // Firestore Test
      return true;
    } catch (error) {
      console.error('Firebase Connection Error:', error);
      return false;
    }
  }
}