export interface ServerConfig {
  PORT: number;
  REACT_PROJECT_COMMAND: string;
  NODE_ENV: 'development' | 'production' | 'test';
}
