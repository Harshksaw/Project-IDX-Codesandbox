import type { Request, Response, NextFunction } from 'express';
import type { FrameworkType } from './frameworks.js';

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
  framework: FrameworkType;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
    nodeVersion?: string;
    deploymentTarget?: 'docker' | 'serverless' | 'standalone';
  };
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

// Framework request types
export interface CreateProjectRequest extends Request {
  body: {
    name?: string;
    framework: FrameworkType;
    description?: string;
    metadata?: Record<string, any>;
  };
}

