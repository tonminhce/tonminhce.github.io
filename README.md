# Nguyen Ton Minh — Backend Engineer Portfolio

Personal portfolio at **https://tonminhce.github.io/**. Drive a small car through a custom Three.js neighborhood to explore Minh's Java/Go projects, professional experience, and background. The homepage is a miniature driving game with cinematic arrival and departure transitions, collectible data packets, and achievements.

## Explore the neighborhood

Five stops introduce different parts of the portfolio:

| Stop | What is inside |
| --- | --- |
| Java Workshop | Personal distributed commerce project built with Java and Spring Boot |
| Experience HQ | Professional work at VNPT IT and KDDI / Vietlink, including VNPT's AI-Driven Platform |
| Data Garden | Personal rental-data pipeline and price-prediction project |
| Learning Lab | Background, education, and certifications |
| Hello Station | Contact details, social links, and résumé |

Drive to a colored arrival ring and open the stop, or use the map to travel directly to it. Entering and leaving a stop animates the camera and interface. Collect all **12 golden data packets**, discover all **five stops**, and unlock **five achievements** for driving, exploring, and collecting.

| Control | Action |
| --- | --- |
| W / up arrow | Accelerate |
| S / down arrow | Reverse |
| A / D or left / right arrows | Steer |
| Space | Brake |
| E / Enter | Explore a nearby stop |
| R | Respawn at the starting point |
| On-screen arrows | Hold to drive and steer on touch devices |

The interface also provides pause/resume, respawn, map, achievements, and help controls. Discoveries, collected packets, and travel distance are saved in this browser's `localStorage` under `minh-world-v1`; there is no account or cross-device sync.

For a direct read, visit **`/overview/`**. The printable résumé is at **`/resume/`**, with a Print / Save PDF button. These routes are prerendered and their portfolio content is readable without JavaScript. The driving game requires JavaScript and WebGL, and offers a link to the overview if the 3D scene cannot start.

## 3D models and motion

The car, buildings, trees, road furniture, packets, and signs are custom procedural Three.js models built from geometry and canvas-drawn labels. There are **no downloaded or externally hosted 3D models**. The neighborhood uses an orthographic camera, soft shadows, and a warm miniature-world palette.

The scene loads separately from the page, caps device pixel ratio, and suspends driving and rendering while paused or in a background tab. Reduced-motion preferences suppress decorative animation and use immediate transitions. Keyboard controls, touch controls, readable dialogs, and the overview route provide several ways to explore the work.

## Run locally

Node.js 22+ and Yarn Classic 1.22.22:

```sh
npx --yes yarn@1.22.22 install --frozen-lockfile
npm run dev
```

## Build and deploy

```sh
npm run build
```

Next.js exports static HTML, CSS, and JavaScript to `out/`. GitHub Actions deploys that directory to GitHub Pages on pushes to `main`. Pages must use **GitHub Actions** as the source. The repository name `tonminhce.github.io` provides the root domain; the Next.js config intentionally has no subdirectory base path.

## Update content

- `src/data/portfolio.ts`: contact details, professional experience, skills, and certifications shared across the portfolio.
- `src/data/world.ts`: five destinations, packet locations, achievements, and saved-progress validation.
- `src/components/driving-portfolio.tsx`: homepage interface, destination content, dialogs, controls, and progress persistence.
- `src/lib/driving-world.ts`: procedural models, rendering, camera transitions, and world interactions.
- `src/lib/driving-physics.ts`: acceleration, steering, braking, collisions, and travel distance.
- `src/app/world.css`: game interface, responsive layout, and transition styles.
- `src/app/overview/page.tsx`: readable portfolio at `/overview/`.
- `src/components/hero-scene.tsx`: interactive Three.js service lattice on the overview route.
- `src/app/globals.css`: shared, overview, and responsive/print styles.
- `src/app/resume/page.tsx`: résumé at `/resume/`, with Print / Save PDF.

This is a static frontend. The backend architectures and professional systems described in the portfolio do not run inside this website.

## Content and design sources

Experience, education, metrics, and certifications are from the owner-provided résumé. Benchmark figures retain their test context. **AI-Driven Platform is professional work at VNPT Information Technology**, presented under Experience HQ and the professional experience section. Its Go runtime orchestrator, sandboxed execution, checkpoint recovery, and tenant concurrency controls belong to that work.

The commerce overview is simplified from the public [petproject README](https://github.com/tonminhce/petproject). Commerce and [Rental System](https://github.com/tonminhce/rental-system) are personal projects, separate from the VNPT and KDDI / Vietlink experience.

Research references (September 2026):

- [Bruno Simon](https://bruno-simon.com/): an explorable driving portfolio and purposeful Three.js interaction.
- [Brittany Chiang](https://brittanychiang.com/): readable experience and project presentation.
- [Dennis Snellenberg on Awwwards](https://www.awwwards.com/sites/dennis-snellenberg): typography, spacing, and restrained motion.

These informed the direction; this portfolio's layout, driving world, and 3D geometry were implemented for Minh without copying their code or assets. Typography uses Space Grotesk and IBM Plex Mono through Next.js, self-hosted in the build.
