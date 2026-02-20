# CodeExpo — Browser-Based Code Sandbox

A self-hosted, browser-based coding environment inspired by CodeSandbox and Google Project IDX. Spin up isolated Docker containers per project, edit files with Monaco Editor, run a live terminal, and preview your app — all from the browser.

<img width="2430" height="964" alt="Screenshot 2026-02-19 at 10 53 47 PM" src="https://github.com/user-attachments/assets/d48be242-fca6-481c-8eca-b875e8cb5d9e" />
<img width="2430" height="964" alt="Screenshot 2026-02-19 at 10 53 56 PM" src="https://github.com/user-attachments/assets/9b3ea09b-b5f6-41bb-9105-754dba698b52" />

---

## ✨ Features

- **Isolated Sandboxes** — each project runs in its own Docker container (Docker-out-of-Docker)
- **Monaco Editor** — VS Code-grade editor with syntax highlighting
- **Integrated Terminal** — full xterm.js terminal attached to the sandbox via WebSocket
- **Live Preview** — in-browser preview proxied through the backend
- **File Explorer** — create, rename, and delete files/folders inside the sandbox
- **Resizable Panes** — drag-to-resize layout powered by Allotment

---

## 🗂️ Project Structure

```
Project-IDX-Codesandbox/
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CreateProject.jsx       # New project wizard
│   │   │   └── ProjectPlayground.jsx   # Main editor/terminal/preview
│   │   ├── components/         # Reusable UI components
│   │   ├── apis/               # Axios API helpers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── store/              # Zustand global state
│   │   ├── config/             # Environment / constants
│   │   └── utils/              # Utility functions
│   ├── Dockerfile              # Nginx production image
│   └── package.json
│
├── backend/                    # Node.js + TypeScript API server
│   ├── src/
│   │   ├── index.ts            # Main Express + Socket.IO server (port 50002)
│   │   ├── terminalApp.ts      # WebSocket terminal server (port 50003)
│   │   ├── previewProxy.ts     # Reverse-proxy for sandbox previews (port 50004)
│   │   ├── controllers/        # Route controllers
│   │   ├── routes/             # Express route definitions
│   │   ├── service/            # Business logic (file ops, Docker management)
│   │   ├── containers/         # Docker container lifecycle helpers
│   │   ├── socketHandlers/     # Socket.IO event handlers
│   │   ├── config/             # App configuration
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utility helpers
│   ├── Dockerfile              # Sandbox base image (Node + tools)
│   ├── Dockerfile.server       # Backend API image
│   └── package.json
│
├── docker-compose.yml          # Production compose (ports 50001-50004)
├── docker-compose.dev.yml      # Development compose
├── docker-compose.prod.yml     # Production overrides
├── deploy.sh                   # One-command VPS deploy script
├── DEPLOY.md                   # Detailed deployment guide
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend framework** | React 18, React Router v7 |
| **Build tool** | Vite 6 |
| **Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Terminal** | xterm.js (`@xterm/xterm`, addon-attach, addon-fit) |
| **UI components** | Ant Design 5, React Icons |
| **State management** | Zustand 5 |
| **Data fetching** | TanStack React Query v5, Axios |
| **Realtime** | Socket.IO client |
| **Layout** | Allotment (resizable panes) |
| **Backend runtime** | Node.js + TypeScript (tsx / tsc) |
| **API server** | Express 4 |
| **Realtime server** | Socket.IO 4 |
| **Container management** | Dockerode (Docker Engine API) |
| **File watching** | Chokidar 5 |
| **Containerisation** | Docker, Docker Compose |
| **Frontend serving** | Nginx (inside Docker) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Docker & Docker Compose
- Node.js ≥ 18 (for running without Docker)

### 1. Clone

```bash
git clone https://github.com/Harshksaw/Project-IDX-Codesandbox.git
cd Project-IDX-Codesandbox
```

### 2. Build the sandbox base image (one-time)

```bash
docker compose --profile build-sandbox build sandbox-builder
```

### 3. Start all services

```bash
docker compose up -d --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:50001 |
| Backend API | http://localhost:50002 |
| Terminal WS | http://localhost:50003 |
| Preview Proxy | http://localhost:50004 |

### 4. Run frontend & backend individually (without Docker)

```bash
# Terminal 1 — backend API server
cd backend
npm install
npm run dev          # API server on :50002

# Terminal 2 — backend terminal server
npm run dev2         # Terminal WS on :50003

# Terminal 3 — frontend
cd frontend
npm install
npm run dev          # Vite dev server on :5173
```

---

## 🏗️ Architecture Overview

```
Browser
  │
  ├── HTTP/WebSocket ──▶  Frontend (Nginx :50001)
  │                              │
  │                         Nginx proxy
  │                              │
  ├── REST API ────────▶  Backend API (:50002)   ──▶  Docker Engine
  │                              │                        │
  ├── Terminal WS ──────▶  Terminal Server (:50003)  ──▶  Sandbox Container
  │                                                        (per-project)
  └── Preview ─────────▶  Preview Proxy (:50004)  ──▶  Sandbox HTTP Server
```

Each project gets its own Docker sandbox container that mounts a shared `./projects/<id>` directory so files are persisted on the host.

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env.example`)
```
VITE_BACKEND_URL=     # Leave empty when running behind Nginx proxy
```

### Backend (`backend/.env.example`)
```
NODE_ENV=production
PORT=50002
TERMINAL_PORT=50003
PREVIEW_PORT=50004
HOST_PROJECTS_PATH=   # Absolute path to ./projects on the host (for sibling containers)
SANDBOX_NETWORK=codeexpo-network
```

---

## 📦 Deployment

See **[DEPLOY.md](./DEPLOY.md)** for the full VPS deployment guide including SSL setup, firewall configuration, and performance tuning.
