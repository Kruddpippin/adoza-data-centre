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

export const DELIVERY_METHOD_LABELS: Record<string, string> = {
  home_address: "Deliver to home address",
  custom_address: "Deliver to a different address",
  pickup_centre: "Pick up at the empowerment centre",
};

export const KOGI_LGAS = [
  "Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah",
  "Igalamela-Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa-Muro",
  "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala",
  "Yagba East", "Yagba West",
];

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
  "Ankpa": [
    "Ankpa Township", "Ankpa Suburb I", "Ankpa Suburb II", "Ankpa I", "Ankpa II",
    "Enjema I", "Enjema II", "Enjema III", "Enjema IV",
    "Ojoku I", "Ojoku II", "Ojoku III", "Ojoku IV",
  ],
  "Bassa": [
    "Akuba I", "Akuba II", "Ayede/Akakana", "Ozongulo/Kpanche", "Ikende",
    "Gboloko", "Kpata", "Eforo", "Mozum", "Ozugbe",
  ],
  "Dekina": [
    "Dekina Town", "Iyale", "Emewe", "Odu I", "Odu II", "Abocho", "Ogbabede",
    "Adumu Egume", "Ojikpadala", "Anyigba", "Okura Olafia", "Ogane Inigu",
  ],
  "Ibaji": [
    "Odeke", "Ujeh", "Iyano", "Akpanyo", "Unale", "Ojila", "Ejule", "Ayah",
    "Analo", "Onyedega",
  ],
  "Idah": [
    "Igalaogba", "Owoli Apa", "Igecheba", "Ukwaja", "Ogegele", "Ede",
    "Sabon Gari", "Ega", "Ugwoda", "Ichala",
  ],
  "Igalamela-Odolu": [
    "Avrugo", "Ekwuloko", "Odolu", "Oji-Aji", "Akpanya", "Ubele", "Ajaka I",
    "Ajaka II", "Oforachi I", "Oforachi II",
  ],
  "Ijumu": [
    "Aiyegunle", "Aiyetoro I", "Aiyetoro II", "Iyah/Ayeh", "Odokoro",
    "Aiyere/Arimah", "Ogidi", "Ileteju/Origa", "Ogale/Aduge",
    "Egbeda Egga/Okedayo", "Iyara", "Iffe/Ikoyi/Okejumu", "Iyamoye",
    "Ekinrin Ade", "Ibgolayere/Ilaere",
  ],
  "Kabba/Bunu": [
    "Asuta", "Odo-Akete", "Okekoko", "Odolu", "Aiyewa", "Aiyeteju", "Otu",
    "Egbeda", "Okedayo", "Akutupa-Kiri", "Aiyetoro-Kiri", "Iluke",
    "Olle/Oke-Ofin", "Odo-Ape", "Okebukun",
  ],
  "Kogi": [
    "Ukwo-Koton Karfe", "Odaki-Koton Karfe", "Kotonkarfe South East",
    "Girinya", "Irenodu", "Akpasu", "Tawari", "Gegu-Beki North",
    "Gegu-Beki South", "Chikara North", "Chikara South",
  ],
  "Lokoja": [
    "Lokoja - A", "Lokoja - B", "Lokoja - C", "Lokoja - D", "Lokoja - E",
    "Kupa North East", "Kupa South West", "Oworo", "Kakanda", "Eggan",
  ],
  "Mopa-Muro": [
    "Odole - 1", "Odole - 2", "Illeteju - 1", "Illeteju - 2", "Okeagi/Ilai",
    "Orokere", "Takete Idde/Otafun", "Aiyedayo/Aiyedaro", "Agbafogun",
    "Aiyede/Okagi",
  ],
  "Ofu": [
    "Igo", "Aloma", "Ejule Allah", "Itobe/Okokenyi", "Ugwolawo - 1",
    "Ugwolawo - 2", "Aloji", "Ofoke", "Ochadamu", "Ogbonicha", "Iboko/Efakwu",
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
  "Olamaboro": [
    "Imane I", "Imane II", "Ogugu I", "Ogugu II", "Ogugu III",
    "Olamaboro I", "Olamaboro II", "Olamaboro III", "Olamaboro IV", "Olamaboro V",
  ],
  "Omala": [
    "Abejukolo I", "Abejukolo II", "Opoda/Ofejiji", "Bagana", "Okpatala",
    "Akpacha", "Bagaji", "Icheke Ajopachi", "Ogodu", "Oji-Aji", "Olla",
  ],
  "Yagba East": [
    "Ife Olukotun I", "Ife Olukotun II", "Ponyan", "Alu/Igbagun/Oranre",
    "Ejuku", "Jege/Oke/Agi Ogbom/Isao", "Makutu I", "Makutu II", "Itedo",
    "Ilafin/Idofin/Odo - Ogba",
  ],
  "Yagba West": [
    "Ejiba", "Odo Eri Okoto", "Odo Ere Oke Ere", "Isaulu Esa/Okoloke/Okunran",
    "Iyamerin/Igbaruku", "Odo Ara Omi Ogga", "Ogbe", "Oke Egbe I",
    "Oke Egbe II", "Oke Egbe III", "Oke Egbe IV", "Odo Egbe I", "Odo Egbe II",
    "Odo Egbe",
  ],
};
