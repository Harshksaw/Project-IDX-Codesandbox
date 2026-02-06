# Container Preview Solution

## Problem
When users create and run projects in CodeExpo, the applications run inside Docker containers (e.g., Vite dev server on port 5173). However, users couldn't access these running apps in their browsers because:

1. **Random Port Mapping**: Containers expose port 5173 but bind to random host ports (`"HostPort": "0"`)
2. **Network Isolation**: Containers run on isolated Docker networks
3. **No Proxy Route**: No reverse proxy was configured to forward browser requests to container ports

## Solution Architecture

### 1. Backend API Endpoint
**Endpoint**: `GET /api/v1/projects/:projectId/port`

Returns the dynamically assigned host port for a project's container:
```json
{
  "success": true,
  "data": { "port": "32768" },
  "message": "Successfully fetched container port"
}
```

### 2. Preview Proxy Route
**Route**: `/api/v1/preview/:projectId/*`

This dynamic proxy route:
- Gets the container's host port using `getContainerPort(projectId)`
- Creates a proxy middleware that forwards requests to `http://<host>:<port>`
- Rewrites the path to remove the `/api/v1/preview/:projectId` prefix
- Supports WebSocket connections for HMR (Hot Module Replacement)

### 3. Docker Networking
When the backend runs in Docker, it needs to access ports on the host machine. The solution uses:
- **Development/Local**: `localhost` to access host ports
- **Production (Docker)**: `172.17.0.1` (Docker bridge gateway) to access host ports from within the backend container

Environment variables:
- `DOCKER_ENVIRONMENT=true`: Indicates backend is running in Docker
- `DOCKER_HOST_IP=172.17.0.1`: Gateway IP for accessing host network

### 4. Nginx Configuration
Both production and dev nginx configs include:
```nginx
location ~ ^/api/v1/preview/([^/]+)/(.*)$ {
    proxy_pass http://backend_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    # ... other headers for WebSocket support
    proxy_buffering off;
}
```

### 5. Frontend Integration
The Browser component now uses the proxy URL directly:
```javascript
const previewUrl = `/api/v1/preview/${projectId}/`;
```

This eliminates the need for:
- Socket-based port discovery
- Port state management
- Direct localhost access attempts

## Request Flow

```
User Browser
    ↓
    → https://code.harshsaw.ca/api/v1/preview/my-project/
    ↓
Nginx (SSL termination)
    ↓
    → http://backend:50002/api/v1/preview/my-project/
    ↓
Backend (gets port: 32768 from Docker)
    ↓
    → http://172.17.0.1:32768/
    ↓
Sandbox Container (Vite dev server)
    ↓
    ← Response sent back through the chain
```

## Benefits

1. **Works in Production**: Properly handles Docker networking
2. **Simple Frontend**: No complex port discovery logic needed
3. **WebSocket Support**: Enables HMR and other real-time features
4. **Secure**: All traffic goes through nginx with proper SSL
5. **Multi-tenant**: Each project gets isolated preview URL

## Testing

To test locally:
1. Start the backend: `cd backend && npm run dev`
2. Create a project and run it
3. Access preview at: `http://localhost:50002/api/v1/preview/<projectId>/`

In production with nginx:
1. Access preview at: `https://code.harshsaw.ca/api/v1/preview/<projectId>/`
2. The UI will embed this in an iframe automatically

## Future Enhancements

1. **Path-based routing**: Could use `/preview/:projectId` at root level instead of `/api/v1/preview/:projectId`
2. **Subdomain routing**: Each project could get `<projectId>.preview.code.harshsaw.ca`
3. **Container networking**: Put sandbox containers on same network as backend for direct access (no host port mapping needed)
4. **Caching**: Cache port lookups to reduce Docker API calls
