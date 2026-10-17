import { Suspense } from "react";
import SearchPage from "@/components/SearchPage";
import SiteHeader from "@/components/SiteHeader";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="app">
          <SiteHeader />
        </main>
      }
    >
      <SearchPage />
    </Suspense>
  );
}
