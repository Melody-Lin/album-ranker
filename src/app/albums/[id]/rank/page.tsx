import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AlbumRankPage from "@/components/AlbumRankPage";
import { getAlbumWithTracks } from "@/lib/itunes";

type ParamsProps = {
  params: Promise<{ id: string }>;
};

type PageProps = ParamsProps & {
  searchParams: Promise<{ q?: string | string[] }>;
};

// Next dedupes identical fetches within one render, so calling the lookup here
// and in the page below results in a single request to iTunes.
export async function generateMetadata({
  params,
}: ParamsProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getAlbumWithTracks(id);

  return {
    title: data ? `Rank ${data.album.title} · trackdown` : "Album not found",
  };
}

export default async function RankPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { q } = await searchParams;
  const data = await getAlbumWithTracks(id);

  if (!data) notFound();

  // "Back to search" returns to the same results the user came from.
  const term = typeof q === "string" ? q.trim() : "";
  const backHref = term
    ? `/?${new URLSearchParams({ q: term }).toString()}`
    : "/";

  return (
    <AlbumRankPage
      album={data.album}
      tracks={data.tracks}
      backHref={backHref}
    />
  );
}
