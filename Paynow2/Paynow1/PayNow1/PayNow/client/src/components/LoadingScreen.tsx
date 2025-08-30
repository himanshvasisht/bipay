import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

type LetterState = 'waiting' | 'appearing' | 'visible' | 'blurring' | 'hidden';

interface Letter {
  char: string;
  state: LetterState;
  delay: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [letters, setLetters] = useState<Letter[]>([
    { char: 'B', state: 'waiting', delay: 0 },
    { char: 'i', state: 'waiting', delay: 500 },
    { char: 'P', state: 'waiting', delay: 1000 },
    { char: 'a', state: 'waiting', delay: 1500 },
    { char: 'y', state: 'waiting', delay: 2000 }
  ]);

  const [currentCycle, setCurrentCycle] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const maxCycles = 2;
    
    if (currentCycle < maxCycles) {
      // Start the letter animation cycle
      const timer = setTimeout(() => {
        animateLetters();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Final cycle complete, show progress bar
      setShowProgress(true);
      simulateProgress();
    }
  }, [currentCycle]);

  const animateLetters = () => {
    letters.forEach((letter, index) => {
      // Appearing phase
      setTimeout(() => {
        setLetters(prev => prev.map((l, i) => 
          i === index ? { ...l, state: 'appearing' } : l
        ));
      }, letter.delay);

      // Visible phase
      setTimeout(() => {
        setLetters(prev => prev.map((l, i) => 
          i === index ? { ...l, state: 'visible' } : l
        ));
      }, letter.delay + 300);

      // Blurring phase (when next letter appears)
      if (index < letters.length - 1) {
        setTimeout(() => {
          setLetters(prev => prev.map((l, i) => 
            i === index ? { ...l, state: 'blurring' } : l
          ));
        }, letter.delay + 800);

        // Hidden phase
        setTimeout(() => {
          setLetters(prev => prev.map((l, i) => 
            i === index ? { ...l, state: 'hidden' } : l
          ));
        }, letter.delay + 1200);
      }
    });

    // Reset for next cycle after all letters are done
    setTimeout(() => {
      setLetters(prev => prev.map(l => ({ ...l, state: 'waiting' })));
      setCurrentCycle(prev => prev + 1);
    }, 3500);
  };

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const getLetterStyle = (state: LetterState): React.CSSProperties => {
    switch (state) {
      case 'waiting':
        return { 
          opacity: 0, 
          transform: 'translateY(20px) scale(0.8)',
          filter: 'blur(0px)'
        };
      case 'appearing':
        return { 
          opacity: 1, 
          transform: 'translateY(0px) scale(1)',
          filter: 'blur(0px)',
          transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        };
      case 'visible':
        return { 
          opacity: 1, 
          transform: 'translateY(0px) scale(1)',
          filter: 'blur(0px)',
          transition: 'all 0.3s ease'
        };
      case 'blurring':
        return { 
          opacity: 0.3, 
          transform: 'translateY(0px) scale(1)',
          filter: 'blur(3px)',
          transition: 'all 0.4s ease'
        };
      case 'hidden':
        return { 
          opacity: 0, 
          transform: 'translateY(-10px) scale(0.9)',
          filter: 'blur(5px)',
          transition: 'all 0.3s ease'
        };
      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-100 rounded-full opacity-30 animate-float"></div>
        <div className="absolute top-1/4 -left-8 w-96 h-96 bg-blue-50 rounded-full opacity-40 animate-gentle-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-200 rounded-full opacity-25 animate-float"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* BiPay Logo Animation */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-1">
            {letters.map((letter, index) => (
              <span
                key={index}
                className="text-6xl md:text-8xl font-bold text-blue-600"
                style={getLetterStyle(letter.state)}
              >
                {letter.char}
              </span>
            ))}
          </div>
        </div>

        {/* Progress Section */}
        {showProgress && (
          <div className="w-80 animate-fade-in-up">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">
                Initializing BiPay
              </h2>
              <p className="text-blue-600 text-sm">
                Setting up your secure payment environment...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-blue-100 rounded-full h-2 mb-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-shimmer"></div>
              </div>
            </div>

            {/* Progress Text */}
            <div className="text-center">
              <span className="text-blue-700 font-medium">{progress}%</span>
            </div>

            {/* Loading Steps */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${progress > 20 ? 'bg-blue-500' : 'bg-blue-200'} transition-colors duration-300`}></div>
                <span className={`text-sm ${progress > 20 ? 'text-blue-700' : 'text-blue-400'} transition-colors duration-300`}>
                  Loading security protocols
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${progress > 50 ? 'bg-blue-500' : 'bg-blue-200'} transition-colors duration-300`}></div>
                <span className={`text-sm ${progress > 50 ? 'text-blue-700' : 'text-blue-400'} transition-colors duration-300`}>
                  Connecting to payment network
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${progress > 80 ? 'bg-blue-500' : 'bg-blue-200'} transition-colors duration-300`}></div>
                <span className={`text-sm ${progress > 80 ? 'text-blue-700' : 'text-blue-400'} transition-colors duration-300`}>
                  Verifying biometric sensors
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-8 text-center">
        <p className="text-blue-500 text-sm font-medium">
          Powered by BiPay Technology
        </p>
        <p className="text-blue-400 text-xs mt-1">
          Secure • Fast • Reliable
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
