# API ConsoleX

API ConsoleX is a modern API exploration console built with Preact and Material UI. It lets you browse, test, and manage API endpoint definitions with a polished UI, inspired by tools like Postman. Collections are persisted locally and can be easily deployed to GitHub Pages.

> **New in v2.0.0**
> - Mobile layout refinements with centered main content and consistent spacing.
> - In-app **About** and **Documentation** views (renders `README.md` with parsed Markdown).
> - Smart cURL detection in the **Create API** form to auto-fill method, headers, params, and body.
> - Sidebar deletion controls, footer navigation updates, and enhanced SEO metadata.

## Features

- **Collections management**: Create, edit, enable/disable, and delete API definitions.
- **Request composer**: Configure headers, query params, and multiple body formats (raw, form-data, urlencoded, binary, GraphQL).
- **Snippet generator**: Copy ready-made cURL, Fetch, and Node/Axios samples for the current request.
- **Response viewer**: Inspect status, timing, and body content with JSON prettification.
- **Filtering**: Toggle between all, enabled, and disabled collections in the sidebar.
- **Theme toggle**: Switch between light and dark modes with one click.
- **GitHub Pages ready**: Built assets deploy cleanly to `gh-pages` with the provided scripts.

## Getting Started

### Prerequisites

- Node.js `20.19.x` or newer (Node `24.x` LTS recommended)
- npm `10.x`

### Setup

```bash
npm install
```

### Development server

```bash
npm run dev
```

The app serves at `http://localhost:5173/api-consolex/`. The Vite dev server proxies `/api/` to `http://localhost:3000`; start your backend there or adjust `vite.config.js`.

### Production build

```bash
npm run build
```

Output is written to `dist/`.

### GitHub Pages deployment

Update `homepage` in `package.json` with your GitHub username (already set to `https://mabhisheksingh.github.io/api-consolex/`), then run:

```bash
npm run deploy
```

This script runs `npm run build` and publishes `dist/` to the `gh-pages` branch via `gh-pages`.

## Project Structure

```
api-consolex/
├─ src/
│  ├─ app.jsx            # Main app component and layout
│  ├─ components/        # UI building blocks (Sidebar, MainContent, Header, etc.)
│  ├─ services/          # Data access layer for API collections
│  ├─ utils/             # Helper utilities (body config, persistence)
│  └─ theme.js           # Material UI theme factory
├─ data/apiCollections.json  # Seed data for API definitions
├─ docs/                 # Additional documentation
├─ vite.config.js        # Vite configuration with GitHub Pages base path
└─ package.json          # Scripts and dependencies
```

## Customization Tips

- Update `data/apiCollections.json` to ship with predefined endpoints.
- Extend `RequestSnippetPanel` to add additional languages or client libraries.
- Adjust `src/theme.js` if you need branding tweaks.
- Hook `services/apiCollections.js` into a real backend instead of localStorage.

## License

MIT © Abhishek Singh
