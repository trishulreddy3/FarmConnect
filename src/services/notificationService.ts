import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppNotification } from '../types';
import BrowserNotificationService from './browserNotificationService';

class NotificationService {
  // Create a notification
  static async createNotification(notification: Omit<AppNotification, 'id' | 'createdAt'>): Promise<void> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });

      // Show browser notification for new notifications
      const fullNotification: AppNotification = {
        id: docRef.id,
        ...notification,
        createdAt: new Date()
      };
      
      BrowserNotificationService.showNotificationByType(fullNotification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create order placed notification for farmer
  static async notifyOrderPlaced(orderData: {
    farmerId: string;
    buyerName: string;
    cropName: string;
    quantity: number;
    unit: string;
    totalAmount: number;
    orderId: string;
  }): Promise<void> {
    // Check if notification already exists for this order
    const existingNotifications = await this.getNotificationsByOrderId(orderData.orderId);
    if (existingNotifications.length > 0) {
      console.log('Notification already exists for order:', orderData.orderId);
      return;
    }

    const notification: Omit<AppNotification, 'id' | 'createdAt'> = {
      userId: orderData.farmerId,
      type: 'order_placed',
      title: 'New Order Received!',
      message: `${orderData.buyerName || 'A buyer'} has placed an order for ${orderData.quantity} ${orderData.unit} of ${orderData.cropName} worth $${orderData.totalAmount.toFixed(2)}`,
      data: {
        orderId: orderData.orderId,
        buyerName: orderData.buyerName,
        cropName: orderData.cropName,
        amount: orderData.totalAmount
      },
      isRead: false
    };

    await this.createNotification(notification);
  }

  // Helper method to check for existing notifications
  static async getNotificationsByOrderId(orderId: string): Promise<AppNotification[]> {
    try {
      // For now, we'll skip the duplicate check to avoid permission issues
      // The duplicate prevention will be handled at the application level
      console.log('Skipping duplicate notification check for order:', orderId);
      return [];
    } catch (error) {
      console.error('Error getting notifications by order ID:', error);
      return [];
    }
  }

  // Create order status update notification for buyer
  static async notifyOrderStatusUpdate(orderData: {
    buyerId: string;
    farmerName: string;
    cropName: string;
    status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    orderId: string;
  }): Promise<void> {
    const statusMessages = {
      confirmed: 'Your order has been confirmed by the farmer',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled'
    };

    const notification: Omit<AppNotification, 'id' | 'createdAt'> = {
      userId: orderData.buyerId,
      type: `order_${orderData.status}` as any,
      title: 'Order Update',
      message: `${statusMessages[orderData.status]} for ${orderData.cropName} from ${orderData.farmerName}`,
      data: {
        orderId: orderData.orderId,
        farmerName: orderData.farmerName,
        cropName: orderData.cropName
      },
      isRead: false
    };

    await this.createNotification(notification);
  }

  // Create contract notification for farmer
  static async notifyContractCreated(contractData: {
    farmerId: string;
    buyerName: string;
    cropType: string;
    contractId: string;
  }): Promise<void> {
    const notification: Omit<AppNotification, 'id' | 'createdAt'> = {
      userId: contractData.farmerId,
      type: 'contract_created',
      title: 'New Contract Request',
      message: `${contractData.buyerName} has created a contract for ${contractData.cropType}`,
      data: {
        contractId: contractData.contractId,
        buyerName: contractData.buyerName,
        cropName: contractData.cropType
      },
      isRead: false
    };

    await this.createNotification(notification);
  }

  // Create message notification
  static async notifyMessageReceived(messageData: {
    userId: string;
    senderName: string;
    chatRoomId: string;
  }): Promise<void> {
    const notification: Omit<AppNotification, 'id' | 'createdAt'> = {
      userId: messageData.userId,
      type: 'message_received',
      title: 'New Message',
      message: `You have a new message from ${messageData.senderName}`,
      data: {
        chatRoomId: messageData.chatRoomId,
        senderName: messageData.senderName
      },
      isRead: false
    };

    await this.createNotification(notification);
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      // This would require a batch update or multiple individual updates
      // For now, we'll handle this in the component level
      console.log('Mark all as read for user:', userId);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get notifications for a user
  static subscribeToNotifications(
    userId: string,
    callback: (notifications: AppNotification[]) => void,
    showBrowserNotifications: boolean = true
  ): () => void {
    if (!userId) {
      console.warn('No userId provided to subscribeToNotifications');
      return () => {};
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    let previousNotifications: AppNotification[] = [];

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        try {
          const notifications = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date())
            };
          }) as AppNotification[];

          // Check for new notifications and show browser notifications
          if (showBrowserNotifications && previousNotifications.length > 0) {
            const newNotifications = notifications.filter(
              newNotif => !previousNotifications.some(prevNotif => prevNotif.id === newNotif.id)
            );

            // Show browser notification for each new notification
            newNotifications.forEach(notification => {
              if (!notification.isRead) {
                BrowserNotificationService.showNotificationByType(notification);
              }
            });
          }

          previousNotifications = notifications;
          callback(notifications);
        } catch (error) {
          console.error('Error processing notifications snapshot:', error);
          callback([]);
        }
      },
      (error) => {
        console.error('Error in notifications subscription:', error);
        callback([]);
      }
    );

    return unsubscribe;
  }
}

export default NotificationService;
