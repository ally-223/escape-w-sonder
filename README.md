# Escape w/ Sonder

Plan a weekend escape without planning anything. Answer a short personality survey, fill in a few blanks (budget, dates, group size, vibe), and get three trips packed into a mystery bag. Rip it open, pick one, and you get a full itinerary ready to share.

## What you get

- A personality-driven survey that figures out your travel archetype
- Three recommended escapes to destinations across Ontario and Quebec, each with a day-by-day itinerary paced to your energy level
- Real accommodation options with live pricing and booking links (Stay22 API)
- A per-person cost breakdown, including transport from U of T
- Matching with compatible travelers based on personality type, with pending invites
- A shareable trip link so friends can join your escape

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Stay22 Accommodations API

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000/escape.

For live accommodation pricing, copy `.env.local.example` to `.env.local` and add a Stay22 API key. Without one, the app serves built-in accommodation data in the same shape.
