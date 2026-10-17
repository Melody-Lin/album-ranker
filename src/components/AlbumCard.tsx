"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Album } from "@/types";
import ScrollingText from "@/components/ScrollingText";

type AlbumCardProps = {
  album: Album;
  /** Load the cover immediately. Set for cards that are above the fold. */
  eager?: boolean;
};

export default function AlbumCard({ album, eager = false }: AlbumCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Carry the current search along so the rank page's "Back to search" link
  // can return to these same results.
  const searchTerm = useSearchParams().get("q")?.trim() ?? "";
  const rankHref = searchTerm
    ? `/albums/${album.id}/rank?${new URLSearchParams({ q: searchTerm }).toString()}`
    : `/albums/${album.id}/rank`;

  // The whole card is one link, so clicking anywhere on it opens the ranking.
  // "Rank songs →" is a styled <span>, because a button or link nested inside
  // a link is invalid HTML.
  //
  // Prefetch is off because the rank page calls iTunes when it renders, and a
  // grid of 24 cards would otherwise fire 24 lookups at once.
  return (
    <Link
      href={rankHref}
      prefetch={false}
      className="album-card"
      aria-label={`Rank songs from ${album.title} by ${album.artist}`}
    >
      <div className="album-card__artwork">
        {album.artworkUrl && (
          <>
            {!imageLoaded && (
              <div
                className="album-card__image-placeholder"
                aria-hidden="true"
              />
            )}

            <Image
              src={album.artworkUrl}
              alt={`${album.title} album cover`}
              width={600}
              height={600}
              sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 220px"
              // next/image lazy-loads by default. Covers above the fold are the
              // page's largest paint, so they must load eagerly (Next 16 deprecated
              // `priority` in favour of this).
              loading={eager ? "eager" : undefined}
              onLoad={() => setImageLoaded(true)}
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 200ms ease",
              }}
            />
          </>
        )}
      </div>

      <h3 className="album-card__title" title={album.title}>
        <ScrollingText text={album.title} />
      </h3>

      <p className="album-card__artist" title={album.artist}>
        <ScrollingText text={album.artist} />
      </p>

      <p className="album-card__meta">
        {[album.year, album.genre].filter(Boolean).join(" · ")}
      </p>
    </Link>
  );
}
