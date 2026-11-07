# Ahmed Yousef — portfolio

A robotics and AI portfolio: professional, with a playful robot at its heart. Light by default with a dark-mode switch.

- **The robot is the skills map**: point at a part (camera eyes = vision, lidar = SLAM, arm = control, chest screen = software, circuit pack = embedded, antenna = AI, companion drone = robots and drones) to see the projects that prove that skill; "Show these projects" filters the grid.
- **Hire, everywhere**: Upwork in the top bar, Upwork and Freelancer in the hero, a hire section, the footer and every project page.
- **Project grid**: 22 cards with clips or photos, filterable by skill (`?skill=<id>` links are shareable).
- **A page per project**: `project.html?p=<slug>` with a large clip or photo, metrics, the brief, what I built, stack, gallery with lightbox, related projects and previous/next (`←`/`→`).
- **Showreel, experience and quick answers** for recruiters.
- **Image credits** in `credits.html`; stock photos are openly licensed from Wikimedia Commons.

## Files

- `site/index.html`, `site/project.html`, `site/credits.html`: the pages.
- `site/assets/projects.js`: **every project lives here** (title, skills, metrics, text, media, gallery, links). The grid, filters, terminal and project pages are all generated from it.
- `site/assets/site.css`, `site/assets/site.js`: styles and behaviour.
- `site/assets/media/`: clips (`.webm` + `.mp4` + `.jpg` poster per clip), `photos/` (credited stock photos) and `gallery/` stills.

Preview locally: `python3 -m http.server -d site`, then open http://localhost:8000.

## Add a clip from a GIF

```bash
ffmpeg -i demo.gif -vf "fps=24,scale=800:-2,format=yuv420p" -c:v libx264 -crf 28 -movflags +faststart -an site/assets/media/demo.mp4
ffmpeg -i site/assets/media/demo.mp4 -c:v libvpx-vp9 -b:v 0 -crf 40 -an site/assets/media/demo.webm
ffmpeg -ss 2 -i site/assets/media/demo.mp4 -frames:v 1 -q:v 5 site/assets/media/demo.jpg
```

Then reference it in `projects.js` as `{ type: 'video', src: 'demo' }`.

## Publish

`.github/workflows/pages.yml` publishes `site/` to GitHub Pages on pushes to `main` (Settings → Pages → Source: GitHub Actions). Live at `https://ahmedmsalah99.github.io/Portofolio/`.
