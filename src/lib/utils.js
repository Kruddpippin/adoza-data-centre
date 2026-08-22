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
export const ROLES = ["super_admin", "campaign_admin", "enumerator", "validator", "committee", "field_agent", "blog_editor"];

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  campaign_admin: "Admin",
  enumerator: "Enumerator",
  validator: "Validator",
  committee: "Benefits Committee",
  field_agent: "Field Agent",
  blog_editor: "Blog Editor",
};

export const ROLE_COLORS = {
  super_admin: "bg-purple-100 text-purple-700",
  campaign_admin: "bg-primary/10 text-primary",
  enumerator: "bg-blue-100 text-blue-700",
  validator: "bg-amber-100 text-amber-700",
  committee: "bg-teal-100 text-teal-700",
  field_agent: "bg-sky-100 text-sky-700",
  blog_editor: "bg-pink-100 text-pink-700",
};

export const ADMIN_ROLES = ["super_admin", "campaign_admin"];
export const isAdminRole = (r) => ADMIN_ROLES.includes(r);

// Roles a prospective staff member can self-apply for — admin-tier roles are never
// self-service, they're only ever granted directly by an existing admin.
export const APPLICABLE_ROLES = ["field_agent", "validator", "enumerator"];
export const OWNER_EMAIL = "precious.op2013@gmail.com";

export const VERIFICATION_META = {
  pending:  { label: "Pending",  cls: "bg-amber-100 text-amber-700" },
  verified: { label: "Verified", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
  flagged:  { label: "Flagged",  cls: "bg-orange-100 text-orange-700" },
};

export const COURSE_STATUS_META = {
  not_started: { label: "Not started", cls: "bg-muted text-muted-foreground" },
  in_progress: { label: "In progress", cls: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700" },
};

export const APPLICATION_STATUS_META = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
  shortlisted: { label: "Shortlisted", cls: "bg-blue-100 text-blue-700" },
  accepted: { label: "Accepted", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Not selected", cls: "bg-red-100 text-red-700" },
  withdrawn: { label: "Withdrawn", cls: "bg-muted text-muted-foreground" },
};

export const BLOG_STATUS_META = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
  published: { label: "Published", cls: "bg-emerald-100 text-emerald-700" },
};

// "Other" is a sentinel the registration form swaps for a free-text value before submit.
export const DESIGNATION_OPTIONS = ["Media Team", "Protocol Team", "Other"];

export const EQUIPMENT_META = {
  available: { label: "Available", cls: "bg-emerald-100 text-emerald-700" },
  assigned:  { label: "Assigned",  cls: "bg-blue-100 text-blue-700" },
  delivered: { label: "Delivered", cls: "bg-primary/10 text-primary" },
  lost:      { label: "Lost",      cls: "bg-red-100 text-red-700" },
  damaged:   { label: "Damaged",   cls: "bg-orange-100 text-orange-700" },
};

export const EQUIPMENT_CATEGORIES = [
  "General", "Agro", "Baking", "Beauty", "Business", "Electronics", "Solar", "Tailoring", "Welding",
];

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

export const ID_TYPES = [
  { value: "voters_card", label: "Voter's Card" },
  { value: "nin", label: "National Identification Number" },
  { value: "passport", label: "International Passport" },
  { value: "drivers_license", label: "Driver's License" },
];

// CBN-licensed banks (name + sort code), for the candidate bank-details form.
export const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "058", name: "Guaranty Trust Bank (GTBank)" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "50211", name: "Kuda Microfinance Bank" },
  { code: "526", name: "Moniepoint Microfinance Bank" },
  { code: "999992", name: "OPay (Paycom)" },
  { code: "999991", name: "PalmPay" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
];

// NUBAN — Nigeria's standard account number format: exactly 10 digits.
export const isValidNuban = (accountNumber) => /^[0-9]{10}$/.test((accountNumber ?? "").trim());

