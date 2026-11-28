# Diamond Art Library

Artwork for the Diamond Art game is stored in this folder and registered in `public/data/diamond-art/catalog.json`.

## Artwork workflow
1. Create or prepare a square-friendly illustration or photo/cartoon.
2. Save the full-colour source image under `public/assets/images/puzzles/diamond-art/`.
3. Add a catalogue entry with a unique `id`, display `title`, `image` path, `category`, and `published` flag.
4. The player will use the source image to generate a grid for the selected difficulty.

## Catalogue entry example
```json
{
  "id": "augustus-stargazer",
  "title": "Auggie the Stargazer",
  "image": "/assets/images/puzzles/diamond-art/augustus-stargazer.webp",
  "category": "Characters",
  "description": "Auggie beneath a starry sky.",
  "published": true
}
```

## Notes
- Keep original artwork as WebP where practical to reduce download size.
- The catalogue is the source of truth for the public puzzle library.
- `published: false` keeps an item out of the player gallery without deleting its artwork.
- The future Admin Control Center will manage catalogue entries and image files.
