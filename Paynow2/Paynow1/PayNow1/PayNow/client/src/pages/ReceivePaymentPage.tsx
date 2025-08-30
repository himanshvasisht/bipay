
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  QrCode, 
  Share, 
  Copy, 
  Check,
  Download,
  Users,
  Smartphone,
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Wallet,
  CreditCard,
  Banknote,
  Gift,
  DollarSign,
  Share2
} from 'lucide-react';

const ReceivePaymentPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'qr' | 'request' | 'link'>('qr');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestNote, setRequestNote] = useState('');

  const userProfile = {
    name: "Alex Kumar",
    phone: "+91 98765 43210",
    upiId: "alex@bipay",
    wallet_id: "BIPAY123456789",
    qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjYwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjEwMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48L3N2Zz4="
  };

  const quickAmounts = [100, 500, 1000, 2000];

  const paymentMethods = [
    { icon: QrCode, label: 'QR Code', description: 'Show QR to receive payments', active: true },
    { icon: Smartphone, label: 'Request Money', description: 'Send payment request to contacts', active: false },
    { icon: Share, label: 'Payment Link', description: 'Share payment link anywhere', active: false }
  ];

  const shareOptions = [
    { icon: MessageCircle, label: 'WhatsApp', color: 'bg-green-500' },
    { icon: Mail, label: 'Email', color: 'bg-blue-500' },
    { icon: Smartphone, label: 'SMS', color: 'bg-indigo-500' },
    { icon: Instagram, label: 'Instagram', color: 'bg-pink-500' },
    { icon: Facebook, label: 'Facebook', color: 'bg-blue-600' },
    { icon: Twitter, label: 'Twitter', color: 'bg-blue-400' }
  ];

  const recentRequests = [
    { id: 1, name: 'Sarah Wilson', amount: 500, status: 'pending', time: '2 hours ago', avatar: '👩‍💼' },
    { id: 2, name: 'John Smith', amount: 1200, status: 'paid', time: '1 day ago', avatar: '👨‍💻' },
    { id: 3, name: 'Emma Davis', amount: 750, status: 'declined', time: '2 days ago', avatar: '👩‍🎓' }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePaymentLink = () => {
    const baseUrl = 'https://bipay.app/pay/';
    const params = new URLSearchParams({
      to: userProfile.upiId,
      amount: amount || '0',
      note: note || ''
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const sharePaymentLink = () => {
    const link = generatePaymentLink();
    if (navigator.share) {
      navigator.share({
        title: 'BiPay Payment Request',
        text: `Pay me ₹${requestAmount || amount} via BiPay`,
        url: link,
      });
    } else {
      copyToClipboard(link);
    }
  };

  const copyWalletId = () => {
    copyToClipboard(userProfile.wallet_id);
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
          <h1 className="ml-2 text-xl font-bold text-gray-900">Receive Payment</h1>
        </div>
      </div>

      <div className="p-4">
        {/* BiPay ID Section - Primary */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-6 mb-6 shadow-professional">
          <div className="text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Your BiPay ID</h3>
            <div className="bg-white bg-opacity-20 rounded-2xl p-4 mb-4">
              <span className="text-2xl font-mono font-bold tracking-wider">{user?.bipay_id}</span>
            </div>
            <p className="text-blue-100 text-sm mb-4">
              Share this unique ID to receive payments instantly with biometric security
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => copyToClipboard(user?.bipay_id || '')}
                className="flex-1 bg-white bg-opacity-20 text-white px-4 py-3 rounded-2xl text-sm font-medium hover:bg-opacity-30 transition-all flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Copy ID'}
              </button>
              <button
                onClick={sharePaymentLink}
                className="flex-1 bg-white text-blue-600 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-blue-50 transition-all flex items-center justify-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Request Money via BiPay ID */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-professional border border-blue-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-green-800">Request Money</h3>
            <p className="text-green-600 text-sm">Ask someone to pay you using their BiPay ID</p>
          </div>
          
          <Link href="/bipay-request">
            <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all">
              Request Payment via BiPay ID
            </button>
          </Link>
        </div>

        {/* Alternative Options */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Other Options</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* QR Code Option */}
            <Link href="/extra-features">
              <button className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-all">
                <QrCode className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <span className="text-sm text-gray-600 font-medium">QR Code</span>
                <p className="text-xs text-gray-500">Generate QR</p>
              </button>
            </Link>
            
            {/* Share Link Option */}
            <Link href="/extra-features">
              <button className="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-all">
                <Share className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <span className="text-sm text-gray-600 font-medium">Share Link</span>
                <p className="text-xs text-gray-500">Payment Link</p>
              </button>
            </Link>
          </div>
        </div>

        {/* Request Amount Section */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Specific Amount</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500 font-medium">₹</span>
              <input
                type="number"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                placeholder="0"
                min="1"
              />
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setRequestAmount(amount.toString())}
                  className="py-2 px-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What's this payment for?"
              rows={3}
            />
          </div>

          <button
            onClick={sharePaymentLink}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Share className="w-5 h-5 mr-2" />
            Share Payment Request
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How to Receive Money</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Share your Wallet ID or QR code with the sender</li>
            <li>• They can send money using your ID in the Send Money section</li>
            <li>• You'll receive instant notification once payment is sent</li>
            <li>• Money will be added to your wallet automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReceivePaymentPage;
