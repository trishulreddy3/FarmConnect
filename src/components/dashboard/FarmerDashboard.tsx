import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, MessageCircle, FileText, Sprout, TrendingUp, Clock, DollarSign, Settings, QrCode, Bell } from 'lucide-react';
import CropForm from './CropForm';
import CropList from './CropList';
import ContractsList from './ContractsList';
import ChatsList from './ChatsList';
import WeatherWidget from '../widgets/WeatherWidget';
import AnalyticsDashboard from './AnalyticsDashboard';
import SettingsPage from './SettingsPage';
import QRCodeGenerator from '../widgets/QRCodeGenerator';
import NotificationCenter from './NotificationCenter';
import ModernDashboardWrapper from './ModernDashboardWrapper';
import { useAuth } from '../../contexts/AuthContext';
import NotificationService from '../../services/notificationService';
import { Notification } from '../../types';

const FarmerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('crops');
  const [showCropForm, setShowCropForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);

  // Listen for notifications
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = NotificationService.subscribeToNotifications(
      currentUser.uid,
      (notifications) => {
        const unread = notifications.filter(n => !n.isRead);
        setUnreadNotifications(unread);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const tabs = [
    { id: 'crops', name: 'My Crops', icon: Package },
    { id: 'contracts', name: 'Contracts', icon: FileText },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const stats = [
    { label: 'Active Crops', value: '12', icon: Sprout, color: 'bg-green-500' },
    { label: 'Total Revenue', value: '$15,420', icon: DollarSign, color: 'bg-blue-500' },
    { label: 'Pending Orders', value: '8', icon: Clock, color: 'bg-orange-500' },
    { label: 'Active Contracts', value: '3', icon: FileText, color: 'bg-purple-500' }
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Farmer Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Manage your crops and connect with buyers</p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-3">
              {/* Notification Bell */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(true)}
                className="relative flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {unreadNotifications.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadNotifications.length}
                  </div>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQRCode(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCropForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Crop</span>
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
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
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
              {activeTab === 'crops' && (
                <motion.div
                  key="crops"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      My Crops
                    </h2>
                  </div>
                  <CropList />
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
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                    Available Contracts
                  </h2>
                  <ContractsList userType="farmer" />
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
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                    Messages
                  </h2>
                  <ChatsList />
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
                  <AnalyticsDashboard />
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
        {showCropForm && (
          <CropForm onClose={() => setShowCropForm(false)} />
        )}

        {showQRCode && (
          <QRCodeGenerator
            data="crop_123_tomatoes_organic"
            title="Tomatoes QR Code"
            subtitle="Scan this QR code to view crop details"
            isOpen={showQRCode}
            onClose={() => setShowQRCode(false)}
          />
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

export default FarmerDashboard;