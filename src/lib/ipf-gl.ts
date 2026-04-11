import type { GlEquipment, GlSex } from "@prisma/client";

export type IpfGlCoefficients = { A: number; B: number; C: number };

const M_EQ_PL: IpfGlCoefficients = { A: 1236.25115, B: 1449.21864, C: 0.01644 };
const M_CL_PL: IpfGlCoefficients = { A: 1199.72839, B: 1025.18162, C: 0.00921 };
const M_EQ_BP: IpfGlCoefficients = { A: 381.22073, B: 733.79378, C: 0.02398 };
const M_CL_BP: IpfGlCoefficients = { A: 320.98041, B: 281.40258, C: 0.01008 };

const F_EQ_PL: IpfGlCoefficients = { A: 758.63878, B: 949.31382, C: 0.02435 };
const F_CL_PL: IpfGlCoefficients = { A: 610.32796, B: 1045.59282, C: 0.03048 };
const F_EQ_BP: IpfGlCoefficients = { A: 221.82209, B: 357.00377, C: 0.02937 };
const F_CL_BP: IpfGlCoefficients = { A: 142.40398, B: 442.52671, C: 0.04724 };

function coeffsPowerlifting(sex: GlSex, equipment: GlEquipment): IpfGlCoefficients {
  if (sex === "MALE") return equipment === "EQUIPPED" ? M_EQ_PL : M_CL_PL;
  return equipment === "EQUIPPED" ? F_EQ_PL : F_CL_PL;
}

function coeffsBenchPress(sex: GlSex, equipment: GlEquipment): IpfGlCoefficients {
  if (sex === "MALE") return equipment === "EQUIPPED" ? M_EQ_BP : M_CL_BP;
  return equipment === "EQUIPPED" ? F_EQ_BP : F_CL_BP;
}

export function ipfGlPointsForLift(
  liftKg: number,
  bodyweightKg: number,
  coeff: IpfGlCoefficients,
): number | null {
  if (!Number.isFinite(liftKg) || liftKg <= 0) return null;
  if (!Number.isFinite(bodyweightKg) || bodyweightKg <= 0) return null;
  const { A, B, C } = coeff;
  const denom = A - B * Math.exp(-C * bodyweightKg);
  if (!Number.isFinite(denom) || denom <= 0) return null;
  const pts = (liftKg * 100) / denom;
  if (!Number.isFinite(pts)) return null;
  return Math.round(pts * 1000) / 1000;
}

export function ipfGlPointsPowerliftingTotal(
  squatKg: number,
  benchKg: number,
  deadliftKg: number,
  bodyweightKg: number,
  sex: GlSex,
  equipment: GlEquipment,
): number | null {
  const total = squatKg + benchKg + deadliftKg;
  return ipfGlPointsForLift(total, bodyweightKg, coeffsPowerlifting(sex, equipment));
}

export function ipfGlPointsBenchPress(
  benchKg: number,
  bodyweightKg: number,
  sex: GlSex,
  equipment: GlEquipment,
) {
  return ipfGlPointsForLift(benchKg, bodyweightKg, coeffsBenchPress(sex, equipment));
}

export function ipfGlPointsSingleLiftApprox(
  liftKg: number,
  bodyweightKg: number,
  sex: GlSex,
  equipment: GlEquipment,
): number | null {
  return ipfGlPointsForLift(liftKg, bodyweightKg, coeffsPowerlifting(sex, equipment));
}

export type IpfGlProfilePreview =
  | { kind: "total"; points: number }
  | { kind: "bench"; points: number }
  | { kind: "none"; message: string };

export function ipfGlProfilePreview(args: {
  bodyweightKg: number | null;
  squatKg: number | null;
  benchKg: number | null;
  deadliftKg: number | null;
  sex: GlSex;
  equipment: GlEquipment;
}): IpfGlProfilePreview {
  const { bodyweightKg, squatKg, benchKg, deadliftKg, sex, equipment } = args;
  if (bodyweightKg == null || bodyweightKg <= 0) {
    return { kind: "none", message: "Вкажи вагу тіла (кг), щоб побачити GL." };
  }
  const sqOk = squatKg != null && squatKg > 0;
  const bpOk = benchKg != null && benchKg > 0;
  const dlOk = deadliftKg != null && deadliftKg > 0;
  if (sqOk && bpOk && dlOk) {
    const pts = ipfGlPointsPowerliftingTotal(
      squatKg!,
      benchKg!,
      deadliftKg!,
      bodyweightKg,
      sex,
      equipment,
    );
    if (pts == null) return { kind: "none", message: "Не вдалося порахувати GL для цих значень." };
    return { kind: "total", points: pts };
  }
  if (bpOk) {
    const pts = ipfGlPointsBenchPress(benchKg!, bodyweightKg, sex, equipment);
    if (pts == null) return { kind: "none", message: "Не вдалося порахувати GL жиму." };
    return { kind: "bench", points: pts };
  }
  return {
    kind: "none",
    message:
      "Для GL триборства вкажи максимуми присяду, жиму й тяги. Для GL жиму лежачи достатньо жиму та ваги тіла.",
  };
}

export type LeaderboardSort = "total" | "bench" | "squat" | "deadlift";

export function leaderboardScore(
  sort: LeaderboardSort,
  row: {
    bodyweightKg: number;
    squatKg: number;
    benchKg: number;
    deadliftKg: number;
    sex: GlSex;
    equipment: GlEquipment;
  },
): number | null {
  const { bodyweightKg, squatKg, benchKg, deadliftKg, sex, equipment } = row;
  switch (sort) {
    case "total":
      return ipfGlPointsPowerliftingTotal(
        squatKg,
        benchKg,
        deadliftKg,
        bodyweightKg,
        sex,
        equipment,
      );
    case "bench":
      return ipfGlPointsBenchPress(benchKg, bodyweightKg, sex, equipment);
    case "squat":
      return ipfGlPointsSingleLiftApprox(squatKg, bodyweightKg, sex, equipment);
    case "deadlift":
      return ipfGlPointsSingleLiftApprox(deadliftKg, bodyweightKg, sex, equipment);
    default:
      return null;
  }
}

export function hasLeaderboardData(
  sort: LeaderboardSort,
  row: Partial<Record<string, unknown>>,
): boolean {
  const bw = row.glBodyweightKg != null;
  const sex = row.glSex != null;
  const eq = row.glEquipment != null;
  const sq = row.glMaxSquatKg != null && Number(row.glMaxSquatKg) > 0;
  const bp = row.glMaxBenchKg != null && Number(row.glMaxBenchKg) > 0;
  const dl = row.glMaxDeadliftKg != null && Number(row.glMaxDeadliftKg) > 0;
  if (!bw || !sex || !eq) return false;
  if (sort === "total") return sq && bp && dl;
  if (sort === "bench") return bp;
  if (sort === "squat") return sq;
  if (sort === "deadlift") return dl;
  return false;
}
