import express, { type Express } from 'express';
import cors from 'cors';
import apiRouter from './routes/index';
import config from './config/serverConfig';
import type { ApiResponse } from './types';

const app: Express = express();

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

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
