# Product

## Register

product

## Users

Two distinct user groups on one Kogi State Government platform:
- **Candidates ("youths")**: young residents of Kogi State applying to the SYB (Skill-Up Youth Business) Door-to-Door Candidate Empowerment programme — registering themselves, tracking verification/beneficiary status, submitting bank/delivery details, viewing training info. Often on budget Android phones over patchy mobile data; not all are highly digitally literate.
- **Programme staff**: enumerators, field agents, validators, the benefits committee, and admins — registering candidates in the field, verifying submissions, approving beneficiaries, managing funding/equipment/training and broadcast communications, from both a web dashboard and a mobile app.

## Product Purpose

A civic-service data centre for a state government youth empowerment programme: capture candidate registrations (self-service or field-agent-assisted), run them through a verification → beneficiary-approval → funding/equipment/training pipeline, and keep every party (candidate and staff) informed of status changes. Success looks like: candidates can register and check their status without needing to visit an office; staff can process a high volume of registrations accurately and audit every decision.

## Brand Personality

Trustworthy, official, welcoming. This is a state government programme, not a startup — calm authority over flashy marketing energy, but approachable rather than cold bureaucracy. Forest green + gold (Kogi State's own colors) already carry this identity throughout the existing product UI; new surfaces (like the public landing page) should read as a natural extension of that same UI rather than a separate "marketing site" register — restrained, card-based, no hero-template SaaS clichés.

## Anti-references

- Generic SaaS marketing pages (gradient-text hero, glassmorphism cards, big rounded pill cards in a grid) — this is a government service, not a product launch.
- The NPower reference page that inspired the new landing page's *layout* should not be copied as a *visual style* — no unrelated third-party branding, imagery, or copy; Adoza's own established green/gold identity and component library carry it instead.

## Design Principles

- Extend the existing design system, don't fork it — reuse the same tokens (`--primary`/`--accent` HSL vars), the same `Card`/`Button`/`Field` primitives, and the same `font-display` (Bricolage Grotesque) + body (Plus Jakarta Sans) pairing already used across the dashboard and candidate portal.
- Calm authority over hype — an official government tone, not a startup pitch.
- Fast on a budget phone — lightweight assets, minimal JS, CSS-only motion (the existing `fade-up`/`fade-in`/`scale-in` keyframes), no heavy animation libraries, no large hero imagery.
- Every public-facing page has one unambiguous next step (Apply / Check Status), never a wall of competing CTAs.

## Accessibility & Inclusion

WCAG AA minimum (already the practice in the existing app: focus-visible rings, semantic form labels). Additional consideration: candidates may be on low-end Android devices with slow/limited mobile data, so public pages must prioritize fast paint and small payloads over rich animation or imagery, and copy should stay in plain, direct language (not all candidates are highly digitally literate).
