import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  
  constructor() {}

  // ✅ Function to request storage permission for Android 10+
  async requestStoragePermission() {
    if (Capacitor.getPlatform() === 'android') {
      const permission = await Filesystem.checkPermissions();

      // Check if permission is granted
      if (permission.publicStorage !== 'granted') {
        const request = await Filesystem.requestPermissions();
        if (request.publicStorage !== 'granted') {
          console.error('❌ Storage permission denied!');
        } else {
          console.log('✅ Storage permission granted!');
        }
      } else {
        console.log('✅ Storage permission already granted!');
      }
    }
  }
}