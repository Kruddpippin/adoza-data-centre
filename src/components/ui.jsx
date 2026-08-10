import { forwardRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2, Inbox, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- Button ---------------- */
const buttonVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-card hover:bg-muted",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-muted",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm",
};
const buttonSizes = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-11 px-6 text-sm",
  icon: "h-9 w-9",
};

export const Button = forwardRef(function Button(
  { className, variant = "default", size = "default", loading = false, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

/* ---------------- Card ---------------- */
export function Card({ className, ...props }) {
  return <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...props} />;
}
export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1 p-5 pb-2", className)} {...props} />;
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-sm font-semibold", className)} {...props} />;
}
export function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-2", className)} {...props} />;
}

/* ---------------- Inputs ---------------- */
export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export function Label({ className, children, ...props }) {
  return (
    <label className={cn("mb-1.5 block text-xs font-medium text-muted-foreground", className)} {...props}>
      {children}
    </label>
  );
}

export function Field({ label, required, children, hint, error }) {
  return (
    <div>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

/* ---------------- Badge ---------------- */
export function Badge({ className, children }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", className)}>
      {children}
    </span>
  );
}

/* ---------------- StatCard ---------------- */
export function StatCard({ icon: Icon, label, value, sub, tone = "primary", className }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent-foreground",
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <Card className={cn("card-lift p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="stat-value mt-2 text-2xl lg:text-3xl">{value}</p>
          {sub && <p className="mt-1.5 text-[11px] text-muted-foreground">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        )}
      </div>
    </Card>
  );
}

/* ---------------- Spinner / Empty / Error ---------------- */
export function Spinner({ className }) {
  return (
    <div className={cn("flex items-center justify-center py-16", className)} role="status" aria-label="Loading">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

/* ---------------- Skeletons ---------------- */
export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} aria-hidden />;
}

export function StatCardSkeleton({ className }) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2.5">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-7 w-1/2" />
        </div>
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      </div>
    </Card>
  );
}

export function TableSkeleton({ columns = 5, rows = 6, className }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", className)} role="status" aria-label="Loading">
      <div className="border-b bg-muted/50 px-4 py-2.5">
        <div className="flex gap-6">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-6 px-4 py-3.5">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className={cn("h-3.5 flex-1", c === 0 && "max-w-32")} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-1 text-sm font-semibold">{title}</p>
      {message && <p className="max-w-xs text-xs text-muted-foreground">{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong loading data.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({ open, onClose, title, children, wide = false, centered = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div
      className={cn("fixed inset-0 z-50 flex justify-center", centered ? "items-center" : "items-end sm:items-center")}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} aria-hidden />
      <div
        className={cn(
          "animate-scale-in relative z-10 max-h-[92vh] w-full overflow-y-auto bg-card p-5 shadow-xl",
          centered ? "rounded-2xl" : "rounded-t-2xl sm:rounded-2xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-md"
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-base font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ---------------- Table helpers ---------------- */
export function Table({ children, className }) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border bg-card", className)}>
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}
export function Th({ children, className }) {
  return (
    <th className={cn("whitespace-nowrap border-b bg-muted/50 px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </th>
  );
}
export function Td({ children, className }) {
  return <td className={cn("border-b px-4 py-3 align-middle", className)}>{children}</td>;
}
