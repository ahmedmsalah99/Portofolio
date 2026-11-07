# Ahmed Yousef — portfolio

A one-page live CV that proves each skill with projects instead of listing it.

- **Skill switchboard** (hero): seven skills. Hover or focus one to see its proof on the stage (a demo clip, a figure or a terminal run); click one, or press keys `1`–`7`, to filter the project index. `0` or `Esc` shows everything again.
- **Project index**: all 22 projects in one list. Matching rows stay lit and the rest dim; on a desktop the row under the mouse previews its clip next to the pointer.
- **Shareable filters**: `#skill=robots`, `#skill=control`, `#skill=slam`, `#skill=vision`, `#skill=ai`, `#skill=embedded`, `#skill=software` open the page already filtered.
- **Experience and quick answers**: roles, start date, work permit, location, languages, education.

The site is static HTML, CSS and JS in `site/` with no build step. Preview it with any local server, e.g. `python3 -m http.server -d site`.

It is built on the taste-skill kit (`.claude/skills/design-taste-frontend`); only the parts the page uses are copied into `site/assets/`. Page-specific code is in `site/assets/portfolio.css` and `site/assets/portfolio.js`.

## Publish on GitHub Pages

1. Merge into `main`.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. `.github/workflows/pages.yml` publishes `site/` on every push to `main` that touches it. The site goes live at `https://ahmedmsalah99.github.io/Portofolio/`.

## Edit projects and media

- A project is one `<li>` in `site/index.html` under `data-index`: `data-skills` lists its skills (space-separated ids), `data-media="<name>"` points to `site/assets/media/<name>.webm`/`.mp4`/`.jpg` (or `data-media-kind="img"` for a still), and `data-figure` is the number shown when there is no clip. The skill counts update by themselves.
- To add a clip from a GIF:

```bash
ffmpeg -i demo.gif -vf "fps=24,scale=800:-2,format=yuv420p" -c:v libx264 -crf 28 -movflags +faststart -an site/assets/media/demo.mp4
ffmpeg -i site/assets/media/demo.mp4 -c:v libvpx-vp9 -b:v 0 -crf 40 -an site/assets/media/demo.webm
ffmpeg -ss 2 -i site/assets/media/demo.mp4 -frames:v 1 -q:v 4 site/assets/media/demo.jpg
```
