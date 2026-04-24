# Design Framework

A web configurator for [Framework](https://frame.work) laptops. Pick a model, a back-panel finish, and a color for every expansion card slot — then see exactly what the combo will look like before you order.

**Live:** https://designframe.work

Built because I was ordering a Framework and couldn't commit to an expansion card colorway. Now I still can't, but at least I can see my indecision rendered in full color.

## Features

- **Four models** – Framework Laptop 12, 13, 13 Pro, and 16.
- **Per-slot expansion card selection** – pick a different finish for each expansion slot, or bulk-select one color for every slot.
- **Back-panel finishes** – each model ships with its real back-panel lineup (Silver, Black, Graphite, Sage, Lavender, Bubblegum, etc.).
- **Live preview** – cards render as SVG overlays on the actual product photo, with per-slot rotation and scale, so what you see is what you get.
- **Randomize** – one click shuffles the whole config, never repeats a color across slots, and never matches a card to the chassis color (so nothing disappears).
- **Theme toggle** – System / Light / Dark, persisted via [`next-themes`](https://github.com/pacocoursey/next-themes).
- **Fully prerendered** – every route is static HTML, served from Cloudflare Pages.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (Vite + React 19) with file-based routing via [TanStack Router](https://tanstack.com/router).
- [HeroUI v3](https://heroui.com) components (built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/)), wired up to the router via `RouterProvider` so every HeroUI `Link` / `Menu` item routes client-side.
- [Tailwind CSS v4](https://tailwindcss.com) with HeroUI's design tokens.
- [`next-themes`](https://github.com/pacocoursey/next-themes) for theming.
- [Bun](https://bun.sh) as the package manager.
- [Cloudflare Pages](https://pages.cloudflare.com) for hosting (static prerender).

## Getting started

```bash
bun install
bun dev
```

Dev server runs at http://localhost:3000.

### Build

```bash
bun run build
```

Output lands in:

- `dist/client/` – prerendered HTML + hashed client assets (this is what Cloudflare Pages serves).
- `dist/server/` – the SSR bundle (not deployed, just used during prerender).

### Test

```bash
bun run test
```

## Project layout

```
src/
  routes/                    # TanStack Router file-based routes
    __root.tsx               # RouterProvider + ThemeProvider wrap
    index.tsx                # Home page (laptop picker)
    $laptop.tsx              # Per-laptop configurator page
  components/
    app-header.tsx           # Top nav + theme toggle
    theme-toggle.tsx         # System/Light/Dark dropdown
    framework/
      product-viewer.tsx     # SVG compositor: laptop photo + expansion cards
      configuration-panel.tsx # Back + per-slot color pickers, Randomize
      option-card.tsx
      section-header.tsx
  data/
    laptops.ts               # Laptop type + getLaptopById
    laptop-models.ts         # LAPTOP_MODELS list used by nav + home
    laptops/
      laptop-12.json         # Per-model: image crop, card slots, backs
      laptop-13.json
      laptop-13-pro.json
      laptop-16.json
    expansion-cards.ts       # ExpansionCard type + catalogue
    expansion-cards.json     # Expansion card catalogue (colors + photos)
public/
  images/
    laptop-12/backs/*.png    # Back-panel photos per finish
    laptop-13/backs/*.png
    laptop-13-pro/*.png
    laptop-16/backs/*.png
    expansion-cards/*.png    # Card finish photos
```

## Adding a new laptop, back finish, or expansion card

Everything is data-driven. No component changes needed for normal content updates.

### Add a new expansion card color

1. Drop a `<color>.png` into `public/images/expansion-cards/`. Target dimensions are `2112 × 2580` with the card roughly centered (see existing cards for framing).
2. Append an entry to `src/data/expansion-cards.json`:
   ```jsonc
   {
     "id": "plastic-newcolor",
     "label": "New Color",
     "color": "#hexswatch",
     "outline": "#hexswatch",
     "image": {
       "src": "/images/expansion-cards/newcolor.png",
       "width": 2112,
       "height": 2580
     },
     "imageCrop": { "x": 580, "y": 802, "width": 948, "height": 1008 }
   }
   ```
3. It'll automatically show up for every laptop, since the catalogue is shared.

### Add a new back finish to an existing laptop

Edit that laptop's JSON (`src/data/laptops/laptop-13.json`, etc.) and append to `backs`:

```jsonc
{
  "id": "graphite",
  "label": "Graphite",
  "shell": "#2a2a2c",          // fallback swatch if photo fails to load
  "accent": "#1a1a1c",
  "defaultExpansionCardId": "plastic-graphite",
  "image": {
    "src": "/images/laptop-13/backs/graphite.png",
    "width": 1290,
    "height": 1290
  },
  "view": { "x": 0, "y": 153, "width": 1290, "height": 968 }
}
```

`view` is the sub-rectangle (in image pixels) that tightly frames the laptop body — it drives the SVG viewBox. If the photo already has the laptop edge-to-edge, you can widen the view past the image bounds (negative `x` / `y`) to add virtual padding so it renders at a similar size to the other models.

### Add a whole new laptop model

1. Create `src/data/laptops/laptop-new.json` following the same shape as `laptop-13.json` (see the JSDoc on the types in `src/data/laptops.ts` — `expansionCardSize`, `expansionCardSlots` with `position` + `scale`, and `backs`).
2. Register it in `src/data/laptops.ts`:
   ```ts
   import laptopNew from "./laptops/laptop-new.json";
   // ...
   export type LaptopId = "laptop-12" | "laptop-13" | "laptop-13-pro" | "laptop-16" | "laptop-new";
   export const LAPTOPS = [laptop12, laptop13, laptop13Pro, laptop16, laptopNew] as const;
   ```
3. Add it to `LAPTOP_MODELS` in `src/data/laptop-models.ts` so the nav + home grid pick it up.

The `$laptop.tsx` route handles any id that resolves from `getLaptopById`, so no routing changes are needed.

## Deploying

Deployed as a static site on Cloudflare Pages.

- **Build command:** `bun run build`
- **Build output directory:** `dist/client`

That's the only setting that matters — the prerender produces real HTML for `/`, `/laptop-12`, `/laptop-13`, `/laptop-13-pro`, `/laptop-16`, so no Pages Function is needed.

## Contributing

Issues and PRs welcome — especially:

- New expansion card finishes (Framework drops colorways faster than I can ship them).
- Better back-panel photos (some finishes are awkwardly cropped).
- Slot-position refinements on any model where the cards don't quite line up with the chassis cutouts.

## Credits

Product photos are Framework's own, used for preview purposes. All trademarks belong to their respective owners. This project is not affiliated with or endorsed by Framework Computer Inc.

Built by [@daveycodez](https://x.com/daveycodez).

## License

MIT. See [LICENSE](./LICENSE).
