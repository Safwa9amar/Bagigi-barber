import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import authRoutes from '@/routes/auth';
import servicesRoutes from '@/routes/services';
import bookingRoutes from '@/routes/booking';
import messageRoutes from '@/routes/messages';
import adminRoutes from '@/routes/admin';
const app = express();
// app.use(express.static('uploads'));

// Enable CORS
app.use(cors());

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

// Only parse JSON for non-multipart requests (so Multer can handle file uploads)
// Only parse JSON for non-multipart requests (so Multer can handle file uploads)
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('application/json')) {
    // console.log(`[JSON Parser] Parsing request for ${req.method} ${req.url}`);
    express.json()(req, res, next);
  } else {
    // console.log(`[JSON Parser] Skipping ${req.method} ${req.url} (Content-Type: ${contentType})`);
    next();
  }
});

// Create a main router
const apiRouter = Router();

apiRouter.use('/uploads', express.static('uploads'));
// Mount all your route modules to the main router
apiRouter.use('/auth', authRoutes);
apiRouter.use('/services', servicesRoutes);
apiRouter.use('/booking', bookingRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/admin', adminRoutes);
// Mount the main router at /api
app.use('/api', apiRouter);

// Health check or root endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default app;
