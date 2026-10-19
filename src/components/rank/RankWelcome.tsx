import Image from "next/image";
import { maxComparisons } from "@/utils/mergeSort";
import RankHeader from "./RankHeader";
import type { Album } from "@/types";

type RankWelcomeProps = {
  album: Album;
  trackCount: number;
  hasInProgress: boolean;
  progress: { completed: number; max: number } | null;
  onStart: () => void;
  onResume: () => void;
};

/** The first screen: album cover plus Start, or Resume / Start over. */
export default function RankWelcome({
  album,
  trackCount,
  hasInProgress,
  progress,
  onStart,
  onResume,
}: RankWelcomeProps) {
  function renderRankStatus() {
    if (trackCount === 0) {
      return (
        <p className="rank-status">No tracks were found for this album.</p>
      );
    }

    if (hasInProgress && progress) {
      return (
        <p className="rank-status">
          You have a ranking in progress: {progress.completed} of up to{" "}
          {progress.max} comparisons done.
        </p>
      );
    }

    return (
      <p className="rank-status">
        {trackCount} {trackCount === 1 ? "song" : "songs"} ready to rank
        {trackCount > 1 && ` · up to ${maxComparisons(trackCount)} comparisons`}
      </p>
    );
  }
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

      {renderRankStatus()}

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
