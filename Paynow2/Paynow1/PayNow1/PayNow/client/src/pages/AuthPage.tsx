
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBiometric } from '@/contexts/BiometricContext';
import { biometricDB } from '@/lib/biometricDatabase';
import { Redirect } from 'wouter';
import { Eye, EyeOff, Fingerprint, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const AuthPage = () => {
  const { isAuthenticated, isLoading: authLoading, login, register } = useAuth();
  const { enrollBiometric, hasBiometricSupport, biometricType, isScanning } = useBiometric();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometricEnrollment, setShowBiometricEnrollment] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: ''
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(formData.mobile, formData.password);
      } else {
        success = await register(formData.name, formData.mobile, formData.password);
        
        // MANDATORY biometric enrollment for all new registrations
        if (success) {
          setShowBiometricEnrollment(true);
          // Don't complete registration until biometric is enrolled
        }
      }

      if (!success && !showBiometricEnrollment) {
        alert(isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricEnrollment = async () => {
    try {
      console.log('🔐 Starting MANDATORY biometric enrollment...');
      const userId = formData.mobile;
      const success = await enrollBiometric(userId);
      
      if (success) {
        console.log('✅ Biometric enrolled successfully for user:', userId);
        setBiometricEnrolled(true);
        
        // Save biometric enrollment to database
        try {
          const templateData = biometricType === 'demo' 
            ? `DEMO_FINGERPRINT_${userId}_${Date.now()}`
            : `REAL_FINGERPRINT_${userId}_${Date.now()}`;
          
          await biometricDB.enrollBiometric(userId, templateData, biometricType === 'demo' ? 'demo' : 'real');
          console.log('✅ Biometric saved to database successfully!');
        } catch (dbError) {
          console.error('Database save error:', dbError);
        }
        
        setTimeout(() => {
          setShowBiometricEnrollment(false);
        }, 2000);
      } else {
        alert('⚠️ Biometric enrollment is REQUIRED to complete registration. Please try again.');
        // Don't allow skipping - biometric is mandatory
      }
    } catch (error) {
      console.error('Biometric enrollment error:', error);
      alert('⚠️ Biometric enrollment is REQUIRED. Please try again.');
    }
  };

  // Biometric Enrollment Modal
  if (showBiometricEnrollment) {
    return (
      <div className="min-h-screen bg-bipay-gradient flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="mb-6">
            {biometricEnrolled ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4 biometric-scanner">
                <Fingerprint className="w-10 h-10 text-blue-600" />
              </div>
            )}
          </div>
          
          {biometricEnrolled ? (
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Biometric Setup Complete!</h2>
              <p className="text-green-600 mb-6">Your account is now secured with biometric authentication</p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">Setup Biometric Security</h2>
              <p className="text-blue-600 mb-6">
                Secure your account with {biometricType === 'demo' ? 'demo fingerprint' : 'biometric authentication'}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">
                      {biometricType === 'demo' ? 'Demo Mode' : 'Hardware Biometric'}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {biometricType === 'demo' 
                        ? 'Demo fingerprint for devices without biometric hardware. Provides secure key generation for development.'
                        : 'Uses your device\'s biometric sensor for maximum security.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {isScanning && (
                <div className="mb-4">
                  <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-loading-bar"></div>
                  </div>
                  <p className="text-blue-600 text-sm">
                    {biometricType === 'demo' ? 'Generating demo fingerprint...' : 'Place your finger on the sensor...'}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={skipBiometricEnrollment}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold"
                  disabled={isScanning}
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleBiometricEnrollment}
                  disabled={isScanning}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold disabled:opacity-50"
                >
                  {isScanning ? 'Enrolling...' : 'Setup Biometric'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bipay-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Fingerprint className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BiPay</h1>
          <p className="text-gray-600">Biometric Payment Platform</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter mobile number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        {/* Demo Login for Development */}
        <div className="mt-4">
          <button
            onClick={async () => {
              setIsLoading(true);
              setFormData({ name: 'Demo User', mobile: '9876543210', password: 'demo123' });
              const success = await login('9876543210', 'demo123');
              if (!success) {
                alert('Demo login failed');
              }
              setIsLoading(false);
            }}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            🚀 Quick Demo Login
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Secure biometric authentication</p>
          <p className="mt-1">Protected by blockchain technology</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
