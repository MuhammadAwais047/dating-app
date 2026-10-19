# Ember 🔥

A swipe-based dating app demo built with **pure vanilla JavaScript** — no frameworks, no build step.

**Live demo:** https://muhammadawais047.github.io/dating-app/

## Features

- **Drag-to-swipe deck** — pointer-driven drag with rotation, like/pass/super-like stamps, and spring-back when released below threshold
- **Three swipe actions** — like (→), pass (←), super like (↑), plus on-screen buttons and keyboard shortcuts
- **Match modal** — opens when you like someone who likes you back, or whenever you super like
- **Matches board** — every match collected with a timestamp ("just now", "2h ago", …)
- **Undo** — restore the last swiped profile and remove any match it created
- **Persistent state** — swipes and matches survive reloads via `localStorage`
- **Fictional profiles** — 12 personas with bios, interests, verification badges and "matches you" flags
- **Reset deck** — start freshly through the profiles without losing your matches
- **Responsive** — desktop, tablet and mobile layouts, with reduced-motion support

## How it works

The deck shows the top three cards stacked with depth (scale/brightness offsets). The top card listens for pointer events, tracks `dx`/`dy`, applies a rotation transform, and fades in the relevant stamp as you pass the threshold. Release beyond 90px horizontally (or 110px up for super) flies the card off-screen and commits the swipe; otherwise it springs back.

Matches render into a grid; clicking a tile opens a photo view. All user-generated content is rendered with `textContent`, so nothing is injected as HTML.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `←` | Pass |
| `→` | Like |
| `↑` | Super like |
| `Backspace` | Undo |
| `Esc` | Close match modal |

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000

## Tech

HTML5 · CSS3 · Vanilla JavaScript (ES2020) · localStorage · Pointer Events

## License

MIT — see [LICENSE](LICENSE).
