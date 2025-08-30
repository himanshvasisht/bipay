import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useBiometric } from '../contexts/BiometricContext';
import { apiClient } from '../lib/api';
import { 
  ArrowLeft, 
  User, 
  Fingerprint, 
  DollarSign,
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
  CreditCard,
  Send,
  MessageCircle,
  Bell
} from 'lucide-react';

interface FoundUser {
  id: string;
  name: string;
  bipay_id: string;
  avatar: string;
  biometric_enabled: boolean;
}

type RequestStep = 'enter-bipay-id' | 'user-found' | 'enter-amount' | 'send-request' | 'request-sent' | 'failed';

const BiPayRequestPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [currentStep, setCurrentStep] = useState<RequestStep>('enter-bipay-id');
  const [bipayId, setBipayId] = useState('');
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [requestId, setRequestId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

    setCurrentStep('send-request');
  };

  const handleSendRequest = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const response = await apiClient.requestPaymentWithBipayId({
        receiver_bipay_id: foundUser!.bipay_id,
        amount: parseFloat(amount),
        note: note,
        signature: `request_${Date.now()}`,
        device_id: sessionStorage.getItem('bipay_device_id') || 'web_device'
      });
      
      if (response.success) {
        setRequestId(response.data.request_id);
        setCurrentStep('request-sent');
      } else {
        setError(response.error || 'Failed to send payment request');
        setCurrentStep('failed');
      }
    } catch (error) {
      setError('Failed to send payment request');
      setCurrentStep('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetRequest = () => {
    setCurrentStep('enter-bipay-id');
    setBipayId('');
    setFoundUser(null);
    setAmount('');
    setNote('');
    setError('');
    setRequestId('');
  };

  const copyBipayId = () => {
    if (user?.bipay_id) {
      navigator.clipboard.writeText(user.bipay_id);
    }
  };

  const renderBipayIdEntry = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Your BiPay ID */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-3xl shadow-professional">
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
        <p className="text-green-100 text-sm mt-2">Your unique payment identifier</p>
      </div>

      {/* Request from BiPay ID */}
      <div className="bg-white p-6 rounded-3xl shadow-professional border border-green-100">
        <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Request Money via BiPay ID
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-800 mb-2">
              Payer's BiPay ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={bipayId}
                onChange={(e) => setBipayId(e.target.value.toUpperCase())}
                placeholder="Enter BiPay ID (e.g., BP1234ABCD)"
                className="w-full px-4 py-4 text-lg font-mono border border-green-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase tracking-wider"
                maxLength={10}
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
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
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-professional hover:shadow-lg'
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
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
        <h4 className="text-sm font-semibold text-green-800 mb-2">BiPay Request System</h4>
        <ul className="text-sm text-green-600 space-y-1">
          <li>• Enter the BiPay ID of the person who should pay you</li>
          <li>• They will receive a payment request notification</li>
          <li>• They can approve using their biometric authentication</li>
          <li>• Secure and instant money transfer</li>
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
        <h3 className="text-center text-lg font-bold text-green-800 mb-4">User Found!</h3>
        
        <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center text-2xl">
            {foundUser?.avatar}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-green-800 text-lg">{foundUser?.name}</h4>
            <p className="text-green-600 font-mono text-sm">{foundUser?.bipay_id}</p>
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
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const renderAmountEntry = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Payer Info */}
      <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
        <p className="text-green-600 text-sm">Requesting money from:</p>
        <div className="flex items-center space-x-3 mt-2">
          <span className="text-2xl">{foundUser?.avatar}</span>
          <div>
            <h4 className="font-bold text-green-800">{foundUser?.name}</h4>
            <p className="text-green-600 font-mono text-sm">{foundUser?.bipay_id}</p>
          </div>
        </div>
      </div>

      {/* Amount Entry */}
      <div className="bg-white p-6 rounded-3xl shadow-professional border border-green-100">
        <h3 className="text-lg font-bold text-green-800 mb-4">Request Amount</h3>
        
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-green-600">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-green-800 bg-green-50 border border-green-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {quickAmounts.map(quickAmount => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="p-3 bg-green-50 text-green-600 rounded-xl font-semibold hover:bg-green-100 transition-colors"
              >
                ₹{quickAmount}
              </button>
            ))}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-green-800 mb-2">
              Reason for Request (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this payment for?"
              className="w-full px-4 py-3 border border-green-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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
            onClick={handleAmountSubmit}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
              amount && parseFloat(amount) > 0
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-professional'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Proceed to Send Request
          </button>
        </div>
      </div>
    </div>
  );

  const renderSendRequest = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl shadow-professional border border-green-100 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bell className="w-12 h-12 text-green-600" />
        </div>
        
        <h3 className="text-xl font-bold text-green-800 mb-2">Send Payment Request</h3>
        <p className="text-green-600 mb-6">Review your request before sending</p>
        
        <div className="bg-green-50 p-4 rounded-2xl mb-6">
          <div className="flex justify-between text-sm text-green-600 mb-2">
            <span>From:</span>
            <span>{foundUser?.name}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600 mb-2">
            <span>Amount:</span>
            <span className="font-bold">₹{amount}</span>
          </div>
          {note && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Reason:</span>
              <span>{note}</span>
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-semibold text-amber-800 mb-1">How BiPay Requests Work</h4>
              <p className="text-sm text-amber-700">
                The user will receive a notification and can approve the payment using their biometric authentication. 
                You'll be notified once they complete the payment.
              </p>
            </div>
          </div>
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
            onClick={handleSendRequest}
            disabled={isLoading}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderRequestSent = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl shadow-professional border border-green-200 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h3 className="text-xl font-bold text-green-800 mb-2">Request Sent Successfully!</h3>
        <p className="text-green-600 mb-6">Your payment request has been sent</p>
        
        <div className="bg-green-50 p-4 rounded-2xl mb-6 text-left">
          <div className="flex justify-between text-sm text-green-600 mb-2">
            <span>Request ID:</span>
            <span className="font-mono">{requestId}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600 mb-2">
            <span>From:</span>
            <span>{foundUser?.name}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600 mb-2">
            <span>Amount:</span>
            <span className="font-bold">₹{amount}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Status:</span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Pending
            </span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">What happens next?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {foundUser?.name} will receive a notification</li>
                <li>• They can review and approve your request</li>
                <li>• Payment will be processed using biometric authentication</li>
                <li>• You'll receive confirmation once completed</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={resetRequest}
            className="flex-1 py-3 bg-green-600 text-white rounded-2xl font-semibold"
          >
            Send Another Request
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
        
        <h3 className="text-xl font-bold text-red-800 mb-2">Request Failed</h3>
        <p className="text-red-600 mb-6">{error || 'Something went wrong'}</p>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentStep('send-request')}
            className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-semibold"
          >
            Try Again
          </button>
          <button
            onClick={resetRequest}
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
      case 'send-request': return renderSendRequest();
      case 'request-sent': return renderRequestSent();
      case 'failed': return renderFailed();
      default: return renderBipayIdEntry();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 shadow-professional-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Request Money</h1>
              <p className="text-green-100">Request payment via BiPay ID</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-6 h-6" />
            <Bell className="w-6 h-6" />
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

export default BiPayRequestPage;
