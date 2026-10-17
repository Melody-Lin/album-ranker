export type Album = {
  id: number;
  title: string;
  artist: string;
  artworkUrl?: string;
  year: number | null;
  trackCount: number | null;
  genre: string | null;
};

export type Track = {
  id: number;
  title: string;
  artist: string;
  trackNumber: number | null;
  discNumber: number;
  durationMs: number | null;
  previewUrl: string | null;
};
