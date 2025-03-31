import { Router, Request, Response } from 'express';
import { TemplateService } from '../services/template.service';
import { logger } from '../utils/logger';

const router = Router();
const templateService = new TemplateService(process.env.TEMPLATES_DIR || './templates');

// Load templates
router.post('/load', async (req: Request, res: Response) => {
  try {
    await templateService.loadTemplates();
    res.json({ message: 'Templates loaded successfully' });
  } catch (error) {
    logger.error('Failed to load templates', error);
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

// Get all templates
router.get('/', async (req: Request, res: Response) => {
  try {
    const templates = await templateService.getTemplates();
    res.json(templates);
  } catch (error) {
    logger.error('Failed to get templates', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Get template by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const template = await templateService.getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    logger.error('Failed to get template', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

// Create project from template
router.post('/:id/project', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { projectPath, variables } = req.body;
    if (!projectPath) {
      return res.status(400).json({ error: 'Project path is required' });
    }

    await templateService.createProjectFromTemplate(
      req.params.id,
      projectPath,
      variables || {}
    );
    res.json({ message: `Created project from template: ${req.params.id}` });
  } catch (error) {
    logger.error('Failed to create project from template', error);
    res.status(500).json({ error: 'Failed to create project from template' });
  }
});

export default router; 