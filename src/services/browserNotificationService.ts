import { AppNotification } from '../types';

class BrowserNotificationService {
  // Request notification permission from the user
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    // Check current permission status
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission has been denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission result:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Check if notifications are supported and permitted
  static isSupported(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Show a browser notification
  static showNotification(
    title: string,
    options: NotificationOptions = {}
  ): void {
    if (!this.isSupported()) {
      console.warn('Notifications are not supported or permitted. Current permission:', Notification.permission);
      return;
    }

    try {
      console.log('Showing browser notification:', title);
      
      const notification = new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        requireInteraction: true, // Keep notification until user interacts
        silent: false,
        vibrate: [200, 100, 200], // Vibration pattern for mobile
        timestamp: Date.now(),
        ...options
      });

      // Auto-close notification after 10 seconds (increased from 5)
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Handle notification close
      notification.onclose = () => {
        console.log('Notification closed');
      };

      // Handle notification error
      notification.onerror = (error) => {
        console.error('Notification error:', error);
      };

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Show notification for different types of events
  static showOrderNotification(notification: AppNotification): void {
    const iconMap = {
      'order_placed': '🛒',
      'order_confirmed': '✅',
      'order_shipped': '🚚',
      'order_delivered': '📦',
      'order_cancelled': '❌'
    };

    const icon = iconMap[notification.type as keyof typeof iconMap] || '🔔';

    this.showNotification(
      `${icon} ${notification.title}`,
      {
        body: notification.message,
        tag: `order-${notification.data?.orderId || notification.id}`,
        data: notification.data
      }
    );
  }

  static showContractNotification(notification: AppNotification): void {
    const iconMap = {
      'contract_created': '📋',
      'contract_response': '📝'
    };

    const icon = iconMap[notification.type as keyof typeof iconMap] || '📋';

    this.showNotification(
      `${icon} ${notification.title}`,
      {
        body: notification.message,
        tag: `contract-${notification.data?.contractId || notification.id}`,
        data: notification.data
      }
    );
  }

  static showMessageNotification(notification: AppNotification): void {
    this.showNotification(
      `💬 ${notification.title}`,
      {
        body: notification.message,
        tag: `message-${notification.data?.chatRoomId || notification.id}`,
        data: notification.data
      }
    );
  }

  // Show notification based on type
  static showNotificationByType(notification: AppNotification): void {
    switch (notification.type) {
      case 'order_placed':
      case 'order_confirmed':
      case 'order_shipped':
      case 'order_delivered':
      case 'order_cancelled':
        this.showOrderNotification(notification);
        break;
      case 'contract_created':
      case 'contract_response':
        this.showContractNotification(notification);
        break;
      case 'message_received':
        this.showMessageNotification(notification);
        break;
      default:
        this.showNotification(
          `🔔 ${notification.title}`,
          {
            body: notification.message,
            tag: `notification-${notification.id}`,
            data: notification.data
          }
        );
    }
  }

  // Initialize notification service
  static async initialize(): Promise<void> {
    console.log('Initializing browser notification service...');
    
    // Register service worker for better notification support
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Request notification permission
    const hasPermission = await this.requestPermission();
    console.log('Notification permission granted:', hasPermission);
    
    if (hasPermission) {
      // Test notification to verify it's working
      setTimeout(() => {
        this.showNotification(
          '🔔 FarmConnect Notifications Active',
          {
            body: 'You will now receive real-time notifications for orders, contracts, and messages.',
            tag: 'test-notification',
            requireInteraction: false
          }
        );
      }, 2000);
    }
  }

  // Test notification function for debugging
  static testNotification(): void {
    console.log('Testing browser notification...');
    console.log('Notification permission:', Notification.permission);
    console.log('Notification supported:', 'Notification' in window);
    
    if (this.isSupported()) {
      this.showNotification(
        '🧪 Test Notification',
        {
          body: 'This is a test notification to verify everything is working correctly.',
          tag: 'test-notification',
          requireInteraction: true
        }
      );
    } else {
      console.error('Notifications not supported or permission denied');
    }
  }
}

export default BrowserNotificationService;
export { BrowserNotificationService };
