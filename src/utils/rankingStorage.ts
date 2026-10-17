import type { Track } from "@/types";
import {
  chooseWinner,
  startMergeSort,
  type MergeSortState,
  type Winner,
} from "@/utils/mergeSort";

/**
 * Everything needed to rebuild a ranking: the shuffled order it started from
 * and every answer given so far. Replaying the answers through the merge sort
 * always produces the same state, so nothing else has to be stored.
 */
export type RankingSession = {
  order: Track[];
  answers: Winner[];
};

const listeners = new Set<() => void>();

// Mirror of what we write. Ranking keeps working for the current tab even when
// localStorage is unavailable (private mode, blocked site data, full quota).
const memory = new Map<string, string>();

const storageKey = (albumId: number) => `trackdown:ranking:${albumId}`;

/** Subscribe function for useSyncExternalStore. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * The raw saved string for an album, or null. It only changes when
 * `saveSession` runs, so it is a stable useSyncExternalStore snapshot.
 */
export function readSessionRaw(albumId: number): string | null {
  const key = storageKey(albumId);
  const inMemory = memory.get(key);

  if (inMemory !== undefined) return inMemory;

  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveSession(albumId: number, session: RankingSession): void {
  const key = storageKey(albumId);
  const raw = JSON.stringify(session);

  memory.set(key, raw);

  try {
    localStorage.setItem(key, raw);
  } catch {
    // Storage unavailable: the in-memory copy still works until the tab closes.
  }

  listeners.forEach((listener) => listener());
}

/** Parses a saved string, returning null for anything missing or malformed. */
export function parseSession(raw: string | null): RankingSession | null {
  if (!raw) return null;

  try {
    const data: unknown = JSON.parse(raw);

    if (typeof data !== "object" || data === null) return null;

    const { order, answers } = data as Partial<RankingSession>;

    if (!Array.isArray(order) || !Array.isArray(answers)) return null;

    const validOrder = order.every(
      (track) =>
        typeof track?.id === "number" && typeof track?.title === "string",
    );
    const validAnswers = answers.every(
      (answer) => answer === "left" || answer === "right",
    );

    return validOrder && validAnswers ? { order, answers } : null;
  } catch {
    return null;
  }
}

/** Rebuilds the current merge sort state by replaying every saved answer. */
export function replayAnswers(session: RankingSession): MergeSortState<Track> {
  let state = startMergeSort(session.order);

  for (const answer of session.answers) {
    state = chooseWinner(state, answer);
  }

  return state;
}
