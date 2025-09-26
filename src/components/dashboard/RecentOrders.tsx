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
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';
import { format, isValid } from 'date-fns';
import { safeToDate, convertFirestoreDocs } from '../../utils/firestoreUtils';

interface RecentOrdersProps {
  userType: 'farmer' | 'buyer';
  limitCount?: number;
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ userType, limitCount = 5 }) => {
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

    const fieldName = userType === 'farmer' ? 'farmerId' : 'buyerId';
    const q = query(
      collection(db, 'orders'),
      where(fieldName, '==', currentUser.uid),
      orderBy('orderDate', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = convertFirestoreDocs(snapshot.docs, [
        'orderDate', 'deliveryDate', 'createdAt', 'updatedAt'
      ]) as Order[];
      
      setOrders(ordersData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, userType, limitCount]);

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
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-600 mb-1">No recent orders</h3>
        <p className="text-gray-500 text-sm">
          {userType === 'farmer' ? 'Orders from buyers will appear here' : 'Your recent orders will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-semibold text-gray-900">{order.cropName}</h4>
                {order.variety && (
                  <span className="text-gray-600 text-sm">({order.variety})</span>
                )}
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{userType === 'farmer' ? order.buyerName : order.farmerName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="w-3 h-3" />
                  <span>{order.quantity} {order.unit}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{safeFormatDate(order.orderDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-semibold text-green-600">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="View Details">
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RecentOrders;
