# Ahmed Yousef — portfolio

A robotics and AI portfolio styled like a drone's camera HUD.

- **Showreel hero**: a colour-graded reel cut from the project clips (tracking drone, PX4 swarm, YOLOs-CPP, SARSA swarm), with live HUD readouts and the headline "I build robots that see / fly in swarms / land on ships…".
- **Hire, everywhere**: Upwork in the top bar, Upwork and Freelancer in the hero, a big freelance section, the footer and every project page.
- **Project grid**: 22 projects as cards; big cards play their clip, all play on hover. Filter by skill with the chips or keys `1`–`7` (`0` for all). The pointer is a reticle that locks onto cards with a detection label.
- **A page per project**: `project.html?p=<slug>` with a large clip, metrics, mission brief, what was built, stack, gallery with lightbox, links and next/previous (also `←`/`→`).
- **Flight log**: experience as a route with waypoints, plus quick answers for recruiters.
- **Terminal**: press `~` (or the `>_` button) and try `help`, `ls`, `open 3`, `grep slam`, `hire`, `sudo hire ahmed`.

## Files

- `site/index.html`, `site/project.html`: the two pages.
- `site/assets/projects.js`: **every project lives here** (title, skills, metrics, text, media, gallery, links). The grid, filters, terminal and project pages are all generated from it.
- `site/assets/hud.css`, `site/assets/hud.js`: styles and behaviour.
- `site/assets/media/`: clips (`.webm` + `.mp4` + `.jpg` poster per clip) and stills.

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
