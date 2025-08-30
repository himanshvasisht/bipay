
import React, { useState, useEffect } from 'react';
import { Fingerprint, Shield, CheckCircle, AlertCircle, Scan } from 'lucide-react';

interface BiometricScannerProps {
  onSuccess: () => void;
  onError: () => void;
  isVisible: boolean;
}

const BiometricScanner: React.FC<BiometricScannerProps> = ({ onSuccess, onError, isVisible }) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [scanLines, setScanLines] = useState(0);

  useEffect(() => {
    if (isVisible && scanState === 'idle') {
      setScanState('scanning');
      setProgress(0);
      setScanLines(0);
      
      // Scanning animation
      const scanLineInterval = setInterval(() => {
        setScanLines(prev => (prev + 1) % 4);
      }, 200);

      // Progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            clearInterval(scanLineInterval);
            setScanState('success');
            setTimeout(() => {
              onSuccess();
            }, 1000);
            return 100;
          }
          return prev + 3;
        });
      }, 60);

      return () => {
        clearInterval(progressInterval);
        clearInterval(scanLineInterval);
      };
    }
  }, [isVisible, scanState, onSuccess]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-fade-in-scale">
        {/* Scanner Container */}
        <div className="relative mb-8">
          <div className="w-28 h-28 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
            
            {/* Scanning Lines Effect */}
            {scanState === 'scanning' && (
              <>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-full h-0.5 bg-blue-500 transition-all duration-200 ${
                      i <= scanLines ? 'opacity-100' : 'opacity-30'
                    }`}
                    style={{
                      top: `${20 + (i * 15)}%`,
                      left: 0,
                      right: 0,
                    }}
                  />
                ))}
                
                {/* Scanning Overlay */}
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-20 transition-all duration-300"
                  style={{ 
                    transform: `translateY(${-100 + (progress * 2)}%)`,
                    height: '40%'
                  }}
                />
              </>
            )}
            
            {/* Icon */}
            <div className="relative z-10">
              {scanState === 'success' ? (
                <CheckCircle className="w-14 h-14 text-green-500 animate-fade-in-scale" />
              ) : scanState === 'error' ? (
                <AlertCircle className="w-14 h-14 text-red-500" />
              ) : (
                <Fingerprint className={`w-14 h-14 text-blue-600 ${
                  scanState === 'scanning' ? 'animate-gentle-pulse' : ''
                }`} />
              )}
            </div>
          </div>
          
          {/* Ripple Effects */}
          {scanState === 'scanning' && (
            <>
              <div className="biometric-ring absolute inset-0 w-28 h-28 mx-auto" />
              <div className="biometric-ring absolute inset-0 w-28 h-28 mx-auto" />
              <div className="biometric-ring absolute inset-0 w-28 h-28 mx-auto" />
            </>
          )}
        </div>

        {/* Status Content */}
        <div className="mb-6">
          {scanState === 'scanning' && (
            <div className="animate-fade-in-up">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Authenticating</h3>
              <p className="text-gray-600 mb-4">Please place your finger on the sensor</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                <Scan className="w-4 h-4" />
                <span className="font-medium">Scanning biometric data...</span>
              </div>
            </div>
          )}
          
          {scanState === 'success' && (
            <div className="animate-fade-in-scale">
              <h3 className="text-xl font-bold text-green-600 mb-2">Authentication Successful</h3>
              <p className="text-gray-600">Welcome to BiPay secure platform</p>
            </div>
          )}
          
          {scanState === 'error' && (
            <div className="animate-fade-in-scale">
              <h3 className="text-xl font-bold text-red-600 mb-2">Authentication Failed</h3>
              <p className="text-gray-600">Please try again or contact support</p>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {scanState === 'scanning' && (
          <div className="mb-6">
            <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-shimmer"></div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 font-medium">
              {progress}% Complete
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className="flex items-center justify-center text-xs text-gray-500 bg-gray-50 rounded-lg py-2 px-4">
          <Shield className="w-3 h-3 mr-2" />
          <span className="font-medium">Protected by BiPay Biometric Security</span>
        </div>
      </div>
    </div>
  );
};

export default BiometricScanner;
