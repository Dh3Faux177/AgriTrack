import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public appPages = [
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];

  constructor(private platform: Platform) {
    this.initializeApp();
  }

  /**
   * App Initialization
   */
  async initializeApp() {
    await this.platform.ready();

    // Fix for keyboard behavior
    this.fixKeyboardBehavior();
    this.configureStatusBar();
    this.initializeTheme();

    await this.createNotificationChannel(); // 🔔 Create notification channel for Android
    await this.setupLocalNotifications();   // ✅ Request permission + add listener

    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-is-open');
    });
    
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-is-open');
    });    

    document.addEventListener('resume', () => {
      // Ensure keyboard resize mode is set correctly on resume
      Keyboard.setResizeMode({ mode: KeyboardResize.Body });
    });
  }


    // Fix Keyboard Resize Behavior
    fixKeyboardBehavior() {
      // Disable automatic resizing of the viewport
      Keyboard.setResizeMode({ mode: KeyboardResize.None });
  
      // Add listeners for when the keyboard shows or hides
      Keyboard.addListener('keyboardWillShow', () => {
        // Optionally, you can handle things when the keyboard is about to show
        document.body.style.overflow = 'hidden'; // Prevent scrolling when keyboard shows
      });
  
      Keyboard.addListener('keyboardWillHide', () => {
        // Optionally, handle cleanup when the keyboard is hidden
        document.body.style.overflow = ''; // Restore scrolling behavior
      });
    }


  /**
   * Configures Android StatusBar (color and layout)
   */
  async configureStatusBar() {
    try {
      if (this.platform.is('cordova')) {
        // Set overlaysWebView to false to prevent status bar overlapping
        await StatusBar.setOverlaysWebView({ overlay: false });

        // Set status bar color (for Android)
        await StatusBar.setBackgroundColor({ color: '#28a745' });

        // On iOS, you might need to handle safe area and status bar height
        if (this.platform.is('ios')) {
          setTimeout(() => {
            document.documentElement.style.setProperty('--status-bar-height', '24px');
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error configuring status bar:', error);
    }
  }

  /**
   * Initializes system theme (dark/light) on app start
   */
  initializeTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark);
  }

  toggleTheme(event: any) {
    const isDark = event.detail.checked;
    this.setTheme(isDark);
  }

  setTheme(darkMode: boolean) {
    document.body.classList.toggle('dark-theme', darkMode);
    document.body.classList.toggle('light-theme', !darkMode);
  }

  /**
   * Creates default notification channel for Android 8+
   */
  async createNotificationChannel() {
    try {
      await LocalNotifications.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: 5, // High priority
        description: 'General AgriTrack alerts',
      });
      console.log('🔔 Notification channel created');
    } catch (error) {
      console.error('❌ Failed to create notification channel:', error);
    }
  }

  /**
   * Requests notification permission and registers listener
   */
  async setupLocalNotifications() {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display === 'granted') {
      console.log('✅ Local notifications enabled');
    } else {
      console.warn('❌ Local notifications not granted');
    }

    await LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('🔔 Local notification received:', notification);
    });
  }
}