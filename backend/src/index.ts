import express, { type Express } from 'express';
import cors from 'cors';
import apiRouter from './routes/index';
import config from './config/serverConfig';
import type { ApiResponse } from './types';
import {createServer} from 'node:http';
import { Server } from 'socket.io';

const app: Express = express();
const server = createServer(app);
const io = new Server(server,{
  cors:{
    origin: "*",
    methods: ["GET","POST"]
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', apiRouter);

app.get('/ping', (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'pong'
  };
  return res.json(response);
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
}


const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
