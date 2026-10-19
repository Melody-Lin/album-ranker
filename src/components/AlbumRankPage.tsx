"use client";

import Link from "next/link";
import { useState } from "react";
import { useRankingSession } from "@/hooks/useRankingSession";
import { getComparison, getSortedItems } from "@/utils/mergeSort";
import { RankComparison, RankComplete, RankWelcome } from "./rank/RankScreens";
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
  // The ranking itself is saved by useRankingSession, so it survives a
  // refresh. `isRanking` only decides whether we show the ranking screens or
  // the welcome screen, which is where "Resume ranking" appears.
  const [isRanking, setIsRanking] = useState(false);
  const { sortState, progress, hasInProgress, canUndo, start, choose, undo } =
    useRankingSession(album.id, tracks);

  function startRanking() {
    start();
    setIsRanking(true);
  }

  // Leaving keeps the saved progress, so the welcome screen offers to resume.
  function backToAlbum() {
    setIsRanking(false);
  }

  // Welcome until the person starts or resumes; then comparisons until the
  // sort is done; then the finished list.
  function renderScreen() {
    if (!isRanking || !sortState) {
      return (
        <RankWelcome
          album={album}
          trackCount={tracks.length}
          hasInProgress={hasInProgress}
          progress={progress}
          onStart={startRanking}
          onResume={() => setIsRanking(true)}
        />
      );
    }

    if (sortState.done) {
      return (
        <RankComplete
          album={album}
          rankedTracks={getSortedItems(sortState)}
          onRestart={startRanking}
          onBack={backToAlbum}
        />
      );
    }

    return (
      <RankComparison
        album={album}
        comparison={getComparison(sortState)}
        progress={progress}
        showDisc={tracks.some((track) => track.discNumber > 1)}
        canUndo={canUndo}
        onChoose={choose}
        onUndo={undo}
        onBack={backToAlbum}
      />
    );
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

        <main className="rank-page">{renderScreen()}</main>
      </div>

      <SiteFooter />
    </div>
  );
}
