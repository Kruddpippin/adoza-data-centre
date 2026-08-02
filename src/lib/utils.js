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
export const ROLES = ["super_admin", "campaign_admin", "enumerator", "validator", "committee", "field_agent"];

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  campaign_admin: "Admin",
  enumerator: "Enumerator",
  validator: "Validator",
  committee: "Benefits Committee",
  field_agent: "Field Agent",
};

export const ROLE_COLORS = {
  super_admin: "bg-purple-100 text-purple-700",
  campaign_admin: "bg-primary/10 text-primary",
  enumerator: "bg-blue-100 text-blue-700",
  validator: "bg-amber-100 text-amber-700",
  committee: "bg-teal-100 text-teal-700",
  field_agent: "bg-sky-100 text-sky-700",
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
