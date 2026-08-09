import { Link } from "react-router-dom";

function BuiltByBadge() {
  return (
    <a
      href="https://kruddpippin-dev.vercel.app/"
      target="_blank"
      rel="noreferrer"
      aria-label="Built by Signal Labs"
      className="inline-flex items-center gap-2 rounded-full bg-[#4d1119] py-1.5 pl-1.5 pr-3 shadow-sm transition-opacity hover:opacity-90"
    >
      <img src="/signal-labs-icon.svg" alt="" width={20} height={20} className="h-5 w-5 rounded-full" aria-hidden />
      <span className="text-xs font-semibold text-white">Signal</span>
      <span className="text-xs font-medium text-[#d9b98f]">Labs</span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-5 text-center sm:flex-row sm:justify-between sm:text-left lg:px-8">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ADOZA Data Centre — SYB Door-to-Door Youth Empowerment Programme, Kogi State Government.
        </p>
        <nav className="flex items-center gap-4" aria-label="Footer">
          <Link to="/about" className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
            About
          </Link>
          <Link to="/privacy-policy" className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
            Privacy Policy
          </Link>
          <Link to="/terms-of-conditions" className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
            Terms of Conditions
          </Link>
        </nav>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-start gap-2 px-4 py-3 lg:px-8">
          <span className="text-xs text-muted-foreground">Built by</span>
          <BuiltByBadge />
        </div>
      </div>
    </footer>
  );
}
