import type { Album } from "@/types";

/** The label, album title and artist shown at the top of every rank screen. */
export default function RankHeader({
  eyebrow,
  album,
}: {
  eyebrow: string;
  album: Album;
}) {
  return (
    <>
      <p className="rank-eyebrow">{eyebrow}</p>
      <h1 className="rank-title">{album.title}</h1>
      <p className="rank-artist">{album.artist}</p>
    </>
  );
}
