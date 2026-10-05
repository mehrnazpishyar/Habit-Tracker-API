import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import habitRoutes from './routes/habit.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? [] }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route nicht gefunden' });
});

app.use(errorHandler);

export default app;