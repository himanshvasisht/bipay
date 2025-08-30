
import { Home, Send, Download, History, User } from 'lucide-react';
import { useLocation } from 'wouter';

const BottomNavigation = () => {
  const [location, setLocation] = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Send, label: 'Send', path: '/send' },
    { icon: Download, label: 'Receive', path: '/receive' },
    { icon: History, label: 'History', path: '/history' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location === path;
          
          return (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className={`
                flex flex-col items-center justify-center p-2 min-w-0 flex-1
                ${isActive ? 'text-blue-600' : 'text-gray-600'}
                hover:text-blue-600 transition-colors
              `}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
