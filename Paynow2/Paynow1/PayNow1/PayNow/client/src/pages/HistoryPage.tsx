
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import BottomNavigation from '@/components/BottomNavigation';
import { ArrowLeft, Download, Send, Filter, Search, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'add_money';
  amount: number;
  recipient?: string;
  sender?: string;
  note?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  blockchain_id?: string;
}

const HistoryPage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'send' | 'receive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filter, searchQuery]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getTransactionHistory(user?.id || '');
      
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        // Demo data if API fails
        const demoTransactions: Transaction[] = [
          {
            id: '1',
            type: 'send',
            amount: 500,
            recipient: 'John Doe',
            note: 'Lunch payment',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'completed',
            blockchain_id: 'bc1234567890abcdef'
          },
          {
            id: '2',
            type: 'receive',
            amount: 1000,
            sender: 'Jane Smith',
            note: 'Rent share',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'completed',
            blockchain_id: 'bc0987654321fedcba'
          },
          {
            id: '3',
            type: 'add_money',
            amount: 2000,
            note: 'Wallet top-up',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            status: 'completed'
          }
        ];
        setTransactions(demoTransactions);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter);
    }

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <Send className="w-5 h-5 text-red-600" />;
      case 'receive':
        return <Download className="w-5 h-5 text-green-600" />;
      default:
        return <Download className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const downloadReceipt = (transactionId: string) => {
    apiClient.downloadReceipt(transactionId).then(receiptUrl => {
      window.open(receiptUrl, '_blank');
    });
  };

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
          <h1 className="ml-2 text-xl font-bold text-gray-900">Transaction History</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Search and Filter */}
        <div className="mb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search transactions..."
            />
          </div>

          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'send', label: 'Sent' },
              { key: 'receive', label: 'Received' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No transactions found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? 'Try adjusting your search' : 'Your transactions will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-xl p-4 shadow-sm border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.type === 'send' 
                          ? `To ${transaction.recipient}`
                          : transaction.type === 'receive'
                          ? `From ${transaction.sender}`
                          : 'Wallet Top-up'
                        }
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(transaction.timestamp)}</p>
                      {transaction.note && (
                        <p className="text-sm text-gray-500 mt-1">{transaction.note}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      transaction.type === 'send' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'send' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>

                {transaction.blockchain_id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Blockchain ID:</span>
                      <span className="text-xs font-mono text-gray-700">
                        {transaction.blockchain_id.substring(0, 12)}...
                      </span>
                    </div>
                    <button
                      onClick={() => downloadReceipt(transaction.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Receipt
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default HistoryPage;
