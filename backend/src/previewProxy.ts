import http from 'http';

/**
 * Preview Proxy Server
 * Routes /preview/:projectId/* requests to the appropriate sandbox container.
 *
 * Sandbox containers run Vite with `base: '/preview/:projectId/'`, so the
 * proxy forwards the full URL path (including the base prefix) and Vite
 * strips it internally.
 */

const PREVIEW_PORT = parseInt(process.env.PREVIEW_PORT || '50004');
const CONTAINER_PORT = 5173; // Internal port inside sandbox containers

const server = http.createServer(async (req, res) => {
    const url = req.url || '/';

    // Parse projectId from URL: /preview/:projectId/...
    const match = url.match(/^\/preview\/([a-f0-9-]+)(\/.*)?$/i);

    if (!match) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found - Invalid preview URL');
        return;
    }

    const projectId = match[1];

    try {
        // Forward the full URL path to Vite (which has base: '/preview/:projectId/')
        // Vite's dev server will strip the base prefix internally
        const proxyReq = http.request(
            {
                hostname: projectId, // Container name as hostname on Docker network
                port: CONTAINER_PORT,
                path: url, // Full path including /preview/:projectId/ prefix
                method: req.method,
                headers: {
                    ...req.headers,
                    host: `localhost:${CONTAINER_PORT}`,
                },
            },
            (proxyRes) => {
                res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
                proxyRes.pipe(res);
            }
        );

        proxyReq.on('error', (err) => {
            console.error(`Proxy error for ${projectId}:`, err.message);
            res.writeHead(502, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                <head><title>Preview Not Available</title></head>
                <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                    <h1>Preview Not Available</h1>
                    <p>The development server is not running yet.</p>
                    <p>Run <code>npm run dev</code> in the terminal to start it.</p>
                    <button onclick="location.reload()">Retry</button>
                </body>
                </html>
            `);
        });

        req.pipe(proxyReq);
    } catch (error) {
        console.error(`Preview error for ${projectId}:`, error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});

// Handle WebSocket upgrade for HMR
server.on('upgrade', async (req, socket, head) => {
    const url = req.url || '/';
    const match = url.match(/^\/preview\/([a-f0-9-]+)(\/.*)?$/i);

    if (!match) {
        socket.destroy();
        return;
    }

    const projectId = match[1];

    try {
        const proxySocket = new (await import('net')).default.Socket();

        proxySocket.connect(CONTAINER_PORT, projectId, () => {
            const modifiedHeaders = Object.entries(req.headers)
                .map(([key, value]) => {
                    if (key.toLowerCase() === 'host') {
                        return `${key}: localhost:${CONTAINER_PORT}`;
                    }
                    return `${key}: ${value}`;
                })
                .join('\r\n');

            // Forward full URL path for WebSocket too
            const upgradeRequest = `${req.method} ${url} HTTP/1.1\r\n${modifiedHeaders}\r\n\r\n`;

            proxySocket.write(upgradeRequest);
            if (head.length > 0) {
                proxySocket.write(head);
            }

            socket.pipe(proxySocket);
            proxySocket.pipe(socket);
        });

        proxySocket.on('error', (err) => {
            console.error(`WebSocket proxy error for ${projectId}:`, err.message);
            socket.destroy();
        });

        socket.on('error', () => {
            proxySocket.destroy();
        });

    } catch (error) {
        console.error(`WebSocket upgrade error for ${projectId}:`, error);
        socket.destroy();
    }
});

server.listen(PREVIEW_PORT, () => {
    console.log(`Preview proxy server running on port ${PREVIEW_PORT}`);
});

export default server;
