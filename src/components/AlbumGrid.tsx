import AlbumCard from "./AlbumCard";
import type { Album } from "@/types";

type AlbumGridProps = {
  albums: Album[];
};

// Covers the first row at every grid width (2 to 5 columns) plus a little more,
// i.e. the covers that are visible without scrolling. Those load immediately;
// the rest stay lazy so a 24-album search doesn't download 24 covers at once.
const EAGER_COUNT = 10;

export default function AlbumGrid({ albums }: AlbumGridProps) {
  return (
    <div className="album-grid">
      {albums.map((album, index) => (
        <AlbumCard key={album.id} album={album} eager={index < EAGER_COUNT} />
      ))}
    </div>
  );
}
