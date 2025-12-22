// src/components/shared/ErrorState.tsx
import { EmptyState, EmptyStateType } from './EmptyState';

interface ErrorStateProps {
  title?: string;
  message?: string;
  titleColor?: string;
  messageColor?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
}) => {
  // ✅ ВАРИАНТ A: Используем новый EmptyState (рекомендую)
  return (
    <EmptyState 
      type="error"
      message={message}
      onRetry={onRetry}
    />
  );
  
}  