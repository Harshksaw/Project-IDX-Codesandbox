import dotenv from 'dotenv';
import type { ServerConfig } from '../types/config.js';

dotenv.config();

const config: ServerConfig = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  REACT_PROJECT_COMMAND: process.env.REACT_PROJECT_COMMAND || 'npm create vite@latest',
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development'
};

export default config;
