import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__icon">♫</span>
          <span className="brand__name">
            track<span className="brand__accent">down</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
