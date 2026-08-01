import { clsx } from "clsx";

export const cn = (...args) => clsx(...args);

/* ---------- formatting ---------- */
export const formatNaira = (n) =>
  n == null ? "—" : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const ageFrom = (dob) => {
  if (!dob) return null;
  const b = new Date(dob), now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a -= 1;
  return a;
};

export const initialsOf = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "U";

/* ---------- domain constants ---------- */
export const ROLES = ["super_admin", "campaign_admin", "enumerator", "verifier", "committee"];

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  campaign_admin: "Campaign Admin",
  enumerator: "Enumerator",
  verifier: "Verifier",
  committee: "Committee",
};

export const ROLE_COLORS = {
  super_admin: "bg-purple-100 text-purple-700",
  campaign_admin: "bg-primary/10 text-primary",
  enumerator: "bg-blue-100 text-blue-700",
  verifier: "bg-amber-100 text-amber-700",
  committee: "bg-teal-100 text-teal-700",
};

export const ADMIN_ROLES = ["super_admin", "campaign_admin"];
export const isAdminRole = (r) => ADMIN_ROLES.includes(r);

export const VERIFICATION_META = {
  pending:  { label: "Pending",  cls: "bg-amber-100 text-amber-700" },
  verified: { label: "Verified", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
  flagged:  { label: "Flagged",  cls: "bg-orange-100 text-orange-700" },
};

export const EQUIPMENT_META = {
  available: { label: "Available", cls: "bg-emerald-100 text-emerald-700" },
  assigned:  { label: "Assigned",  cls: "bg-blue-100 text-blue-700" },
  delivered: { label: "Delivered", cls: "bg-primary/10 text-primary" },
  lost:      { label: "Lost",      cls: "bg-red-100 text-red-700" },
  damaged:   { label: "Damaged",   cls: "bg-orange-100 text-orange-700" },
};

export const FUNDING_META = {
  pending:   { label: "Pending",   cls: "bg-amber-100 text-amber-700" },
  approved:  { label: "Approved",  cls: "bg-blue-100 text-blue-700" },
  disbursed: { label: "Disbursed", cls: "bg-emerald-100 text-emerald-700" },
  failed:    { label: "Failed",    cls: "bg-red-100 text-red-700" },
  returned:  { label: "Returned",  cls: "bg-orange-100 text-orange-700" },
};

export const EMPLOYMENT_LABELS = {
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

/* ---------- CSV export ---------- */
export function exportCsv(filename, rows) {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
