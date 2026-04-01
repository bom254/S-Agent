import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: parsed.error.errors,
      });
      return;
    }

    const { email, password, name } = parsed.data;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        error: 'CONFLICT',
        message: 'User with this email already exists',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        token,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to register user',
    });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: parsed.error.errors,
      });
      return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password as string);
    if (!validPassword) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        token,
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to login',
    });
  }
});

export default router;