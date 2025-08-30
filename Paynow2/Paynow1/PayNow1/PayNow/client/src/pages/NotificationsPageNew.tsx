import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Bell,
  Settings,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Shield,
  CreditCard,
  Users,
  TrendingUp,
  Gift,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  X,
  MessageSquare,
  DollarSign,
  Zap,
  Star,
  Calendar,
  MapPin
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'payment' | 'security' | 'promotion' | 'update' | 'reminder' | 'social';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    href: string;
  };
  amount?: number;
  avatar?: string;
  category: string;
}

interface NotificationSettings {
  push: boolean;
  sms: boolean;
  email: boolean;
  inApp: boolean;
  sound: boolean;
  vibration: boolean;
  categories: {
    payments: boolean;
    security: boolean;
    promotions: boolean;
    updates: boolean;
    reminders: boolean;
    social: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationsPageNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [settings, setSettings] = useState<NotificationSettings>({
    push: true,
    sms: true,
    email: false,
    inApp: true,
    sound: true,
    vibration: true,
    categories: {
      payments: true,
      security: true,
      promotions: false,
      updates: true,
      reminders: true,
      social: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'payment',
      title: 'Payment Received',
      message: 'You received ₹2,500 from John Smith for freelance work',
      timestamp: new Date(2024, 7, 29, 14, 30),
      read: false,
      priority: 'high',
      amount: 2500,
      avatar: '👨‍💻',
      category: 'Payments',
      action: { label: 'View Details', href: '/transaction/1' }
    },
    {
      id: '2',
      type: 'security',
      title: 'Security Alert',
      message: 'New device login detected from Mumbai. If this wasn\'t you, please secure your account.',
      timestamp: new Date(2024, 7, 29, 12, 15),
      read: false,
      priority: 'high',
      category: 'Security',
      action: { label: 'Review Activity', href: '/security' }
    },
    {
      id: '3',
      type: 'promotion',
      title: 'Cashback Offer',
      message: 'Get 10% cashback on electricity bills. Valid till tomorrow!',
      timestamp: new Date(2024, 7, 29, 10, 45),
      read: true,
      priority: 'medium',
      category: 'Promotions',
      action: { label: 'Pay Bill', href: '/bills' }
    },
    {
      id: '4',
      type: 'payment',
      title: 'Payment Sent Successfully',
      message: 'Your payment of ₹1,250 to Sarah Wilson was completed',
      timestamp: new Date(2024, 7, 28, 18, 20),
      read: true,
      priority: 'medium',
      amount: 1250,
      avatar: '👩‍💼',
      category: 'Payments'
    },
    {
      id: '5',
      type: 'reminder',
      title: 'Bill Reminder',
      message: 'Your electricity bill of ₹1,850 is due tomorrow',
      timestamp: new Date(2024, 7, 28, 9, 0),
      read: false,
      priority: 'medium',
      amount: 1850,
      category: 'Reminders',
      action: { label: 'Pay Now', href: '/bills/electricity' }
    },
    {
      id: '6',
      type: 'social',
      title: 'Split Bill Request',
      message: 'Emma Davis requested to split dinner bill of ₹2,400',
      timestamp: new Date(2024, 7, 27, 20, 30),
      read: true,
      priority: 'medium',
      amount: 2400,
      avatar: '👩‍🎓',
      category: 'Social',
      action: { label: 'View Request', href: '/split-bill/1' }
    },
    {
      id: '7',
      type: 'update',
      title: 'App Update Available',
      message: 'BiPay v2.1.0 is now available with new features and bug fixes',
      timestamp: new Date(2024, 7, 26, 16, 0),
      read: true,
      priority: 'low',
      category: 'Updates',
      action: { label: 'Update Now', href: '/update' }
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment': return DollarSign;
      case 'security': return Shield;
      case 'promotion': return Gift;
      case 'update': return Zap;
      case 'reminder': return Clock;
      case 'social': return Users;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-200 text-blue-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-green-100 text-green-700';
      case 'security': return 'bg-red-100 text-red-700';
      case 'promotion': return 'bg-purple-100 text-purple-700';
      case 'update': return 'bg-blue-100 text-blue-700';
      case 'reminder': return 'bg-orange-100 text-orange-700';
      case 'social': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         (filter === 'important' && notification.priority === 'high');
    
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const importantCount = notifications.filter(n => n.priority === 'high').length;

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateCategorySetting = (category: keyof typeof settings.categories, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }));
  };

  const renderNotifications = () => (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'important', label: 'Important', count: importantCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  filter === tab.key 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 bg-white border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">No notifications found</h3>
            <p className="text-blue-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <div 
                key={notification.id}
                className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg animate-fade-in-up ${
                  notification.read 
                    ? 'bg-white border-blue-100' 
                    : 'bg-gradient-to-r from-blue-50 to-white border-blue-200'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon/Avatar */}
                  <div className="relative">
                    {notification.avatar ? (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl">
                        {notification.avatar}
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(notification.type)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    )}
                    {!notification.read && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-blue-800 truncate">{notification.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <button className="text-blue-400 hover:text-blue-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-blue-600 text-sm mb-2 leading-relaxed">{notification.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-blue-400">{formatTimestamp(notification.timestamp)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(notification.type)}`}>
                          {notification.category}
                        </span>
                        {notification.amount && (
                          <span className="text-sm font-semibold text-green-600">
                            ₹{notification.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {notification.action && (
                        <Link href={notification.action.href}>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                            {notification.action.label}
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {filteredNotifications.length > 0 && (
        <div className="text-center pt-4">
          <button className="px-6 py-3 bg-white border-2 border-blue-200 text-blue-600 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300">
            Load More Notifications
          </button>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-professional border border-blue-100">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-600" />
          Notification Methods
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'push', label: 'Push Notifications', icon: Smartphone, desc: 'Get notified on your device' },
            { key: 'sms', label: 'SMS Notifications', icon: MessageSquare, desc: 'Receive important alerts via SMS' },
            { key: 'email', label: 'Email Notifications', icon: Mail, desc: 'Weekly summaries and updates' },
            { key: 'sound', label: 'Sound', icon: Volume2, desc: 'Play notification sounds' },
            { key: 'vibration', label: 'Vibration', icon: Smartphone, desc: 'Vibrate for notifications' }
          ].map(setting => (
            <div key={setting.key} className="flex items-center justify-between p-3 border border-blue-100 rounded-xl">
              <div className="flex items-center space-x-3">
                <setting.icon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">{setting.label}</p>
                  <p className="text-sm text-blue-500">{setting.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[setting.key as keyof NotificationSettings] as boolean}
                  onChange={(e) => updateSetting(setting.key as keyof NotificationSettings, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Category Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-professional border border-blue-100">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-600" />
          Notification Categories
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'payments', label: 'Payments', icon: DollarSign, desc: 'Payment confirmations and receipts' },
            { key: 'security', label: 'Security', icon: Shield, desc: 'Security alerts and login notifications' },
            { key: 'promotions', label: 'Promotions', icon: Gift, desc: 'Offers, cashbacks, and deals' },
            { key: 'updates', label: 'App Updates', icon: Zap, desc: 'New features and improvements' },
            { key: 'reminders', label: 'Reminders', icon: Clock, desc: 'Bill due dates and payment reminders' },
            { key: 'social', label: 'Social', icon: Users, desc: 'Split bills and friend requests' }
          ].map(category => (
            <div key={category.key} className="flex items-center justify-between p-3 border border-blue-100 rounded-xl">
              <div className="flex items-center space-x-3">
                <category.icon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">{category.label}</p>
                  <p className="text-sm text-blue-500">{category.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.categories[category.key as keyof typeof settings.categories]}
                  onChange={(e) => updateCategorySetting(category.key as keyof typeof settings.categories, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white p-6 rounded-2xl shadow-professional border border-blue-100">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
          <VolumeX className="w-5 h-5 mr-2 text-blue-600" />
          Quiet Hours
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-blue-100 rounded-xl">
            <div>
              <p className="font-medium text-blue-800">Enable Quiet Hours</p>
              <p className="text-sm text-blue-500">Silence notifications during specified hours</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.quietHours.enabled}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  quietHours: { ...prev.quietHours, enabled: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">Start Time</label>
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, start: e.target.value }
                  }))}
                  className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-2">End Time</label>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, end: e.target.value }
                  }))}
                  className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300">
        Save Notification Settings
      </button>
    </div>
  );

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
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-blue-100">Stay updated with BiPay</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {unreadCount} new
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mt-6">
          <div className="flex space-x-1 bg-white bg-opacity-20 p-1 rounded-2xl">
            {[
              { key: 'notifications', label: 'Notifications', icon: Bell },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-white text-blue-700 shadow-lg'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-md mx-auto">
          {activeTab === 'notifications' ? renderNotifications() : renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPageNew;
