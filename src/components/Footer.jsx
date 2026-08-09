import { Link } from "react-router-dom";

function BuiltByBadge() {
  return (
    <a
      href="https://kruddpippin-dev.vercel.app/"
      target="_blank"
      rel="noreferrer"
      aria-label="Built by Signal Labs"
      className="inline-flex items-center gap-2 rounded-full bg-[#5c1533] px-3 py-1.5 shadow-sm transition-opacity hover:opacity-90"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
        <path
          fill="#fff"
          d="M8.5 2.5c-2.6 0-4.5 1.9-4.5 4.3 0 3.6 4.7 4.1 4.7 6.5 0 1-.8 1.7-2 1.7-1.5 0-2.6-1-2.9-2.4L1 13.4c.5 3 3 5.1 6.6 5.1 3 0 5.2-1.8 5.2-4.6 0-3.9-4.8-4.3-4.8-6.6 0-.8.7-1.4 1.7-1.4 1.1 0 2 .7 2.3 1.9l2.7-.9C14.2 4 11.9 2.5 8.5 2.5z"
        />
        <path fill="#3fc1c9" d="M14 14.5c0 2.5 1.9 4.3 4.5 4.3s4.5-1.8 4.5-4.3c0-3.4-4.7-3.9-4.7-6.1 0-.8.7-1.4 1.7-1.4v-2.8c-3 0-5.3 1.8-5.3 4.4 0 3.4 4.7 3.8 4.7 6 0 .9-.8 1.5-1.9 1.5-1.2 0-2.1-.8-2.4-2.1l-2.6.9c.4 2.3 2.3 3.9 4.9 3.9" />
      </svg>
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
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-3 text-center lg:px-8">
          <span className="text-xs text-muted-foreground">Built by</span>
          <BuiltByBadge />
        </div>
      </div>
    </footer>
  );
}
