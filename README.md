# Bethany Does Things

The official website and interactive puzzle playground for Bethany Does Things.

## Repository layout

The website is served from `public/` by the Cloudflare Worker configured in `wrangler.jsonc`.

```text
public/
├── index.html
├── admin/                 # Private administration interface (protected at the edge)
├── assets/
│   ├── audio/             # Optional sound effects; load only after user interaction
│   ├── fonts/
│   ├── icons/
│   └── images/
│       ├── brand/
│       ├── bethany/
│       ├── dogs/ (auggie/, rucca/)
│       ├── puzzles/ (train-track/, murdoku/, mini-jigsaws/, diamond-art/, crime-puzzle-books/)
│       ├── galleries/
│       ├── events/
│       └── blog/
├── css/ (base/, components/, pages/, games/train-track/)
└── js/ (core/, components/, pages/, games/train-track/, admin/)

docs/                      # Architecture, design decisions and operating notes
```

## Puzzle categories

1. Train Track
2. Murdoku
3. Mini Jigsaws
4. Diamond Art
5. Crime Puzzle Books

## Technical approach

- HTML, CSS, vanilla JavaScript and SVG wherever practical.
- Cloudflare Workers serves the static site from `public/`.
- Mobile-first, accessible and performance-conscious.
- Progressive enhancement: essential content first; optional effects load later.
- Keep each puzzle modular so its rules, board, rendering and validation can be tested independently.
- Use lowercase, hyphen-separated file and folder names.
- Optimize photographs as WebP or AVIF; use responsive dimensions and lazy loading.
- Do not autoplay audio or video. Audio must be initiated by the visitor.
- Never put secrets, passwords, private keys or privileged API tokens in public files.

## Development sequence

1. Establish the shared site foundations and design tokens.
2. Build Train Track as the first standalone playable puzzle.
3. Test puzzle generation, clue accuracy, route connectivity and solution uniqueness.
4. Integrate the game into the Puzzle Room.
5. Reuse the architecture for the remaining puzzle categories.
6. Add protected administration and dynamic content only when needed.

## Hosting and cost principles

Keep the initial project on Cloudflare's free offerings where practical. Before enabling databases, object storage, email services or other paid features, check current limits and pricing. The public website must remain useful if optional services are unavailable.
