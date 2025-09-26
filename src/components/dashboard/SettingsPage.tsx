import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Bell, MapPin, Moon, Lock, Shield, Database, HelpCircle, MessageSquare, Info, LogOut,
  Edit3, Check, Settings, Camera, Upload, Download, Trash2, Eye, EyeOff, Globe, Wifi, WifiOff,
  Battery, HardDrive, Activity, TrendingUp, Calendar, Clock, Star, Award, Target, BarChart3,
  RefreshCw, Save, X, AlertTriangle, CheckCircle, Smartphone, Monitor, Volume2, VolumeX,
  Palette, Languages, CreditCard, FileText, Mail, Phone, Map, Navigation, Zap, ShieldCheck,
  Key, UserCheck, Users, Heart, Gift, Crown, Package
} from 'lucide-react';
import BrowserNotificationService from '../../services/browserNotificationService';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import { safeToDate } from '../../utils/firestoreUtils';
import { ProfileSection, PreferencesSection, AccountSection, StatsSection, SupportSection } from './SettingsComponents';

interface UserStats {
  totalOrders: number;
  totalContracts: number;
  totalCrops: number;
  totalMessages: number;
  joinDate: Date;
  lastActive: Date;
  rating: number;
  level: number;
  experience: number;
}

interface AppSettings {
  notifications: {
    inApp: boolean;
    browser: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    locationSharing: boolean;
    dataCollection: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  performance: {
    autoSync: boolean;
    offlineMode: boolean;
    dataCompression: boolean;
  };
}

const SettingsPage: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'account' | 'stats' | 'support'>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Profile states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: ''
  });
  
  // Settings states
  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      inApp: true,
      browser: false,
      email: true,
      sms: false
    },
    privacy: {
      profileVisibility: 'public',
      locationSharing: true,
      dataCollection: true
    },
    appearance: {
      theme: 'light',
      language: 'en',
      fontSize: 'medium'
    },
    performance: {
      autoSync: true,
      offlineMode: false,
      dataCompression: true
    }
  });
  
  // Stats states
  const [userStats, setUserStats] = useState<UserStats>({
    totalOrders: 0,
    totalContracts: 0,
    totalCrops: 0,
    totalMessages: 0,
    joinDate: new Date(),
    lastActive: new Date(),
    rating: 0,
    level: 1,
    experience: 0
  });
  
  // Browser notification states
  const [browserNotificationsSupported, setBrowserNotificationsSupported] = useState(false);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);
  
  // System info states
  const [systemInfo, setSystemInfo] = useState({
    online: navigator.onLine,
    batteryLevel: 0,
    storageUsed: 0,
    storageTotal: 0,
    memoryUsage: 0,
    connectionType: 'unknown'
  });

  // Load user data and settings
  useEffect(() => {
    if (currentUser) {
      loadUserData();
      loadUserStats();
      loadSystemInfo();
    }
  }, [currentUser]);

  // Check browser notification support
  useEffect(() => {
    const isSupported = 'Notification' in window;
    setBrowserNotificationsSupported(isSupported);
    
    if (isSupported) {
      setBrowserNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setSystemInfo(prev => ({ ...prev, online: navigator.onLine }));
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const loadUserData = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfileData({
          displayName: userData.displayName || currentUser.displayName || '',
          email: currentUser.email || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          location: userData.location || '',
          website: userData.website || ''
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserStats = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Get orders count
      const ordersQuery = query(collection(db, 'orders'), where('buyerId', '==', currentUser.uid));
      const ordersSnapshot = await getDocs(ordersQuery);
      
      // Get contracts count
      const contractsQuery = query(collection(db, 'contracts'), where('buyerId', '==', currentUser.uid));
      const contractsSnapshot = await getDocs(contractsQuery);
      
      // Get crops count (for farmers)
      const cropsQuery = query(collection(db, 'crops'), where('farmerId', '==', currentUser.uid));
      const cropsSnapshot = await getDocs(cropsQuery);
      
      // Get messages count
      const messagesQuery = query(collection(db, 'messages'), where('senderId', '==', currentUser.uid));
      const messagesSnapshot = await getDocs(messagesQuery);
      
      setUserStats(prev => ({
        ...prev,
        totalOrders: ordersSnapshot.size,
        totalContracts: contractsSnapshot.size,
        totalCrops: cropsSnapshot.size,
        totalMessages: messagesSnapshot.size,
        lastActive: new Date()
      }));
      
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemInfo = async () => {
    try {
      // Get battery info if available
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        setSystemInfo(prev => ({ ...prev, batteryLevel: Math.round(battery.level * 100) }));
      }
      
      // Get storage info if available
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const storage = await navigator.storage.estimate();
        setSystemInfo(prev => ({
          ...prev,
          storageUsed: Math.round((storage.usage || 0) / 1024 / 1024), // MB
          storageTotal: Math.round((storage.quota || 0) / 1024 / 1024) // MB
        }));
      }
      
      // Get connection info if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setSystemInfo(prev => ({ ...prev, connectionType: connection.effectiveType || 'unknown' }));
      }
      
    } catch (error) {
      console.error('Error loading system info:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...profileData,
        updatedAt: new Date()
      });
      
      toast.success('Profile updated successfully!');
      setShowEditProfile(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        settings: settings,
        updatedAt: new Date()
      });
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
        toast.success('Signed out successfully');
      } catch (error) {
        console.error('Error signing out:', error);
        toast.error('Failed to sign out');
      }
    }
  };

  const handleBrowserNotificationToggle = async () => {
    if (!browserNotificationsSupported) return;

    if (browserNotificationsEnabled) {
      toast.info('Browser notifications cannot be disabled programmatically. Please disable them in your browser settings.');
    } else {
      const granted = await BrowserNotificationService.requestPermission();
      setBrowserNotificationsEnabled(granted);
      
      if (granted) {
        BrowserNotificationService.showNotification(
          '🎉 Browser Notifications Enabled!',
          {
            body: 'You will now receive real-time notifications for orders, contracts, and messages.',
            icon: '/favicon.png'
          }
        );
        toast.success('Browser notifications enabled!');
      } else {
        toast.error('Failed to enable browser notifications');
      }
    }
  };

  const handleExportData = async () => {
    try {
      const data = {
        profile: profileData,
        settings: settings,
        stats: userStats,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `farmconnect-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear the app cache? This will remove offline data.')) {
      try {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        if ('storage' in navigator && 'clear' in navigator.storage) {
          await navigator.storage.clear();
        }
        
        toast.success('Cache cleared successfully!');
        loadSystemInfo(); // Refresh system info
      } catch (error) {
        console.error('Error clearing cache:', error);
        toast.error('Failed to clear cache');
      }
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'account', name: 'Account', icon: Shield },
    { id: 'stats', name: 'Statistics', icon: BarChart3 },
    { id: 'support', name: 'Support', icon: HelpCircle }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Settings & Preferences
            </h1>
            <p className="text-gray-600">Manage your account, preferences, and app settings</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              systemInfo.online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {systemInfo.online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {systemInfo.online ? 'Online' : 'Offline'}
              </span>
            </div>
            {saving && (
              <div className="flex items-center space-x-2 text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="border-b border-gray-200/50">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileSection 
                  profileData={profileData}
                  setProfileData={setProfileData}
                  showEditProfile={showEditProfile}
                  setShowEditProfile={setShowEditProfile}
                  handleSaveProfile={handleSaveProfile}
                  saving={saving}
                  currentUser={currentUser}
                />
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PreferencesSection 
                  settings={settings}
                  setSettings={setSettings}
                  handleSaveSettings={handleSaveSettings}
                  browserNotificationsSupported={browserNotificationsSupported}
                  browserNotificationsEnabled={browserNotificationsEnabled}
                  handleBrowserNotificationToggle={handleBrowserNotificationToggle}
                  systemInfo={systemInfo}
                />
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AccountSection 
                  handleSignOut={handleSignOut}
                  handleExportData={handleExportData}
                  handleClearCache={handleClearCache}
                  systemInfo={systemInfo}
                />
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StatsSection 
                  userStats={userStats}
                  loading={loading}
                  currentUser={currentUser}
                />
              </motion.div>
            )}

            {activeTab === 'support' && (
              <motion.div
                key="support"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SupportSection />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
