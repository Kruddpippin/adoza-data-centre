// Fixed, explicit icon set for Tech Hub courses (matched by name against the `icon`
// column seeded on each course). Deliberately not `import * as Icons from "lucide-react"`
// with dynamic lookup — that pulls the entire icon set into this chunk instead of just
// the ones actually used, which matters on the budget-Android devices this app targets.
import {
  Monitor, FileSpreadsheet, Database, Search, Palette, Megaphone, Share2, Code, Wifi,
  Briefcase, Laptop, PiggyBank, Sparkles, GraduationCap,
} from "lucide-react";

const TECH_HUB_ICONS = {
  Monitor, FileSpreadsheet, Database, Search, Palette, Megaphone, Share2, Code, Wifi,
  Briefcase, Laptop, PiggyBank, Sparkles,
};

export const techHubIcon = (name) => TECH_HUB_ICONS[name] || GraduationCap;
