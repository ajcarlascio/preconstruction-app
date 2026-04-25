import { Request, Response, NextFunction } from 'express';

export class PreconstructionError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'PreconstructionError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  if (err instanceof PreconstructionError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const prismaErr = err as any;
  if (prismaErr.code === 'P2002') {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }

  if (prismaErr.code === 'P2025') {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  if (err.name === 'ZodError') {
    res.status(400).json({ error: 'Validation failed', details: (err as any).errors });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}