import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from '@/routes/authRoutes';

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Create a main router
import { Router } from 'express';
const apiRouter = Router();

// Mount all your route modules to the main router
apiRouter.use('/auth', authRoutes);

// Add more routes here as needed, e.g.:
// apiRouter.use('/users', userRoutes);
// apiRouter.use('/items', itemRoutes);

// Mount the main router at /api
app.use('/api', apiRouter);

// Health check or root endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default app;
