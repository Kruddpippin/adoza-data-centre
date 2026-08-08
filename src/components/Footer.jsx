import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-5 text-center sm:flex-row sm:justify-between sm:text-left lg:px-8">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ADOZA Data Centre — SYB Door-to-Door Candidate Empowerment Programme, Kogi State Government.
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
    </footer>
  );
}
