import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Toast } from '../components/Toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as ToastType,
    duration: 2500,
  });

  const showToast = (message: string, type: ToastType = 'success', duration: number = 2500) => {
    setToast({ visible: true, message, type, duration });
    setTimeout(() => {
      setToast({ visible: false, message: '', type, duration });
    }, duration + 300); // Add transition time
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast {...toast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
