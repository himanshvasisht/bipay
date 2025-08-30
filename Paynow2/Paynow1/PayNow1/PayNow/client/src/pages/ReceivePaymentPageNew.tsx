import React, { useState } from 'react';
import { Link } from 'wouter';
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
  Gift
} from 'lucide-react';

const ReceivePaymentPage: React.FC = () => {
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
    qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjYwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjEwMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48L3N2Zz4="
  };

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

  const renderQRSection = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* QR Code Display */}
      <div className="bg-white p-8 rounded-3xl shadow-professional border border-blue-100 text-center">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-blue-800 mb-2">Your Payment QR</h3>
          <p className="text-blue-600 text-sm">Scan to send money instantly</p>
        </div>

        {/* QR Code */}
        <div className="w-48 h-48 mx-auto mb-6 bg-white p-4 rounded-2xl shadow-professional border-2 border-blue-100">
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
            <QrCode className="w-32 h-32 text-blue-600" />
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 mb-6">
          <h4 className="font-bold text-blue-800">{userProfile.name}</h4>
          <p className="text-blue-600 text-sm">{userProfile.phone}</p>
          <p className="text-blue-500 text-xs mt-1">{userProfile.upiId}</p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[100, 500, 1000, 2000].map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt.toString())}
              className={`p-3 rounded-xl font-semibold text-sm transition-all duration-300 btn-ripple ${
                amount === amt.toString()
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="space-y-4">
          <div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter custom amount"
              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus text-center"
            />
          </div>
          <div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add note (optional)"
              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 btn-ripple flex items-center justify-center space-x-2">
            <Share className="w-4 h-4" />
            <span>Share QR</span>
          </button>
          <button className="p-3 bg-white border-2 border-blue-200 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 btn-ripple flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderRequestSection = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Request Form */}
      <div className="bg-white p-6 rounded-3xl shadow-professional border border-blue-100">
        <h3 className="text-xl font-bold text-blue-800 mb-4">Request Money</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-blue-600 font-medium mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-bold">₹</span>
              <input
                type="number"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 text-xl font-bold bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
              />
            </div>
          </div>

          <div>
            <label className="block text-blue-600 font-medium mb-2">Reason</label>
            <input
              type="text"
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="What's this request for?"
              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
            />
          </div>

          <button 
            disabled={!requestAmount}
            className="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-ripple"
          >
            Send Request
          </button>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white p-6 rounded-3xl shadow-professional border border-blue-100">
        <h4 className="text-lg font-bold text-blue-800 mb-4">Recent Requests</h4>
        <div className="space-y-3">
          {recentRequests.map((request, index) => (
            <div key={request.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-lg">
                  {request.avatar}
                </div>
                <div>
                  <h5 className="font-semibold text-blue-800">{request.name}</h5>
                  <p className="text-sm text-blue-500">₹{request.amount} • {request.time}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                request.status === 'paid' ? 'bg-green-100 text-green-700' :
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLinkSection = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Payment Link Generator */}
      <div className="bg-white p-6 rounded-3xl shadow-professional border border-blue-100">
        <h3 className="text-xl font-bold text-blue-800 mb-4">Payment Link</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-600 font-medium mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Optional"
                className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
              />
            </div>
            <div>
              <label className="block text-blue-600 font-medium mb-2">Note</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional"
                className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
              />
            </div>
          </div>

          {/* Generated Link */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-blue-600 font-medium mb-2">Your Payment Link</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={generatePaymentLink()}
                readOnly
                className="flex-1 p-3 bg-white border border-blue-200 rounded-xl text-sm text-blue-700"
              />
              <button
                onClick={() => copyToClipboard(generatePaymentLink())}
                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 btn-ripple"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <label className="block text-blue-600 font-medium mb-3">Share via</label>
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option, index) => (
                <button
                  key={index}
                  className={`p-4 ${option.color} text-white rounded-xl hover:opacity-90 transition-all duration-300 btn-ripple flex flex-col items-center space-y-2`}
                >
                  <option.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-professional-lg">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <button className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Receive Money</h1>
            <p className="text-blue-100">Get paid instantly & securely</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-md mx-auto">
          {/* Payment Method Tabs */}
          <div className="bg-white p-2 rounded-2xl shadow-professional border border-blue-100 mb-6">
            <div className="grid grid-cols-3 gap-1">
              {['qr', 'request', 'link'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`p-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-professional'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {tab === 'qr' ? 'QR Code' : tab === 'request' ? 'Request' : 'Link'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'qr' && renderQRSection()}
          {activeTab === 'request' && renderRequestSection()}
          {activeTab === 'link' && renderLinkSection()}

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="bg-white p-4 rounded-2xl shadow-professional text-center border border-blue-100">
              <Wallet className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-800">₹15.2k</div>
              <div className="text-xs text-blue-500">This Month</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-professional text-center border border-blue-100">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-800">24</div>
              <div className="text-xs text-blue-500">Requests</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-professional text-center border border-blue-100">
              <Gift className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-800">₹340</div>
              <div className="text-xs text-blue-500">Rewards</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceivePaymentPage;
