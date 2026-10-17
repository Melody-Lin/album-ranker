"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  getComparison,
  getProgress,
  getSortedItems,
  maxComparisons,
  shuffle,
  type Winner,
} from "@/utils/mergeSort";
import {
  parseSession,
  readSessionRaw,
  replayAnswers,
  saveSession,
  subscribe,
} from "@/utils/rankingStorage";
import SiteFooter from "./SiteFooter";
import type { Album, Track } from "@/types";

type Props = {
  album: Album;
  tracks: Track[];
  /** Where "Back to search" goes; includes the search term when there was one. */
  backHref?: string;
};

export default function AlbumRankPage({
  album,
  tracks,
  backHref = "/",
}: Props) {
  // The ranking itself lives in localStorage (see rankingStorage.ts), so it
  // survives a refresh. `isRanking` only decides whether we show the ranking
  // screens or the welcome screen, which is where "Resume ranking" appears.
  const [isRanking, setIsRanking] = useState(false);

  const raw = useSyncExternalStore(
    subscribe,
    () => readSessionRaw(album.id),
    () => null,
  );
  const session = useMemo(() => parseSession(raw), [raw]);
  const sortState = useMemo(
    () => (session ? replayAnswers(session) : null),
    [session],
  );

  const progress = sortState ? getProgress(sortState) : null;
  const hasInProgress = sortState !== null && !sortState.done;
  const comparison =
    isRanking && sortState && !sortState.done ? getComparison(sortState) : null;
  const hasMultipleDiscs = tracks.some((track) => track.discNumber > 1);

  function startRanking() {
    saveSession(album.id, { order: shuffle(tracks), answers: [] });
    setIsRanking(true);
  }

  function resumeRanking() {
    setIsRanking(true);
  }

  // Leaving keeps the saved progress, so the welcome screen offers to resume.
  function backToAlbum() {
    setIsRanking(false);
  }

  function choose(winner: Winner) {
    if (!session) return;

    saveSession(album.id, {
      ...session,
      answers: [...session.answers, winner],
    });
  }

  function undo() {
    if (!session || session.answers.length === 0) return;

    saveSession(album.id, {
      ...session,
      answers: session.answers.slice(0, -1),
    });
  }

  return (
    <div className="app app--blue">
      {/* The same white block on a blue backdrop as the home page. */}
      <div className="home-panel">
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="brand">
              <span className="brand__icon">♫</span>
              <span className="brand__name">
                track<span className="brand__accent">down</span>
              </span>
            </Link>

            <Link href={backHref} className="rank-back">
              ← Back to search
            </Link>
          </div>
        </header>

        <main className="rank-page">
          {!isRanking || !sortState ? (
            <div className="rank-welcome">
              {album.artworkUrl ? (
                <Image
                  className="rank-artwork"
                  src={album.artworkUrl}
                  alt={`${album.title} album cover`}
                  width={600}
                  height={600}
                  sizes="(max-width: 639px) 72vw, 280px"
                  loading="eager"
                  fetchPriority="high"
                />
              ) : (
                <div className="rank-artwork rank-artwork--placeholder">♫</div>
              )}

              <RankHeader
                eyebrow={
                  hasInProgress ? "RANKING IN PROGRESS" : "YOUR NEXT RANKING"
                }
                title={album.title}
                artist={album.artist}
              />

              {tracks.length === 0 ? (
                <p className="rank-status">
                  No tracks were found for this album.
                </p>
              ) : hasInProgress && progress ? (
                <p className="rank-status">
                  You have a ranking in progress: {progress.completed} of up to{" "}
                  {progress.max} comparisons done.
                </p>
              ) : (
                <p className="rank-status">
                  {tracks.length} {tracks.length === 1 ? "song" : "songs"} ready
                  to rank
                  {tracks.length > 1 &&
                    ` · up to ${maxComparisons(tracks.length)} comparisons`}
                </p>
              )}

              <div className="rank-actions rank-actions--center">
                {hasInProgress ? (
                  <>
                    <button
                      type="button"
                      className="button rank-start-button"
                      onClick={resumeRanking}
                    >
                      Resume ranking →
                    </button>
                    <button
                      type="button"
                      className="button button--secondary rank-start-button"
                      onClick={startRanking}
                    >
                      Start over
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="button rank-start-button"
                    disabled={tracks.length === 0}
                    onClick={startRanking}
                  >
                    Start ranking →
                  </button>
                )}
              </div>
            </div>
          ) : sortState.done ? (
            <div className="rank-track-preview">
              <RankHeader
                eyebrow="RANKING COMPLETE"
                title={album.title}
                artist={album.artist}
              />

              <p className="rank-status">
                Your songs are ranked from favorite to least favorite!
              </p>

              <ol className="rank-track-list">
                {getSortedItems(sortState).map((track, index) => (
                  <li key={track.id}>
                    <span className="rank-track-number">{index + 1}</span>
                    <span>{track.title}</span>
                  </li>
                ))}
              </ol>

              <div className="rank-actions">
                <button type="button" className="button" onClick={startRanking}>
                  Rank again
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={backToAlbum}
                >
                  ← Back to album
                </button>
              </div>
            </div>
          ) : (
            <div className="rank-track-preview">
              <RankHeader
                eyebrow="SONG COMPARISON"
                title={album.title}
                artist={album.artist}
              />

              {progress && progress.max > 0 && (
                <div className="rank-progress">
                  <p className="rank-progress__label" aria-live="polite">
                    Comparison {progress.completed + 1} of up to {progress.max}
                  </p>
                  <div
                    className="rank-progress__track"
                    role="progressbar"
                    aria-label="Ranking progress"
                    aria-valuemin={0}
                    aria-valuemax={progress.max}
                    aria-valuenow={progress.completed}
                  >
                    <div
                      className="rank-progress__fill"
                      style={{
                        width: `${Math.min(100, (progress.completed / progress.max) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <p className="rank-status">Which song do you like more?</p>

              {comparison && (
                <div className="rank-comparison">
                  <SongChoice
                    track={comparison[0]}
                    showDisc={hasMultipleDiscs}
                    onChoose={() => choose("left")}
                  />

                  <p className="rank-versus">OR</p>

                  <SongChoice
                    track={comparison[1]}
                    showDisc={hasMultipleDiscs}
                    onChoose={() => choose("right")}
                  />
                </div>
              )}

              <div className="rank-actions">
                <button
                  type="button"
                  className="button button--secondary"
                  disabled={!session || session.answers.length === 0}
                  onClick={undo}
                >
                  ↶ Undo
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={backToAlbum}
                >
                  ← Back to album
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}

function RankHeader({
  eyebrow,
  title,
  artist,
}: {
  eyebrow: string;
  title: string;
  artist: string;
}) {
  return (
    <>
      <p className="rank-eyebrow">{eyebrow}</p>
      <h1 className="rank-title">{title}</h1>
      <p className="rank-artist">{artist}</p>
    </>
  );
}

function SongChoice({
  track,
  showDisc,
  onChoose,
}: {
  track: Track;
  showDisc: boolean;
  onChoose: () => void;
}) {
  const number = track.trackNumber ?? "•";
  const label = showDisc
    ? `Disc ${track.discNumber} · Track ${number}`
    : `Track ${number}`;

  return (
    <button type="button" className="rank-song-choice" onClick={onChoose}>
      <span className="rank-song-choice__number">{label}</span>
      <span className="rank-song-choice__title">{track.title}</span>
      <span className="rank-song-choice__hint">Choose this song</span>
    </button>
  );
}
