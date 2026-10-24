---
title: "Driftwatch"
description: "A breaking-change radar for the third-party APIs you depend on. It watches vendors' OpenAPI specs, diffs every release, and publishes only the changes that break callers to a free public feed, with JSON, RSS and an MCP server."
techStack: ["TypeScript", "Next.js", "PostgreSQL", "Prisma", "Cloudflare Workers", "MCP"]
demoUrl: "https://driftwatch.et/"
featured: true
order: -1
year: "2026"
role: "Founder"
---

Every OpenAPI diff tool is built for API owners: point it at your own spec, in your own CI,
so you don't break your customers. Driftwatch points the other way. It watches the specs you
depend on (Stripe, OpenAI, Twilio, GitHub, Hetzner and more) and tells you when a vendor
broke you.

```
acquire → normalize → diff → classify → render → publish
```

The pipeline runs end to end and the feed is live at driftwatch.et. Next is a GitHub App
that finds the affected call sites in your repo and opens the fix PR.

## An archive on day one

A spec kept in a public git repo hands over its own history. Driftwatch partially clones
those repos and walks every revision, so the feed launched with nine years of Stripe
changes before it had a single subscriber: 2,741 revisions across four providers.

Spec files move. Twilio's core spec has lived at four different paths, so every revision
carries the path it was written at; without that, every commit before a move fails to read.

## Normalization is where the noise dies

One false BREAKING label and a subscriber is gone for good. Spec generators shuffle key
order, parameter lists and enum values between releases, none of which changes the API.
Specs are parsed, upgraded, bundled, canonicalized and hashed, with set-like arrays sorted,
so a reshuffle never shows up as a change.

## Diffing shared components once

Following `$ref`s inline looked correct until it met real history. Stripe's schemas nest
through shared components, so one enum gaining a value was rediscovered along every path
that reached it: one release produced 4,528 "breaking" changes. Walks now stop at each
`$ref`, and components are diffed once and annotated with how many operations reach them.
The same release yields 6 breaking changes, each a distinct real fact. Roughly a 750x
reduction with no lost signal.

## Breaking for the consumer, not the producer

Three rules invert on the calling end, and they are why anyone subscribes:

- **A response field becoming optional** is safe for the producer and a null dereference for you
- **A response enum gaining a value** breaks exhaustive switches, strict parsers and generated clients
- **A removed request parameter** raises no error at all; your results just quietly change

Severity is a pure lookup in the ruleset, never a model's guess, so the same pair of specs
always gets the same verdict. Anything under 85 confidence never reaches the feed, and
everything else waits behind a human review gate.

## Built to be consumed by agents too

The feed ships as HTML, JSON and RSS, plus a stdio MCP server that reads the same published
JSON a person sees, so an unpublished change can never leak through a side channel.
