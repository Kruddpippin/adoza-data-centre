/* ---------- formatting ---------- */
export const formatNaira = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const formatDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const formatDateTime = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const ageFrom = (dob: string | null | undefined) => {
  if (!dob) return null;
  const b = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a -= 1;
  return a;
};

export const initialsOf = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "U";

/* ---------- domain constants ---------- */
export const ROLES = ["super_admin", "campaign_admin", "enumerator", "verifier", "committee"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  campaign_admin: "Campaign Admin",
  enumerator: "Enumerator",
  verifier: "Verifier",
  committee: "Committee",
};

// Tailwind class-pair equivalents, expressed as [backgroundHex, textHex] for RN inline styles.
export const ROLE_COLORS: Record<Role, [string, string]> = {
  super_admin: ["#f3e8ff", "#7e22ce"],
  campaign_admin: ["#15803d1a", "#15803d"],
  enumerator: ["#dbeafe", "#1d4ed8"],
  verifier: ["#fef3c7", "#b45309"],
  committee: ["#ccfbf1", "#0f766e"],
};

export const ADMIN_ROLES: Role[] = ["super_admin", "campaign_admin"];
export const isAdminRole = (r?: string | null) => !!r && (ADMIN_ROLES as string[]).includes(r);

export type VerificationStatus = "pending" | "verified" | "rejected" | "flagged";

export const VERIFICATION_META: Record<VerificationStatus, { label: string; bg: string; fg: string }> = {
  pending: { label: "Pending", bg: "#fef3c7", fg: "#b45309" },
  verified: { label: "Verified", bg: "#d1fae5", fg: "#047857" },
  rejected: { label: "Rejected", bg: "#fee2e2", fg: "#b91c1c" },
  flagged: { label: "Flagged", bg: "#ffedd5", fg: "#c2410c" },
};

export const EMPLOYMENT_LABELS: Record<string, string> = {
  employed: "Employed",
  unemployed: "Unemployed",
  self_employed: "Self-employed",
  student: "Student",
};

export const EDUCATION_LEVELS = ["None", "Primary", "Secondary", "Tertiary", "Postgraduate"];

export const KOGI_LGAS = [
  "Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah",
  "Igalamela-Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa-Muro",
  "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala",
  "Yagba East", "Yagba West",
];
