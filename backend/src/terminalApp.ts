import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { handleContainerCreate, listContainer } from './containers/handleContainerCreate.js';
import { WebSocketServer } from 'ws';
import { handleTerminalCreation } from './containers/handleTerminalCreation.js';


const app = express();
const server = createServer(app);


app.use(express.json());
app.use(express.urlencoded());
app.use(cors());


const TERMINAL_PORT = parseInt(process.env.TERMINAL_PORT || '50003', 10);

server.listen(TERMINAL_PORT, () => {
    console.log(`Server is running on port ${TERMINAL_PORT}`);
    console.log(process.cwd())
});

const webSocketForTerminal = new WebSocketServer({
    server
});

webSocketForTerminal.on("connection", async (ws, req, container) => {
    const isTerminal = req.url.includes("/terminal");

    if(isTerminal) {
        const projectId = req.url.split("=")[1];
        console.log("Project id received after connection", projectId);

        const container = await handleContainerCreate(projectId, webSocketForTerminal);

        handleTerminalCreation(container, ws);
    }
    
});
