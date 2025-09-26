import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, MapPin, Moon, Lock, Shield, Database, HelpCircle, MessageSquare, Info, LogOut,
  Edit3, Check, Settings, Camera, Upload, Download, Trash2, Eye, EyeOff, Globe, Wifi, WifiOff,
  Battery, HardDrive, Activity, TrendingUp, Calendar, Clock, Star, Award, Target, BarChart3,
  RefreshCw, Save, X, AlertTriangle, CheckCircle, Smartphone, Monitor, Volume2, VolumeX,
  Palette, Languages, CreditCard, FileText, Mail, Phone, Map, Navigation, Zap, ShieldCheck,
  Key, UserCheck, Users, Heart, Gift, Crown, Package
} from 'lucide-react';
import { format } from 'date-fns';

// Profile Section Component
export const ProfileSection: React.FC<{
  profileData: any;
  setProfileData: any;
  showEditProfile: boolean;
  setShowEditProfile: any;
  handleSaveProfile: any;
  saving: boolean;
  currentUser: any;
}> = ({ profileData, setProfileData, showEditProfile, setShowEditProfile, handleSaveProfile, saving, currentUser }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Profile Information
        </h2>
        <button
          onClick={() => setShowEditProfile(!showEditProfile)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          {showEditProfile ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            {showEditProfile && (
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1">
            {showEditProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{profileData.displayName || 'User'}</h3>
                <p className="text-gray-600">{profileData.email}</p>
                {profileData.phone && <p className="text-gray-600">{profileData.phone}</p>}
                {profileData.location && <p className="text-gray-600">{profileData.location}</p>}
                {profileData.bio && <p className="text-gray-600 mt-2">{profileData.bio}</p>}
                <div className="flex items-center space-x-4 mt-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    currentUser?.role === 'farmer' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {currentUser?.role?.toUpperCase() || 'USER'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Joined {format(new Date(), 'MMM yyyy')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Preferences Section Component
export const PreferencesSection: React.FC<{
  settings: any;
  setSettings: any;
  handleSaveSettings: any;
  browserNotificationsSupported: boolean;
  browserNotificationsEnabled: boolean;
  handleBrowserNotificationToggle: any;
  systemInfo: any;
}> = ({ settings, setSettings, handleSaveSettings, browserNotificationsSupported, browserNotificationsEnabled, handleBrowserNotificationToggle, systemInfo }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Preferences & Settings
        </h2>
        <button
          onClick={handleSaveSettings}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-blue-600" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">In-App Notifications</h4>
              <p className="text-sm text-gray-600">Show notifications within the app</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.inApp}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, inApp: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {browserNotificationsSupported && (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Browser Notifications</h4>
                <p className="text-sm text-gray-600">
                  {browserNotificationsEnabled 
                    ? 'Receive desktop notifications when the app is not in focus' 
                    : 'Enable desktop notifications for real-time updates'
                  }
                </p>
              </div>
              <button
                onClick={handleBrowserNotificationToggle}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  browserNotificationsEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {browserNotificationsEnabled ? 'Enabled' : 'Enable'}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-green-600" />
          Privacy
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Profile Visibility</h4>
              <p className="text-sm text-gray-600">Control who can see your profile</p>
            </div>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, profileVisibility: e.target.value as any }
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Location Sharing</h4>
              <p className="text-sm text-gray-600">Allow app to access your location</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.locationSharing}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, locationSharing: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Palette className="h-5 w-5 mr-2 text-purple-600" />
          Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Theme</h4>
              <p className="text-sm text-gray-600">Choose your preferred theme</p>
            </div>
            <select
              value={settings.appearance.theme}
              onChange={(e) => setSettings({
                ...settings,
                appearance: { ...settings.appearance, theme: e.target.value as any }
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Font Size</h4>
              <p className="text-sm text-gray-600">Adjust text size for better readability</p>
            </div>
            <select
              value={settings.appearance.fontSize}
              onChange={(e) => setSettings({
                ...settings,
                appearance: { ...settings.appearance, fontSize: e.target.value as any }
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-orange-600" />
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            {systemInfo.online ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
            <div>
              <p className="text-sm font-medium text-gray-900">Connection</p>
              <p className="text-sm text-gray-600">{systemInfo.online ? 'Online' : 'Offline'} • {systemInfo.connectionType}</p>
            </div>
          </div>
          
          {systemInfo.batteryLevel > 0 && (
            <div className="flex items-center space-x-3">
              <Battery className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Battery</p>
                <p className="text-sm text-gray-600">{systemInfo.batteryLevel}%</p>
              </div>
            </div>
          )}
          
          {systemInfo.storageTotal > 0 && (
            <div className="flex items-center space-x-3">
              <HardDrive className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Storage</p>
                <p className="text-sm text-gray-600">{systemInfo.storageUsed}MB / {systemInfo.storageTotal}MB</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Account Section Component
export const AccountSection: React.FC<{
  handleSignOut: any;
  handleExportData: any;
  handleClearCache: any;
  systemInfo: any;
}> = ({ handleSignOut, handleExportData, handleClearCache, systemInfo }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Account Management
      </h2>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheck className="h-5 w-5 mr-2 text-green-600" />
          Security
        </h3>
        <div className="space-y-4">
          <button className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <Key className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
          </button>

          <button className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <UserCheck className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-purple-600" />
          Data Management
        </h3>
        <div className="space-y-4">
          <button 
            onClick={handleExportData}
            className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Download className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Export Data</h4>
              <p className="text-sm text-gray-600">Download your data as JSON</p>
            </div>
          </button>

          <button 
            onClick={handleClearCache}
            className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Clear Cache</h4>
              <p className="text-sm text-gray-600">Remove offline data and cache</p>
            </div>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          Danger Zone
        </h3>
        <div className="space-y-4">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// Stats Section Component
export const StatsSection: React.FC<{
  userStats: any;
  loading: boolean;
  currentUser: any;
}> = ({ userStats, loading, currentUser }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Your Statistics
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contracts</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.totalContracts}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {currentUser?.role === 'farmer' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Crops Listed</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.totalCrops}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.totalMessages}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Account created</p>
                  <p className="text-xs text-gray-500">{format(userStats.joinDate, 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Last active</p>
                  <p className="text-xs text-gray-500">{format(userStats.lastActive, 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Support Section Component
export const SupportSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        Support & Help
      </h2>

      {/* Help Center */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
          Help Center
        </h3>
        <div className="space-y-4">
          <button className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <FileText className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">User Guide</h4>
              <p className="text-sm text-gray-600">Learn how to use FarmConnect</p>
            </div>
          </button>

          <button className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">FAQ</h4>
              <p className="text-sm text-gray-600">Frequently asked questions</p>
            </div>
          </button>

          <button className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <Mail className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Contact Support</h4>
              <p className="text-sm text-gray-600">Get help from our support team</p>
            </div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2 text-green-600" />
          About FarmConnect
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Build</span>
            <span className="text-sm font-medium text-gray-900">2024.01.15</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Platform</span>
            <span className="text-sm font-medium text-gray-900">Web App</span>
          </div>
        </div>
      </div>
    </div>
  );
};
