/**
 * Framework configuration and initialization commands
 */

export enum FrameworkType {
  VITE_REACT = 'vite-react',
  VITE_VUE = 'vite-vue',
  VITE_SVELTE = 'vite-svelte',
  EXPRESS_JS = 'express-js',
  NEST_JS = 'nest-js',
  NEXT_JS = 'next-js',
  MONOREPO_TURBOREPO = 'monorepo-turborepo',
  MONOREPO_PNPM = 'monorepo-pnpm',
  NODE_TYPESCRIPT = 'node-typescript',
  NODE_JAVASCRIPT = 'node-javascript'
}

export interface FrameworkConfig {
  type: FrameworkType;
  name: string;
  description: string;
  initCommand: string;
  buildCommand?: string;
  devCommand?: string;
  startCommand?: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  entryPoint: string;
  supportsDocker: boolean;
  dockerTemplate?: string;
}

export const FRAMEWORK_CONFIGS: Record<FrameworkType, FrameworkConfig> = {
  [FrameworkType.VITE_REACT]: {
    type: FrameworkType.VITE_REACT,
    name: 'Vite + React',
    description: 'Fast frontend framework with React',
    initCommand: 'npm create vite@latest . -- --template react-ts',
    buildCommand: 'npm run build',
    devCommand: 'npm run dev',
    packageManager: 'npm',
    entryPoint: 'src/main.tsx',
    supportsDocker: true,
    dockerTemplate: 'frontend'
  },
  [FrameworkType.VITE_VUE]: {
    type: FrameworkType.VITE_VUE,
    name: 'Vite + Vue',
    description: 'Fast frontend framework with Vue',
    initCommand: 'npm create vite@latest . -- --template vue-ts',
    buildCommand: 'npm run build',
    devCommand: 'npm run dev',
    packageManager: 'npm',
    entryPoint: 'src/main.ts',
    supportsDocker: true
  },
  [FrameworkType.VITE_SVELTE]: {
    type: FrameworkType.VITE_SVELTE,
    name: 'Vite + Svelte',
    description: 'Fast frontend framework with Svelte',
    initCommand: 'npm create vite@latest . -- --template svelte-ts',
    buildCommand: 'npm run build',
    devCommand: 'npm run dev',
    packageManager: 'npm',
    entryPoint: 'src/main.ts',
    supportsDocker: true
  },
  [FrameworkType.EXPRESS_JS]: {
    type: FrameworkType.EXPRESS_JS,
    name: 'Express.js',
    description: 'Node.js web framework',
    initCommand: 'npm init -y && npm install express',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    packageManager: 'npm',
    entryPoint: 'src/index.js',
    supportsDocker: true
  },
  [FrameworkType.NEST_JS]: {
    type: FrameworkType.NEST_JS,
    name: 'NestJS',
    description: 'Progressive Node.js framework',
    initCommand: 'npm i -g @nestjs/cli && nest new . --skip-git --package-manager npm',
    buildCommand: 'npm run build',
    startCommand: 'npm run start',
    devCommand: 'npm run start:dev',
    packageManager: 'npm',
    entryPoint: 'src/main.ts',
    supportsDocker: true
  },
  [FrameworkType.NEXT_JS]: {
    type: FrameworkType.NEXT_JS,
    name: 'Next.js',
    description: 'React framework with server-side rendering',
    initCommand: 'npx create-next-app@latest . --typescript --tailwind --no-git',
    buildCommand: 'npm run build',
    devCommand: 'npm run dev',
    startCommand: 'npm start',
    packageManager: 'npm',
    entryPoint: 'pages/index.tsx',
    supportsDocker: true
  },
  [FrameworkType.MONOREPO_TURBOREPO]: {
    type: FrameworkType.MONOREPO_TURBOREPO,
    name: 'Monorepo (Turborepo)',
    description: 'Monorepo setup with Turborepo',
    initCommand: 'npx create-turbo@latest . --skip-install',
    buildCommand: 'turbo build',
    devCommand: 'turbo dev',
    packageManager: 'npm',
    entryPoint: 'packages/web/src/index.ts',
    supportsDocker: false
  },
  [FrameworkType.MONOREPO_PNPM]: {
    type: FrameworkType.MONOREPO_PNPM,
    name: 'Monorepo (pnpm Workspaces)',
    description: 'Monorepo setup with pnpm workspaces',
    initCommand: 'pnpm init -y && echo "packages:\\n  - \\"packages/*\\"" > pnpm-workspace.yaml',
    packageManager: 'pnpm',
    buildCommand: 'pnpm -r build',
    devCommand: 'pnpm -r dev',
    entryPoint: 'packages/app/src/index.ts',
    supportsDocker: false
  },
  [FrameworkType.NODE_TYPESCRIPT]: {
    type: FrameworkType.NODE_TYPESCRIPT,
    name: 'Node.js + TypeScript',
    description: 'Minimal Node.js setup with TypeScript',
    initCommand: 'npm init -y && npm install typescript ts-node @types/node',
    buildCommand: 'tsc',
    startCommand: 'node dist/index.js',
    devCommand: 'ts-node src/index.ts',
    packageManager: 'npm',
    entryPoint: 'src/index.ts',
    supportsDocker: true
  },
  [FrameworkType.NODE_JAVASCRIPT]: {
    type: FrameworkType.NODE_JAVASCRIPT,
    name: 'Node.js (JavaScript)',
    description: 'Minimal Node.js setup with JavaScript',
    initCommand: 'npm init -y',
    startCommand: 'node src/index.js',
    packageManager: 'npm',
    entryPoint: 'src/index.js',
    supportsDocker: true
  }
};

export const getFrameworkConfig = (type: FrameworkType): FrameworkConfig => {
  const config = FRAMEWORK_CONFIGS[type];
  if (!config) {
    throw new Error(`Unknown framework type: ${type}`);
  }
  return config;
};

export const getAvailableFrameworks = (): FrameworkConfig[] => {
  return Object.values(FRAMEWORK_CONFIGS);
};
