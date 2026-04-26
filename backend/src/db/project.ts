import { db } from "./client";

export const projectQueries = {
  async getAll(userId: string, page = 1, limit = 20) {
    const [total, items] = await Promise.all([
      db.project.count({ where: { ownerId: userId } }),
      db.project.findMany({
        where: { ownerId: userId },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          documents: { select: { id: true, filename: true, uploadedAt: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  async getById(id: string, userId: string) {
    return db.project.findFirst({
      where: { id, ownerId: userId },
      include: {
        documents: true,
        owner: { select: { name: true, email: true } },
      },
    });
  },

  async create(data: { name: string; description?: string; ownerId: string }) {
    return db.project.create({ data });
  },

  async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string; status?: string },
  ) {
    return db.project.updateMany({
      where: { id, ownerId: userId },
      data,
    });
  },

  async delete(id: string, userId: string) {
    return db.$transaction([
      db.document.deleteMany({ where: { projectId: id } }),
      db.project.deleteMany({ where: { id, ownerId: userId } }),
    ]);
  },
};
