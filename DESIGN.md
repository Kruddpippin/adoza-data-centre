---
name: ADOZA Data Centre
description: Kogi State Government SYB Door-to-Door Candidate Empowerment programme platform
colors:
  forest-primary: "#145d3b"
  forest-primary-foreground: "#ffffff"
  sage-secondary: "#ecf4f0"
  sage-secondary-foreground: "#0e432b"
  kogi-gold-accent: "#dfa30c"
  kogi-gold-accent-foreground: "#2e2205"
  paper-background: "#fdfdfc"
  card-surface: "#ffffff"
  ink-foreground: "#111714"
  mist-muted: "#f4f6f5"
  mist-muted-foreground: "#556860"
  signal-destructive: "#e11414"
  hairline-border: "#e2e9e6"
  input-border: "#dce5e0"
  focus-ring: "#145d3b"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "16px"
  pill: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.forest-primary}"
    textColor: "{colors.forest-primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.forest-primary}"
  button-accent:
    backgroundColor: "{colors.kogi-gold-accent}"
    textColor: "{colors.kogi-gold-accent-foreground}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  button-outline:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.ink-foreground}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  card-default:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.ink-foreground}"
    rounded: "{rounded.xl}"
  input-default:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.ink-foreground}"
    rounded: "{rounded.lg}"
---

# Design System: ADOZA Data Centre

## 1. Overview

**Creative North Star: "The Trusted Registry"**

ADOZA Data Centre is the digital front door of a Kogi State Government youth empowerment programme (SYB Door-to-Door Candidate Empowerment) — a civic-service registry, not a startup product. Every surface, from the staff dashboard to the candidate's own status page, carries the same forest-green-and-gold identity drawn straight from Kogi State's own colors. The system reads as calm official authority: a form you trust to hand your National ID number to, not a landing page trying to sell you something. Density stays moderate — generous card padding, clear section headers, no compressed data-table starkness — because a meaningful share of candidates are checking this on a budget Android phone, sometimes reading a second language.

