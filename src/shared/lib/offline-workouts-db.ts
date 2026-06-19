import type { WorkoutPayload } from "@/features/workouts/lib/workout-session-types";
import { formatDateForInput } from "@/shared/lib/date-local";
import { calendarWeekBounds, dateKeyInWeek } from "@/shared/lib/calendar-week";

const DB_NAME = "gym-offline";
const DB_VERSION = 1;
const STORE_META = "meta";
const STORE_WORKOUTS = "workouts";

type OfflineMeta = {
  id: "current";
  weekStart: string;
  weekEnd: string;
  anchoredAt: string;
};

export type CachedWorkoutRow = {
  id: string;
  dateKey: string;
  title: string | null;
  payload: WorkoutPayload;
  cachedAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB недоступний"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_WORKOUTS)) {
        const store = db.createObjectStore(STORE_WORKOUTS, { keyPath: "id" });
        store.createIndex("dateKey", "dateKey", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

export async function anchorOfflineWeek(anchor: Date = new Date()): Promise<OfflineMeta> {
  const { weekStart, weekEnd } = calendarWeekBounds(anchor);
  const meta: OfflineMeta = {
    id: "current",
    weekStart,
    weekEnd,
    anchoredAt: new Date().toISOString(),
  };
  const db = await openDb();
  const tx = db.transaction(STORE_META, "readwrite");
  tx.objectStore(STORE_META).put(meta);
  await txDone(tx);
  db.close();
  return meta;
}

export async function getOfflineWeekMeta(): Promise<OfflineMeta | null> {
  const db = await openDb();
  const tx = db.transaction(STORE_META, "readonly");
  const meta = await new Promise<OfflineMeta | null>((resolve, reject) => {
    const req = tx.objectStore(STORE_META).get("current");
    req.onsuccess = () => resolve((req.result as OfflineMeta | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return meta;
}

export async function putCachedWorkout(payload: WorkoutPayload): Promise<void> {
  const meta = await getOfflineWeekMeta();
  if (!meta) await anchorOfflineWeek();

  const dateKey = formatDateForInput(payload.date);
  const currentMeta = (await getOfflineWeekMeta())!;
  if (!dateKeyInWeek(payload.date, currentMeta.weekStart, currentMeta.weekEnd)) return;

  const row: CachedWorkoutRow = {
    id: payload.id,
    dateKey,
    title: payload.title,
    payload,
    cachedAt: new Date().toISOString(),
  };

  const db = await openDb();
  const tx = db.transaction(STORE_WORKOUTS, "readwrite");
  tx.objectStore(STORE_WORKOUTS).put(row);
  await txDone(tx);
  db.close();
}

export async function putCachedWorkouts(payloads: WorkoutPayload[]): Promise<void> {
  if (payloads.length === 0) return;
  await anchorOfflineWeek();
  const meta = (await getOfflineWeekMeta())!;
  const db = await openDb();
  const tx = db.transaction(STORE_WORKOUTS, "readwrite");
  const store = tx.objectStore(STORE_WORKOUTS);
  const now = new Date().toISOString();
  for (const payload of payloads) {
    const dateKey = formatDateForInput(payload.date);
    if (!dateKeyInWeek(payload.date, meta.weekStart, meta.weekEnd)) continue;
    store.put({
      id: payload.id,
      dateKey,
      title: payload.title,
      payload,
      cachedAt: now,
    } satisfies CachedWorkoutRow);
  }
  await txDone(tx);
  db.close();
}

export async function listCachedWorkoutsForOfflineWeek(): Promise<CachedWorkoutRow[]> {
  const meta = await getOfflineWeekMeta();
  if (!meta) return [];
  const db = await openDb();
  const tx = db.transaction(STORE_WORKOUTS, "readonly");
  const all = await new Promise<CachedWorkoutRow[]>((resolve, reject) => {
    const req = tx.objectStore(STORE_WORKOUTS).getAll();
    req.onsuccess = () => resolve((req.result as CachedWorkoutRow[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return all
    .filter((w) => dateKeyInWeek(w.payload.date, meta.weekStart, meta.weekEnd))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.id.localeCompare(b.id));
}

export async function getCachedWorkout(id: string): Promise<WorkoutPayload | null> {
  const meta = await getOfflineWeekMeta();
  if (!meta) return null;
  const db = await openDb();
  const tx = db.transaction(STORE_WORKOUTS, "readonly");
  const row = await new Promise<CachedWorkoutRow | null>((resolve, reject) => {
    const req = tx.objectStore(STORE_WORKOUTS).get(id);
    req.onsuccess = () => resolve((req.result as CachedWorkoutRow | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  if (!row) return null;
  if (!dateKeyInWeek(row.payload.date, meta.weekStart, meta.weekEnd)) return null;
  return row.payload;
}
