import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MessageCircle, FileText, ShoppingCart, TrendingDown, Package, Clock, Store, Settings, BarChart3, Bell } from 'lucide-react';
import CropSearch from './CropSearch';
import ContractForm from './ContractForm';
import ContractsList from './ContractsList';
import ChatsList from './ChatsList';
import OrdersList from './OrdersList';
import BuyerOrders from './BuyerOrders';
import MarketplaceDashboard from './MarketplaceDashboard';
import BuyerAnalyticsDashboard from './BuyerAnalyticsDashboard';
import SettingsPage from './SettingsPage';
import WeatherWidget from '../widgets/WeatherWidget';
import ModernDashboardWrapper from './ModernDashboardWrapper';
import NotificationCenter from './NotificationCenter';
import RecentOrders from './RecentOrders';
import { useAuth } from '../../contexts/AuthContext';
import NotificationService from '../../services/notificationService';
import { BrowserNotificationService } from '../../services/browserNotificationService';
import { AppNotification } from '../../types';

const BuyerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('search');
  const [showContractForm, setShowContractForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState<AppNotification[]>([]);

  // Listen for notifications
  useEffect(() => {
    if (!currentUser) {
      setUnreadNotifications([]);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = NotificationService.subscribeToNotifications(
        currentUser.uid,
        (notifications) => {
          const unread = notifications.filter(n => !n.isRead);
          setUnreadNotifications(unread);
        }
      );
    } catch (error) {
      console.error('Error setting up notifications subscription:', error);
      setUnreadNotifications([]);
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from notifications:', error);
        }
      }
    };
  }, [currentUser]);

  const tabs = [
    { id: 'marketplace', name: 'Marketplace', icon: Store },
    { id: 'search', name: 'Browse Crops', icon: Search },
    { id: 'contracts', name: 'My Contracts', icon: FileText },
    { id: 'orders', name: 'My Orders', icon: ShoppingCart },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const stats = [
    { label: 'Active Orders', value: '5', icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Cost Savings', value: '$8,450', icon: TrendingDown, color: 'bg-green-500' },
    { label: 'Pending Contracts', value: '12', icon: Clock, color: 'bg-orange-500' },
    { label: 'Total Purchases', value: '47', icon: Package, color: 'bg-purple-500' }
  ];

  return (
    <ModernDashboardWrapper>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Buyer Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Find fresh crops directly from farmers</p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-3">
              {/* Notification Bell */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(true)}
                className="relative flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {unreadNotifications.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadNotifications.length}
                  </div>
                )}
              </motion.button>

              {/* Test Notification Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('Test notification button clicked');
                  console.log('BrowserNotificationService available:', typeof BrowserNotificationService);
                  
                  try {
                    BrowserNotificationService.showNotification(
                      '🧪 Test Notification - Buyer',
                      {
                        body: `Hello ${currentUser?.displayName || 'Buyer'}! This is a test notification from your buyer dashboard.`,
                        tag: 'buyer-test-notification',
                        requireInteraction: true
                      }
                    );
                    console.log('Notification sent successfully');
                  } catch (error) {
                    console.error('Error calling BrowserNotificationService:', error);
                    // Fallback notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                      new Notification('🧪 Test Notification - Buyer', {
                        body: `Hello ${currentUser?.displayName || 'Buyer'}! This is a test notification from your buyer dashboard.`,
                        icon: '/favicon.png'
                      });
                    } else {
                      alert('Notifications not available. Please enable notifications in your browser settings.');
                    }
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Bell className="w-4 h-4" />
                <span>Test Notification</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowContractForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Open Contract</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Weather Widget */}
        <div className="mb-6">
          <WeatherWidget />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
                <motion.div 
                  className={`p-4 rounded-xl ${stat.color} shadow-lg`}
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Recent Orders
              </h2>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            <RecentOrders userType="buyer" limitCount={3} />
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-6"
        >
          <div className="border-b border-gray-200/50">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
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
              {activeTab === 'marketplace' && (
                <motion.div
                  key="marketplace"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MarketplaceDashboard />
                </motion.div>
              )}

              {activeTab === 'search' && (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Browse Available Crops
                    </h2>
                  </div>
                  <CropSearch />
                </motion.div>
              )}

              {activeTab === 'contracts' && (
                <motion.div
                  key="contracts"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      My Contracts
                    </h2>
                  </div>
                  <ContractsList userType="buyer" />
                </motion.div>
              )}

              {activeTab === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
                    Messages
                  </h2>
                  <ChatsList />
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BuyerOrders />
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BuyerAnalyticsDashboard />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsPage />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showContractForm && (
          <ContractForm onClose={() => setShowContractForm(false)} />
        )}

        {showNotifications && (
          <NotificationCenter
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>
    </ModernDashboardWrapper>
  );
};

export default BuyerDashboard;