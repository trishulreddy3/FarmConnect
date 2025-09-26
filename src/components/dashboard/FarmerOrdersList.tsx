import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';
import { format, isValid } from 'date-fns';
import NotificationService from '../../services/notificationService';
import { convertFirestoreDocs, safeToDate } from '../../utils/firestoreUtils';
import toast from 'react-hot-toast';

const FarmerOrdersList: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Safe date formatting function
  const safeFormatDate = (date: any, formatString: string = 'MMM dd, yyyy'): string => {
    const safeDate = safeToDate(date);
    return isValid(safeDate) ? format(safeDate, formatString) : 'Invalid Date';
  };

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'orders'),
      where('farmerId', '==', currentUser.uid),
      orderBy('orderDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = convertFirestoreDocs(snapshot.docs, [
        'orderDate', 'deliveryDate', 'createdAt', 'updatedAt'
      ]) as Order[];
      
      setOrders(ordersData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleStatusUpdate = async (orderId: string, newStatus: 'confirmed' | 'shipped' | 'delivered' | 'cancelled') => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Update order status in Firestore
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // If farmer confirms the order, mark crop as sold out and schedule deletion
      if (newStatus === 'confirmed') {
        await updateDoc(doc(db, 'crops', order.cropId), {
          status: 'sold_out',
          soldOutAt: serverTimestamp(),
          soldToOrderId: orderId,
          updatedAt: serverTimestamp()
        });

        // Schedule crop deletion after 2 hours
        setTimeout(async () => {
          try {
            await updateDoc(doc(db, 'crops', order.cropId), {
              status: 'deleted',
              deletedAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } catch (error) {
            console.error('Error deleting crop:', error);
          }
        }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
      }

      // Send notification to buyer
      await NotificationService.notifyOrderStatusUpdate({
        buyerId: order.buyerId,
        farmerName: order.farmerName,
        cropName: order.cropName,
        status: newStatus,
        orderId: orderId
      });

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <Package className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
        <p className="text-gray-500">Orders from buyers will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{order.cropName}</h3>
                {order.variety && (
                  <p className="text-sm text-gray-600">{order.variety}</p>
                )}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="capitalize">{order.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Buyer</p>
                <p className="text-sm font-medium text-gray-900">{order.buyerName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="text-sm font-medium text-gray-900">{order.quantity} {order.unit}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-sm font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Order Date</p>
                <p className="text-sm font-medium text-gray-900">{safeFormatDate(order.orderDate)}</p>
              </div>
            </div>
          </div>

          {order.deliveryDate && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Delivery Date</p>
                  <p className="text-sm font-medium text-gray-900">{safeFormatDate(order.deliveryDate)}</p>
                </div>
              </div>
            </div>
          )}

          {order.location && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Delivery Address</p>
                  <p className="text-sm font-medium text-gray-900">{order.location.address}</p>
                </div>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
            </div>
          )}

          {/* Order Actions */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-3">
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Confirm Order
                </button>
                <button
                  onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  Cancel Order
                </button>
              </>
            )}
            
            {order.status === 'confirmed' && (
              <button
                onClick={() => handleStatusUpdate(order.id, 'shipped')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Mark as Shipped
              </button>
            )}
            
            {order.status === 'shipped' && (
              <button
                onClick={() => handleStatusUpdate(order.id, 'delivered')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Mark as Delivered
              </button>
            )}
            
            <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Contact Buyer
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FarmerOrdersList;
