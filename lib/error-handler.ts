/**
 * Global error handler to prevent unhandled promise rejections
 * Call this once in your application (e.g., in layout or middleware)
 */

let isErrorHandlerInitialized = false;

export function initializeErrorHandler() {
  if (isErrorHandlerInitialized) {
    return; // Already initialized
  }

  // Handle unhandled promise rejections
  if (typeof process !== 'undefined') {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
      
      // Don't exit the process in development, just log the error
      if (process.env.NODE_ENV === 'development') {
        console.error('This error was caught by the global error handler to prevent crashes during development.');
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('This error was caught by the global error handler to prevent crashes during development.');
      } else {
        // In production, you might want to exit gracefully
        process.exit(1);
      }
    });
  }

  isErrorHandlerInitialized = true;
  console.log('Global error handler initialized');
}

/**
 * Wrapper for MongoDB operations to handle errors gracefully
 */
export async function withErrorHandler<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    return fallback ?? null;
  }
} 