import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useBiometric } from '../contexts/BiometricContext';
import { apiClient } from '../lib/api';
import { 
  ArrowLeft, 
  User, 
  Fingerprint, 
  Send,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Shield,
  Zap,
  Star,
  Copy,
  QrCode,
  CreditCard
} from 'lucide-react';

interface FoundUser {
  id: string;
  name: string;
  bipay_id: string;
  avatar: string;
  biometric_enabled: boolean;
}

type PaymentStep = 'enter-bipay-id' | 'user-found' | 'enter-amount' | 'biometric-auth' | 'processing' | 'success' | 'failed';

const BiPayPaymentPage: React.FC = () => {
  const { user } = useAuth();
  const { scanFingerprint, isScanning, generateSignature } = useBiometric();
  const [, setLocation] = useLocation();
  
  const [currentStep, setCurrentStep] = useState<PaymentStep>('enter-bipay-id');
  const [bipayId, setBipayId] = useState('');
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handleBipayIdSearch = async () => {
    if (!bipayId.trim()) {
      setError('Please enter a BiPay ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.findUserByBipayId(bipayId.trim().toUpperCase());
      
      if (response.success && response.data) {
        setFoundUser(response.data);
        setCurrentStep('user-found');
      } else {
        setError('BiPay ID not found. Please check and try again.');
      }
    } catch (error) {
      setError('Failed to search BiPay ID. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountSubmit = () => {
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (user && amountValue > user.balance) {
      setError('Insufficient balance');
      return;
    }

    setCurrentStep('biometric-auth');
  };

  const handleBiometricAuth = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      // Generate payment signature with biometric
      const paymentData = {
        receiver_bipay_id: foundUser?.bipay_id,
        amount: parseFloat(amount),
        timestamp: Date.now(),
        sender_id: user?.id
      };
      
      const signature = await generateSignature(paymentData);
      
      if (signature) {
        setCurrentStep('processing');
        
        // Process payment with BiPay ID
        const response = await apiClient.payWithBipayId({
          receiver_bipay_id: foundUser!.bipay_id,
          amount: parseFloat(amount),
          note: note,
          signature: signature,
          device_id: sessionStorage.getItem('bipay_device_id') || 'web_device',
          nonce: Date.now().toString()
        });
        
        if (response.success) {
          setTransactionId(response.data.transaction_id);
          setCurrentStep('success');
          
          // Update balance in context
          if (user) {
            const { updateBalance } = require('../contexts/AuthContext');
            // updateBalance(user.balance - parseFloat(amount));
          }
        } else {
          setError(response.error || 'Payment failed');
          setCurrentStep('failed');
        }
      } else {
        setError('Biometric authentication failed');
        setCurrentStep('biometric-auth');
      }
    } catch (error) {
      setError('Payment processing failed');
      setCurrentStep('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPayment = () => {
    setCurrentStep('enter-bipay-id');
    setBipayId('');
    setFoundUser(null);
    setAmount('');
    setNote('');
    setError('');
    setTransactionId('');
  };

  const copyBipayId = () => {
    if (user?.bipay_id) {
      navigator.clipboard.writeText(user.bipay_id);
    }
  };

  const renderBipayIdEntry = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Your BiPay ID */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-professional">
        <h3 className="text-lg font-bold mb-3 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Your BiPay ID
        </h3>
        <div className="flex items-center justify-between bg-white bg-opacity-20 rounded-2xl p-4">
          <span className="text-xl font-mono font-bold tracking-wider">{user?.bipay_id}</span>
          <button 
            onClick={copyBipayId}
            className="p-2 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
        <p className="text-blue-100 text-sm mt-2">Share this ID to receive payments</p>
      </div>

      {/* Enter Receiver BiPay ID */}
      <div className="bg-white p-6 rounded-3xl shadow-professional border border-blue-100">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
          <Send className="w-5 h-5 mr-2 text-blue-600" />
          Send Money via BiPay ID
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Receiver's BiPay ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={bipayId}
                onChange={(e) => setBipayId(e.target.value.toUpperCase())}
                placeholder="Enter BiPay ID (e.g., BP1234ABCD)"
                className="w-full px-4 py-4 text-lg font-mono border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-wider"
                maxLength={10}
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleBipayIdSearch}
            disabled={!bipayId.trim() || isLoading}
            className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
              bipayId.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-professional hover:shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Searching...
              </div>
            ) : (
              'Find User'
            )}
          </button>
        </div>
      </div>

      {/* BiPay ID Format Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">BiPay ID Format</h4>
        <ul className="text-sm text-blue-600 space-y-1">
          <li>• BiPay ID format: BP followed by 8 characters</li>
          <li>• Example: BP1234ABCD</li>
          <li>• Case insensitive (automatically converted to uppercase)</li>
          <li>• Ask the receiver for their BiPay ID</li>
        </ul>
      </div>
    </div>
  );

  const renderUserFound = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Found User Card */}
      <div className="bg-white p-6 rounded-3xl shadow-professional border border-green-200">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-center text-lg font-bold text-blue-800 mb-4">User Found!</h3>
        
        <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center text-2xl">
            {foundUser?.avatar}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-800 text-lg">{foundUser?.name}</h4>
            <p className="text-blue-600 font-mono text-sm">{foundUser?.bipay_id}</p>
            <div className="flex items-center mt-2">
              {foundUser?.biometric_enabled ? (
                <div className="flex items-center text-green-600 text-sm">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Biometric Enabled</span>
                </div>
              ) : (
                <div className="flex items-center text-orange-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span>Basic Security</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setCurrentStep('enter-bipay-id')}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold"
          >
            Search Again
          </button>
          <button
            onClick={() => setCurrentStep('enter-amount')}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const renderAmountEntry = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Receiver Info */}
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
        <p className="text-blue-600 text-sm">Sending money to:</p>
        <div className="flex items-center space-x-3 mt-2">
          <span className="text-2xl">{foundUser?.avatar}</span>
          <div>
            <h4 className="font-bold text-blue-800">{foundUser?.name}</h4>
            <p className="text-blue-600 font-mono text-sm">{foundUser?.bipay_id}</p>
          </div>
        </div>
      </div>

      {/* Amount Entry */}
      <div className="bg-white p-6 rounded-3xl shadow-professional border border-blue-100">
        <h3 className="text-lg font-bold text-blue-800 mb-4">Enter Amount</h3>
        
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-blue-600">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {quickAmounts.map(quickAmount => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="p-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
              >
                ₹{quickAmount}
              </button>
            ))}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this payment for?"
              className="w-full px-4 py-3 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Balance Check */}
          {user && (
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-blue-600 text-sm">
                Available Balance: ₹{user.balance.toLocaleString()}
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleAmountSubmit}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
              amount && parseFloat(amount) > 0
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-professional'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Proceed to Pay
          </button>
        </div>
      </div>
    </div>
  );

  const renderBiometricAuth = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl shadow-professional border border-blue-100 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 biometric-scanner">
          <Fingerprint className="w-12 h-12 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-bold text-blue-800 mb-2">Biometric Authentication</h3>
        <p className="text-blue-600 mb-6">Place your finger on the sensor to confirm payment</p>
        
        <div className="bg-blue-50 p-4 rounded-2xl mb-6">
          <div className="flex justify-between text-sm text-blue-600 mb-2">
            <span>To:</span>
            <span>{foundUser?.name}</span>
          </div>
          <div className="flex justify-between text-sm text-blue-600 mb-2">
            <span>Amount:</span>
            <span className="font-bold">₹{amount}</span>
          </div>
          {note && (
            <div className="flex justify-between text-sm text-blue-600">
              <span>Note:</span>
              <span>{note}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentStep('enter-amount')}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold"
          >
            Back
          </button>
          <button
            onClick={handleBiometricAuth}
            disabled={isLoading}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl shadow-professional border border-blue-100 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Zap className="w-12 h-12 text-blue-600 animate-pulse" />
        </div>
        
        <h3 className="text-xl font-bold text-blue-800 mb-2">Processing Payment</h3>
        <p className="text-blue-600 mb-6">Please wait while we process your transaction</p>
        
        <div className="w-full bg-blue-100 rounded-full h-2 mb-4">
          <div className="bg-blue-600 h-2 rounded-full animate-loading-bar"></div>
        </div>
        
        <p className="text-blue-500 text-sm">Secured by BiPay biometric technology</p>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl shadow-professional border border-green-200 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h3 className="text-xl font-bold text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-green-600 mb-6">Your payment has been sent successfully</p>
        
        <div className="bg-green-50 p-4 rounded-2xl mb-6 text-left">
          <div className="flex justify-between text-sm text-green-600 mb-2">
            <span>Transaction ID:</span>
            <span className="font-mono">{transactionId}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600 mb-2">
            <span>To:</span>
            <span>{foundUser?.name}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600 mb-2">
            <span>Amount:</span>
            <span className="font-bold">₹{amount}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Time:</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={resetPayment}
            className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-semibold"
          >
            Send Another
          </button>
          <Link href="/">
            <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold">
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderFailed = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl shadow-professional border border-red-200 text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h3 className="text-xl font-bold text-red-800 mb-2">Payment Failed</h3>
        <p className="text-red-600 mb-6">{error || 'Something went wrong'}</p>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentStep('biometric-auth')}
            className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-semibold"
          >
            Try Again
          </button>
          <button
            onClick={resetPayment}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 'enter-bipay-id': return renderBipayIdEntry();
      case 'user-found': return renderUserFound();
      case 'enter-amount': return renderAmountEntry();
      case 'biometric-auth': return renderBiometricAuth();
      case 'processing': return renderProcessing();
      case 'success': return renderSuccess();
      case 'failed': return renderFailed();
      default: return renderBipayIdEntry();
    }
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
              <h1 className="text-2xl font-bold">BiPay Payment</h1>
              <p className="text-blue-100">Send money with biometric security</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Fingerprint className="w-6 h-6" />
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-md mx-auto">
          {getCurrentStepContent()}
        </div>
      </div>
    </div>
  );
};

export default BiPayPaymentPage;
