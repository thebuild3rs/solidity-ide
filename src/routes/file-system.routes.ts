import { Router, Request, Response } from 'express';
import { FileSystemService } from '../services/file-system.service';
import { logger } from '../utils/logger';

const router = Router();
const fileSystem = new FileSystemService(process.env.PROJECTS_DIR || './projects');

// Get directory structure
router.get('/:projectId/structure', async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { path = '.' } = req.query;
    const structure = await fileSystem.getDirectoryStructure(path as string);
    res.json(structure);
  } catch (error) {
    logger.error('Failed to get directory structure', error);
    res.status(500).json({ error: 'Failed to get directory structure' });
  }
});

// Create directory
router.post('/:projectId/directory', async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { path } = req.body;
    if (!path) {
      return res.status(400).json({ error: 'Directory path is required' });
    }

    await fileSystem.createDirectory(path);
    res.json({ message: `Created directory: ${path}` });
  } catch (error) {
    logger.error('Failed to create directory', error);
    res.status(500).json({ error: 'Failed to create directory' });
  }
});

// Create or update file
router.post('/:projectId/file', async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { path, content } = req.body;
    if (!path) {
      return res.status(400).json({ error: 'File path is required' });
    }

    await fileSystem.createFile(path, content || '');
    res.json({ message: `Created/updated file: ${path}` });
  } catch (error) {
    logger.error('Failed to create/update file', error);
    res.status(500).json({ error: 'Failed to create/update file' });
  }
});

// Read file content
router.get('/:projectId/file', async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const content = await fileSystem.readFile(path as string);
    res.json({ content });
  } catch (error) {
    logger.error('Failed to read file', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Delete file or directory
router.delete('/:projectId/file', async (req: Request<{ projectId: string }>, res: Response) => {
  try {
    const { path, type } = req.query;
    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }

    if (type === 'directory') {
      await fileSystem.deleteDirectory(path as string);
      res.json({ message: `Deleted directory: ${path}` });
    } else {
      await fileSystem.deleteFile(path as string);
      res.json({ message: `Deleted file: ${path}` });
    }
  } catch (error) {
    logger.error('Failed to delete file/directory', error);
    res.status(500).json({ error: 'Failed to delete file/directory' });
  }
});

export default router; 