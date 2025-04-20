import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { HttpClientModule } from '@angular/common/http';
import { PrintService } from 'src/app/service/print.service';  // Import the PrintService
import { Calendar } from '@ionic-native/calendar/ngx';

@NgModule({ 
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, IonicModule.forRoot(), AppRoutingModule, FormsModule],
  providers: [Calendar, PrintService, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideFirebaseApp(() => initializeApp({ projectId: "agritrack-c6e2a", appId: "1:679233035201:web:ff05330e8a5ba61195ad40", databaseURL: "https://agritrack-c6e2a-default-rtdb.asia-southeast1.firebasedatabase.app", storageBucket: "agritrack-c6e2a.firebasestorage.app", apiKey: "AIzaSyDPpQVmfgjF1c4LOF-Ttx2CFQkV7XWuXR8", authDomain: "agritrack-c6e2a.firebaseapp.com", messagingSenderId: "679233035201" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()), provideHttpClient(withInterceptorsFromDi())],
  bootstrap: [AppComponent],
})
export class AppModule {}