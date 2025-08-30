import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  QrCode, 
  Share, 
  Link as LinkIcon,
  Download,
  Copy,
  Smartphone,
  Mail,
  MessageCircle,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Star,
  Gift,
  Zap,
  Clock,
  Users,
  CreditCard
} from 'lucide-react';

const ExtraFeaturesPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'qr' | 'links' | 'share' | 'tools'>('qr');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePaymentLink = () => {
    const baseUrl = 'https://bipay.app/pay/';
    const params = new URLSearchParams({
      to: user?.bipay_id || '',
      amount: amount || '0',
      note: note || ''
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const shareOptions = [
    { icon: MessageCircle, label: 'WhatsApp', color: 'bg-green-500' },
    { icon: Mail, label: 'Email', color: 'bg-blue-500' },
    { icon: Smartphone, label: 'SMS', color: 'bg-indigo-500' },
    { icon: Copy, label: 'Copy Link', color: 'bg-gray-500' }
  ];

  const extraTools = [
    { icon: Shield, label: 'Security Settings', description: 'Manage biometric and security', href: '/profile' },
    { icon: Users, label: 'Split Bills', description: 'Split expenses with friends', href: '#' },
    { icon: Star, label: 'Rewards', description: 'Check cashback and offers', href: '#' },
    { icon: Clock, label: 'Scheduled Payments', description: 'Set up recurring payments', href: '#' },
    { icon: Gift, label: 'Gift Cards', description: 'Buy and redeem gift cards', href: '#' },
    { icon: CreditCard, label: 'Virtual Cards', description: 'Create virtual payment cards', href: '#' }
  ];

  const renderQRSection = () => (
    <div className="space-y-6">
      {/* QR Code Generator */}
      <div className="bg-white rounded-3xl p-6 shadow-professional border border-blue-100">
        <h3 className="text-lg font-bold text-blue-800 mb-4 text-center">Generate QR Code</h3>
        
        {/* Amount Input */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">Amount (Optional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-blue-600">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 text-lg font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this payment for?"
              className="w-full px-4 py-3 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* QR Code Display */}
        <div className="text-center">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl mx-auto mb-4 flex items-center justify-center border-2 border-blue-200">
            <div className="text-center">
              <QrCode className="w-20 h-20 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-600 font-medium">QR Code</p>
              <p className="text-xs text-blue-500">Scan to pay</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-2xl font-semibold">
              <Download className="w-5 h-5 mx-auto" />
            </button>
            <button 
              onClick={() => copyToClipboard(generatePaymentLink())}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl font-semibold"
            >
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      {/* QR Scanner */}
      <div className="bg-white rounded-3xl p-6 shadow-professional border border-green-100">
        <h3 className="text-lg font-bold text-green-800 mb-4 text-center">Scan QR Code</h3>
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl mx-auto mb-4 flex items-center justify-center border-2 border-green-200">
            <QrCode className="w-16 h-16 text-green-600" />
          </div>
          <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-2xl font-semibold">
            Open QR Scanner
          </button>
        </div>
      </div>
    </div>
  );

  const renderLinksSection = () => (
    <div className="space-y-6">
      {/* Payment Link Generator */}
      <div className="bg-white rounded-3xl p-6 shadow-professional border border-purple-100">
        <h3 className="text-lg font-bold text-purple-800 mb-4">Payment Links</h3>
        
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-2xl">
            <h4 className="font-semibold text-purple-800 mb-2">Your Payment Link</h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={generatePaymentLink()}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-xl text-sm"
              />
              <button
                onClick={() => copyToClipboard(generatePaymentLink())}
                className="p-2 bg-purple-600 text-white rounded-xl"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option, index) => (
              <button
                key={index}
                className={`flex items-center space-x-2 p-3 ${option.color} text-white rounded-xl`}
              >
                <option.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderToolsSection = () => (
    <div className="space-y-4">
      {extraTools.map((tool, index) => (
        <Link key={index} href={tool.href}>
          <div className="bg-white p-4 rounded-2xl shadow-professional border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <tool.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{tool.label}</h4>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                Soon
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  const tabs = [
    { id: 'qr', label: 'QR Code', icon: QrCode },
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'tools', label: 'Tools', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 shadow-professional-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Extra Features</h1>
              <p className="text-purple-100">Additional payment tools</p>
            </div>
          </div>
          <Zap className="w-6 h-6" />
        </div>
      </div>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-3xl p-2 mb-6 shadow-professional border border-gray-100">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {activeTab === 'qr' && renderQRSection()}
          {activeTab === 'links' && renderLinksSection()}
          {activeTab === 'tools' && renderToolsSection()}
        </div>

        {/* Bottom note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-6">
          <p className="text-amber-800 text-sm text-center">
            <strong>Note:</strong> These are alternative features. For best security, use BiPay ID payments with biometric authentication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExtraFeaturesPage;
