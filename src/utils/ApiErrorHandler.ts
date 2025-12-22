// src/utils/ApiErrorHandler.ts
import { UserFriendlyError } from "./userFriendlyError";

export class ApiErrorHandler {
  /**
   * Преобразует любую ошибку в UserFriendlyError
   */
  static handle(error: unknown, context: string = 'API'): UserFriendlyError {
    console.error(`[${context}] Ошибка:`, error);
    
    // Если уже UserFriendlyError - возвращаем как есть
    if (error instanceof UserFriendlyError) {
      return error;
    }
    
    // Обработка сетевых ошибок
    if (error instanceof TypeError && error.message.includes('Network')) {
      return UserFriendlyError.network('Проверьте подключение к интернету');
    }
    
    // Обработка fetch/axios ошибок
    if (error instanceof Error) {
      // API-specific ошибки
      if (error.message.includes('404')) {
        return new UserFriendlyError('Данные не найдены', 'NOT_FOUND', error);
      }
      if (error.message.includes('401') || error.message.includes('403')) {
        return new UserFriendlyError('Ошибка авторизации', 'AUTH_ERROR', error);
      }
      if (error.message.includes('5')) {
        return UserFriendlyError.api('Сервер временно недоступен');
      }
      
      // Другие ошибки Error
      return new UserFriendlyError(
        error.message || 'Неизвестная ошибка',
        'UNKNOWN_ERROR',
        error
      );
    }
    
    // Fallback для любых других ошибок
    return new UserFriendlyError(
      'Произошла непредвиденная ошибка',
      'UNKNOWN_ERROR',
      error
    );
  }
  
  /**
   * Обёртка для асинхронных функций
   */
  static async wrap<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.handle(error, context);
    }
  }
}