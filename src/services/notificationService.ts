import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Notification } from '../types';

class NotificationService {
  // Create a notification
  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });
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
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
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

    const notification: Omit<Notification, 'id' | 'createdAt'> = {
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
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
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
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
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
    callback: (notifications: Notification[]) => void
  ): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Notification[];

      callback(notifications);
    });
  }
}

export default NotificationService;
