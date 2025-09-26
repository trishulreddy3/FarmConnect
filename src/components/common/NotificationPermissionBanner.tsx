import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle } from 'lucide-react';
import BrowserNotificationService from '../../services/browserNotificationService';

const NotificationPermissionBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      return;
    }

    // Check current permission status
    const currentPermission = Notification.permission;
    setPermissionStatus(currentPermission);

    // Show banner if permission is default (not requested yet)
    if (currentPermission === 'default') {
      setShowBanner(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const granted = await BrowserNotificationService.requestPermission();
      
      if (granted) {
        setPermissionStatus('granted');
        setShowBanner(false);
        
        // Show a test notification
        BrowserNotificationService.showNotification(
          '🎉 Notifications Enabled!',
          {
            body: 'You will now receive real-time notifications for orders, contracts, and messages.',
            icon: '/favicon.png'
          }
        );
      } else {
        setPermissionStatus('denied');
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setPermissionStatus('denied');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store dismissal in localStorage to not show again for this session
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  // Don't show banner if user has dismissed it or if notifications are not supported
  if (!showBanner || !('Notification' in window) || localStorage.getItem('notification-banner-dismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  Enable Browser Notifications
                </h3>
                <p className="text-xs sm:text-sm text-blue-100">
                  Get real-time updates for orders, contracts, and messages
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isRequesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enabling...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Enable</span>
                  </>
                )}
              </motion.button>
              
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPermissionBanner;
