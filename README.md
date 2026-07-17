# SIC — Student Innovation Council Website (TGPCET)

A brutalist × cyber-styled static site for the Student Innovation Council.
Pure HTML/CSS/JS + [anime.js v3](https://animejs.com) — no build step, deploys anywhere.

## Structure

```
sic-website/
├── index.html                  # main page (hero, about, projects, idea lab, team, gallery)
├── css/style.css               # all styles + design tokens (colors in :root)
├── js/main.js                  # all animations & interactions
├── projects/
│   ├── poppy-humanoid.html     # Poppy Humanoid project page (animated SVG robot)
│   └── project-2.html          # placeholder — replace with your team's anime.js page
└── assets/                     # put images/photos here
```

## Customize before the event

1. **Team section** (`index.html` → `#team`): replace `MEMBER NAME` / roles, and swap
   the `👤` placeholder with `<img src="assets/name.jpg" alt="Name">` inside `.team-card__photo`.
2. **Gallery** (`#gallery`): replace each `.gallery__ph` div with
   `<img src="assets/photo.jpg" alt="...">`.
3. **Project cards**: swap the emoji placeholder in `.project-card__visual` with a real
   `<img>` of Poppy.
4. **Contact links** (footer): set real email / Instagram / LinkedIn URLs.
5. **Stats counters** (`data-count="..."` in `#about`): set real numbers.
6. **Second project page**: your team drops their finished anime.js page in as
   `projects/project-2.html` (or add more `projects/*.html` and duplicate a project card).

## Adding a new project page

Duplicate a `.project-card` block in `index.html` and point its `href` to the new file in
`projects/`. Each project page is standalone — it only needs `../css/style.css` and the
anime.js CDN script.

## Deploy

**Vercel:** `npx vercel` in this folder, or drag-drop the folder at vercel.com/new
**Netlify:** drag-drop the folder at app.netlify.com/drop

No build settings needed — it's a plain static site.
