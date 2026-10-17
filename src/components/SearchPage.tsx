"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import SearchBar from "./SearchBar";
import AlbumGrid from "./AlbumGrid";
import type { Album } from "@/types";

type SearchResult = {
  /** Which search these results belong to (see `requestKey` below). */
  key: string;
  albums: Album[];
  error: string;
};

export default function SearchPage() {
  // The URL (?q=...) is the source of truth for what has been searched, so
  // results survive refreshes, back/forward and shared links.
  const urlQuery = useSearchParams().get("q")?.trim() ?? "";

  const [query, setQuery] = useState(urlQuery); // what's typed in the box
  const [previousUrlQuery, setPreviousUrlQuery] = useState(urlQuery);
  const [attempt, setAttempt] = useState(0); // bumped to re-run the same search
  const [result, setResult] = useState<SearchResult | null>(null);

  // Keep the text box in sync when the URL changes from outside the form
  // (back/forward, "Back to home").
  if (urlQuery !== previousUrlQuery) {
    setPreviousUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  // Loading is derived, not stored: we are loading until results arrive for
  // the search the URL currently asks for.
  const requestKey = `${attempt}:${urlQuery}`;
  const hasSearched = urlQuery !== "";
  const current = result?.key === requestKey ? result : null;
  const isLoading = hasSearched && current === null;
  const albums = current?.albums ?? [];
  const error = current?.error ?? "";

  useEffect(() => {
    if (!urlQuery) return;

    const key = `${attempt}:${urlQuery}`;
    const controller = new AbortController();

    async function loadAlbums() {
      try {
        const response = await fetch(
          `/api/albums?q=${encodeURIComponent(urlQuery)}`,
          { signal: controller.signal },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to search albums.");
        }

        setResult({ key, albums: data.albums, error: "" });
      } catch (err) {
        // Aborted because the search changed or the page was left.
        if (controller.signal.aborted) return;

        setResult({
          key,
          albums: [],
          error:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
        });
      }
    }

    void loadAlbums();

    // Runs when the search changes (including "Back to home") or on unmount,
    // which cancels the request that is still in flight.
    return () => controller.abort();
  }, [urlQuery, attempt]);

  function handleSearch(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const term = query.trim();

    if (!term || isLoading) return;

    if (term === urlQuery) {
      // Same search again: the URL won't change, so re-run it directly.
      setAttempt((count) => count + 1);
      return;
    }

    // Next.js syncs history.pushState with useSearchParams, so the URL and the
    // UI update immediately and the Back button returns to the previous search.
    window.history.pushState(
      null,
      "",
      `/?${new URLSearchParams({ q: term }).toString()}`,
    );
  }

  function handleBackToHome() {
    window.history.pushState(null, "", "/");
  }

  return (
    <div className="app app--blue">
      {/* The white block that sits on the blue backdrop. */}
      <div className="home-panel">
        <SiteHeader />

        <main>
          <section
            className={`search-section ${
              hasSearched ? "search-section--results" : ""
            }`}
          >
            <div
              className={`search-hero ${
                hasSearched ? "search-hero--results" : ""
              }`}
            >
              {!hasSearched && (
                <>
                  {/* <div className="search-badge">
                    <span aria-hidden="true">✦</span>
                    Find your next favorite
                  </div> */}

                  <h1 className="search-title">
                    Your music.
                    <span className="search-title__accent">Your ranking.</span>
                  </h1>

                  <p className="search-description">
                    {/* Search for an album and rank every song, one comparison at a
                    time. */}
                    Find an album. Rank its songs. One matchup at a time.
                  </p>
                </>
              )}

              <SearchBar
                query={query}
                isLoading={isLoading}
                hasSearched={hasSearched}
                onQueryChange={setQuery}
                onSearch={handleSearch}
              />

              {!hasSearched && (
                <p className="search-hint">
                  A little space to discover what you love.
                </p>
              )}
            </div>
          </section>

          {hasSearched && (
            <section className="results-section">
              <h2 className="results-title">Search results</h2>

              <p className="results-count" aria-live="polite">
                {isLoading
                  ? "Finding albums for you..."
                  : error
                    ? "Search couldn't be completed"
                    : `${albums.length} ${
                        albums.length === 1 ? "album" : "albums"
                      } found`}
              </p>

              {error && (
                <div role="alert" className="error-message">
                  <p>{error}</p>
                  <button
                    type="button"
                    className="album-card__button"
                    onClick={() => setAttempt((count) => count + 1)}
                  >
                    Try again
                  </button>
                </div>
              )}

              {isLoading && (
                <div
                  className="skeleton-grid"
                  aria-label="Loading albums"
                  aria-busy="true"
                >
                  {Array.from({ length: 8 }, (_, index) => (
                    <div key={index} className="skeleton">
                      <div className="skeleton__artwork" />
                      <div className="skeleton__line" />
                      <div className="skeleton__line skeleton__line--short" />
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && !error && albums.length > 0 && (
                <AlbumGrid albums={albums} />
              )}

              {!isLoading && !error && albums.length === 0 && (
                <div className="status-message">
                  <p className="status-message__icon">♫</p>
                  <h3 className="status-message__title">No albums found</h3>
                  <p className="status-message__description">
                    Try searching for another album or artist.
                  </p>
                </div>
              )}

              <div className="results-footer">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={handleBackToHome}
                >
                  Back to home
                </button>
              </div>
            </section>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
