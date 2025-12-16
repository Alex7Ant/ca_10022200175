'use client';

import { AuthProvider } from '@/lib/context';
import { useToast } from '@/lib/toast';

function ToastWrapper({ children }: { children: React.ReactNode }) {
  const { ToastContainer } = useToast();
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastWrapper>{children}</ToastWrapper>
    </AuthProvider>
  );
}
