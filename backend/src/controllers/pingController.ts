import type { AsyncRoute, ApiResponse } from '../types';

export const pingCheck: AsyncRoute = async (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'pong'
  };
  return res.status(200).json(response);
};
