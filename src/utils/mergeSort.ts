export type Winner = "left" | "right";

export type MergeSortState<T> = {
  source: T[];
  destination: T[];
  width: number;
  leftStart: number;
  leftEnd: number;
  rightEnd: number;
  left: number;
  right: number;
  out: number;
  /** Number of comparisons the user has answered so far. */
  comparisons: number;
  done: boolean;
};

function normalize<T>(state: MergeSortState<T>): MergeSortState<T> {
  const next = { ...state };

  while (true) {
    const n = next.source.length;

    if (next.width >= n) {
      next.done = true;
      return next;
    }

    if (next.leftStart >= n) {
      next.source = next.destination;
      next.destination = new Array<T>(n);
      next.width *= 2;
      next.leftStart = 0;

      if (next.width >= n) {
        next.done = true;
        return next;
      }

      next.leftEnd = Math.min(next.width, n);
      next.rightEnd = Math.min(next.width * 2, n);
      next.left = 0;
      next.right = next.leftEnd;
      next.out = 0;
      continue;
    }

    if (next.out >= next.rightEnd) {
      next.leftStart += next.width * 2;
      next.leftEnd = Math.min(next.leftStart + next.width, n);
      next.rightEnd = Math.min(next.leftStart + next.width * 2, n);
      next.left = next.leftStart;
      next.right = next.leftEnd;
      next.out = next.leftStart;
      continue;
    }

    if (next.left >= next.leftEnd) {
      while (next.right < next.rightEnd) {
        next.destination[next.out++] = next.source[next.right++];
      }
      continue;
    }

    if (next.right >= next.rightEnd) {
      while (next.left < next.leftEnd) {
        next.destination[next.out++] = next.source[next.left++];
      }
      continue;
    }

    return next;
  }
}

/**
 * Returns a shuffled copy of `items` (Fisher-Yates). Shuffle before calling
 * `startMergeSort` so the original order doesn't bias the early comparisons.
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Initializes the sorting process.
 */
export function startMergeSort<T>(items: T[]): MergeSortState<T> {
  const n = items.length;

  if (n < 2) {
    return {
      source: [...items],
      destination: [...items],
      width: 1,
      leftStart: 0,
      leftEnd: n,
      rightEnd: n,
      left: 0,
      right: n,
      out: 0,
      comparisons: 0,
      done: true,
    };
  }

  return normalize({
    source: [...items],
    destination: new Array<T>(n),
    width: 1,
    leftStart: 0,
    leftEnd: Math.min(1, n),
    rightEnd: Math.min(2, n),
    left: 0,
    right: 1,
    out: 0,
    comparisons: 0,
    done: false,
  });
}

/**
 * Records the choice and advances the algorithm.
 *
 * Returns a new state and never mutates the one passed in, so keeping old
 * states in an array is all you need to implement undo.
 */
export function chooseWinner<T>(
  state: MergeSortState<T>,
  winner: Winner,
): MergeSortState<T> {
  if (state.done) return state;

  const next = {
    ...state,
    source: [...state.source],
    destination: [...state.destination],
  };

  if (winner === "left") {
    next.destination[next.out] = next.source[next.left];
    next.left++;
  } else {
    next.destination[next.out] = next.source[next.right];
    next.right++;
  }

  next.out++;
  next.comparisons++;

  return normalize(next);
}

/**
 * Returns the two items the user needs to compare, or null when finished.
 */
export function getComparison<T>(state: MergeSortState<T>): [T, T] | null {
  if (state.done) return null;

  return [state.source[state.left], state.source[state.right]];
}

/**
 * Returns the final sorted list when sorting finishes.
 */
export function getSortedItems<T>(state: MergeSortState<T>): T[] {
  return state.source;
}

/**
 * Worst-case number of comparisons a bottom-up merge sort needs for `n` items.
 * Merging runs of length a and b takes at most a + b - 1 comparisons, and a
 * leftover run with nothing to merge against takes none.
 */
export function maxComparisons(n: number): number {
  let total = 0;

  for (let width = 1; width < n; width *= 2) {
    for (let start = 0; start < n; start += width * 2) {
      const left = Math.min(width, n - start);
      const right = Math.min(width, Math.max(0, n - start - width));

      if (right > 0) total += left + right - 1;
    }
  }

  return total;
}

/**
 * Progress for a "Comparison 12 of up to 31" style indicator. The real total
 * can finish earlier than `max` when one side of a merge runs out first.
 */
export function getProgress<T>(state: MergeSortState<T>): {
  completed: number;
  max: number;
} {
  return {
    completed: state.comparisons,
    max: maxComparisons(state.source.length),
  };
}
