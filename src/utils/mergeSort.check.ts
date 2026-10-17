import {
  chooseWinner,
  getComparison,
  getProgress,
  getSortedItems,
  maxComparisons,
  shuffle,
  startMergeSort,
} from "./mergeSort";

let failures = 0;

function check(condition: boolean, message: string) {
  if (!condition) {
    failures++;
    console.error("FAIL:", message);
  }
}

for (let n = 0; n <= 40; n++) {
  for (let trial = 0; trial < 20; trial++) {
    const items = shuffle(Array.from({ length: n }, (_, i) => i));
    let state = startMergeSort(items);
    const snapshots = [];

    while (!state.done) {
      const pair = getComparison(state);
      check(pair !== null, `n=${n}: comparison missing while not done`);
      if (!pair) break;

      snapshots.push(state);
      state = chooseWinner(state, pair[0] < pair[1] ? "left" : "right");
    }

    const sorted = getSortedItems(state);
    const expected = Array.from({ length: n }, (_, i) => i);

    check(
      JSON.stringify(sorted) === JSON.stringify(expected),
      `n=${n}: result not sorted`,
    );
    check(
      state.comparisons <= maxComparisons(n),
      `n=${n}: ${state.comparisons} comparisons exceeds max ${maxComparisons(n)}`,
    );
    check(
      getProgress(state).completed === state.comparisons,
      `n=${n}: progress mismatch`,
    );

    // Undo safety: an earlier state must be untouched by later choices.
    if (snapshots.length > 0) {
      const first = snapshots[0];
      const pair = getComparison(first);
      check(
        pair !== null && first.comparisons === 0,
        `n=${n}: first snapshot was mutated`,
      );
    }
  }
}

console.log(
  "maxComparisons:",
  [1, 2, 3, 5, 10, 12, 16].map((n) => `${n}->${maxComparisons(n)}`).join(" "),
);
console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
