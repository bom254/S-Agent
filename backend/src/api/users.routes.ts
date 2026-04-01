import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/index.js';

const router = Router();

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  preferences: z.record(z.unknown()),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: parsed.error.errors,
      });
      return;
    }

    const user = await User.create({
      email: parsed.data.email,
      name: parsed.data.name,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if ((error as { parent?: { code?: string } }).parent?.code === '23505') {
      res.status(409).json({
        error: 'CONFLICT',
        message: 'User with this email already exists',
      });
      return;
    }

    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to create user',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id as string, {
      attributes: ['id', 'email', 'name', 'preferences', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch user',
    });
  }
});

router.put('/:id/preferences', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = updatePreferencesSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: parsed.error.errors,
      });
      return;
    }

    const user = await User.findByPk(id as string);

    if (!user) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'User not found',
      });
      return;
    }

    await user.update({
      preferences: parsed.data.preferences,
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to update preferences',
    });
  }
});

export default router;