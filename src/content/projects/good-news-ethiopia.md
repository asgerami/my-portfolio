---
title: "Good News Ethiopia"
description: "A bot that reads Tikvah Ethiopia's public Telegram channels, uses Gemini to keep only genuinely good news, translates it into English and posts it to its own channel every 30 minutes."
techStack: ["Python", "Gemini", "Telegram", "GitHub Actions"]
githubUrl: "https://github.com/asgerami/good-news-ethiopia"
demoUrl: "https://t.me/good_news_ethiopia"
year: "2026"
role: "Solo build"
---

Good News Ethiopia scrapes Tikvah Ethiopia's public Telegram channels, keeps only the
posts that are genuinely positive news, translates them into English, and posts a summary
with links to the full translation and the original.

## How it works

- **Scrape** recent posts from the public `t.me/s/` preview pages, no login required
- **Pre-filter** obvious ads and sponsor posts before spending an API call on them
- **Classify and translate** in batches with Gemini: is it good news, is it authentic and safe to repost, plus a full English translation and a short summary
- **Publish** the translation to Telegra.ph and post the summary and both links to the channel
- **Track state** in a committed `state.json`, so reruns never repost a story

## Running for free

It runs unattended on GitHub Actions. Scheduled cron on Actions is best-effort and in
practice drifted to hourly with multi-hour gaps, so an external cron service calls the
workflow dispatch API every 30 minutes instead, with the native schedule kept as a backup.
Crashes DM the admin on Telegram rather than failing silently.
