export const AVATAR_IDS = [
  "barbell",
  "plate",
  "squat",
  "bench",
  "deadlift",
  "kettlebell",
  "dumbbell",
  "chalk",
  "belt",
  "trophy",
  "flame",
  "bolt",
  "medal",
  "timer",
  "hex",
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export const DEFAULT_AVATAR_ID: AvatarId = "barbell";

export const AVATAR_LABELS: Record<AvatarId, string> = {
  barbell: "Штанга",
  plate: "Диск",
  squat: "Присяд",
  bench: "Жим",
  deadlift: "Тяга",
  kettlebell: "Гиря",
  dumbbell: "Гантеля",
  chalk: "Магнезія",
  belt: "Пояс",
  trophy: "Кубок",
  flame: "Вогонь",
  bolt: "Блискавка",
  medal: "Медаль",
  timer: "Таймер",
  hex: "Сила",
};

export function normalizeAvatarId(id: string | null | undefined): AvatarId {
  if (id && (AVATAR_IDS as readonly string[]).includes(id)) return id as AvatarId;
  return DEFAULT_AVATAR_ID;
}
