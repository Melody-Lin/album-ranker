import RankHeader from "./RankHeader";
import type { Album, Track } from "@/types";

type RankCompleteProps = {
  album: Album;
  /** Favorite first. */
  rankedTracks: Track[];
  onRestart: () => void;
  onBack: () => void;
};

/** The finished list, favorite to least favorite. */
export default function RankComplete({
  album,
  rankedTracks,
  onRestart,
  onBack,
}: RankCompleteProps) {
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
