import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import MovingAdsCarousel from '../components/MovingAdsCarousel';
import { 
  CreditCard, 
  Send, 
  QrCode, 
  History,
  Smartphone,
  Zap,
  Wifi,
  Car,
  Home as HomeIcon,
  TrendingUp,
  Gift,
  Shield,
  Bell,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Star,
  Trophy,
  Target,
  Users,
  Fingerprint,
  Menu,
  Search,
  Plus
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [userName] = useState(user?.name || "User");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const quickActions = [
    { 
      icon: Send, 
      label: 'Send Money', 
      color: 'from-blue-600 to-indigo-600', 
      href: '/send',
      hasThumbprint: true
    },
    { 
      icon: ArrowDownLeft, 
      label: 'Receive', 
      color: 'from-indigo-500 to-purple-600', 
      href: '/receive' 
    },
    { 
      icon: Fingerprint, 
      label: 'BiPay Send', 
      color: 'from-green-500 to-emerald-600', 
      href: '/bipay-send',
      hasThumbprint: true
    },
    { 
      icon: CreditCard, 
      label: 'BiPay Request', 
      color: 'from-orange-500 to-red-600', 
      href: '/bipay-request' 
    },
    { 
      icon: History, 
      label: 'History', 
      color: 'from-blue-400 to-blue-600', 
      href: '/history' 
    }
  ];

  const paymentServices = [
    { icon: Smartphone, label: 'Mobile', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Zap, label: 'Electricity', color: 'text-blue-700', bg: 'bg-blue-50' },
    { icon: Wifi, label: 'Internet', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: Car, label: 'Fuel', color: 'text-blue-800', bg: 'bg-blue-50' },
    { icon: HomeIcon, label: 'Rent', color: 'text-indigo-700', bg: 'bg-indigo-50' },
    { icon: CreditCard, label: 'Cards', color: 'text-blue-600', bg: 'bg-blue-50' }
  ];

  const financialServices = [
    { icon: TrendingUp, label: 'Invest', subtitle: 'Mutual Funds & Stocks', color: 'from-blue-400 to-indigo-500' },
    { icon: Shield, label: 'Insurance', subtitle: 'Life & Health Plans', color: 'from-indigo-400 to-blue-500' },
    { icon: Target, label: 'Loans', subtitle: 'Personal & Business', color: 'from-blue-500 to-indigo-600' },
    { icon: Gift, label: 'Rewards', subtitle: 'Cashback & Offers', color: 'from-indigo-500 to-blue-600' }
  ];

  const recentTransactions = [
    { id: 1, type: 'sent', name: 'Sarah Wilson', amount: 250, time: '2 hours ago', avatar: '👩‍💼', status: 'success' },
    { id: 2, type: 'received', name: 'Grocery Store', amount: 85.50, time: '5 hours ago', avatar: '🏪', status: 'success' },
    { id: 3, type: 'sent', name: 'Electric Bill', amount: 120.75, time: 'Yesterday', avatar: '⚡', status: 'success' },
    { id: 4, type: 'received', name: 'John Smith', amount: 300, time: '2 days ago', avatar: '👨‍💻', status: 'success' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-20 -left-8 w-32 h-32 bg-indigo-200 rounded-full opacity-20 animate-gentle-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-300 rounded-full opacity-30 animate-float"></div>
        </div>

        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6 rounded-b-3xl shadow-professional-lg">
          {/* Header Row */}
          <div className="flex justify-between items-center mb-6 animate-fade-in-up">
            <div className="flex items-center space-x-3">
              <Menu className="w-6 h-6 text-white opacity-80" />
              <div>
                <h1 className="text-2xl font-bold">{greeting}, {userName}! 👋</h1>
                <p className="text-blue-100 mt-1">Welcome to BiPay</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Search className="w-6 h-6 text-white opacity-80" />
              <div className="relative">
                <Bell className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full notification-badge"></div>
              </div>
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-lg">💼</span>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="glass-card p-6 rounded-3xl animate-fade-in-scale border border-white border-opacity-20" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-blue-100 text-sm font-medium">Total Balance</span>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300"
              >
                {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-bold amount-display">
                  ₹{balanceVisible ? (user?.balance || 0).toLocaleString() : '••••••'}
                </span>
                <div className="flex items-center text-green-300 text-sm">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+2.5%</span>
                </div>
              </div>
              <Fingerprint className="w-8 h-8 text-blue-300 opacity-60" />
            </div>
            <p className="text-blue-100 text-sm mt-2">Available for spending</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Moving Ads Carousel */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <MovingAdsCarousel />
        </section>

        {/* Quick Actions */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
            <Star className="w-5 h-5 text-blue-500 mr-2" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className={`quick-action p-6 rounded-3xl bg-gradient-to-br ${action.color} text-white shadow-professional card-hover btn-ripple relative`}>
                  <div className={`w-8 h-8 mb-3 mx-auto ${action.hasThumbprint ? 'thumbprint-loading' : ''}`}>
                    <action.icon className="w-8 h-8" />
                  </div>
                  <p className="text-center font-semibold text-sm">{action.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Payment Services */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-800 flex items-center">
              <Zap className="w-5 h-5 text-blue-500 mr-2" />
              Pay Bills & Recharge
            </h2>
            <div className="flex gap-2">
              <Link href="/biometric-demo">
                <button className="text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                  🔐 Biometric System
                </button>
              </Link>
              <Link href="/ecosystem-demo">
                <button className="text-purple-600 text-sm font-medium bg-purple-50 px-3 py-1 rounded-full">
                  🚀 Demo Ecosystem
                </button>
              </Link>
              <Link href="/bills">
                <button className="text-blue-600 text-sm font-medium">View All</button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {paymentServices.map((service, index) => (
              <Link key={index} href="/bills">
                <div className={`card-hover p-4 ${service.bg} rounded-2xl shadow-professional text-center border border-blue-100 transition-all duration-300 hover:scale-105`}>
                  <service.icon className={`w-8 h-8 mx-auto mb-2 ${service.color}`} />
                  <p className="text-xs font-medium text-blue-700">{service.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Financial Services */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
            <Trophy className="w-5 h-5 text-blue-500 mr-2" />
            Financial Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financialServices.map((service, index) => (
              <div key={index} className={`card-hover p-6 bg-gradient-to-r ${service.color} text-white rounded-3xl shadow-professional btn-ripple`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{service.label}</h3>
                    <p className="text-sm opacity-90">{service.subtitle}</p>
                  </div>
                  <service.icon className="w-8 h-8" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-800 flex items-center">
              <History className="w-5 h-5 text-blue-500 mr-2" />
              Recent Activity
            </h2>
            <Link href="/history" className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <div key={transaction.id} className="history-item bg-white p-4 rounded-2xl shadow-professional flex items-center space-x-4 border border-blue-50 animate-fade-in-up" style={{ animationDelay: `${1.2 + index * 0.1}s` }}>
                <div className="history-avatar w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl transition-all duration-300">
                  {transaction.avatar}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800">{transaction.name}</h3>
                  <p className="history-time text-sm text-blue-500 transition-colors duration-300">{transaction.time}</p>
                </div>
                
                <div className="text-right">
                  <p className={`history-amount font-bold transition-all duration-300 ${transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.type === 'sent' ? '-' : '+'}₹{transaction.amount}
                  </p>
                  <div className="flex items-center justify-end space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-xs text-blue-600 font-medium">Success</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="card-hover p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl shadow-professional">
              <Users className="w-8 h-8 mb-3" />
              <h3 className="text-2xl font-bold">12</h3>
              <p className="text-sm opacity-90">Contacts</p>
            </div>
            
            <div className="card-hover p-6 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-3xl shadow-professional">
              <Trophy className="w-8 h-8 mb-3" />
              <h3 className="text-2xl font-bold">₹2.1k</h3>
              <p className="text-sm opacity-90">Rewards Earned</p>
            </div>
            
            <div className="card-hover p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-professional md:col-span-1 col-span-2">
              <Target className="w-8 h-8 mb-3" />
              <h3 className="text-2xl font-bold">₹15k</h3>
              <p className="text-sm opacity-90">Monthly Goal</p>
            </div>
          </div>
        </section>
      </div>

      {/* Professional Footer */}
      <footer className="mt-12 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white p-8 rounded-t-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-300">B</span>
                </div>
                <h3 className="text-2xl font-bold">BiPay</h3>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed mb-4">
                Experience the future of digital payments with BiPay. Secure, fast, and reliable payment solutions for everyone.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-blue-200">Bank Grade Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-200">Biometric Auth</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-blue-300 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><Link href="/send" className="hover:text-white transition-colors">Send Money</Link></li>
                <li><Link href="/history" className="hover:text-white transition-colors">Transaction History</Link></li>
                <li><Link href="/cards" className="hover:text-white transition-colors">Manage Cards</Link></li>
                <li><Link href="/settings" className="hover:text-white transition-colors">Settings</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-blue-300 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-blue-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-300 text-sm">
              © 2024 BiPay. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-xs text-blue-400">Version 2.1.0</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-gentle-pulse"></div>
                <span className="text-xs text-blue-300">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
