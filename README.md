# Maison Noir

A cinematic luxury real estate website built with pure HTML, CSS, and JavaScript. No frameworks. No dependencies.

## Features

- **Scroll-scrubbed hero** — 240 JPEG frames drawn to canvas on scroll, frame-perfect with zero decode lag (Apple iPhone-style technique)
- **Ultra-minimalist design** — near-black background, champagne gold accents, Cormorant Garamond + Inter typography
- **Animated sections** — IntersectionObserver reveal animations, number count-up, staggered property grid
- **Split contact form** — with dropdown, success state, and animated arrow CTA
- **Gold cursor dot** — smooth lagged cursor follower on desktop
- **Fully responsive** — mobile to widescreen

## Stack

- HTML5 / CSS3 / Vanilla JS (ES5-compatible)
- [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) + [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- Frames extracted with `ffmpeg`

## Local Development

Requires Python 3 for the local server (handles 240 concurrent image requests):

```bash
python serve.py
```

Then open [http://127.0.0.1:3000](http://127.0.0.1:3000)

## Frame Extraction

To re-extract frames from a new hero video:

```bash
ffmpeg -i video/hero.mp4 -vf "fps=24,scale=1280:-2" -q:v 3 frames/%04d.jpg
```

Then update `TOTAL_FRAMES` in `script.js` to match the frame count.

## Deployment

Deployed on [Vercel](https://vercel.com). Any push to `master` triggers an automatic redeploy.
