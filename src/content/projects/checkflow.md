---
title: "CheckFlow"
description: "A facility access and check-in system: QR-coded guest cards, reservations, and live check-in tracking, with an admin dashboard for staff."
techStack: ["Next.js", "TypeScript", "MongoDB", "Mongoose", "BetterAuth", "Tailwind CSS"]
githubUrl: "https://github.com/asgerami/checkflow"
demoUrl: "https://checkflow-alpha.vercel.app/"
featured: true
image: "/images/projects/checkflow.png"
---

CheckFlow manages facility access end-to-end: guest records, reservations, redeemable access cards, and check-in logs, backed by an admin dashboard for staff.

## Key Features

- **Access cards** - unique codes per facility with redemption and usage tracking, plus expiry
- **Guest check-in** - QR scanning for fast check-in, with a manual fallback
- **Reservations** - facility bookings tied to guests and time slots
- **Admin dashboard** - staff views for cards, guests, and check-in activity

## Technical Highlights

- Next.js 14 App Router with TypeScript throughout
- MongoDB/Mongoose across four core schemas (Cards, Guests, Reservations, Checkins)
- BetterAuth email/password authentication with protected routes
- Playwright end-to-end test coverage
