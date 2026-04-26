import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { projectQueries } from "../db/project";
// import { generateUploadUrl } from '../aws/s3';
// import { enqueueDocumentProcessing } from '../aws/sqs';

export const projectRouter = Router();

projectRouter.use(requireAuth);

const createSchema = z.object({
  name: z.string().min(6).max(50),
  description: z.string().max(500).optional(),
});

const updateSchema = z.object({
  name: z.string().min(6).max(50).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "archived"]).optional(),
});

projectRouter.get(
  "/",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const result = await projectQueries.getAll(req.user!.id, page);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

projectRouter.get(
  "/:id",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        res.status(400).json({ error: "Invalid Project ID format" });
        return;
      }
      const project = await projectQueries.getById(id, req.user!.id);
      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      res.json(project);
    } catch (err) {
      next(err);
    }
  },
);

projectRouter.post(
  "/",
  validate(createSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const project = await projectQueries.create({
        ...req.body,
        ownerId: req.user!.id,
      });
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  },
);

projectRouter.patch(
  "/:id",
  validate(updateSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        res.status(400).json({ error: "Invalid Project ID format" });
        return;
      }
      const result = await projectQueries.update(id, req.user!.id, req.body);
      if (result.count === 0) {
        res
          .status(404)
          .json({ error: "Project not found or not owned by you" });
        return;
      }
      res.json({ message: "Updated successfully" });
    } catch (err) {
      next(err);
    }
  },
);

projectRouter.delete(
  "/:id",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (typeof id !== "string") {
        res.status(400).json({ error: "Invalid Project ID format" });
        return;
      }
      await projectQueries.delete(id, req.user!.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

// projectRouter.post('/:id/upload-url', async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     const { filename, contentType } = req.body;
//     const s3Key = `projects/${req.params.id}/${Date.now()}-${filename}`;
//     const uploadUrl = await generateUploadUrl(s3Key, contentType);

//     await enqueueDocumentProcessing(req.params.id, s3Key);

//     res.json({ uploadUrl, s3Key });
//   } catch (err) { next(err); }
// });
