import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Gift, 
  Zap, 
  TrendingUp, 
  Shield, 
  Sparkles,
  ArrowRight,
  Clock,
  Target,
  Award
} from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  action: string;
  badge?: string;
  gradient: string;
}

const MovingAdsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const promotions: Promotion[] = [
    {
      id: 'cashback',
      title: 'Get 5% Cashback',
      description: 'On all bill payments this month',
      icon: Gift,
      color: 'text-green-700',
      bgColor: 'from-green-400 to-emerald-500',
      action: 'Pay Bills Now',
      badge: 'Limited Time',
      gradient: 'bg-gradient-to-r from-green-400 to-emerald-600'
    },
    {
      id: 'biometric',
      title: 'BiPay Security',
      description: 'Most secure payments with biometric auth',
      icon: Shield,
      color: 'text-blue-700',
      bgColor: 'from-blue-400 to-indigo-500',
      action: 'Enable Now',
      badge: 'New',
      gradient: 'bg-gradient-to-r from-blue-400 to-indigo-600'
    },
    {
      id: 'instant',
      title: 'Instant Transfers',
      description: 'Send money in seconds with BiPay ID',
      icon: Zap,
      color: 'text-yellow-700',
      bgColor: 'from-yellow-400 to-orange-500',
      action: 'Try Now',
      badge: 'Fast',
      gradient: 'bg-gradient-to-r from-yellow-400 to-orange-500'
    },
    {
      id: 'investment',
      title: 'Smart Investments',
      description: 'Start SIP with just ₹100',
      icon: TrendingUp,
      color: 'text-purple-700',
      bgColor: 'from-purple-400 to-pink-500',
      action: 'Invest Now',
      badge: 'Trending',
      gradient: 'bg-gradient-to-r from-purple-400 to-pink-500'
    },
    {
      id: 'rewards',
      title: 'Loyalty Rewards',
      description: 'Earn stars on every transaction',
      icon: Star,
      color: 'text-amber-700',
      bgColor: 'from-amber-400 to-yellow-500',
      action: 'View Rewards',
      badge: 'Popular',
      gradient: 'bg-gradient-to-r from-amber-400 to-yellow-500'
    }
  ];

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, promotions.length]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000); // Resume after 10 seconds
  };

  const handlePromotionClick = (promotion: Promotion) => {
    console.log('Promotion clicked:', promotion.id);
    // Handle navigation based on promotion type
    switch (promotion.id) {
      case 'cashback':
        window.location.hash = '/bills';
        break;
      case 'biometric':
        window.location.hash = '/profile';
        break;
      case 'instant':
        window.location.hash = '/bipay-send';
        break;
      default:
        console.log('Feature coming soon!');
    }
  };

  return (
    <div className="relative mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-blue-800 flex items-center">
          <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
          Special Offers
        </h2>
        <div className="flex items-center space-x-1">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-600 w-6' 
                  : 'bg-gray-300 hover:bg-blue-400'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl shadow-professional">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className="w-full flex-shrink-0 relative overflow-hidden"
            >
              <div 
                className={`${promotion.gradient} p-6 text-white relative cursor-pointer group`}
                onClick={() => handlePromotionClick(promotion)}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-4 translate-y-4"></div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                        <promotion.icon className="w-7 h-7 text-white" />
                      </div>
                      {promotion.badge && (
                        <span className="bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded-full font-semibold animate-gentle-pulse">
                          {promotion.badge}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1">{promotion.title}</h3>
                    <p className="text-white/90 text-sm mb-4">{promotion.description}</p>
                    
                    <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 transition-all group-hover:scale-105">
                      <span>{promotion.action}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Animated Icon */}
                  <div className="ml-4">
                    <div className="w-20 h-20 bg-white bg-opacity-10 rounded-full flex items-center justify-center animate-gentle-pulse">
                      <promotion.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentIndex(currentIndex === 0 ? promotions.length - 1 : currentIndex - 1)}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
        
        <button
          onClick={() => setCurrentIndex(currentIndex === promotions.length - 1 ? 0 : currentIndex + 1)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / promotions.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MovingAdsCarousel;