This system explicitly rejects generic SaaS marketing tropes (gradient-text heroes, glassmorphism, big rounded pill-card grids, hero-metric templates) and third-party visual borrowing — even when a reference layout (e.g. a federal programme's public page) inspires a *structure*, the *skin* stays entirely Adoza's own tokens and components. One register, one visual language, whether the page is a staff data table or a public registration notice.

**Key Characteristics:**
- Forest green as the one committed brand color; gold as a rare, deliberate accent (badges, highlights, the accent button variant) — never both at full saturation on the same element.
- Warm near-white paper background (#fdfdfc), not stark white, not cream-drenched — subtle enough to read as neutral, not styled.
- Bricolage Grotesque for anything that needs authority (page titles, stat values, hero type); Plus Jakarta Sans for everything functional (body copy, labels, form fields, table cells).
- Soft, moderate radii (8–16px) everywhere; pill shape reserved for badges and status pills only.
- Motion is a light touch: a 500ms fade-up on page-load content, nothing choreographed, nothing that costs a slow connection real time. Easing is `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint, no overshoot) — calm authority reads as decisive deceleration, not a playful bounce.

## 2. Colors

A single committed brand color (forest green) carries authority; gold is used sparingly as the one accent; everything else is a tight neutral ramp built around a barely-warm paper background.

### Primary
- **Forest Primary** (#145d3b): The one brand color. Primary buttons, active nav state, focus rings, links, icons that need to read as "the system," the candidate/staff avatar chip background. Used deliberately, not painted across every surface — most of any given screen stays neutral so the green reads as signal, not wallpaper.

### Secondary
- **Sage Secondary** (#ecf4f0): A pale tint of the primary, used for secondary button fills and the rare soft-background badge that needs to feel "on-brand" without competing with the primary CTA.

### Tertiary
- **Kogi Gold Accent** (#dfa30c): The second half of Kogi State's own palette. Reserved for the `accent` button variant (the single highest-stakes action on a page — "Approve as beneficiary," "Apply Now" on the public landing page) and status badges ("Beneficiary," warning states). Its rarity is what makes it read as important when it appears.

### Neutral
- **Paper Background** (#fdfdfc): Page background. Barely-warm off-white — read the hue, don't chase it; if it starts looking cream or parchment, pull it back toward this exact value.
- **Card Surface** (#ffffff): True white, for every Card, Modal, and input surface sitting on the paper background — the one-step lift is what separates "container" from "page."
- **Ink Foreground** (#111714): Body text, headings. A near-black with a whisper of green in it, never pure `#000`.
- **Mist Muted** (#f4f6f5) / **Mist Muted Foreground** (#556860): Muted backgrounds (empty states, subtle section fills) and secondary/caption text respectively. Foreground tuned to ~5.6:1 on paper-background — don't lighten past this without re-checking contrast; the original #657b72 measured ~4.46:1, just under the 4.5:1 AA floor for normal text.
- **Hairline Border** (#e2e9e6): Card borders, table dividers, the one place structure is drawn with a line instead of a shadow.
- **Signal Destructive** (#e11414): Reject/revoke/delete actions and error text only. Tuned so white destructive-foreground text holds ~4.9:1 (destructive buttons are font-medium, not bold, so the 3:1 large-text exemption doesn't apply) — the original #ed2c2c only reached ~4.2:1.

### Named Rules
**The One Accent Rule.** Gold never fills more than one element per screen at full saturation. If a page already has a gold badge, its buttons stay green or neutral — gold does not repeat within the same view.

## 3. Typography

**Display Font:** Bricolage Grotesque (with Plus Jakarta Sans, system-ui fallback)
**Body Font:** Plus Jakarta Sans (with system-ui, -apple-system fallback)

**Character:** A grotesque-on-humanist-sans pairing — Bricolage Grotesque's slightly quirky, confident letterforms give page titles and stat numbers authority without feeling corporate-cold, while Plus Jakarta Sans keeps every functional surface (forms, tables, labels) plain, legible, and unremarkable on purpose.

### Hierarchy
- **Display** (700, `clamp(1.5rem, 3vw, 2.5rem)`, 1.1 line-height, -0.02em tracking): Page titles (`h1` on every dashboard/detail page), the public landing page's hero headline (scaled up further there, never past a 6xl equivalent), and `.stat-value` numbers (dashboard stat cards, eligibility score) with tabular figures.
- **Title** (600, 0.875–1rem): `CardTitle` — one per card, sets the section's subject.
- **Body** (400, 0.875rem, 1.5 line-height): Default text everywhere — form values, table cells, paragraph copy. Cap prose blocks (registration invitation copy, notes) at ~65–75ch even though most containers here are narrower than that already.
- **Label** (500, 0.6875rem, 0.02em tracking, uppercase): Field labels, table headers, badges, the muted "uppercase tracking-wider" microcopy above stat values.

### Named Rules
**The Two-Font Ceiling Rule.** Exactly two families, ever: Bricolage Grotesque for display, Plus Jakarta Sans for everything else. A third "just for this hero" font is never introduced, including on the public landing page.

## 4. Elevation

Flat by default. The system separates surfaces with a 1px hairline border (#e2e9e6) and a one-step background lift (card surface #ffffff on paper background #fdfdfc), not shadows. Shadows exist only as a hover response — `card-lift` translates a card up 2px and introduces a soft, green-tinted shadow (`0 12px 32px -6px hsl(152 65% 22% / 0.14), 0 4px 10px -2px rgb(0 0 0 / 0.05)`) — never as a resting-state decoration. Never pair a visible border with a wide resting shadow on the same element; that combination doesn't occur anywhere in this system and shouldn't be introduced.

### Shadow Vocabulary
- **Card hover lift** (`0 12px 32px -6px hsl(152 65% 22% / 0.14), 0 4px 10px -2px rgb(0 0 0 / 0.05)`): Applied via `.card-lift:hover` on interactive/clickable cards (stat cards, list rows presented as cards) — never on static informational cards.
- **Modal surface** (`shadow-xl` utility): The one place a resting shadow is intentional, because a modal must read as detached from the page underneath it.

### Named Rules
**The Flat-By-Default Rule.** A card at rest has a border, not a shadow. If a card needs to look "important," reach for the gold accent or a tinted background (e.g. `bg-primary/[0.03]` on the workflow-actions card), not elevation.

## 5. Components

### Buttons
- **Shape:** 8px radius (`rounded-lg`), consistent across every variant and size.
- **Primary** (`bg-primary text-primary-foreground`): The default action on any form or workflow card. Padding scales with size token (`h-10 px-4` default, `h-8 px-3` sm, `h-11 px-6` lg).
- **Accent** (`bg-accent text-accent-foreground`): The single highest-stakes affirmative action per screen — "Approve as beneficiary," a public landing page's "Apply Now." Never more than one accent button visible at once.
- **Outline** (`border border-input bg-card`): Secondary actions — Cancel, Edit, Sign out (non-destructive).
- **Destructive** (`bg-destructive text-destructive-foreground`): Reject, revoke, delete only.
- **Ghost**: Icon-only utility actions (remove-row trash icon) with no visible resting boundary.
- **Hover / Focus:** Background darkens ~10% on hover (`/90` opacity trick); every interactive element gets a 2px `ring` in the focus color (#145d3b) offset 2px on `:focus-visible`, never on plain `:focus`. Active press scales to 0.975 — a tactile, not bouncy, response.

### Cards / Containers
- **Corner style:** 12–16px (`rounded-xl`).
- **Background:** Card surface (#ffffff) on paper background (#fdfdfc) — the lift is the only depth cue at rest.
- **Shadow strategy:** None at rest; see Elevation.
- **Border:** 1px hairline (#e2e9e6), always present.
- **Internal padding:** Header `p-5 pb-2`, content `p-5 pt-2` — generous, never cramped, even in dense staff tables (which use a separate `Table`/`Th`/`Td` primitive, not cards).

### Inputs / Fields
- **Style:** 1px input-border (#dce5e0) stroke, card-surface background, 8px radius, `h-10` height (matches button height for alignment in inline layouts).
- **Focus:** 2px ring in the focus color, no border-color change — the ring is the entire focus signal.
- **Label:** Always a `Field` wrapper — uppercase-adjacent small muted label above, required marker in destructive red, error text below in destructive red at 11px.

### Badges
- **Style:** Pill shape (`rounded-full`), 11px label text, soft-tint background + matching dark-tint text (e.g. verified = emerald tint, beneficiary = gold/accent tint, pending = amber tint) — never a solid saturated fill.

### Navigation
- **Staff sidebar/header:** Fixed-width sidebar (240px desktop, drawer on mobile) with the ADOZA wordmark + Kogi crest at top (now a home-link back to `/dashboard`); nav items get a soft primary-tint background + primary text when active, muted text otherwise, no underline.
- **Public landing page nav:** A single top bar (logo + org name left, HOME/APPLY text links + a pill-shaped "Check Status" primary button right) — the underline-on-active-link treatment from the sidebar's spirit, adapted to a horizontal bar. Same green, same font-display wordmark, no separate "marketing nav" component invented.

## 6. Do's and Don'ts

### Do:
- **Do** keep the public landing page in the same component vocabulary as the dashboard — `Card`, `Button`, the existing color tokens — per PRODUCT.md's explicit choice to treat it as an extension of the product UI, not a separate marketing register.
- **Do** use gold (#dfa30c) exactly once per screen, on the single most important affirmative action or status badge.
- **Do** keep motion to the existing `fade-up`/`fade-in`/`scale-in` CSS keyframes (500/300/300ms) — no new animation library, no scroll-driven choreography, per PRODUCT.md's low-end-device accessibility note.
- **Do** cap body copy width and use `text-wrap: balance` on headings (already global via `h1, h2, h3 { text-wrap: balance; }`).

### Don't:
- **Don't** introduce SaaS marketing clichés on the landing page — no gradient-text hero, no gradient section backgrounds (the auth pages and landing hero once carried a `primary → background → accent` wash; replaced with a flat `bg-primary/[0.04]` tint), no glassmorphism cards, no hero-metric template, no identical-card grid — per PRODUCT.md's anti-references.
- **Don't** use a bounce/elastic/overshoot easing curve (a `cubic-bezier` with a value past 1 or below 0) — motion decelerates smoothly to a stop, per the Motion note in §1.
- **Don't** copy any third-party programme's visual identity (imagery, wordmark, color) even when its page *layout* is the reference; the skin is always Adoza's own tokens.
- **Don't** pair a visible 1px border with a wide (≥16px blur) resting box-shadow on the same card or button.
- **Don't** exceed 16px corner radius on any card, section, or input. Full-pill radius is reserved for badges, status pills, and the "Check Status" nav button only.
- **Don't** add a third font family anywhere, including a "just for the hero" display font on the public page.
