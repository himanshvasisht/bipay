import React from 'react';
import { Link } from 'wouter';
import { 
  Shield, 
  Fingerprint, 
  Heart,
  Star,
  Users,
  Lock,
  Zap,
  Phone,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-700 rounded-full opacity-10 animate-float"></div>
        <div className="absolute top-20 -left-8 w-24 h-24 bg-indigo-700 rounded-full opacity-15 animate-gentle-pulse"></div>
        <div className="absolute bottom-10 right-1/3 w-16 h-16 bg-blue-800 rounded-full opacity-20 animate-float"></div>
      </div>

      <div className="relative p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4 animate-fade-in-up">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-professional">
                  <span className="text-xl font-bold">B</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                    BiPay
                  </h3>
                  <p className="text-blue-300 text-sm">Future of Digital Payments</p>
                </div>
              </div>
              
              <p className="text-blue-200 text-sm leading-relaxed mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Experience the future of digital payments with BiPay. Secure, fast, and reliable payment solutions 
                powered by advanced biometric technology. Your money, your security, your control.
              </p>
              
              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-blue-200">Bank Grade Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-200">Biometric Auth</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-blue-200">Instant Transfers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-blue-200">256-bit Encryption</span>
                </div>
              </div>

              {/* App Stats */}
              <div className="flex items-center space-x-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10M+</div>
                  <div className="text-xs text-blue-300">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">₹500Cr+</div>
                  <div className="text-xs text-blue-300">Transacted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-xs text-blue-300">Uptime</div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <h4 className="font-semibold text-blue-300 mb-4 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Quick Links
              </h4>
              <ul className="space-y-3 text-sm text-blue-200">
                <li>
                  <Link href="/send" className="hover:text-white transition-colors duration-300 flex items-center space-x-2">
                    <span>→</span>
                    <span>Send Money</span>
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="hover:text-white transition-colors duration-300 flex items-center space-x-2">
                    <span>→</span>
                    <span>Transaction History</span>
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-white transition-colors duration-300 flex items-center space-x-2">
                    <span>→</span>
                    <span>Manage Profile</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cards" className="hover:text-white transition-colors duration-300 flex items-center space-x-2">
                    <span>→</span>
                    <span>Manage Cards</span>
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-white transition-colors duration-300 flex items-center space-x-2">
                    <span>→</span>
                    <span>Security Settings</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Contact */}
            <div className="animate-fade-in-up" style={{ animationDelay: '1s' }}>
              <h4 className="font-semibold text-blue-300 mb-4 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Support & Contact
              </h4>
              <ul className="space-y-3 text-sm text-blue-200">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors duration-300 flex items-center space-x-2">
                    <span>→</span>
                    <span>Help Center</span>
                  </Link>
                </li>
                <li>
                  <a href="tel:+911800123456" className="hover:text-white transition-colors duration-300 flex items-center space-x-2">
                    <Phone className="w-3 h-3" />
                    <span>1800-123-456</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:support@bipay.com" className="hover:text-white transition-colors duration-300 flex items-center space-x-2">
                    <Mail className="w-3 h-3" />
                    <span>support@bipay.com</span>
                  </a>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white transition-colors duration-300 flex items-center space-x-2">
                    <span>→</span>
                    <span>Security Center</span>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors duration-300 flex items-center space-x-2">
                    <span>→</span>
                    <span>Privacy Policy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Partnership & Awards Section */}
          <div className="border-t border-blue-800 mt-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
              {/* Partners */}
              <div>
                <h5 className="text-blue-300 font-medium mb-3">Trusted Partners</h5>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold">RBI</span>
                    </div>
                    <span className="text-xs text-blue-300">Regulated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold">SSL</span>
                    </div>
                    <span className="text-xs text-blue-300">Secured</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold">ISO</span>
                    </div>
                    <span className="text-xs text-blue-300">Certified</span>
                  </div>
                </div>
              </div>

              {/* Awards */}
              <div>
                <h5 className="text-blue-300 font-medium mb-3">Recognition</h5>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-xs text-blue-300">Best Fintech App 2024</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-400 fill-current" />
                    <span className="text-xs text-blue-300">User's Choice</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-blue-800 mt-8 pt-6 animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <p className="text-blue-300 text-sm">
                  © 2024 BiPay Technologies Pvt. Ltd. All rights reserved.
                </p>
                <div className="hidden md:flex items-center space-x-4 text-xs text-blue-400">
                  <Link href="/terms" className="hover:text-blue-200 transition-colors">Terms</Link>
                  <span>•</span>
                  <Link href="/privacy" className="hover:text-blue-200 transition-colors">Privacy</Link>
                  <span>•</span>
                  <Link href="/cookies" className="hover:text-blue-200 transition-colors">Cookies</Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-blue-400">Version 2.1.0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-gentle-pulse"></div>
                  <span className="text-xs text-blue-300">All Systems Operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-300">Available in India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Made with Love */}
          <div className="text-center mt-6 pt-4 border-t border-blue-800 animate-fade-in-up" style={{ animationDelay: '1.6s' }}>
            <p className="text-blue-400 text-xs flex items-center justify-center space-x-2">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-400 fill-current animate-gentle-pulse" />
              <span>in India for the Digital Future</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
