import http from 'http';
import { getContainerPort } from './containers/handleContainerCreate.js';

/**
 * Preview Proxy Server
 * Routes /preview/:projectId/* requests to the appropriate sandbox container
 */

const PREVIEW_PORT = parseInt(process.env.PREVIEW_PORT || '50004');

// In Docker, we need to reach the host machine where sandbox containers run
// host.docker.internal works on Docker Desktop, for Linux we use the gateway IP
const PROXY_HOST = process.env.DOCKER_HOST_IP || 'host.docker.internal';

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
        const port = await getContainerPort(projectId);

        if (!port) {
            res.writeHead(503, { 'Content-Type': 'text/html' });
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
            return;
        }

        // Proxy the request to the container
        const proxyReq = http.request(
            {
                hostname: PROXY_HOST,
                port: parseInt(port),
                path: path,
                method: req.method,
                headers: {
                    ...req.headers,
                    host: `localhost:${port}`,
                },
            },
            (proxyRes) => {
                const contentType = proxyRes.headers['content-type'] || '';

                // For HTML responses, inject <base> tag to fix relative paths
                if (contentType.includes('text/html')) {
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
                        headers['content-length'] = Buffer.byteLength(modifiedBody).toString();

                        res.writeHead(proxyRes.statusCode || 200, headers);
                        res.end(modifiedBody);
                    });
                } else {
                    // For non-HTML, pipe directly
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
                <head><title>Preview Error</title></head>
                <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                    <h1>Preview Error</h1>
                    <p>Could not connect to the development server.</p>
                    <p>Make sure your app is running on port 5173.</p>
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
        const port = await getContainerPort(projectId);

        if (!port) {
            socket.destroy();
            return;
        }

        // Create connection to target
        const proxySocket = new (await import('net')).default.Socket();

        proxySocket.connect(parseInt(port), PROXY_HOST, () => {
            // Reconstruct the HTTP upgrade request with localhost host header
            const modifiedHeaders = Object.entries(req.headers)
                .map(([key, value]) => {
                    if (key.toLowerCase() === 'host') {
                        return `${key}: localhost:${port}`;
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
