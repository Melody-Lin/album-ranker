import Image from "next/image";
import { maxComparisons, type Winner } from "@/utils/mergeSort";
import type { Album, Track } from "@/types";

type Progress = { completed: number; max: number } | null;

/* -------------------------------------------------------------------------- */
/* Welcome: cover plus Start, or Resume / Start over                          */
/* -------------------------------------------------------------------------- */

export function RankWelcome({
  album,
  trackCount,
  hasInProgress,
  progress,
  onStart,
  onResume,
}: {
  album: Album;
  trackCount: number;
  hasInProgress: boolean;
  progress: Progress;
  onStart: () => void;
  onResume: () => void;
}) {
  return (
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
        eyebrow={hasInProgress ? "RANKING IN PROGRESS" : "YOUR NEXT RANKING"}
        album={album}
      />

      {trackCount === 0 ? (
        <p className="rank-status">No tracks were found for this album.</p>
      ) : hasInProgress && progress ? (
        <p className="rank-status">
          You have a ranking in progress: {progress.completed} of up to{" "}
          {progress.max} comparisons done.
        </p>
      ) : (
        <p className="rank-status">
          {trackCount} {trackCount === 1 ? "song" : "songs"} ready to rank
          {trackCount > 1 &&
            ` · up to ${maxComparisons(trackCount)} comparisons`}
        </p>
      )}

      <div className="rank-actions rank-actions--center">
        {hasInProgress ? (
          <>
            <button
              type="button"
              className="button rank-start-button"
              onClick={onResume}
            >
              Resume ranking →
            </button>
            <button
              type="button"
              className="button button--secondary rank-start-button"
              onClick={onStart}
            >
              Start over
            </button>
          </>
        ) : (
          <button
            type="button"
            className="button rank-start-button"
            disabled={trackCount === 0}
            onClick={onStart}
          >
            Start ranking →
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Comparison: "Which song do you like more?"                                 */
/* -------------------------------------------------------------------------- */

export function RankComparison({
  album,
  comparison,
  progress,
  showDisc,
  canUndo,
  onChoose,
  onUndo,
  onBack,
}: {
  album: Album;
  comparison: [Track, Track] | null;
  progress: Progress;
  showDisc: boolean;
  canUndo: boolean;
  onChoose: (winner: Winner) => void;
  onUndo: () => void;
  onBack: () => void;
}) {
  return (
    <div className="rank-track-preview">
      <RankHeader eyebrow="SONG COMPARISON" album={album} />

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
            showDisc={showDisc}
            onChoose={() => onChoose("left")}
          />

          <p className="rank-versus">OR</p>

          <SongChoice
            track={comparison[1]}
            showDisc={showDisc}
            onChoose={() => onChoose("right")}
          />
        </div>
      )}

      <div className="rank-actions">
        <button
          type="button"
          className="button button--secondary"
          disabled={!canUndo}
          onClick={onUndo}
        >
          ↶ Undo
        </button>
        <button
          type="button"
          className="button button--secondary"
          onClick={onBack}
        >
          ← Back to album
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Complete: the finished list, favourite first                               */
/* -------------------------------------------------------------------------- */

export function RankComplete({
  album,
  rankedTracks,
  onRestart,
  onBack,
}: {
  album: Album;
  rankedTracks: Track[];
  onRestart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="rank-track-preview">
      <RankHeader eyebrow="RANKING COMPLETE" album={album} />

      <p className="rank-status">
        Your songs are ranked from favorite to least favorite!
      </p>

      <ol className="rank-track-list">
        {rankedTracks.map((track, index) => (
          <li key={track.id}>
            <span className="rank-track-number">{index + 1}</span>
            <span>{track.title}</span>
          </li>
        ))}
      </ol>

      <div className="rank-actions">
        <button type="button" className="button" onClick={onRestart}>
          Rank again
        </button>
        <button
          type="button"
          className="button button--secondary"
          onClick={onBack}
        >
          ← Back to album
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small shared pieces                                                        */
/* -------------------------------------------------------------------------- */

function RankHeader({ eyebrow, album }: { eyebrow: string; album: Album }) {
  return (
    <>
      <p className="rank-eyebrow">{eyebrow}</p>
      <h1 className="rank-title">{album.title}</h1>
      <p className="rank-artist">{album.artist}</p>
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
