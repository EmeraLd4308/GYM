import { prisma } from "@/shared/lib/prisma";

const TEMP_OFFSET = 1_000_000;

export async function applyOrderedSortOrderUpdates(
  orderedIds: readonly string[],
  update: (id: string, sortOrder: number) => Promise<unknown>,
): Promise<void> {
  await prisma.$transaction(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await update(orderedIds[i]!, TEMP_OFFSET + i);
    }
    for (let i = 0; i < orderedIds.length; i++) {
      await update(orderedIds[i]!, i);
    }
  });
}
