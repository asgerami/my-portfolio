---
title: "Examen CDL"
description: "A Spanish-first, offline Android app for the US commercial driver's license written test: 754 bilingual practice questions, timed exams, read-aloud and diagrams, built from the official manual."
techStack: ["React Native", "Expo", "TypeScript", "Reanimated", "AdMob"]
role: "Solo build"
year: "2026"
---

Examen CDL helps Spanish-speaking drivers in the US prepare for the CDL written test. Every CDL practice app on Google Play is English first; this one opens in Spanish, with English one tap away.

## Key Features

- **754 practice questions** in Spanish and English, covering General Knowledge, Air Brakes, Combination Vehicles and all five endorsements (HazMat, Tanker, Passenger, Doubles/Triples, School Bus)
- **Manual-backed answers** - every question cites the section of the CDL manual it comes from, with an explanation
- **Timed exams** sized like the real test, plus a mistakes deck that keeps missed questions until you get them right twice
- **Read-aloud** in both languages using the phone's own voice engine, so it works with no connection
- **Diagrams** for the visual topics: air brake system, coupling steps, stopping distance, placards and more
- **Daily goal, streaks and reminders** to keep study sessions short and regular

## Technical Highlights

- Expo SDK 57 with Expo Router, fully offline, no backend: progress is stored on the device
- Question banks as validated JSON, with a script that checks structure, sources, translations and answer-length balance so the right answer never gives itself away
- Diagrams generated from a script as SVG in both languages, drawn from the manual's own numbers
- Motion with Reanimated and haptic feedback, in a design language taken from US highway guide signs
- AdMob with Google's consent flow and strict placement rules: no ads on question screens or before a score

[Privacy policy](/examen-cdl/privacy/)
