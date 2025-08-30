import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useBiometric } from '../contexts/BiometricContext';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Fingerprint, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  Shield,
  Zap,
  Clock,
  Plus,
  Search,
  Star
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar: string;
  isFrequent?: boolean;
}

type PaymentStep = 'select-contact' | 'enter-amount' | 'biometric-auth' | 'processing' | 'success' | 'failed';

const SendPaymentPage: React.FC = () => {
  const { scanFingerprint, isScanning, generateSignature } = useBiometric();
  
  const [currentStep, setCurrentStep] = useState<PaymentStep>('select-contact');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [authError, setAuthError] = useState('');

  const contacts: Contact[] = [
    { id: '1', name: 'Sarah Wilson', phone: '+91 98765 43210', email: 'sarah@email.com', avatar: '👩‍💼', isFrequent: true },
    { id: '2', name: 'John Smith', phone: '+91 98765 43211', email: 'john@email.com', avatar: '👨‍💻', isFrequent: true },
    { id: '3', name: 'Emma Davis', phone: '+91 98765 43212', avatar: '👩‍🎓', isFrequent: false },
    { id: '4', name: 'Mike Johnson', phone: '+91 98765 43213', avatar: '👨‍🔧', isFrequent: true },
    { id: '5', name: 'Lisa Chen', phone: '+91 98765 43214', email: 'lisa@email.com', avatar: '👩‍⚕️', isFrequent: false },
    { id: '6', name: 'David Brown', phone: '+91 98765 43215', avatar: '👨‍🎨', isFrequent: false }
  ];

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const frequentContacts = contacts.filter(contact => contact.isFrequent);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentStep('enter-amount');
  };

  const handleAmountSubmit = () => {
    if (parseFloat(amount) > 0) {
      setCurrentStep('biometric-auth');
    }
  };

  const handleBiometricAuth = async () => {
    setAuthError('');
    
    try {
      setCurrentStep('processing');
      const authResult = await scanFingerprint();
      
      if (authResult) {
        // Generate payment signature
        const paymentData = {
          amount: parseFloat(amount),
          recipient: selectedContact?.id,
          timestamp: Date.now()
        };
        
        const signature = await generateSignature(paymentData);
        
        // Simulate payment processing with signature
        setTimeout(() => {
          setCurrentStep('success');
        }, 2000);
      } else {
        setAuthError('Biometric authentication failed. Please try again.');
        setCurrentStep('biometric-auth');
        setTimeout(() => setAuthError(''), 3000);
      }
    } catch (error) {
      setAuthError('Biometric authentication failed. Please try again.');
      setCurrentStep('biometric-auth');
      setTimeout(() => setAuthError(''), 3000);
    }
  };

  const resetFlow = () => {
    setCurrentStep('select-contact');
    setSelectedContact(null);
    setAmount('');
    setNote('');
    setAuthError('');
  };

  const renderContactSelection = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
        />
      </div>

      {/* Frequent Contacts */}
      {!searchQuery && (
        <div>
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            Frequent Contacts
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {frequentContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleContactSelect(contact)}
                className="card-hover p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-professional text-center border border-blue-100 btn-ripple"
              >
                <div className="text-3xl mb-2">{contact.avatar}</div>
                <p className="font-semibold text-blue-800 text-sm">{contact.name.split(' ')[0]}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Contacts */}
      <div>
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          {searchQuery ? 'Search Results' : 'All Contacts'}
        </h3>
        <div className="space-y-3">
          {filteredContacts.map((contact, index) => (
            <button
              key={contact.id}
              onClick={() => handleContactSelect(contact)}
              className="w-full p-4 bg-white rounded-2xl shadow-professional flex items-center space-x-4 text-left card-hover btn-ripple animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl">
                {contact.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800">{contact.name}</h4>
                <p className="text-sm text-blue-500">{contact.phone}</p>
                {contact.email && (
                  <p className="text-xs text-blue-400">{contact.email}</p>
                )}
              </div>
              {contact.isFrequent && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAmountEntry = () => (
    <div className="space-y-6 animate-fade-in-up">
      {/* Selected Contact */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl">
            {selectedContact?.avatar}
          </div>
          <div>
            <h3 className="font-bold text-blue-800 text-lg">{selectedContact?.name}</h3>
            <p className="text-blue-500">{selectedContact?.phone}</p>
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="text-center">
        <label className="block text-blue-600 font-medium mb-2">Enter Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-blue-600">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-center bg-white border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus amount-display"
            autoFocus
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div>
        <label className="block text-blue-600 font-medium mb-3">Quick Select</label>
        <div className="grid grid-cols-5 gap-2">
          {quickAmounts.map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 btn-ripple"
            >
              ₹{quickAmount}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="block text-blue-600 font-medium mb-2">Add Note (Optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's this payment for?"
          className="w-full p-3 bg-white border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
        />
      </div>

      {/* Continue Button */}
      <button
        onClick={handleAmountSubmit}
        disabled={!amount || parseFloat(amount) <= 0}
        className="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-ripple"
      >
        Continue to Payment
      </button>
    </div>
  );

  const renderBiometricAuth = () => (
    <div className="text-center space-y-6 animate-fade-in-up">
      {/* Payment Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Payment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-blue-600">To:</span>
            <span className="font-semibold text-blue-800">{selectedContact?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-600">Amount:</span>
            <span className="font-bold text-2xl text-blue-800">₹{amount}</span>
          </div>
          {note && (
            <div className="flex justify-between items-center">
              <span className="text-blue-600">Note:</span>
              <span className="text-blue-700">{note}</span>
            </div>
          )}
        </div>
      </div>

      {/* Biometric Authentication */}
      <div className="bg-white p-8 rounded-3xl shadow-professional border border-blue-100">
        <div className="flex flex-col items-center space-y-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
            isScanning 
              ? 'bg-blue-100 biometric-scanner' 
              : 'bg-gradient-to-br from-blue-100 to-indigo-100'
          }`}>
            <Fingerprint className={`w-12 h-12 ${
              isScanning ? 'text-blue-600 animate-pulse' : 'text-blue-500'
            }`} />
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-800 mb-2">
              {isScanning ? 'Authenticating...' : 'Secure Payment Authentication'}
            </h3>
            <p className="text-blue-600">
              {isScanning 
                ? 'Please keep your finger on the sensor' 
                : 'Place your finger on the sensor to authorize payment'
              }
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 animate-fade-in-up">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-600 text-sm">{authError}</p>
            </div>
          )}

          {!isScanning && (
            <button
              onClick={handleBiometricAuth}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 btn-ripple flex items-center space-x-2"
            >
              <Fingerprint className="w-5 h-5" />
              <span>Authenticate Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center justify-center space-x-2 text-blue-500">
        <Shield className="w-4 h-4" />
        <span className="text-sm">Your payment is protected by biometric security</span>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-6 animate-fade-in-up">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
        <div className="loading-spinner border-blue-600"></div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-blue-800 mb-2">Processing Payment</h3>
        <p className="text-blue-600">Please wait while we process your transaction...</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-gentle-pulse"></div>
            <span className="text-blue-700">Verifying transaction details</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-gentle-pulse"></div>
            <span className="text-blue-700">Processing payment through secure channel</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span className="text-blue-500">Sending confirmation</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6 animate-fade-in-up">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h3>
        <p className="text-green-600">Your money has been sent successfully</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-200">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-green-700">Amount Sent:</span>
            <span className="font-bold text-xl text-green-800">₹{amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-700">To:</span>
            <span className="font-semibold text-green-800">{selectedContact?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-700">Transaction ID:</span>
            <span className="font-mono text-sm text-green-600">TXN{Date.now().toString().slice(-8)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-700">Time:</span>
            <span className="text-green-600">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={resetFlow}
          className="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 btn-ripple"
        >
          Send Another Payment
        </button>
        
        <Link href="/" className="block w-full p-4 bg-white border-2 border-blue-200 text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 text-center">
          Back to Home
        </Link>
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
            <h1 className="text-2xl font-bold">Send Money</h1>
            <p className="text-blue-100">Quick and secure payments</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-md mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">
                Step {currentStep === 'select-contact' ? '1' : currentStep === 'enter-amount' ? '2' : '3'} of 3
              </span>
              <span className="text-sm text-blue-500">
                {currentStep === 'select-contact' ? 'Select Contact' : 
                 currentStep === 'enter-amount' ? 'Enter Amount' : 
                 'Authenticate & Pay'}
              </span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ 
                  width: currentStep === 'select-contact' ? '33%' : 
                         currentStep === 'enter-amount' ? '66%' : '100%' 
                }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'select-contact' && renderContactSelection()}
          {currentStep === 'enter-amount' && renderAmountEntry()}
          {currentStep === 'biometric-auth' && renderBiometricAuth()}
          {currentStep === 'processing' && renderProcessing()}
          {currentStep === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default SendPaymentPage;
