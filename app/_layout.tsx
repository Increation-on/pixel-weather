import { queryClient } from '@/src/lib/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ToastProvider } from '@/src/providers/ToastProvider';
import { NetworkProvider } from '@/src/providers/NetworkProvider';
import './../global.css';

export default function RootLayout() {
  return (
    <NetworkProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <Stack />
        </QueryClientProvider>
      </ToastProvider>
    </NetworkProvider>
      
  );
}