import { useCallback } from 'react';

interface ErrorHandlerOptions {
  onError?: (error: Error) => void;
  ignoreDOMErrors?: boolean;
  context?: string;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { onError, ignoreDOMErrors = true, context } = options;

  const handleError = useCallback((error: Error, errorContext?: string) => {
    // Ignorar erros específicos de DOM se configurado
    if (ignoreDOMErrors && (
      error.message.includes('removeChild') || 
      error.message.includes('NotFoundError') ||
      error.message.includes('Failed to execute')
    )) {
      console.warn(`Erro de DOM ignorado${context || errorContext ? ` em ${context || errorContext}` : ''}:`, error.message);
      return;
    }

    // Log do erro
    console.error(`Erro${context || errorContext ? ` em ${context || errorContext}` : ''}:`, error);

    // Chamar callback de erro se fornecido
    onError?.(error);
  }, [onError, ignoreDOMErrors, context]);

  const wrapAsync = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    fnContext?: string
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error as Error, fnContext);
        throw error;
      }
    };
  }, [handleError]);

  return {
    handleError,
    wrapAsync
  };
}; 