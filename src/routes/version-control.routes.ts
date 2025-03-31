import { Router, Request, Response } from 'express';
import { VersionControlService } from '../services/version-control.service';
import { logger } from '../utils/logger';

const router = Router();
const versionControl = new VersionControlService(process.env.PROJECTS_DIR || './projects');

// Initialize version control for a project
router.post('/:projectId/init', async (req: Request, res: Response) => {
  try {
    await versionControl.initialize();
    res.json({ message: 'Version control initialized successfully' });
  } catch (error) {
    logger.error('Failed to initialize version control', error);
    res.status(500).json({ error: 'Failed to initialize version control' });
  }
});

// Create a new commit
router.post('/:projectId/commit', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Commit message is required' });
    }

    const commitId = await versionControl.commit(message);
    res.json({ commitId });
  } catch (error) {
    logger.error('Failed to create commit', error);
    res.status(500).json({ error: 'Failed to create commit' });
  }
});

// Create a new branch
router.post('/:projectId/branch', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Branch name is required' });
    }

    await versionControl.createBranch(name);
    res.json({ message: `Created branch: ${name}` });
  } catch (error) {
    logger.error('Failed to create branch', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
});

// Switch to a branch
router.post('/:projectId/switch-branch', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Branch name is required' });
    }

    await versionControl.switchBranch(name);
    res.json({ message: `Switched to branch: ${name}` });
  } catch (error) {
    logger.error('Failed to switch branch', error);
    res.status(500).json({ error: 'Failed to switch branch' });
  }
});

// Merge a branch
router.post('/:projectId/merge', async (req: Request, res: Response) => {
  try {
    const { sourceBranch } = req.body;
    if (!sourceBranch) {
      return res.status(400).json({ error: 'Source branch is required' });
    }

    await versionControl.merge(sourceBranch);
    res.json({ message: `Merged ${sourceBranch} into current branch` });
  } catch (error) {
    logger.error('Failed to merge branch', error);
    res.status(500).json({ error: 'Failed to merge branch' });
  }
});

export default router; 