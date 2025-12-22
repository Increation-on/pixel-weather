// src/utils/UserFriendlyError.ts
export class UserFriendlyError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'UserFriendlyError';
    
    // Для правильного наследования в TypeScript
    Object.setPrototypeOf(this, UserFriendlyError.prototype);
  }
  
  // Фабричные методы для удобства
  static network(message: string = 'Нет подключения к интернету'): UserFriendlyError {
    return new UserFriendlyError(message, 'NETWORK_ERROR');
  }
  
  static api(message: string = 'Сервис временно недоступен'): UserFriendlyError {
    return new UserFriendlyError(message, 'API_ERROR');
  }
  
  static validation(message: string): UserFriendlyError {
    return new UserFriendlyError(message, 'VALIDATION_ERROR');
  }
}