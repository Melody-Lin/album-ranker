type ITunesAlbum = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100?: string;
  releaseDate?: string;
  trackCount?: number;
  primaryGenreName?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("q")?.trim();

  if (!term) {
    return Response.json(
      { error: "Please enter an album or artist name." },
      { status: 400 },
    );
  }

  try {
    const params = new URLSearchParams({
      term,
      entity: "album",
      media: "music",
      limit: "24",
      country: "US",
    });

    const response = await fetch(
      `https://itunes.apple.com/search?${params.toString()}`,
      { signal: AbortSignal.timeout(10000) },
    );

    if (!response.ok) {
      return Response.json(
        { error: "Unable to search albums right now." },
        { status: 502 },
      );
    }

    const data: { results: ITunesAlbum[] } = await response.json();

    const albums = data.results.map((album) => ({
      id: album.collectionId,
      title: album.collectionName,
      artist: album.artistName,
      artworkUrl: album.artworkUrl100?.replace(
        "100x100bb",
        "600x600bb",
      ),
      year: album.releaseDate
        ? Number(album.releaseDate.slice(0, 4))
        : null,
      trackCount: album.trackCount ?? null,
      genre: album.primaryGenreName ?? null,
    }));

    return Response.json({ albums });
  } catch {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
