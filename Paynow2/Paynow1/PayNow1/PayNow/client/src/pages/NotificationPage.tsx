
import { useState, useEffect } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { ArrowLeft, Bell, Check, X, Download, Send } from 'lucide-react';
import { useLocation } from 'wouter';

interface Notification {
  id: string;
  type: 'payment_received' | 'payment_sent' | 'security' | 'promo';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  amount?: number;
  sender?: string;
  recipient?: string;
}

const NotificationPage = () => {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Demo notifications
    const demoNotifications: Notification[] = [
      {
        id: '1',
        type: 'payment_received',
        title: 'Payment Received',
        message: 'You received ₹500 from John Doe',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        amount: 500,
        sender: 'John Doe'
      },
      {
        id: '2',
        type: 'payment_sent',
        title: 'Payment Sent Successfully',
        message: 'Your payment of ₹1000 to Jane Smith was successful',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        amount: 1000,
        recipient: 'Jane Smith'
      },
      {
        id: '3',
        type: 'security',
        title: 'Security Alert',
        message: 'Your biometric authentication was successfully updated',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true
      },
      {
        id: '4',
        type: 'promo',
        title: 'New Feature Available',
        message: 'Try our new QR payment feature for faster transactions',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        read: true
      }
    ];
    setNotifications(demoNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return <Download className="w-5 h-5 text-green-600" />;
      case 'payment_sent':
        return <Send className="w-5 h-5 text-blue-600" />;
      case 'security':
        return <Check className="w-5 h-5 text-orange-600" />;
      case 'promo':
        return <Bell className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'payment_received':
        return 'bg-green-100';
      case 'payment_sent':
        return 'bg-blue-100';
      case 'security':
        return 'bg-orange-100';
      case 'promo':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setLocation('/')}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="ml-2 text-xl font-bold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 text-sm font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
                  !notification.read ? 'border-blue-200 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationBgColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-400">{formatTimestamp(notification.timestamp)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default NotificationPage;
