import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db/client';
import { validate } from '../middleware/validate';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(6).max(20),
  email: z.email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

authRouter.post(
  '/register',
  validate(registerSchema),          
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const hashed = await bcrypt.hash(password, 12);

      const user = await db.user.create({
        data: { name, email, password: hashed },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      res.status(201).json({ user });
    } catch (err) {
      next(err);   
    }
  }
);

authRouter.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await db.user.findUnique({ where: { email } });

      const passwordValid = user
        ? await bcrypt.compare(password, user.password)
        : false;

      if (!user || !passwordValid) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      next(err);
    }
  }
);