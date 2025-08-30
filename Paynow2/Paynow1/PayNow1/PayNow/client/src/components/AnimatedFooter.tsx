import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Send, 
  ArrowDownLeft, 
  History, 
  User,
  Zap,
  CreditCard,
  Fingerprint,
  Star,
  QrCode
} from 'lucide-react';

interface FooterItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  isSpecial?: boolean;
  badge?: string;
}

const AnimatedFooter: React.FC = () => {
  const [location] = useLocation();
  const [animatingItem, setAnimatingItem] = useState<string | null>(null);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });

  const footerItems: FooterItem[] = [
    { id: 'home', icon: Home, label: 'Home', href: '/' },
    { id: 'send', icon: Send, label: 'Send', href: '/send' },
    { id: 'bipay', icon: Fingerprint, label: 'BiPay', href: '/bipay-send', isSpecial: true },
    { id: 'bills', icon: Zap, label: 'Bills', href: '/bills' },
    { id: 'profile', icon: User, label: 'Profile', href: '/profile' }
  ];

  const handleItemClick = (itemId: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setRipplePosition({ x, y });
    setAnimatingItem(itemId);
    
    setTimeout(() => setAnimatingItem(null), 300);
  };

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <>
      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Floating Pills Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-80 h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-30 animate-gentle-pulse"></div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/50 px-6 py-3 shadow-professional-lg">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {footerItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              
              return (
                <Link key={item.id} href={item.href}>
                  <button
                    onClick={(e) => handleItemClick(item.id, e)}
                    className={`relative flex flex-col items-center space-y-1 p-3 rounded-2xl transition-all duration-300 transform group ${
                      active 
                        ? 'scale-110' 
                        : 'hover:scale-105'
                    } ${
                      item.isSpecial
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg'
                        : active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    style={{
                      boxShadow: item.isSpecial 
                        ? '0 8px 25px rgba(59, 130, 246, 0.3)' 
                        : active 
                        ? '0 4px 15px rgba(59, 130, 246, 0.1)' 
                        : 'none'
                    }}
                  >
                    {/* Ripple Effect */}
                    {animatingItem === item.id && (
                      <div 
                        className="absolute inset-0 rounded-2xl overflow-hidden"
                        style={{
                          background: `radial-gradient(circle at ${ripplePosition.x}px ${ripplePosition.y}px, rgba(59, 130, 246, 0.3) 0%, transparent 70%)`
                        }}
                      >
                        <div className="w-full h-full animate-ping bg-blue-400 opacity-20 rounded-2xl"></div>
                      </div>
                    )}
                    
                    {/* Icon with special effects */}
                    <div className={`relative ${item.isSpecial ? 'animate-gentle-pulse' : ''}`}>
                      <Icon 
                        className={`w-6 h-6 transition-all duration-300 ${
                          item.isSpecial 
                            ? 'drop-shadow-lg' 
                            : active 
                            ? 'scale-110' 
                            : 'group-hover:scale-110'
                        }`} 
                      />
                      
                      {/* Special BiPay glow effect */}
                      {item.isSpecial && (
                        <div className="absolute inset-0 w-6 h-6 bg-white/30 rounded-full animate-ping opacity-20"></div>
                      )}
                      
                      {/* Active indicator */}
                      {active && !item.isSpecial && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full animate-gentle-pulse"></div>
                      )}
                    </div>
                    
                    {/* Label */}
                    <span className={`text-xs font-medium transition-all duration-300 ${
                      item.isSpecial 
                        ? 'text-white drop-shadow-sm' 
                        : active 
                        ? 'text-blue-600 font-semibold' 
                        : 'group-hover:text-blue-600'
                    }`}>
                      {item.label}
                    </span>
                    
                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                        {item.badge}
                      </div>
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-50/20 to-transparent"></div>
          <div className="absolute bottom-8 left-8 w-3 h-3 bg-blue-300/30 rounded-full animate-float"></div>
          <div className="absolute bottom-12 right-12 w-2 h-2 bg-indigo-300/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-6 left-1/3 w-1 h-1 bg-blue-400/50 rounded-full animate-gentle-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Bottom padding for content */}
      <div className="h-20"></div>
    </>
  );
};

export default AnimatedFooter;
