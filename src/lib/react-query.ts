import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * staleTime: 5 минут (5 * 60 * 1000 миллисекунд)
       * Данные считаются "свежими" 5 минут после получения
       */
      staleTime: 5 * 60 * 1000, // 5 минут
      
      /**
       * gcTime: 10 минут (ЗАМЕНИЛИ cacheTime на gcTime!)
       * Время, после которого неактивные данные удаляются из кэша
       * Ранее назывался cacheTime
       */
      gcTime: 10 * 60 * 1000, // 10 минут
      
      /**
       * retry: 1 попытка
       * При ошибке запроса автоматически повторить 1 раз
       */
      retry: 1,
      
      /**
       * refetchOnWindowFocus: false
       * Не обновлять данные при возвращении на вкладку
       */
      refetchOnWindowFocus: false,
      
      /**
       * refetchOnMount: true
       * Обновлять данные при монтировании компонента, если данные устарели
       */
      refetchOnMount: true,
      
      /**
       * refetchOnReconnect: true
       * Обновить данные при восстановлении соединения
       */
      refetchOnReconnect: true,
    },
  },
});