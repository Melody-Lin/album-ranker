"use client";

import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

// Shown when iTunes can't be reached while loading an album.
export default function RankError({ reset }: { reset: () => void }) {
  return (
    <div className="app app--blue">
      <div className="home-panel">
        <SiteHeader />

        <main className="rank-page">
          <div className="rank-welcome">
            <p className="rank-eyebrow">SOMETHING WENT WRONG</p>
            <h1 className="rank-title">We couldn&apos;t load this album</h1>
            <p className="rank-status">
              The music service may be temporarily unavailable. Give it another
              try in a moment.
            </p>

            <div className="rank-actions rank-actions--center">
              <button
                type="button"
                className="button rank-start-button"
                onClick={reset}
              >
                Try again
              </button>
            </div>

            <p className="rank-status">
              <Link href="/" className="rank-back">
                ← Back to search
              </Link>
            </p>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
