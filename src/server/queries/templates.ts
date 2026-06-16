import { prisma } from "@/shared/lib/prisma";

const TEMPLATES_PAGE_SIZE = 12;

export async function getTemplatesListPageData(
  userId: string,
  page: number,
) {
  const total = await prisma.workoutTemplate.count();
  const totalPages = Math.max(1, Math.ceil(total / TEMPLATES_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const templatesRaw = await prisma.workoutTemplate.findMany({
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * TEMPLATES_PAGE_SIZE,
    take: TEMPLATES_PAGE_SIZE,
    include: {
      _count: { select: { exercises: true } },
      user: { select: { id: true, login: true, nickname: true } },
    },
  });

  const templates = [...templatesRaw].sort((a, b) => {
    const ao = a.userId === userId ? 0 : 1;
    const bo = b.userId === userId ? 0 : 1;
    return ao - bo;
  });

  return {
    templates,
    total,
    totalPages,
    safePage,
    pageSize: TEMPLATES_PAGE_SIZE,
    pagePastEnd: templates.length === 0 && total > 0,
  };
}

export async function getNewWorkoutFormTemplates() {
  return prisma.workoutTemplate.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      userId: true,
      user: { select: { login: true, nickname: true } },
    },
  });
}
