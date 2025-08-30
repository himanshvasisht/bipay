import React, { useState, useEffect } from 'react';
import { biPayEcosystem } from '../lib/biPayEcosystem';
import { biometricDB } from '../lib/biometricDatabase';
import { Fingerprint, Users, CreditCard, ShoppingBag, Database, Activity } from 'lucide-react';

const BiometricPaymentDemo: React.FC = () => {
  const [systemStats, setSystemStats] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState('9876543210');
  const [paymentAmount, setPaymentAmount] = useState('500');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [demoStep, setDemoStep] = useState(1);

  // Demo users for simulation
  const demoUsers = [
    { id: '9876543210', name: 'Raj Kumar', balance: 5000 },
    { id: '9876543211', name: 'Priya Singh', balance: 3500 },
    { id: '9876543212', name: 'ABC Electronics (Merchant)', balance: 25000 }
  ];

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    const stats = biometricDB.getStats();
    setSystemStats(stats);
  };

  const simulateBiometricPayment = async () => {
    setIsProcessing(true);
    setPaymentResult(null);
    setDemoStep(1);

    try {
      // Step 1: Generate biometric data for the selected user
      setDemoStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const biometricTemplate = biometricDB.generateEnhancedTemplate('demo');
      console.log('Generated biometric template for user:', selectedUser);

      // Step 2: Authenticate via biometric
      setDemoStep(2);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const authResult = await biPayEcosystem.authenticateByBiometric(biometricTemplate, 'demo_device_001');
      
      if (!authResult.success) {
        throw new Error(authResult.error || 'Authentication failed');
      }

      // Step 3: Process merchant payment
      setDemoStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const paymentRequest = {
        merchant_id: 'abc.electronics@bipay',
        customer_biometric: biometricTemplate,
        amount: parseFloat(paymentAmount),
        description: 'Demo Purchase',
        device_id: 'demo_device_001',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'New Delhi, India'
        }
      };

      const paymentResponse = await biPayEcosystem.processMerchantPayment(paymentRequest);
      
      setPaymentResult(paymentResponse);
      setDemoStep(4);
      
    } catch (error) {
      console.error('Payment simulation error:', error);
      setPaymentResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
      setDemoStep(4);
    } finally {
      setIsProcessing(false);
      loadSystemStats(); // Refresh stats
    }
  };

  const resetDemo = () => {
    setPaymentResult(null);
    setDemoStep(1);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🔐 BiPay Enhanced Biometric System</h1>
          <p className="text-purple-200 text-lg">100% Working Payment Through Biometrics</p>
          <div className="flex justify-center mt-4">
            <div className="bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
              <span className="text-green-300 font-semibold">✅ Database Integration Active</span>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold">{systemStats.totalTemplates}</div>
                  <div className="text-sm text-blue-200">Biometric Templates</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
                  <div className="text-sm text-green-200">Enrolled Users</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Fingerprint className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold">{systemStats.realTemplates}</div>
                  <div className="text-sm text-purple-200">Real Biometrics</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(systemStats.avgQuality)}%</div>
                  <div className="text-sm text-yellow-200">Avg Quality</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Payment Setup */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Payment Setup
            </h2>

            {/* User Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Select Customer</label>
              <div className="space-y-2">
                {demoUsers.slice(0, 2).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedUser === user.id
                        ? 'bg-purple-600 ring-2 ring-purple-400'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-purple-200">Balance: ₹{user.balance}</div>
                    <div className="text-xs text-green-300">✓ Biometric Enrolled</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Payment Amount (₹)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                placeholder="Enter amount"
              />
            </div>

            {/* Merchant Info */}
            <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-300 mb-2">Merchant: ABC Electronics</h3>
              <div className="text-sm text-green-200 space-y-1">
                <div>📍 New Delhi, India</div>
                <div>🆔 abc.electronics@bipay</div>
                <div>💰 Balance: ₹25,000</div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={simulateBiometricPayment}
              disabled={isProcessing || !paymentAmount}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-lg font-semibold text-lg transition-all"
            >
              {isProcessing ? '🔄 Processing Payment...' : '👍 Pay with Biometric'}
            </button>
          </div>

          {/* Right Panel: Payment Process */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <ShoppingBag className="w-6 h-6 mr-2" />
              Payment Process
            </h2>

            {/* Process Steps */}
            <div className="space-y-4">
              {[
                { step: 1, title: 'Generate Biometric', desc: 'Creating unique fingerprint template' },
                { step: 2, title: 'Authenticate User', desc: 'Finding user in biometric database' },
                { step: 3, title: 'Process Payment', desc: 'Transferring funds via biometric verification' },
                { step: 4, title: 'Complete Transaction', desc: 'Payment successful and history updated' }
              ].map((item) => (
                <div
                  key={item.step}
                  className={`flex items-center space-x-4 p-3 rounded-lg transition-all ${
                    demoStep >= item.step
                      ? isProcessing && demoStep === item.step
                        ? 'bg-yellow-600/30 border border-yellow-600/50'
                        : 'bg-green-600/30 border border-green-600/50'
                      : 'bg-gray-600/20 border border-gray-600/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    demoStep > item.step
                      ? 'bg-green-500 text-white'
                      : demoStep === item.step && isProcessing
                      ? 'bg-yellow-500 text-white animate-pulse'
                      : demoStep === item.step
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-500 text-gray-300'
                  }`}>
                    {demoStep > item.step ? '✓' : item.step}
                  </div>
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-gray-300">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Result */}
            {paymentResult && (
              <div className="mt-6">
                {paymentResult.success ? (
                  <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="font-semibold text-green-300">Payment Successful!</span>
                    </div>
                    
                    <div className="text-sm space-y-1 text-green-200">
                      <div>Transaction ID: {paymentResult.transaction?.id}</div>
                      <div>Amount: ₹{paymentResult.transaction?.amount}</div>
                      <div>Customer: {paymentResult.customer?.name}</div>
                      <div>New Balance: ₹{paymentResult.customer?.balance}</div>
                      <div>🔐 Biometric Verified: ✅</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✗</span>
                      </div>
                      <span className="font-semibold text-red-300">Payment Failed</span>
                    </div>
                    <div className="text-sm text-red-200">{paymentResult.error}</div>
                  </div>
                )}

                <button
                  onClick={resetDemo}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold transition-colors"
                >
                  Reset Demo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real World Workflow */}
        <div className="mt-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
          <h2 className="text-2xl font-bold mb-4 text-green-300">🌟 Real World Implementation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-400 mb-3">Customer Journey:</h3>
              <div className="space-y-2 text-sm text-green-200">
                <div>1. 📱 Downloads BiPay app and registers</div>
                <div>2. 👆 Enrolls biometric during registration (MANDATORY)</div>
                <div>3. 🏪 Visits any BiPay-enabled merchant</div>
                <div>4. 💳 Merchant enters amount, customer confirms with thumb</div>
                <div>5. ✅ Payment processed instantly via biometric database</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400 mb-3">Technical Flow:</h3>
              <div className="space-y-2 text-sm text-blue-200">
                <div>1. 🔐 Biometric template generated and stored in database</div>
                <div>2. 🔍 System finds user by matching biometric patterns</div>
                <div>3. ⚡ Real-time balance verification and deduction</div>
                <div>4. 📊 Transaction synced across P2P and merchant systems</div>
                <div>5. 📱 Instant notification and history update</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricPaymentDemo;
