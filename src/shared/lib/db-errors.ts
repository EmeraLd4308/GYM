import { Prisma } from "@prisma/client";

export function isTransientDbError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P1001" || error.code === "P1002" || error.code === "P1017";
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("can't reach database server") ||
      msg.includes("connection terminated") ||
      msg.includes("connection timed out") ||
      msg.includes("econnrefused") ||
      msg.includes("etimedout")
    );
  }
  return false;
}

export function dbErrorMessageForUser(error: unknown): string {
  if (isTransientDbError(error)) {
    return "База даних тимчасово недоступна (Neon могла «заснути»). Зачекай 10–15 секунд і спробуй ще раз.";
  }
  if (process.env.NODE_ENV === "development") {
    return "Помилка бази даних локально. Перевір DATABASE_URL у .env і що Neon-проєкт активний.";
  }
  return "Помилка сервера. Спробуй пізніше або звернись до адміністратора.";
}

export async function withDbRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientDbError(error) || i === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  throw lastError;
}
