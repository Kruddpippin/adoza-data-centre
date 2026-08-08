import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

export function StaticPageLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="ADOZA Data Centre home">
            <img
              src="/kogi-logo.png"
              alt="Kogi State Government"
              width={36}
              height={36}
              decoding="async"
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <p className="font-display truncate text-sm font-bold tracking-tight sm:text-base">
              ADOZA Data Centre
            </p>
          </Link>
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10 lg:px-8">
          <h1 className="font-display animate-fade-up text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="animate-fade-up stagger-1 mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
          <div className="animate-fade-up stagger-2 mt-6 space-y-5 text-sm leading-relaxed text-foreground sm:text-base">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
