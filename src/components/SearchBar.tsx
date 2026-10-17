type SearchBarProps = {
  query: string;
  isLoading: boolean;
  hasSearched: boolean;
  onQueryChange: (query: string) => void;
  onSearch: (event: React.SubmitEvent<HTMLFormElement>) => void;
};

export default function SearchBar({
  query,
  isLoading,
  hasSearched,
  onQueryChange,
  onSearch,
}: SearchBarProps) {
  return (
    <form
      onSubmit={onSearch}
      className={`search-form ${hasSearched ? "search-form--results" : ""}`}
    >
      <svg
        aria-hidden="true"
        className="search-form__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
      </svg>

      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search an album or artist..."
        aria-label="Search albums or artists"
        className="search-form__input"
      />

      {query && (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          aria-label="Clear search input"
          className="search-form__clear"
        >
          Clear
        </button>
      )}

      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="button"
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
