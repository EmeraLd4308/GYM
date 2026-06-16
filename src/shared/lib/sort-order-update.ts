import { prisma } from "@/shared/lib/prisma";

const TEMP_OFFSET = 1_000_000;

/**
 * Reassign sortOrder values without violating unique (parentId, sortOrder) constraints.
 * Uses a temporary offset pass, then writes final 0..n-1 indices.
 */
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
