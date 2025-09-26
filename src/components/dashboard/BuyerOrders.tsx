import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, XCircle, MapPin, Calendar, User } from 'lucide-react';
import OrdersList from './OrdersList';
import { Order } from '../../types';
import { format, isValid } from 'date-fns';
import { safeToDate, convertFirestoreDocs } from '../../utils/firestoreUtils';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface BuyerOrdersProps {}

const BuyerOrders: React.FC<BuyerOrdersProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'current'>('current');

  const subTabs = [
    { id: 'current', name: 'Current Orders', icon: Clock },
    { id: 'all', name: 'All Orders', icon: Package }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          My Orders
        </h2>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 mb-6">
        <div className="border-b border-gray-200/50">
          <nav className="flex space-x-6 px-6">
            {subTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as 'all' | 'current')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeSubTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeSubTab === 'current' && (
              <motion.div
                key="current"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentOrders />
              </motion.div>
            )}

            {activeSubTab === 'all' && (
              <motion.div
                key="all"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AllOrders />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Current Orders Component with Tracking
const CurrentOrders: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'orders'),
      where('buyerId', '==', currentUser.uid),
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

  // Filter for current orders (pending, confirmed, shipped)
  const currentOrders = orders.filter(order => 
    ['pending', 'confirmed', 'shipped'].includes(order.status)
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <Package className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrackingSteps = (status: string) => {
    const steps = [
      { id: 'pending', label: 'Order Placed', completed: true },
      { id: 'confirmed', label: 'Confirmed by Farmer', completed: ['confirmed', 'shipped', 'delivered'].includes(status) },
      { id: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(status) },
      { id: 'delivered', label: 'Delivered', completed: status === 'delivered' }
    ];
    return steps;
  };

  const safeFormatDate = (date: any, formatString: string = 'MMM dd, yyyy'): string => {
    const safeDate = safeToDate(date);
    return isValid(safeDate) ? format(safeDate, formatString) : 'Invalid Date';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Current Orders</h3>
        <div className="text-sm text-gray-500">
          {currentOrders.length} active order{currentOrders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : currentOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No Current Orders</h3>
          <p className="text-gray-400">You don't have any active orders at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {currentOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{order.cropName}</h4>
                      <p className="text-sm text-gray-500">Order #{order.id.slice(-8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Information */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Farmer</p>
                        <p className="text-sm text-gray-500">{order.farmerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Quantity</p>
                        <p className="text-sm text-gray-500">{order.quantity} {order.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Order Date</p>
                        <p className="text-sm text-gray-500">{safeFormatDate(order.orderDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                        <p className="text-sm text-gray-500">{order.location.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Progress */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Order Tracking</h5>
                    <div className="space-y-3">
                      {getTrackingSteps(order.status).map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            step.completed 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            {step.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span className="text-xs font-medium">{index + 1}</span>
                            )}
                          </div>
                          <span className={`text-sm ${
                            step.completed ? 'text-green-600 font-medium' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delivery Date */}
                {order.deliveryDate && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Expected Delivery</p>
                        <p className="text-sm text-blue-600 font-medium">{safeFormatDate(order.deliveryDate)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// All Orders Component
const AllOrders: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">All Orders</h3>
      </div>
      <OrdersList />
    </div>
  );
};

export default BuyerOrders;
