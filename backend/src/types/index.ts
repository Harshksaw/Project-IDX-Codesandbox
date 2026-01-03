import type { Request, Response, NextFunction } from 'express';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  createdAt: Date;
}

export interface ProjectTree {
  path: string;
  name: string;
  type?: 'file' | 'directory';
  size?: number;
  extension?: string;
  children?: ProjectTree[];
}

// Route handler types
export type AsyncRoute = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<void | Response>;

// Request extensions
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}