// Format checks only — these confirm a government ID number is shaped correctly, not
// that it's genuinely registered to that person. We can't verify against NIMC/INEC at
// point of entry (no accessible API for either without a paid KYC integration), so this
// is a first line of defense against typos/garbage, not real identity verification.
// NIN and voters_card formats are well-documented and consistent across sources; passport
// and drivers_license are looser because the exact official format is less certain.
export const ID_FORMATS = {
  nin: { regex: /^[0-9]{11}$/, hint: "11 digits" },
  voters_card: { regex: /^[A-Z0-9]{19}$/i, hint: "19 characters — the VIN printed on the front of the card (starts with letters, e.g. INC)" },
  passport: { regex: /^[A-Z]{1,2}[0-9]{7,8}$/i, hint: "1-2 letters followed by 7-8 digits" },
  drivers_license: { regex: /^[A-Z0-9]{8,16}$/i, hint: "8-16 letters/numbers" },
};

export const isValidGovernmentId = (type, value) => {
  const v = (value ?? "").trim();
  if (!v) return false;
  const fmt = ID_FORMATS[type];
  return fmt ? fmt.regex.test(v) : true;
};

export const DELIVERY_METHOD_LABELS = {
  home_address: "Deliver to my home address",
  custom_address: "Deliver to a different address",
  pickup_centre: "Pick up at the empowerment centre",
};

// A generous Nigeria-wide bounding box (not Kogi-only) — real GPS/network fixes can be
// off by kilometers, but never continents. Catches garbage like manually-typed or
// pasted-in-error coordinates (e.g. a record once had latitude=25, longitude=26 —
// suspiciously round numbers landing in the Egypt/Libya desert) without rejecting a
// slightly-imprecise but genuine reading from somewhere else in the country.
export const NIGERIA_BOUNDS = { minLat: 4, maxLat: 14, minLng: 2.5, maxLng: 15 };

export const isPlausibleNigeriaCoordinate = (lat, lng) => {
  const la = Number(lat), lo = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return false;
  return la >= NIGERIA_BOUNDS.minLat && la <= NIGERIA_BOUNDS.maxLat && lo >= NIGERIA_BOUNDS.minLng && lo <= NIGERIA_BOUNDS.maxLng;
};

// Scoped to Kogi Central's 5 LGAs only — this programme doesn't operate in the other
// 16 Kogi State LGAs (Kogi East/West), so they're deliberately excluded here.
export const KOGI_LGAS = ["Adavi", "Ajaokuta", "Ogori/Magongo", "Okehi", "Okene"];

// Wards per LGA, source: INEC Directory of Polling Units (Revised January 2015).
export const KOGI_WARDS_BY_LGA = {
  "Adavi": [
    "Okunchi/Ozuri/Onieka", "Ogaminana", "Iruvucheba", "Idanuhua", "Adavi-Eba",
    "Kuroko I", "Kuroko II", "Ino Ziomi/Ipaku/Osisi", "Ikaraworo/Idobanyere",
    "Nagazi Farm Centre", "Ege/Iruvochinomi",
  ],
  "Ajaokuta": [
    "Ebiya North", "Ebiya South", "Abodi/Patesi", "Ichuwa/Upaja", "Badoko",
    "Ogigiri", "Adogo", "Achagana", "Odonu/Unosi", "Omgbo",
    "Adogu/Apamira/Ogodo Uhuovene", "Obangede/Ohunene/Ukoko Inye'Re",
    "Old Ajaokuta", "Ganaga/Township",
  ],
  "Ogori/Magongo": [
    "Eni", "Oshobane", "Okibo", "Okesi", "Ileteju", "Aiyeromi", "Ugugu",
    "Obinoyin", "Obatgben", "Oturu Opowuroye",
  ],
  "Okehi": [
    "Obaiba I", "Obaiba II", "Okuehu", "Ohueta", "Oboroke Eba",
    "Obaroke Uvete", "Eika / Ohizenyi", "Okaito / Usungwen",
    "Ohuepe / Omavi Uboro", "Obangede / Uhuodo", "Oboroke Uvete - II",
  ],
  "Okene": [
    "Bariki", "Obessa", "Onyukoko", "Idoji", "Orietesu", "Otutu",
    "Okene-Eba / Agassa/ Ahache", "Obehira Uvetta", "Obehira Eba",
    "Abuga/Ozuja", "Upogoro/Odenku",
  ],
};

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
