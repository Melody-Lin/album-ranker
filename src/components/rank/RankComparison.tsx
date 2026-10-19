import type { Winner } from "@/utils/mergeSort";
import RankHeader from "./RankHeader";
import type { Album, Track } from "@/types";

type RankComparisonProps = {
  album: Album;
  comparison: [Track, Track] | null;
  progress: { completed: number; max: number } | null;
  showDisc: boolean;
  canUndo: boolean;
  onChoose: (winner: Winner) => void;
  onUndo: () => void;
  onBack: () => void;
};

/** The "Which song do you like more?" screen. */
export default function RankComparison({
  album,
  comparison,
  progress,
  showDisc,
  canUndo,
  onChoose,
  onUndo,
  onBack,
}: RankComparisonProps) {
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
