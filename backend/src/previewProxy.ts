import http from 'http';

/**
 * Preview Proxy Server
 * Routes /preview/:projectId/* requests to the appropriate sandbox container
 *
 * Uses Docker network routing: sandbox containers are on the same network
 * as the backend, so we reach them by container name on port 5173.
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
    const path = match[2] || '/';

    try {
        // Proxy the request to the container via Docker network
        // Container name = projectId, reachable on the shared network
        const proxyReq = http.request(
            {
                hostname: projectId, // Container name as hostname on Docker network
                port: CONTAINER_PORT,
                path: path,
                method: req.method,
                headers: {
                    ...req.headers,
                    host: `localhost:${CONTAINER_PORT}`,
                },
            },
            (proxyRes) => {
                const contentType = proxyRes.headers['content-type'] || '';

                // For HTML responses with 200 status, inject <base> tag to fix relative paths
                if (contentType.includes('text/html') && proxyRes.statusCode === 200) {
                    let body = '';
                    proxyRes.on('data', chunk => body += chunk);
                    proxyRes.on('end', () => {
                        // Inject base tag after <head> to make relative URLs work
                        const baseTag = `<base href="/preview/${projectId}/">`;
                        let modifiedBody = body;

                        if (body.includes('<head>')) {
                            modifiedBody = body.replace('<head>', `<head>${baseTag}`);
                        } else if (body.includes('<!DOCTYPE') || body.includes('<html')) {
                            modifiedBody = baseTag + body;
                        }

                        // Update content-length header
                        const headers = { ...proxyRes.headers };
                        delete headers['content-length'];
                        delete headers['Content-Length'];
                        delete headers['transfer-encoding'];
                        delete headers['Transfer-Encoding'];
                        headers['content-length'] = Buffer.byteLength(modifiedBody).toString();

                        res.writeHead(proxyRes.statusCode || 200, headers);
                        res.end(modifiedBody);
                    });
                } else {
                    // For non-HTML responses, validate MIME type matches expected file extension
                    const requestedPath = path.toLowerCase();
                    const actualContentType = contentType.toLowerCase();

                    // Check for Vite SPA fallback returning HTML for JS/CSS files
                    const isJsRequest = requestedPath.endsWith('.js') || requestedPath.endsWith('.ts') ||
                                       requestedPath.endsWith('.tsx') || requestedPath.endsWith('.jsx') ||
                                       requestedPath.includes('@vite') || requestedPath.includes('@react-refresh');
                    const isCssRequest = requestedPath.endsWith('.css');

                    if ((isJsRequest || isCssRequest) && actualContentType.includes('text/html')) {
                        console.error(`MIME mismatch: ${requestedPath} returned ${actualContentType}`);
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end(`File not found: ${requestedPath}`);
                        return;
                    }

                    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
                    proxyRes.pipe(res);
                }
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
    const path = match[2] || '/';

    try {
        // Create connection to target container via Docker network
        const proxySocket = new (await import('net')).default.Socket();

        proxySocket.connect(CONTAINER_PORT, projectId, () => {
            // Reconstruct the HTTP upgrade request
            const modifiedHeaders = Object.entries(req.headers)
                .map(([key, value]) => {
                    if (key.toLowerCase() === 'host') {
                        return `${key}: localhost:${CONTAINER_PORT}`;
                    }
                    return `${key}: ${value}`;
                })
                .join('\r\n');

            const upgradeRequest = `${req.method} ${path} HTTP/1.1\r\n${modifiedHeaders}\r\n\r\n`;

            proxySocket.write(upgradeRequest);
            if (head.length > 0) {
                proxySocket.write(head);
            }

            // Pipe bidirectionally
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
