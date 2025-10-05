// Environment configuration and utility functions
export const env = {
  // Application settings
  APP_NAME: import.meta.env.VITE_APP_NAME || 'AntStrike CTI',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '2.1.4',
  APP_ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  
  // Development flags
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  
};

// Development helper functions
export const isDevelopment = () => env.APP_ENVIRONMENT === 'development';
export const isProduction = () => env.APP_ENVIRONMENT === 'production';
export const isStaging = () => env.APP_ENVIRONMENT === 'staging';

// Debug and error logging
export const debugLog = (...args: any[]) => {
  if (env.ENABLE_DEBUG && isDevelopment()) {
    console.log('[DEBUG]', ...args);
  }
};

export const errorLog = (error: any, context?: string) => {
  if (isDevelopment()) {
    console.error('[ERROR]', context ? `[${context}]` : '', error);
  }
  
  // In production, you might want to send errors to a service like Sentry
  if (isProduction()) {
    // TODO: Integrate with error tracking service
    // Sentry.captureException(error, { extra: { context } });
  }
};

// Configuration validation
export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_APP_NAME',
    'VITE_APP_VERSION'
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  
  return missing.length === 0;
};

// Export environment info for debugging
export const getEnvironmentInfo = () => ({
  app: {
    name: env.APP_NAME,
    version: env.APP_VERSION,
    environment: env.APP_ENVIRONMENT,
  },
  features: {
    debug: env.ENABLE_DEBUG,
  },
  
  timestamp: new Date().toISOString(),
});