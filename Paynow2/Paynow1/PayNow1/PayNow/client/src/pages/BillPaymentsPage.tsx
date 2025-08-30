import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Smartphone, 
  Zap, 
  Wifi, 
  Car, 
  Home,
  CreditCard,
  Tv,
  Droplets,
  Flame,
  GraduationCap,
  Building,
  Shield,
  Plane,
  ShoppingCart,
  Gift,
  TrendingUp,
  Star,
  Clock,
  ChevronRight,
  Search,
  Filter,
  Sparkles,
  Wallet
} from 'lucide-react';

interface BillService {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: string;
  color: string;
  bgColor: string;
  description: string;
  popular?: boolean;
  cashback?: string;
}

const BillPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All', icon: Star },
    { id: 'mobile', name: 'Mobile', icon: Smartphone },
    { id: 'utilities', name: 'Utilities', icon: Zap },
    { id: 'entertainment', name: 'Entertainment', icon: Tv },
    { id: 'finance', name: 'Finance', icon: CreditCard },
    { id: 'travel', name: 'Travel', icon: Plane }
  ];

  const billServices: BillService[] = [
    // Mobile & DTH
    { id: 'airtel', name: 'Airtel', icon: Smartphone, category: 'mobile', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Mobile & DTH Recharge', popular: true, cashback: '2%' },
    { id: 'jio', name: 'Jio', icon: Smartphone, category: 'mobile', color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Mobile & DTH Recharge', popular: true, cashback: '1.5%' },
    { id: 'vodafone', name: 'Vodafone Idea', icon: Smartphone, category: 'mobile', color: 'text-red-500', bgColor: 'bg-red-50', description: 'Mobile Recharge', cashback: '1%' },
    { id: 'bsnl', name: 'BSNL', icon: Smartphone, category: 'mobile', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Mobile Recharge' },

    // Utilities
    { id: 'electricity', name: 'Electricity Bill', icon: Zap, category: 'utilities', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'State Electricity Boards', popular: true, cashback: '1%' },
    { id: 'gas', name: 'Gas Bill', icon: Flame, category: 'utilities', color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'Pipeline Gas Bills', cashback: '0.5%' },
    { id: 'water', name: 'Water Bill', icon: Droplets, category: 'utilities', color: 'text-blue-500', bgColor: 'bg-blue-50', description: 'Municipal Water Bills' },
    { id: 'broadband', name: 'Broadband', icon: Wifi, category: 'utilities', color: 'text-purple-600', bgColor: 'bg-purple-50', description: 'Internet Bills', cashback: '1%' },

    // Entertainment
    { id: 'netflix', name: 'Netflix', icon: Tv, category: 'entertainment', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Streaming Subscription', popular: true },
    { id: 'amazon-prime', name: 'Amazon Prime', icon: Tv, category: 'entertainment', color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Prime Subscription' },
    { id: 'hotstar', name: 'Disney+ Hotstar', icon: Tv, category: 'entertainment', color: 'text-indigo-600', bgColor: 'bg-indigo-50', description: 'Streaming Service' },
    { id: 'spotify', name: 'Spotify', icon: Tv, category: 'entertainment', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Music Streaming' },

    // Finance
    { id: 'credit-card', name: 'Credit Card', icon: CreditCard, category: 'finance', color: 'text-blue-700', bgColor: 'bg-blue-50', description: 'Credit Card Bills', popular: true },
    { id: 'loan-emi', name: 'Loan EMI', icon: Building, category: 'finance', color: 'text-green-700', bgColor: 'bg-green-50', description: 'Personal & Home Loans' },
    { id: 'insurance', name: 'Insurance', icon: Shield, category: 'finance', color: 'text-purple-700', bgColor: 'bg-purple-50', description: 'Life & Health Insurance' },
    { id: 'mutual-funds', name: 'Mutual Funds', icon: TrendingUp, category: 'finance', color: 'text-indigo-700', bgColor: 'bg-indigo-50', description: 'SIP & Investments' },

    // Travel
    { id: 'flight', name: 'Flight Booking', icon: Plane, category: 'travel', color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Domestic & International' },
    { id: 'hotel', name: 'Hotel Booking', icon: Building, category: 'travel', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Hotels & Resorts' },
    { id: 'cab', name: 'Cab Booking', icon: Car, category: 'travel', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Taxi & Ride Sharing' }
  ];

  const popularServices = billServices.filter(service => service.popular);

  const filteredServices = billServices.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleServiceClick = (service: BillService) => {
    // Navigate to specific bill payment page
    console.log('Opening bill payment for:', service.name);
    alert(`${service.name} bill payment coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-professional-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Bill Payments</h1>
              <p className="text-blue-100">Pay bills and recharge instantly</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6" />
            <span className="text-sm">₹{user?.balance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-professional border border-blue-100">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bills, recharge, and services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Services */}
        {selectedCategory === 'all' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-800 flex items-center">
                <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                Popular Services
              </h2>
              <span className="text-sm text-blue-600">Trending</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularServices.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="bg-white p-4 rounded-2xl shadow-professional border border-blue-100 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 ${service.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <service.icon className={`w-6 h-6 ${service.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{service.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                  {service.cashback && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {service.cashback} cashback
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Services */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-800">
              {selectedCategory === 'all' ? 'All Services' : categories.find(c => c.id === selectedCategory)?.name + ' Services'}
            </h2>
            <span className="text-sm text-gray-500">{filteredServices.length} services</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredServices.map(service => (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className="bg-white p-4 rounded-2xl shadow-professional border border-gray-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 ${service.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <service.icon className={`w-7 h-7 ${service.color}`} />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-gray-800">{service.name}</h3>
                      {service.popular && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                    
                    <div className="flex items-center space-x-4">
                      {service.cashback && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          {service.cashback} cashback
                        </span>
                      )}
                      <span className="text-xs text-blue-600">Instant payment</span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Bills */}
        <div className="bg-white rounded-3xl p-6 shadow-professional border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              Recent Bills
            </h2>
            <Link href="/history">
              <button className="text-blue-600 text-sm font-medium">View All</button>
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Airtel Mobile', amount: 399, date: 'Yesterday', icon: Smartphone, status: 'paid' },
              { name: 'Electricity Bill', amount: 1250, date: '3 days ago', icon: Zap, status: 'paid' },
              { name: 'Jio Recharge', amount: 599, date: '1 week ago', icon: Smartphone, status: 'paid' }
            ].map((bill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <bill.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{bill.name}</h4>
                    <p className="text-sm text-gray-500">{bill.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">₹{bill.amount}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Padding for Navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default BillPaymentsPage;
