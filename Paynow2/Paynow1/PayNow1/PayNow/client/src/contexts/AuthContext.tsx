
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  name: string;
  full_name?: string;
  mobile: string;
  balance: number;
  wallet_id: string;
  bipay_id: string; // Unique BiPay ID for payments
  biometric_enabled: boolean;
  biometric_data?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (mobile: string, password: string) => Promise<boolean>;
  register: (name: string, mobile: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuthState = () => {
      const storedUser = sessionStorage.getItem('bipay_user');
      const token = sessionStorage.getItem('bipay_token');
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          apiClient.setAuthToken(token);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid data
          sessionStorage.removeItem('bipay_user');
          sessionStorage.removeItem('bipay_token');
          sessionStorage.removeItem('bipay_device_id');
        }
      }
      setIsLoading(false);
    };

    checkAuthState();
  }, []);

  const login = async (mobile: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(mobile, password);

      if (response.success) {
        const userData = response.data as {
          user: User;
          token: string;
          device_id?: string;
        };
        setUser(userData.user);
        setIsAuthenticated(true);
        sessionStorage.setItem('bipay_user', JSON.stringify(userData.user));
        sessionStorage.setItem('bipay_token', userData.token);
        sessionStorage.setItem('bipay_device_id', userData.device_id || 'web_device_' + Date.now());
        apiClient.setAuthToken(userData.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };  const register = async (name: string, mobile: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.register(name, mobile, password);

      if (response.success) {
        // Auto login after registration
        return await login(mobile, password);
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('bipay_user');
    sessionStorage.removeItem('bipay_token');
    sessionStorage.removeItem('bipay_device_id');
    apiClient.setAuthToken(null);
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      sessionStorage.setItem('bipay_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      updateBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};
