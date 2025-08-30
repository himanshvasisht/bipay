import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Plus,
  Wallet,
  CreditCard,
  Building,
  Smartphone,
  Zap,
  Gift,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Star,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Receipt,
  Users,
  Settings,
  HelpCircle,
  Repeat,
  DollarSign,
  Info,
  ChevronRight,
  X,
  Check,
  Fingerprint,
  Key
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'bank' | 'card' | 'upi' | 'wallet';
  name: string;
  details: string;
  logo: string;
  isDefault: boolean;
  verified: boolean;
  balance?: number;
  lastUsed?: Date;
  offers?: string[];
}

interface AddMoneyOffer {
  id: string;
  title: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  cashback: number;
  validity: Date;
  terms: string[];
  icon: string;
}

interface Transaction {
  id: string;
  type: 'add_money' | 'cashback' | 'refund';
  amount: number;
  status: 'success' | 'pending' | 'failed';
  timestamp: Date;
  method: string;
  reference: string;
}

const AddMoneyPageNew: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showMethods, setShowMethods] = useState(false);
  const [showOffers, setShowOffers] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<string>('');
  const [showSecurityPin, setShowSecurityPin] = useState(false);
  const [pin, setPin] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentBalance = 5420;
  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'hdfc_bank',
      type: 'bank',
      name: 'HDFC Bank',
      details: 'Account ****8765',
      logo: '🏦',
      isDefault: true,
      verified: true,
      lastUsed: new Date(2024, 7, 28),
      offers: ['No charges', 'Instant transfer']
    },
    {
      id: 'icici_card',
      type: 'card',
      name: 'ICICI Credit Card',
      details: '**** **** **** 1234',
      logo: '💳',
      isDefault: false,
      verified: true,
      lastUsed: new Date(2024, 7, 25),
      offers: ['2% cashback', 'No convenience fee']
    },
    {
      id: 'gpay_upi',
      type: 'upi',
      name: 'Google Pay',
      details: 'alex@oksbi',
      logo: '📱',
      isDefault: false,
      verified: true,
      lastUsed: new Date(2024, 7, 27),
      offers: ['Instant transfer', 'UPI rewards']
    },
    {
      id: 'paytm_wallet',
      type: 'wallet',
      name: 'Paytm Wallet',
      details: 'Balance: ₹2,350',
      logo: '👛',
      isDefault: false,
      verified: true,
      balance: 2350,
      offers: ['Transfer to BiPay']
    }
  ];

  const offers: AddMoneyOffer[] = [
    {
      id: 'welcome_offer',
      title: 'First Add Money Bonus',
      description: 'Get ₹50 cashback on first add money of ₹500+',
      minAmount: 500,
      maxAmount: 10000,
      cashback: 50,
      validity: new Date(2024, 8, 15),
      terms: ['Valid for new users only', 'One time offer', 'Cashback within 24 hours'],
      icon: '🎉'
    },
    {
      id: 'weekend_special',
      title: 'Weekend Special',
      description: 'Add ₹1000+ and get 5% cashback up to ₹100',
      minAmount: 1000,
      maxAmount: 2000,
      cashback: 5,
      validity: new Date(2024, 8, 31),
      terms: ['Valid on weekends', 'Max cashback ₹100', 'Valid till month end'],
      icon: '🎁'
    },
    {
      id: 'premium_boost',
      title: 'Premium Member Boost',
      description: 'Premium users get extra 3% cashback on all add money',
      minAmount: 100,
      maxAmount: 50000,
      cashback: 3,
      validity: new Date(2024, 9, 30),
      terms: ['Premium members only', 'Unlimited usage', 'Auto applied'],
      icon: '👑'
    }
  ];

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      type: 'add_money',
      amount: 2000,
      status: 'success',
      timestamp: new Date(2024, 7, 28, 14, 30),
      method: 'HDFC Bank',
      reference: 'TXN123456789'
    },
    {
      id: '2',
      type: 'cashback',
      amount: 50,
      status: 'success',
      timestamp: new Date(2024, 7, 27, 16, 45),
      method: 'Weekend Special',
      reference: 'CB987654321'
    },
    {
      id: '3',
      type: 'add_money',
      amount: 1500,
      status: 'pending',
      timestamp: new Date(2024, 7, 27, 12, 20),
      method: 'ICICI Card',
      reference: 'TXN456789123'
    }
  ];

  const selectedMethodData = paymentMethods.find(method => method.id === selectedMethod);
  const selectedOfferData = offers.find(offer => offer.id === selectedOffer);
  const amountValue = parseFloat(amount) || 0;

  const calculateCashback = () => {
    if (!selectedOfferData || amountValue < selectedOfferData.minAmount) return 0;
    
    if (selectedOfferData.id === 'weekend_special') {
      return Math.min((amountValue * selectedOfferData.cashback) / 100, 100);
    }
    
    if (selectedOfferData.id === 'welcome_offer') {
      return selectedOfferData.cashback;
    }
    
    return (amountValue * selectedOfferData.cashback) / 100;
  };

  const cashback = calculateCashback();
  const finalAmount = amountValue + cashback;

  const handleAddMoney = async () => {
    if (!amountValue || !selectedMethod) return;
    
    setShowSecurityPin(true);
  };

  const processPayment = async () => {
    if (pin.length !== 4) return;
    
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSecurityPin(false);
      setAmount('');
      setPin('');
      // Show success message
    }, 3000);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank': return Building;
      case 'card': return CreditCard;
      case 'upi': return Smartphone;
      case 'wallet': return Wallet;
      default: return CreditCard;
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'bank': return 'bg-blue-100 text-blue-700';
      case 'card': return 'bg-purple-100 text-purple-700';
      case 'upi': return 'bg-green-100 text-green-700';
      case 'wallet': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              <h1 className="text-2xl font-bold">Add Money</h1>
              <p className="text-blue-100">Top up your BiPay wallet</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">Current Balance</p>
            <p className="text-xl font-bold">₹{currentBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Amount Section */}
          <div className="bg-white p-6 rounded-2xl shadow-professional border border-blue-100 animate-fade-in-up">
            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
              Enter Amount
            </h3>
            
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-blue-600">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map(quickAmount => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className={`p-3 rounded-xl font-semibold transition-all duration-300 ${
                    amount === quickAmount.toString()
                      ? 'bg-blue-600 text-white shadow-professional'
                      : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  ₹{quickAmount.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Amount Validation */}
            {amountValue > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                {amountValue < 10 && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Minimum amount is ₹10
                  </p>
                )}
                {amountValue > 100000 && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Maximum amount is ₹1,00,000
                  </p>
                )}
                {amountValue >= 10 && amountValue <= 100000 && (
                  <p className="text-green-600 text-sm flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Valid amount
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Offers Section */}
          {showOffers && offers.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-professional border border-blue-100 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-blue-800 flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-blue-600" />
                  Special Offers
                </h3>
                <button 
                  onClick={() => setShowOffers(false)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {offers.map(offer => (
                  <button
                    key={offer.id}
                    onClick={() => setSelectedOffer(selectedOffer === offer.id ? '' : offer.id)}
                    className={`w-full p-4 border rounded-2xl transition-all duration-300 text-left ${
                      selectedOffer === offer.id
                        ? 'border-blue-500 bg-blue-50 shadow-professional'
                        : 'border-blue-200 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{offer.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-800">{offer.title}</h4>
                        <p className="text-sm text-blue-600 mt-1">{offer.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-blue-500">
                          <span>Min: ₹{offer.minAmount}</span>
                          <span>Valid till: {offer.validity.toLocaleDateString()}</span>
                        </div>
                      </div>
                      {selectedOffer === offer.id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-professional border border-blue-100 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Payment Method
            </h3>

            {!selectedMethod ? (
              <div className="space-y-3">
                {paymentMethods.map(method => {
                  const Icon = getMethodIcon(method.type);
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className="w-full flex items-center space-x-4 p-4 border border-blue-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getMethodColor(method.type)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-blue-800">{method.name}</h4>
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Default</span>
                          )}
                          {method.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-blue-600">{method.details}</p>
                        {method.offers && method.offers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {method.offers.map((offer, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                {offer}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-400" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getMethodColor(selectedMethodData?.type || '')}`}>
                    {React.createElement(getMethodIcon(selectedMethodData?.type || ''))}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800">{selectedMethodData?.name}</h4>
                    <p className="text-sm text-blue-600">{selectedMethodData?.details}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedMethod('')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Change
                  </button>
                </div>

                {/* Transaction Summary */}
                {amountValue > 0 && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3">Transaction Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-600">Amount to add:</span>
                        <span className="font-semibold text-blue-800">₹{amountValue.toLocaleString()}</span>
                      </div>
                      {cashback > 0 && (
                        <>
                          <div className="flex justify-between text-green-600">
                            <span>Cashback ({selectedOfferData?.title}):</span>
                            <span className="font-semibold">+₹{cashback.toFixed(0)}</span>
                          </div>
                          <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-blue-800">
                            <span>You'll receive:</span>
                            <span>₹{finalAmount.toFixed(0)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          {recentTransactions.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-professional border border-blue-100 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-blue-600" />
                Recent Add Money
              </h3>

              <div className="space-y-3">
                {recentTransactions.slice(0, 3).map(transaction => (
                  <div key={transaction.id} className="flex items-center space-x-3 p-3 border border-blue-100 rounded-xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      transaction.type === 'add_money' ? 'bg-blue-100 text-blue-700' :
                      transaction.type === 'cashback' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {transaction.type === 'add_money' ? <Plus className="w-5 h-5" /> :
                       transaction.type === 'cashback' ? <Gift className="w-5 h-5" /> :
                       <ArrowDownLeft className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-blue-800">
                          {transaction.type === 'add_money' ? 'Added Money' :
                           transaction.type === 'cashback' ? 'Cashback' : 'Refund'}
                        </h4>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === 'success' ? 'bg-green-100 text-green-700' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {transaction.status}
                        </div>
                      </div>
                      <p className="text-sm text-blue-600">{transaction.method}</p>
                      <p className="text-xs text-blue-400">{formatDate(transaction.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+₹{transaction.amount}</p>
                      <p className="text-xs text-blue-400">{transaction.reference}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/history">
                <button className="w-full mt-4 py-3 text-blue-600 font-semibold border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                  View All Transactions
                </button>
              </Link>
            </div>
          )}

          {/* Add Money Button */}
          <button
            onClick={handleAddMoney}
            disabled={!amountValue || !selectedMethod || amountValue < 10 || amountValue > 100000}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              amountValue && selectedMethod && amountValue >= 10 && amountValue <= 100000
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-professional hover:shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!amountValue ? 'Enter Amount' :
             !selectedMethod ? 'Select Payment Method' :
             `Add ₹${amountValue.toLocaleString()} to Wallet`}
          </button>
        </div>
      </div>

      {/* Security PIN Modal */}
      {showSecurityPin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-in-up">
            {!isProcessing ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-800 mb-2">Enter Security PIN</h3>
                  <p className="text-blue-600">Confirm your transaction with 4-digit PIN</p>
                </div>

                <div className="flex justify-center space-x-3 mb-6">
                  {[0, 1, 2, 3].map(index => (
                    <div
                      key={index}
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold ${
                        pin.length > index
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : 'border-blue-200 bg-white'
                      }`}
                    >
                      {pin.length > index ? '●' : ''}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, ''].map((num, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (num === '') {
                          if (index === 11) setPin(pin.slice(0, -1)); // Delete
                          return;
                        }
                        if (pin.length < 4) setPin(pin + num);
                      }}
                      className={`h-12 rounded-xl font-bold text-lg transition-colors ${
                        num === ''
                          ? index === 11
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-transparent'
                          : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                      }`}
                    >
                      {num === '' && index === 11 ? '⌫' : num}
                    </button>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowSecurityPin(false);
                      setPin('');
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={pin.length !== 4}
                    className={`flex-1 py-3 rounded-xl font-semibold ${
                      pin.length === 4
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-blue-800 mb-2">Processing Payment</h3>
                <p className="text-blue-600">Please wait while we process your transaction...</p>
                <div className="mt-4 w-full bg-blue-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-loading-bar"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMoneyPageNew;
