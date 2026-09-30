# Parnia Yazdinia — Portfolio

My personal portfolio, with a framed cat gallery, experience timeline, four selected software projects, and contact links.

## Preview

Serve this directory with any static HTTP server, for example:

```sh
python -m http.server 5300
```

Open http://localhost:5300. No build step or package installation is required.

## Deployment

Vercel deploys the repository's `main` branch. The site is plain HTML, CSS, and browser JavaScript modules, served from the repository root. `vercel.json` redirects links to the old Projects and Contact pages to the matching sections of the current site.

## Files

- `index.html`: About, Experience, Projects, and Contact.
- `style.css`, `projects.css`, `portfolio-flow.css`: gallery styling and responsive layouts.
- `portfolio-flow.js`: smooth scrolling, section navigation, and reveal effects.
- `cat-companion.js`, `descent-physics.js`: the optional keyboard- and touch-accessible jumping cat.
- `assets/`: the approved portrait, frames, cats, and project illustrations.
- `assets/vendor/`: Lenis 1.3.26 and its MIT license.

Reduced-motion preferences disable animated scrolling and transitions. The body uses DM Sans and headings use Fraunces, loaded through Google Fonts with system-font fallbacks.

The prior portfolio remains available in Git history.
