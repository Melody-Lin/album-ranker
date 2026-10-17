import type { Album, Track } from "@/types";

const ITUNES_BASE_URL = "https://itunes.apple.com";
const REQUEST_TIMEOUT_MS = 10_000;

// Cache lifetimes (seconds). Apple's Search API is rate limited per IP, and a
// deployed app funnels every user through the server's IP, so caching matters.
const SEARCH_REVALIDATE = 60 * 60; // 1 hour
const ALBUM_REVALIDATE = 60 * 60 * 24; // 24 hours

/** Raw item shape from the iTunes Search / Lookup APIs (both result kinds). */
type ITunesItem = {
  wrapperType?: string;

  // Album ("collection") fields
  collectionId?: number;
  collectionName?: string;
  artistName?: string;
  artworkUrl100?: string;
  releaseDate?: string;
  trackCount?: number;
  primaryGenreName?: string;

  // Track fields
  trackId?: number;
  trackName?: string;
  trackNumber?: number;
  discNumber?: number;
  trackTimeMillis?: number;
  previewUrl?: string;
};

type ITunesResponse = {
  resultCount: number;
  results: ITunesItem[];
};

/** Thrown when iTunes can't be reached or returns an error response. */
export class ITunesError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "ITunesError";
    this.status = status;
  }
}

async function fetchITunes(
  endpoint: "search" | "lookup",
  params: Record<string, string>,
  revalidate: number,
): Promise<ITunesResponse> {
  const query = new URLSearchParams({ country: "US", ...params });
  let response: Response;

  try {
    response = await fetch(
      `${ITUNES_BASE_URL}/${endpoint}?${query.toString()}`,
      {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        next: { revalidate },
      },
    );
  } catch {
    throw new ITunesError("Unable to reach the music service.");
  }

  if (!response.ok) {
    throw new ITunesError("The music service returned an error.");
  }

  try {
    return (await response.json()) as ITunesResponse;
  } catch {
    throw new ITunesError("The music service returned an invalid response.");
  }
}

function toAlbum(item: ITunesItem): Album | null {
  if (
    typeof item.collectionId !== "number" ||
    typeof item.collectionName !== "string"
  ) {
    return null;
  }

  return {
    id: item.collectionId,
    title: item.collectionName,
    artist: item.artistName ?? "Unknown artist",
    artworkUrl: item.artworkUrl100?.replace("100x100bb", "600x600bb"),
    year: item.releaseDate ? Number(item.releaseDate.slice(0, 4)) : null,
    trackCount: item.trackCount ?? null,
    genre: item.primaryGenreName ?? null,
  };
}

function toTrack(item: ITunesItem): Track | null {
  if (
    item.wrapperType !== "track" ||
    typeof item.trackId !== "number" ||
    typeof item.trackName !== "string"
  ) {
    return null;
  }

  return {
    id: item.trackId,
    title: item.trackName,
    artist: item.artistName ?? "Unknown artist",
    trackNumber: item.trackNumber ?? null,
    discNumber: item.discNumber ?? 1,
    durationMs: item.trackTimeMillis ?? null,
    previewUrl: item.previewUrl ?? null,
  };
}

/**
 * Searches albums by album or artist name.
 * Returns an empty list for a blank term; throws ITunesError on upstream failure.
 */
export async function searchAlbums(term: string): Promise<Album[]> {
  const trimmed = term.trim();

  if (!trimmed) return [];

  const data = await fetchITunes(
    "search",
    { term: trimmed, entity: "album", media: "music", limit: "24" },
    SEARCH_REVALIDATE,
  );

  return data.results
    .map(toAlbum)
    .filter((album): album is Album => album !== null);
}

/**
 * Loads an album and its tracks in one request. The lookup response includes
 * the album itself as the first result, so no extra metadata call is needed.
 *
 * Returns null when the id is malformed or no such album exists (use
 * `notFound()` in the page). Throws ITunesError on upstream failure.
 */
export async function getAlbumWithTracks(
  id: string,
): Promise<{ album: Album; tracks: Track[] } | null> {
  if (!/^\d+$/.test(id)) return null;

  const data = await fetchITunes(
    "lookup",
    { id, entity: "song" },
    ALBUM_REVALIDATE,
  );

  const albumItem = data.results.find(
    (item) => item.wrapperType === "collection",
  );
  const album = albumItem ? toAlbum(albumItem) : null;

  if (!album) return null;

  const tracks = data.results
    .map(toTrack)
    .filter((track): track is Track => track !== null)
    .sort(
      (a, b) =>
        a.discNumber - b.discNumber ||
        (a.trackNumber ?? 0) - (b.trackNumber ?? 0),
    );

  return { album, tracks };
}
