import React, { useState, useEffect } from 'react';
import { biPayEcosystem } from '../lib/biPayEcosystem';

interface DemoUser {
  id: string;
  name: string;
  bipay_id: string;
  balance: number;
  biometric_enrolled: boolean;
}

const EcosystemDemo: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [merchantMode, setMerchantMode] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Demo users for testing
  const demoUsers: DemoUser[] = [
    {
      id: 'user1',
      name: 'Raj Kumar',
      bipay_id: 'raj.kumar@bipay',
      balance: 5000,
      biometric_enrolled: true
    },
    {
      id: 'user2', 
      name: 'Priya Singh',
      bipay_id: 'priya.singh@bipay',
      balance: 3500,
      biometric_enrolled: true
    },
    {
      id: 'merchant1',
      name: 'ABC Electronics Store',
      bipay_id: 'abc.electronics@bipay',
      balance: 25000,
      biometric_enrolled: true
    }
  ];

  useEffect(() => {
    // Set default user
    setCurrentUser(demoUsers[0]);
  }, []);

  const handleBiometricPayment = async () => {
    if (!currentUser || !amount) return;

    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      if (merchantMode) {
        // Merchant receiving payment
        const result = await biPayEcosystem.processMerchantPayment({
          merchant_id: currentUser.bipay_id,
          amount: parseFloat(amount),
          customer_biometric: 'demo_fingerprint_data',
          description: 'Shop purchase payment',
          device_id: 'demo_device_001'
        });

        if (result.success) {
          setTransaction(result.transaction);
          setPaymentStatus('success');
          setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + parseFloat(amount) } : null);
        } else {
          setPaymentStatus('failed');
        }
      } else {
        // Customer making payment via P2P
        const result = await biPayEcosystem.processP2PPayment({
          sender_biometric: 'demo_fingerprint_data',
          receiver_bipay_id: 'abc.electronics@bipay',
          amount: parseFloat(amount),
          note: 'Payment to merchant',
          device_id: 'demo_device_001'
        });

        if (result.success) {
          setTransaction(result.transaction);
          setPaymentStatus('success');
          setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - parseFloat(amount) } : null);
        } else {
          setPaymentStatus('failed');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
    }

    setIsLoading(false);
  };

  const resetDemo = () => {
    setAmount('');
    setPaymentStatus('');
    setTransaction(null);
    setIsLoading(false);
  };

  const switchUser = (user: DemoUser) => {
    setCurrentUser(user);
    resetDemo();
  };

  if (!currentUser) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">BiPay Ecosystem Demo</h1>
            <p className="text-purple-200">Experience seamless biometric payments</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
          >
            Back to App
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* User Selection */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Select Demo User</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => switchUser(user)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  currentUser.id === user.id
                    ? 'bg-purple-600 ring-2 ring-purple-400'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-purple-200">{user.bipay_id}</div>
                <div className="text-sm text-green-300">Balance: ₹{user.balance}</div>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs">Biometric Enrolled</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Mode</h2>
          <div className="flex gap-4">
            <button
              onClick={() => { setMerchantMode(false); resetDemo(); }}
              className={`px-6 py-3 rounded-lg transition-all ${
                !merchantMode
                  ? 'bg-blue-600 ring-2 ring-blue-400'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              Customer Mode
              <div className="text-xs text-blue-200">Pay using biometrics</div>
            </button>
            <button
              onClick={() => { setMerchantMode(true); resetDemo(); }}
              className={`px-6 py-3 rounded-lg transition-all ${
                merchantMode
                  ? 'bg-green-600 ring-2 ring-green-400'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              Merchant Mode
              <div className="text-xs text-green-200">Receive payments</div>
            </button>
          </div>
        </div>

        {/* Current User Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Current User: {currentUser.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-600/30 p-4 rounded-lg">
              <div className="text-2xl font-bold">₹{currentUser.balance}</div>
              <div className="text-sm text-purple-200">Balance</div>
            </div>
            <div className="bg-blue-600/30 p-4 rounded-lg">
              <div className="text-lg font-bold">{currentUser.bipay_id}</div>
              <div className="text-sm text-blue-200">BiPay ID</div>
            </div>
            <div className="bg-green-600/30 p-4 rounded-lg">
              <div className="text-lg font-bold">✓ Enrolled</div>
              <div className="text-sm text-green-200">Biometric</div>
            </div>
            <div className="bg-orange-600/30 p-4 rounded-lg">
              <div className="text-lg font-bold">{merchantMode ? 'Merchant' : 'Customer'}</div>
              <div className="text-sm text-orange-200">Mode</div>
            </div>
          </div>
        </div>

        {/* Payment Interface */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            {merchantMode ? 'Receive Payment' : 'Make Payment'}
          </h2>
          
          {paymentStatus === '' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-200 mb-2">
                  {merchantMode ? 'Merchant Flow:' : 'Customer Flow:'}
                </h3>
                <div className="text-sm text-yellow-100 space-y-1">
                  {merchantMode ? (
                    <>
                      <div>1. Customer wants to pay ₹{amount || 'XX'}</div>
                      <div>2. You enter amount and proceed</div>
                      <div>3. Customer places thumb on their device</div>
                      <div>4. BiPay finds customer by biometric</div>
                      <div>5. Amount added to your account</div>
                    </>
                  ) : (
                    <>
                      <div>1. You want to pay at merchant</div>
                      <div>2. Enter amount and proceed</div>
                      <div>3. Place your thumb for verification</div>
                      <div>4. BiPay processes payment</div>
                      <div>5. Amount deducted from your account</div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleBiometricPayment}
                disabled={!amount || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-lg font-semibold text-lg transition-all"
              >
                {isLoading ? 'Processing...' : 
                 merchantMode ? '👍 Receive Payment via Biometric' : '👍 Pay with Biometric'}
              </button>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="text-lg font-semibold">Processing Biometric Payment...</div>
              <div className="text-purple-200">Verifying fingerprint and processing transaction</div>
            </div>
          )}

          {paymentStatus === 'success' && transaction && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <div className="text-xl font-bold text-green-400 mb-2">Payment Successful!</div>
              <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4 mb-4">
                <div className="text-sm space-y-1">
                  <div>Transaction ID: {transaction.id}</div>
                  <div>Amount: ₹{transaction.amount}</div>
                  <div>Status: {transaction.status}</div>
                  <div>Time: {new Date(transaction.timestamp).toLocaleString()}</div>
                </div>
              </div>
              <div className="text-green-200 mb-4">
                {merchantMode 
                  ? 'Payment received! Customer paid using just their fingerprint.'
                  : 'Payment sent! You paid using just your fingerprint.'}
              </div>
              <button
                onClick={resetDemo}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors"
              >
                Make Another Payment
              </button>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✗</span>
              </div>
              <div className="text-xl font-bold text-red-400 mb-2">Payment Failed!</div>
              <div className="text-red-200 mb-4">
                There was an issue processing the biometric payment.
              </div>
              <button
                onClick={resetDemo}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Real World Scenario */}
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
          <h2 className="text-xl font-semibold mb-4 text-green-300">Real World Scenario</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <div className="font-semibold">Customer Registration</div>
                <div className="text-green-200">User installs BiPay app and registers with biometric enrollment</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <div className="font-semibold">Shopping Experience</div>
                <div className="text-green-200">Customer visits any BiPay-enabled merchant</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <div className="font-semibold">Seamless Payment</div>
                <div className="text-green-200">Merchant enters amount, customer puts thumb on their device</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <div className="font-semibold">Instant Settlement</div>
                <div className="text-green-200">BiPay finds customer by biometric and processes payment instantly</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">5</div>
              <div>
                <div className="font-semibold">Synchronized History</div>
                <div className="text-green-200">Transaction appears in both customer P2P app and merchant portal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcosystemDemo;
