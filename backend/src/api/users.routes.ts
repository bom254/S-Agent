import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/index.js';
import { OAuth2Client } from 'google-auth-library';
import sequelize from '../db/sequelize.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'test-client-id.googleusercontent.com');

const createUserSchema = z.object({
  telegramId: z.string().optional(),
  email: z.string().email().optional(),
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

    if (!parsed.data.telegramId && !parsed.data.email) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Either telegramId or email is required',
      });
      return;
    }

    const user = await User.create({
      telegramId: parsed.data.telegramId,
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
        message: 'User with this telegramId or email already exists',
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

    const user = await User.findByPk(id, {
      attributes: ['id', 'telegramId', 'email', 'name', 'preferences', 'createdAt', 'updatedAt'],
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

    const user = await User.findByPk(id);

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

router.post('/google-login', async (req: Request, res: Response) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ error: 'MISSING_TOKEN', message: 'ID token is required' });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID, // Or your client ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid ID token' });
    }

    const { email, name, sub: googleId, picture: avatar } = payload;

    if (!email) {
      return res.status(400).json({ error: 'MISSING_EMAIL', message: 'Email not found in token' });
    }

    // Find or create user
    let user = await User.findOne({
      where: sequelize.literal(`(email = '${email}' OR "googleId" = '${googleId}')`),
    });

    if (!user) {
      user = await User.create({
        email,
        name,
        googleId,
        // avatar, // if add field later
      });
    } else if (!user.googleId) {
      // Update existing user with googleId
      await user.update({ googleId });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name || name,
        isNew: new Date(user.createdAt).getTime() > Date.now() - 24*60*60*1000, // rough new user check
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'AUTH_ERROR', message: 'Failed to verify Google token' });
  }
});

export default router;
