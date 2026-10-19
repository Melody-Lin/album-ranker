"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getProgress, shuffle, type Winner } from "@/utils/mergeSort";
import {
  parseSession,
  readSessionRaw,
  replayAnswers,
  saveSession,
  subscribe,
} from "@/utils/rankingStorage";
import type { Track } from "@/types";

/**
 * The saved ranking for one album. It lives in localStorage (see
 * rankingStorage.ts), so it survives a refresh, and every component that uses
 * this hook stays in sync with it.
 */
export function useRankingSession(albumId: number, tracks: Track[]) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readSessionRaw(albumId),
    () => null,
  );

  const session = useMemo(() => parseSession(raw), [raw]);
  const sortState = useMemo(
    () => (session ? replayAnswers(session) : null),
    [session],
  );

  const progress = sortState ? getProgress(sortState) : null;
  const hasInProgress = sortState !== null && !sortState.done;

  function start() {
    saveSession(albumId, { order: shuffle(tracks), answers: [] });
  }

  function choose(winner: Winner) {
    if (!session) return;

    saveSession(albumId, {
      ...session,
      answers: [...session.answers, winner],
    });
  }

  function undo() {
    if (!session || session.answers.length === 0) return;

    saveSession(albumId, {
      ...session,
      answers: session.answers.slice(0, -1),
    });
  }

  return {
    sortState,
    progress,
    hasInProgress,
    canUndo: session !== null && session.answers.length > 0,
    start,
    choose,
    undo,
  };
}
