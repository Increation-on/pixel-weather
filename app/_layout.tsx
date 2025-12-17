import { queryClient } from '@/src/lib/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import './../global.css';

export default function RootLayout() {
  return (  
      <QueryClientProvider client={queryClient}>
        <Stack />
      </QueryClientProvider>
  );
}