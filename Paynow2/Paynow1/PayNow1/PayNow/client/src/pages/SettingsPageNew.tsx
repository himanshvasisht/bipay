import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  User,
  Bell,
  Shield,
  CreditCard,
  Smartphone,
  HelpCircle,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  Key,
  Globe,
  Moon,
  Sun,
  Palette,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Trash2,
  LogOut,
  Share2,
  Star,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Camera,
  Check,
  X,
  Plus,
  Minus,
  ChevronRight,
  Info,
  AlertTriangle,
  Users,
  Building,
  Briefcase,
  GraduationCap,
  Clock
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  kycStatus: 'verified' | 'pending' | 'not_started';
  accountType: 'personal' | 'business';
  memberSince: Date;
  lastLogin: Date;
}

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'input' | 'action' | 'info';
  value?: any;
  options?: { label: string; value: any }[];
  action?: () => void;
  danger?: boolean;
}

const SettingsPageNew: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    phone: '+91 98765 43210',
    avatar: '👨‍💼',
    kycStatus: 'verified',
    accountType: 'personal',
    memberSince: new Date(2023, 5, 15),
    lastLogin: new Date(2024, 7, 29, 14, 30)
  });

  const [settings, setSettings] = useState({
    // Security
    biometricAuth: true,
    twoFactorAuth: false,
    autoLock: 300, // seconds
    lockOnBackground: true,
    
    // Privacy
    showBalance: true,
    shareTransactions: false,
    allowContactSync: true,
    
    // Notifications
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    
    // Appearance
    theme: 'light', // light, dark, auto
    language: 'en',
    currency: 'INR',
    
    // Advanced
    dataSync: true,
    analytics: false,
    crashReports: true
  });

  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile & Account',
      icon: User,
      items: [
        {
          id: 'edit_profile',
          label: 'Edit Profile',
          description: 'Update your personal information',
          type: 'action',
          action: () => console.log('Edit profile')
        },
        {
          id: 'kyc_status',
          label: 'KYC Verification',
          description: userProfile.kycStatus === 'verified' ? 'Verified account' : 'Complete verification',
          type: 'info',
          value: userProfile.kycStatus
        },
        {
          id: 'account_type',
          label: 'Account Type',
          description: 'Switch between personal and business',
          type: 'select',
          value: userProfile.accountType,
          options: [
            { label: 'Personal Account', value: 'personal' },
            { label: 'Business Account', value: 'business' }
          ]
        }
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: Shield,
      items: [
        {
          id: 'biometric_auth',
          label: 'Biometric Authentication',
          description: 'Use fingerprint or face ID',
          type: 'toggle',
          value: settings.biometricAuth
        },
        {
          id: 'two_factor_auth',
          label: 'Two-Factor Authentication',
          description: 'Extra security for your account',
          type: 'toggle',
          value: settings.twoFactorAuth
        },
        {
          id: 'auto_lock',
          label: 'Auto Lock',
          description: 'Lock app after inactivity',
          type: 'select',
          value: settings.autoLock,
          options: [
            { label: 'Immediately', value: 0 },
            { label: '1 minute', value: 60 },
            { label: '5 minutes', value: 300 },
            { label: '15 minutes', value: 900 },
            { label: 'Never', value: -1 }
          ]
        },
        {
          id: 'show_balance',
          label: 'Show Balance on Home',
          description: 'Display wallet balance on main screen',
          type: 'toggle',
          value: settings.showBalance
        },
        {
          id: 'change_password',
          label: 'Change Password',
          description: 'Update your login password',
          type: 'action',
          action: () => setShowPasswordModal(true)
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          id: 'push_notifications',
          label: 'Push Notifications',
          description: 'Get notified about transactions',
          type: 'toggle',
          value: settings.pushNotifications
        },
        {
          id: 'email_notifications',
          label: 'Email Notifications',
          description: 'Receive updates via email',
          type: 'toggle',
          value: settings.emailNotifications
        },
        {
          id: 'sms_notifications',
          label: 'SMS Notifications',
          description: 'Get SMS for important alerts',
          type: 'toggle',
          value: settings.smsNotifications
        },
        {
          id: 'sound_enabled',
          label: 'Notification Sound',
          description: 'Play sound for notifications',
          type: 'toggle',
          value: settings.soundEnabled
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          id: 'theme',
          label: 'Theme',
          description: 'Choose your preferred theme',
          type: 'select',
          value: settings.theme,
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
            { label: 'Auto', value: 'auto' }
          ]
        },
        {
          id: 'language',
          label: 'Language',
          description: 'App language preference',
          type: 'select',
          value: settings.language,
          options: [
            { label: 'English', value: 'en' },
            { label: 'हिंदी', value: 'hi' },
            { label: 'தமிழ்', value: 'ta' },
            { label: 'বাংলা', value: 'bn' }
          ]
        },
        {
          id: 'currency',
          label: 'Currency',
          description: 'Default currency display',
          type: 'select',
          value: settings.currency,
          options: [
            { label: 'Indian Rupee (₹)', value: 'INR' },
            { label: 'US Dollar ($)', value: 'USD' },
            { label: 'Euro (€)', value: 'EUR' }
          ]
        }
      ]
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: HelpCircle,
      items: [
        {
          id: 'help_center',
          label: 'Help Center',
          description: 'Get help and find answers',
          type: 'action',
          action: () => console.log('Open help')
        },
        {
          id: 'contact_support',
          label: 'Contact Support',
          description: 'Reach out to our support team',
          type: 'action',
          action: () => console.log('Contact support')
        },
        {
          id: 'report_issue',
          label: 'Report an Issue',
          description: 'Let us know about problems',
          type: 'action',
          action: () => console.log('Report issue')
        },
        {
          id: 'rate_app',
          label: 'Rate BiPay',
          description: 'Share your experience',
          type: 'action',
          action: () => console.log('Rate app')
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced',
      icon: Settings,
      items: [
        {
          id: 'data_sync',
          label: 'Data Sync',
          description: 'Sync data across devices',
          type: 'toggle',
          value: settings.dataSync
        },
        {
          id: 'analytics',
          label: 'Usage Analytics',
          description: 'Help improve BiPay',
          type: 'toggle',
          value: settings.analytics
        },
        {
          id: 'export_data',
          label: 'Export Data',
          description: 'Download your transaction data',
          type: 'action',
          action: () => console.log('Export data')
        },
        {
          id: 'delete_account',
          label: 'Delete Account',
          description: 'Permanently delete your account',
          type: 'action',
          action: () => setShowDeleteModal(true),
          danger: true
        }
      ]
    }
  ];

  const updateSetting = (settingId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
  };

  const renderSettingItem = (item: SettingItem) => {
    const renderValue = () => {
      switch (item.type) {
        case 'toggle':
          return (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={item.value}
                onChange={(e) => updateSetting(item.id, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          );
        
        case 'select':
          return (
            <select
              value={item.value}
              onChange={(e) => updateSetting(item.id, e.target.value)}
              className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {item.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        
        case 'action':
          return (
            <button
              onClick={item.action}
              className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                item.danger 
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          );
        
        case 'info':
          return (
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
              item.value === 'verified' ? 'bg-green-100 text-green-700' :
              item.value === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {item.value === 'verified' && <Check className="w-4 h-4 inline mr-1" />}
              {item.value === 'pending' && <Clock className="w-4 h-4 inline mr-1" />}
              {item.value === 'verified' ? 'Verified' : 
               item.value === 'pending' ? 'Pending' : 'Not Started'}
            </div>
          );
        
        default:
          return null;
      }
    };

    return (
      <div 
        key={item.id}
        className="flex items-center justify-between p-4 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors"
      >
        <div className="flex-1">
          <h4 className={`font-medium ${item.danger ? 'text-red-600' : 'text-blue-800'}`}>
            {item.label}
          </h4>
          {item.description && (
            <p className="text-sm text-blue-500 mt-1">{item.description}</p>
          )}
        </div>
        {renderValue()}
      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-professional">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-white bg-opacity-20 flex items-center justify-center text-3xl">
              {userProfile.avatar}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{userProfile.name}</h2>
            <p className="text-blue-100">{userProfile.email}</p>
            <p className="text-blue-200 text-sm">{userProfile.phone}</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                userProfile.kycStatus === 'verified' ? 'bg-green-500 bg-opacity-20' : 'bg-yellow-500 bg-opacity-20'
              }`}>
                {userProfile.kycStatus === 'verified' ? 
                  <Check className="w-3 h-3" /> : 
                  <Clock className="w-3 h-3" />
                }
                <span>KYC {userProfile.kycStatus}</span>
              </div>
              <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                {userProfile.accountType === 'personal' ? '👤 Personal' : '🏢 Business'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl text-center border border-blue-100">
          <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-sm font-bold text-blue-800">
            {Math.floor((new Date().getTime() - userProfile.memberSince.getTime()) / (1000 * 60 * 60 * 24))} days
          </div>
          <div className="text-xs text-blue-500">Member Since</div>
        </div>
        <div className="bg-white p-4 rounded-2xl text-center border border-blue-100">
          <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-sm font-bold text-blue-800">Secure</div>
          <div className="text-xs text-blue-500">Account Status</div>
        </div>
        <div className="bg-white p-4 rounded-2xl text-center border border-blue-100">
          <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          <div className="text-sm font-bold text-blue-800">Premium</div>
          <div className="text-xs text-blue-500">Plan Type</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-2xl shadow-professional border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          {[
            { icon: Edit, label: 'Edit Profile Information', color: 'blue' },
            { icon: Key, label: 'Change Password', color: 'orange' },
            { icon: Shield, label: 'Security Settings', color: 'green' },
            { icon: Download, label: 'Download Account Data', color: 'purple' }
          ].map((action, index) => (
            <button
              key={index}
              className="w-full flex items-center space-x-3 p-3 border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <action.icon className={`w-5 h-5 text-${action.color}-600`} />
              <span className="text-blue-800 font-medium">{action.label}</span>
              <ChevronRight className="w-4 h-4 text-blue-400 ml-auto" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const currentSection = settingsSections.find(section => section.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-professional-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-blue-100">Customize your BiPay experience</p>
            </div>
          </div>
          <button className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-md mx-auto">
          {/* Section Navigation */}
          <div className="bg-white p-2 rounded-2xl shadow-professional border border-blue-100 mb-6">
            <div className="grid grid-cols-3 gap-1">
              {settingsSections.slice(0, 6).map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-professional'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {section.title.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {activeSection === 'profile' ? renderProfile() : (
            <div className="space-y-6 animate-fade-in-up">
              {currentSection && (
                <div className="bg-white p-6 rounded-2xl shadow-professional border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <currentSection.icon className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-blue-800">{currentSection.title}</h2>
                  </div>
                  <div className="space-y-3">
                    {currentSection.items.map(item => renderSettingItem(item))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sign Out */}
          <div className="mt-8 bg-white p-6 rounded-2xl shadow-professional border border-red-100">
            <button className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in-up">
            <h3 className="text-lg font-bold text-blue-800 mb-4">Change Password</h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold">
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in-up">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-800 mb-2">Delete Account</h3>
              <p className="text-red-600 mb-6">This action cannot be undone. All your data will be permanently deleted.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPageNew;
