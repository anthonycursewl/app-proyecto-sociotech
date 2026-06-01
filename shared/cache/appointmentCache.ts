import { Appointment } from "@/shared/services/appointment.service";

interface CacheEntry {
  data: Appointment;
  ts: number;
}

const DEFAULT_TTL_MS = 60_000;

const entries = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<Appointment>>();

const subscribers = new Map<string, Set<() => void>>();

function notify(id: string) {
  const set = subscribers.get(id);
  if (!set) return;
  set.forEach((cb) => cb());
}

function subscribe(id: string, cb: () => void): () => void {
  let set = subscribers.get(id);
  if (!set) {
    set = new Set();
    subscribers.set(id, set);
  }
  set.add(cb);
  return () => {
    set!.delete(cb);
    if (set!.size === 0) subscribers.delete(id);
  };
}

function isFresh(entry: CacheEntry, ttl: number): boolean {
  return Date.now() - entry.ts < ttl;
}

export function getCached(id: string, ttl: number = DEFAULT_TTL_MS): Appointment | null {
  const entry = entries.get(id);
  if (!entry) return null;
  if (!isFresh(entry, ttl)) {
    entries.delete(id);
    return null;
  }
  return entry.data;
}

export function setCached(appointment: Appointment): void {
  entries.set(appointment.id, { data: appointment, ts: Date.now() });
  notify(appointment.id);
}

export function invalidate(id: string): void {
  entries.delete(id);
  notify(id);
}

export function invalidateAll(): void {
  for (const id of Array.from(entries.keys())) {
    entries.delete(id);
    notify(id);
  }
}

export function subscribeToAppointment(id: string, cb: () => void): () => void {
  return subscribe(id, cb);
}

export async function fetchDedup(
  id: string,
  fetcher: (id: string) => Promise<Appointment>,
): Promise<Appointment> {
  const existing = inFlight.get(id);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const data = await fetcher(id);
      setCached(data);
      return data;
    } finally {
      inFlight.delete(id);
    }
  })();

  inFlight.set(id, promise);
  return promise;
}

export const __appointmentCache = {
  get size() {
    return entries.size;
  },
  clear() {
    entries.clear();
    for (const id of Array.from(subscribers.keys())) notify(id);
  },
};
