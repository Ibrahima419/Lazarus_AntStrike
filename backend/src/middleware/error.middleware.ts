/**
 * ⚠️ Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log error
  logger.error('Error occurred', {
    statusCode,
    message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id
  });

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !isOperational) {
    message = 'An unexpected error occurred';
  }

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      status: 404,
      message: `Route ${req.method} ${req.path} not found`
    }
  });
}




