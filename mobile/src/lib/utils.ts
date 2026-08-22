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
export const ROLES = ["super_admin", "campaign_admin", "enumerator", "validator", "committee", "field_agent"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  campaign_admin: "Admin",
  enumerator: "Enumerator",
  validator: "Validator",
  committee: "Benefits Committee",
  field_agent: "Field Agent",
};

// Tailwind class-pair equivalents, expressed as [backgroundHex, textHex] for RN inline styles.
export const ROLE_COLORS: Record<Role, [string, string]> = {
  super_admin: ["#f3e8ff", "#7e22ce"],
  campaign_admin: ["#15803d1a", "#15803d"],
  enumerator: ["#dbeafe", "#1d4ed8"],
  validator: ["#fef3c7", "#b45309"],
  committee: ["#ccfbf1", "#0f766e"],
  field_agent: ["#e0f2fe", "#0369a1"],
};

export const ADMIN_ROLES: Role[] = ["super_admin", "campaign_admin"];
export const isAdminRole = (r?: string | null) => !!r && (ADMIN_ROLES as string[]).includes(r);

// Roles an applicant can self-select on the staff application form — admin roles
// are granted manually, never through self-service application.
export const APPLICABLE_ROLES: Role[] = ["field_agent", "validator", "enumerator"];

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

export const ID_TYPES = [
  { value: "voters_card", label: "Voter's Card" },
  { value: "nin", label: "National Identification Number" },
  { value: "passport", label: "International Passport" },
  { value: "drivers_license", label: "Driver's License" },
];

// Format checks only — confirms a government ID number is shaped correctly, not that
// it's genuinely registered to that person. No accessible NIMC/INEC API exists for real
// verification at point of entry. NIN and voters_card formats are well-documented; passport
// and drivers_license are looser since the exact official format is less certain.
export const ID_FORMATS: Record<string, { regex: RegExp; hint: string }> = {
  nin: { regex: /^[0-9]{11}$/, hint: "11 digits" },
  voters_card: { regex: /^[A-Z0-9]{19}$/i, hint: "19 characters — the VIN printed on the front of the card (starts with letters, e.g. INC)" },
  passport: { regex: /^[A-Z]{1,2}[0-9]{7,8}$/i, hint: "1-2 letters followed by 7-8 digits" },
  drivers_license: { regex: /^[A-Z0-9]{8,16}$/i, hint: "8-16 letters/numbers" },
};

export const isValidGovernmentId = (type: string | null | undefined, value: string | null | undefined) => {
  const v = (value ?? "").trim();
  if (!v) return false;
  const fmt = type ? ID_FORMATS[type] : undefined;
  return fmt ? fmt.regex.test(v) : true;
};

export const DELIVERY_METHOD_LABELS: Record<string, string> = {
  home_address: "Deliver to home address",
  custom_address: "Deliver to a different address",
  pickup_centre: "Pick up at the empowerment centre",
};

// A generous Nigeria-wide bounding box (not Kogi-only) — real GPS/network fixes can be
// off by kilometers, but never continents. Catches garbage like manually-typed or
// pasted-in-error coordinates (e.g. a record once had latitude=25, longitude=26 —
// suspiciously round numbers landing in the Egypt/Libya desert) without rejecting a
// slightly-imprecise but genuine reading from somewhere else in the country.
export const NIGERIA_BOUNDS = { minLat: 4, maxLat: 14, minLng: 2.5, maxLng: 15 };

export const isPlausibleNigeriaCoordinate = (lat: number | string | null | undefined, lng: number | string | null | undefined) => {
  const la = Number(lat), lo = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return false;
  return la >= NIGERIA_BOUNDS.minLat && la <= NIGERIA_BOUNDS.maxLat && lo >= NIGERIA_BOUNDS.minLng && lo <= NIGERIA_BOUNDS.maxLng;
};

// Scoped to Kogi Central's 5 LGAs only — this programme doesn't operate in the other
// 16 Kogi State LGAs (Kogi East/West), so they're deliberately excluded here.
export const KOGI_LGAS = ["Adavi", "Ajaokuta", "Ogori/Magongo", "Okehi", "Okene"];

// Wards per LGA, source: INEC Directory of Polling Units (Revised January 2015).
export const KOGI_WARDS_BY_LGA: Record<string, string[]> = {
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
