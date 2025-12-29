// src/components/shared/ErrorState.tsx
import { EmptyState } from './EmptyState';

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
  
  return (
    <EmptyState 
      type="error"
      message={message}
      onRetry={onRetry}
    />
  );
  
}  