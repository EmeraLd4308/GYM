export type WeekLiftMetric = {
  bench: number | null;
  squat: number | null;
  deadlift: number | null;
  weekLabel: string;
};

export type WeekVolumeCompare = {
  prev: WeekLiftMetric;
  curr: WeekLiftMetric;
};
