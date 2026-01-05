import express, { type Express } from "express";
import cors from "cors";
import apiRouter from "./routes/index";
import config from "./config/serverConfig";
import type { ApiResponse } from "./types";
import { createServer } from "node:http";
import { Server } from "socket.io";
import chokidar from "chokidar";
import queryString from "query-string";

import { handlerEditorSocketEvents } from './socketHandlers/editorHandlers';


const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", apiRouter);

app.get("/ping", (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: "pong",
  };
  return res.json(response);
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const editorNamespace = io.of("/editor");

editorNamespace.on("connection", (socket) => {

  let projectId = socket.handshake.query['projectId'] ; // This should be dynamically set based on your application logic
  let watcher: ReturnType<typeof chokidar.watch> | null = null;

  if (projectId) {
    watcher = chokidar.watch(`./projects/${projectId}`, {
      ignored: (path) => path.includes("node_modules"),
      persistent: true, // Keep the process running
      awaitWriteFinish: {
        stabilityThreshold: 2000,
      },
      ignoreInitial: true,
    });
    // watcher.on("all", (event, path) => {
    //   console.log(event, path);
    // });

  
  }
    handlerEditorSocketEvents(socket)


      socket.on("disconnect", async () => {
        if (watcher) {
          await watcher.close();
        }
        console.log("User disconnected from editor namespace:", socket.id);
      });

});

const PORT = config.PORT;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
