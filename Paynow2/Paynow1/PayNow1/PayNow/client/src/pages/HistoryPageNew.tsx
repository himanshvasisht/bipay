import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Search,
  Filter,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Receipt,
  Repeat,
  Users,
  CreditCard,
  Smartphone,
  Zap,
  MoreVertical,
  Star,
  MapPin
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'bill' | 'recharge' | 'investment';
  status: 'success' | 'pending' | 'failed';
  amount: number;
  title: string;
  subtitle: string;
  timestamp: Date;
  avatar: string;
  category: string;
  merchant?: string;
  location?: string;
  cashback?: number;
  recurring?: boolean;
}

const HistoryPageNew: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sent' | 'received' | 'bills'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(true);

  const periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' }
  ];

  const filters = [
    { key: 'all', label: 'All', icon: Receipt },
    { key: 'sent', label: 'Sent', icon: ArrowUpRight },
    { key: 'received', label: 'Received', icon: ArrowDownLeft },
    { key: 'bills', label: 'Bills', icon: CreditCard }
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'sent',
      status: 'success',
      amount: 1250,
      title: 'Sarah Wilson',
      subtitle: 'Lunch payment',
      timestamp: new Date(2024, 7, 29, 14, 30),
      avatar: '👩‍💼',
      category: 'Friends'
    },
    {
      id: '2',
      type: 'received',
      status: 'success',
      amount: 2500,
      title: 'John Smith',
      subtitle: 'Freelance work payment',
      timestamp: new Date(2024, 7, 29, 10, 15),
      avatar: '👨‍💻',
      category: 'Work',
      cashback: 25
    },
    {
      id: '3',
      type: 'bill',
      status: 'success',
      amount: 1850,
      title: 'Electricity Bill',
      subtitle: 'BESCOM Ltd.',
      timestamp: new Date(2024, 7, 28, 16, 45),
      avatar: '⚡',
      category: 'Utilities',
      merchant: 'BESCOM',
      recurring: true
    },
    {
      id: '4',
      type: 'recharge',
      status: 'success',
      amount: 399,
      title: 'Mobile Recharge',
      subtitle: 'Airtel - 9876543210',
      timestamp: new Date(2024, 7, 28, 12, 20),
      avatar: '📱',
      category: 'Telecom'
    },
    {
      id: '5',
      type: 'sent',
      status: 'pending',
      amount: 5000,
      title: 'Emma Davis',
      subtitle: 'Birthday gift',
      timestamp: new Date(2024, 7, 27, 18, 30),
      avatar: '👩‍🎓',
      category: 'Friends'
    },
    {
      id: '6',
      type: 'investment',
      status: 'success',
      amount: 10000,
      title: 'SIP Investment',
      subtitle: 'Axis Bluechip Fund',
      timestamp: new Date(2024, 7, 25, 9, 0),
      avatar: '📈',
      category: 'Investment',
      recurring: true
    },
    {
      id: '7',
      type: 'received',
      status: 'failed',
      amount: 750,
      title: 'Mike Johnson',
      subtitle: 'Payment failed - insufficient balance',
      timestamp: new Date(2024, 7, 24, 20, 15),
      avatar: '👨‍🔧',
      category: 'Friends'
    }
  ];

  const stats = {
    totalSpent: 18499,
    totalReceived: 3250,
    totalTransactions: 47,
    avgTransaction: 463,
    monthlyTrend: 12.5,
    topCategory: 'Utilities',
    cashbackEarned: 145
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'sent' && transaction.type === 'sent') ||
                         (selectedFilter === 'received' && transaction.type === 'received') ||
                         (selectedFilter === 'bills' && (transaction.type === 'bill' || transaction.type === 'recharge'));
    
    const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return XCircle;
      default: return AlertCircle;
    }
  };

  const renderStats = () => (
    <div className="space-y-4 mb-6 animate-fade-in-up">
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-professional-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Transaction Overview</h3>
            <p className="text-blue-100 text-sm">{periods.find(p => p.key === selectedPeriod)?.label}</p>
          </div>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
            stats.monthlyTrend > 0 ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'
          }`}>
            {stats.monthlyTrend > 0 ? 
              <TrendingUp className="w-4 h-4 text-green-300" /> :
              <TrendingDown className="w-4 h-4 text-red-300" />
            }
            <span className="text-sm font-medium">{Math.abs(stats.monthlyTrend)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-200 text-sm">Total Spent</p>
            <p className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Total Received</p>
            <p className="text-2xl font-bold">₹{stats.totalReceived.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-professional text-center border border-blue-100">
          <Receipt className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-blue-800">{stats.totalTransactions}</div>
          <div className="text-xs text-blue-500">Transactions</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-professional text-center border border-blue-100">
          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-blue-800">₹{stats.avgTransaction}</div>
          <div className="text-xs text-blue-500">Average</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-professional text-center border border-blue-100">
          <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-blue-800">₹{stats.cashbackEarned}</div>
          <div className="text-xs text-blue-500">Cashback</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-professional text-center border border-blue-100">
          <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-blue-800">{stats.topCategory}</div>
          <div className="text-xs text-blue-500">Top Category</div>
        </div>
      </div>
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
              <h1 className="text-2xl font-bold">Transaction History</h1>
              <p className="text-blue-100">Track all your payments</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300">
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowStats(!showStats)}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-md mx-auto">
          {/* Stats Section */}
          {showStats && renderStats()}

          {/* Search & Filters */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
              />
            </div>

            {/* Time Period Filter */}
            <div className="bg-white p-2 rounded-2xl shadow-professional border border-blue-100 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="grid grid-cols-3 gap-1">
                {periods.map((period) => (
                  <button
                    key={period.key}
                    onClick={() => setSelectedPeriod(period.key as any)}
                    className={`p-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      selectedPeriod === period.key
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-professional'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction Type Filter */}
            <div className="flex space-x-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                    selectedFilter === filter.key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <filter.icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 animate-fade-in-up">
                <Receipt className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-800 mb-2">No transactions found</h3>
                <p className="text-blue-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredTransactions.map((transaction, index) => {
                const StatusIcon = getStatusIcon(transaction.status);
                return (
                  <div 
                    key={transaction.id} 
                    className="bg-white p-4 rounded-2xl shadow-professional border border-blue-50 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl">
                          {transaction.avatar}
                        </div>
                        {transaction.recurring && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Repeat className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Transaction Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-blue-800 truncate">{transaction.title}</h3>
                          {transaction.type === 'sent' && <ArrowUpRight className="w-4 h-4 text-red-500" />}
                          {transaction.type === 'received' && <ArrowDownLeft className="w-4 h-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-blue-500 truncate">{transaction.subtitle}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-blue-400">{formatDate(transaction.timestamp)}</span>
                          <span className="text-xs text-blue-300">•</span>
                          <span className="text-xs text-blue-400">{formatTime(transaction.timestamp)}</span>
                          {transaction.location && (
                            <>
                              <span className="text-xs text-blue-300">•</span>
                              <MapPin className="w-3 h-3 text-blue-400" />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Amount & Status */}
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`font-bold ${
                            transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'sent' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-2">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span className="text-xs font-medium capitalize">{transaction.status}</span>
                          </div>
                        </div>

                        {transaction.cashback && (
                          <div className="mt-1">
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              +₹{transaction.cashback} cashback
                            </span>
                          </div>
                        )}
                      </div>

                      {/* More Options */}
                      <button className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Load More */}
          {filteredTransactions.length > 0 && (
            <div className="text-center mt-8 animate-fade-in-up" style={{ animationDelay: '1s' }}>
              <button className="px-6 py-3 bg-white border-2 border-blue-200 text-blue-600 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300">
                Load More Transactions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPageNew;
