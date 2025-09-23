import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Calendar,
  MapPin,
  Star,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Contract, Crop } from '../../types';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface Order {
  id: string;
  cropId: string;
  cropName: string;
  farmerId: string;
  farmerName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  deliveryDate?: Date;
  location: string;
}

const BuyerAnalyticsDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('buyerId', '==', currentUser.uid),
      orderBy('orderDate', 'desc')
    );

    const ordersUnsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        orderDate: doc.data().orderDate?.toDate() || new Date(),
        deliveryDate: doc.data().deliveryDate?.toDate() || null
      })) as Order[];
      
      setOrders(ordersData);
    });

    // Fetch contracts
    const contractsQuery = query(
      collection(db, 'contracts'),
      where('buyerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const contractsUnsubscribe = onSnapshot(contractsQuery, (snapshot) => {
      const contractsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requiredBy: doc.data().requiredBy?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Contract[];
      
      setContracts(contractsData);
      setLoading(false);
    });

    return () => {
      ordersUnsubscribe();
      contractsUnsubscribe();
    };
  }, [currentUser]);

  // Calculate analytics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const activeContracts = contracts.filter(c => c.status === 'open' || c.status === 'negotiating').length;

  // Monthly data
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const monthlyOrders = orders.filter(order => 
    order.orderDate >= monthStart && order.orderDate <= monthEnd
  );
  const monthlySpent = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Status distribution
  const statusDistribution = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top farmers
  const farmerStats = orders.reduce((acc, order) => {
    if (!acc[order.farmerId]) {
      acc[order.farmerId] = {
        farmerName: order.farmerName,
        totalOrders: 0,
        totalSpent: 0
      };
    }
    acc[order.farmerId].totalOrders += 1;
    acc[order.farmerId].totalSpent += order.totalAmount;
    return acc;
  }, {} as Record<string, { farmerName: string; totalOrders: number; totalSpent: number }>);

  const topFarmers = Object.values(farmerStats)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Track your purchasing activity and performance</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {format(new Date(), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+{monthlyOrders.length} this month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">${monthlySpent.toFixed(2)} this month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900">${averageOrderValue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Activity className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-purple-600 font-medium">Per order</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Contracts</p>
              <p className="text-3xl font-bold text-gray-900">{activeContracts}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
            <span className="text-orange-600 font-medium">In progress</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              const statusColors = {
                pending: 'bg-yellow-500',
                confirmed: 'bg-blue-500',
                shipped: 'bg-purple-500',
                delivered: 'bg-green-500',
                cancelled: 'bg-red-500'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Farmers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Farmers</h3>
            <Star className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {topFarmers.length > 0 ? (
              topFarmers.map((farmer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{farmer.farmerName}</p>
                      <p className="text-xs text-gray-500">{farmer.totalOrders} orders</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">${farmer.totalSpent.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No orders yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.cropName}</p>
                  <p className="text-xs text-gray-500">from {order.farmerName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                <p className={`text-xs font-medium ${
                  order.status === 'delivered' ? 'text-green-600' :
                  order.status === 'pending' ? 'text-yellow-600' :
                  order.status === 'cancelled' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </p>
              </div>
            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No orders yet</p>
              <p className="text-gray-400 text-xs mt-1">Start browsing crops to place your first order!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BuyerAnalyticsDashboard;
