import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar, ShoppingCart, FileText } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Contract, Crop, Order } from '../../types';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const BuyerAnalyticsDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeOrders = onSnapshot(
      query(
        collection(db, 'orders'),
        where('buyerId', '==', currentUser.uid),
        orderBy('orderDate', 'desc')
      ),
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          orderDate: doc.data().orderDate?.toDate() || new Date()
        })) as Order[];
        setOrders(ordersData);
      }
    );

    const unsubscribeContracts = onSnapshot(
      query(
        collection(db, 'contracts'),
        where('buyerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        const contractsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          requiredBy: doc.data().requiredBy?.toDate() || new Date()
        })) as Contract[];
        setContracts(contractsData);
      }
    );

    const unsubscribeCrops = onSnapshot(
      query(
        collection(db, 'crops'),
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        const cropsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          harvestDate: doc.data().harvestDate?.toDate() || new Date(),
          expiryDate: doc.data().expiryDate?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as Crop[];
        setCrops(cropsData);
      }
    );

    setLoading(false);

    return () => {
      unsubscribeOrders();
      unsubscribeContracts();
      unsubscribeCrops();
    };
  }, [currentUser]);

  // Calculate analytics data
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const activeContracts = contracts.filter(c => c.status === 'open' || c.status === 'negotiating').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

  // Sample data for charts - replace with real data
  const spendingData = [
    { name: 'Jan', amount: 1200 },
    { name: 'Feb', amount: 1500 },
    { name: 'Mar', amount: 1800 },
    { name: 'Apr', amount: 2200 },
    { name: 'May', amount: 1900 },
    { name: 'Jun', amount: 2500 },
  ];

  const orderStatusData = [
    { name: 'Delivered', value: completedOrders, color: '#10B981' },
    { name: 'Pending', value: pendingOrders, color: '#F59E0B' },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#EF4444' }
  ];

  const topFarmers = [
    { name: 'Green Valley Farm', performance: 85, color: '#10B981' },
    { name: 'Sunrise Agriculture', performance: 72, color: '#3B82F6' },
    { name: 'Mountain View Farms', performance: 68, color: '#F59E0B' },
    { name: 'River Side Produce', performance: 55, color: '#8B5CF6' },
  ];

  const recentActivity = [
    { id: 1, action: 'Order placed: Tomatoes', time: '2 hours ago', icon: '🛒', color: 'text-blue-500' },
    { id: 2, action: 'Contract accepted: Wheat', time: '5 hours ago', icon: '✅', color: 'text-green-500' },
    { id: 3, action: 'Message received from farmer', time: '1 day ago', icon: '💬', color: 'text-purple-500' },
    { id: 4, action: 'Order delivered: Rice', time: '2 days ago', icon: '📦', color: 'text-orange-500' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Buyer Analytics</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-blue-600">${totalSpent.toFixed(2)}</p>
              <p className="text-sm text-blue-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +15% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-green-600">{totalOrders}</p>
              <p className="text-sm text-gray-500">{completedOrders} completed</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Contracts</p>
              <p className="text-2xl font-bold text-orange-600">{activeContracts}</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +3 this month
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Crops</p>
              <p className="text-2xl font-bold text-purple-600">{crops.length}</p>
              <p className="text-sm text-gray-500">From {new Set(crops.map(c => c.farmerId)).size} farmers</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Spending']} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {orderStatusData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Farmers */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Farmers by Spending</h3>
        <div className="space-y-4">
          {topFarmers.map((farmer, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{farmer.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{farmer.performance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${farmer.performance}%`,
                      backgroundColor: farmer.color
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-lg mr-3">{activity.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyerAnalyticsDashboard;