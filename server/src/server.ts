import app from '@/app';
import config from '@/config/config';
import { createServer } from 'http';
import { initSocket } from './socket';

const httpServer = createServer(app);
const io = initSocket(httpServer);

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

