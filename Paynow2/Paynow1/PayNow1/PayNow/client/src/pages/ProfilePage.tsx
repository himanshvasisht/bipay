
import { useAuth } from '@/contexts/AuthContext';
import BottomNavigation from '@/components/BottomNavigation';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Wallet, 
  Shield, 
  Settings, 
  HelpCircle, 
  LogOut,
  Edit,
  Copy,
  Fingerprint
} from 'lucide-react';
import { useLocation } from 'wouter';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      setLocation('/auth');
    }
  };

  const copyWalletId = () => {
    navigator.clipboard.writeText(user?.wallet_id || '');
    alert('Wallet ID copied to clipboard!');
  };

  const profileItems = [
    {
      icon: Settings,
      label: 'Account Settings',
      action: () => alert('Account settings coming soon'),
      description: 'Update your personal information'
    },
    {
      icon: Shield,
      label: 'Security Settings',
      action: () => alert('Security settings coming soon'),
      description: 'Manage your biometric settings'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => alert('Help center coming soon'),
      description: 'Get help and contact support'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center">
          <button
            onClick={() => setLocation('/')}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-2 text-xl font-bold text-gray-900">Profile</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</h2>
            <p className="text-gray-600 mb-4">BiPay User</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 flex items-center mx-auto">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Mobile Number</p>
                  <p className="text-sm text-gray-600">{user?.mobile}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Wallet ID</p>
                  <p className="text-sm text-gray-600 font-mono">{user?.wallet_id}</p>
                </div>
              </div>
              <button
                onClick={copyWalletId}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <Fingerprint className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Biometric Status</p>
                <p className="text-sm text-green-600">Enrolled & Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Current Balance</p>
              <p className="text-3xl font-bold">₹{user?.balance.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          {profileItems.map(({ icon: Icon, label, action, description }, index) => (
            <button
              key={label}
              onClick={action}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                index !== profileItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <Icon className="w-5 h-5 text-gray-400" />
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
              <div className="w-5 h-5 text-gray-400">→</div>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 border border-red-200 text-red-600 py-4 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>

        {/* App Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>BiPay v1.0.0</p>
          <p className="mt-1">Secure biometric payments</p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
