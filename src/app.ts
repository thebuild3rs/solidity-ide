import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { logger } from './utils/logger';

import fileSystemRoutes from './routes/file-system.routes';
import templateRoutes from './routes/template.routes';
import versionControlRoutes from './routes/version-control.routes';
import ethereumRoutes from './routes/ethereum.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Routes
app.use('/api/fs', fileSystemRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/vc', versionControlRoutes);
app.use('/api/ethereum', ethereumRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app; 