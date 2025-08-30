
import { Router, Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { BiometricProvider } from '@/contexts/BiometricContext';
import LoadingScreen from '@/components/LoadingScreen';
import AnimatedFooter from '@/components/AnimatedFooter';
import AuthPage from '@/pages/AuthPage';
import HomePage from '@/pages/HomePage';
import SendPaymentPage from '@/pages/SendPaymentPage';
import ReceivePaymentPage from '@/pages/ReceivePaymentPage';
import BiPayPaymentPage from '@/pages/BiPayPaymentPage';
import BiPayRequestPage from '@/pages/BiPayRequestPage';
import BillPaymentsPage from '@/pages/BillPaymentsPage';
import ExtraFeaturesPage from '@/pages/ExtraFeaturesPage';
import EcosystemDemo from '@/pages/EcosystemDemo';
import BiometricPaymentDemo from '@/pages/BiometricPaymentDemo';
import HistoryPage from '@/pages/HistoryPage';
import ProfilePage from '@/pages/ProfilePage';
import NotificationPage from '@/pages/NotificationPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <AuthProvider>
      <BiometricProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Switch>
              <Route path="/auth" component={AuthPage} />
              <ProtectedRoute path="/" component={HomePage} />
              <ProtectedRoute path="/send" component={SendPaymentPage} />
              <ProtectedRoute path="/receive" component={ReceivePaymentPage} />
              <ProtectedRoute path="/bipay-send" component={BiPayPaymentPage} />
              <ProtectedRoute path="/bipay-request" component={BiPayRequestPage} />
              <ProtectedRoute path="/bills" component={BillPaymentsPage} />
              <ProtectedRoute path="/extra-features" component={ExtraFeaturesPage} />
              <Route path="/ecosystem-demo" component={EcosystemDemo} />
              <Route path="/biometric-demo" component={BiometricPaymentDemo} />
              <ProtectedRoute path="/history" component={HistoryPage} />
              <ProtectedRoute path="/notifications" component={NotificationPage} />
              <ProtectedRoute path="/profile" component={ProfilePage} />
            </Switch>
            
            {/* Animated Footer - only show on protected routes */}
            <Route path="/auth" />
            <Route>
              <AnimatedFooter />
            </Route>
          </div>
        </Router>
        <Toaster />
      </BiometricProvider>
    </AuthProvider>
  );
}

export default App;
