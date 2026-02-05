import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { clerkMiddleware } from '@clerk/express';
import sessionRoutes from './routes/sessions.js';
import statsRoutes from './routes/stats.js';
import programRoutes from './routes/programs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// API routes
app.use('/api/sessions', sessionRoutes);
app.use('/api', statsRoutes);
app.use('/api/programs', programRoutes);

// Serve static files in production
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
