# Ahmed Yousef — portfolio

A one-page live CV: experience, drone and robotics projects, skills, freelance work and answers for recruiters.

- The site is static HTML, CSS and JS in `site/` (no build step). Open `site/index.html` through any local server, e.g. `python3 -m http.server -d site`.
- It is built with the taste-skill kit (`.claude/skills/design-taste-frontend`); only the parts the page uses are copied into `site/assets/`.
- `.github/workflows/pages.yml` publishes `site/` to GitHub Pages on every push to `main` that touches it.

## Publish on GitHub Pages

1. Merge this branch into `main`.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow runs on the next push to `main` (or run it by hand from the Actions tab). The site goes live at `https://ahmedmsalah99.github.io/Portofolio/`.

## Add GIFs or videos of your projects

Put the files in `site/assets/media/` and replace the matching project panel in `site/index.html` with an `<img src="assets/media/<file>.gif" alt="...">` (or a muted, looping `<video>`).
