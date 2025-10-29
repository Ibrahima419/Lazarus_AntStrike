/**
 * 🔐 Extension TypeScript pour Express Request
 * Ajoute la propriété 'user' au type Request
 */

declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      tenantId: string;
      email: string;
      role: string;
    };
  }
}


