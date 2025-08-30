
import { Toast, ToastProvider, ToastViewport } from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { useState } from 'react';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export const Toaster = () => {
  return (
    <ToastProvider>
      <ToastViewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    setToasts((prev) => [...prev, { title, description, variant }]);
  };

  return { toast };
};
