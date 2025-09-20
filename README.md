# AITools

## Market News Frontend

The `frontend/` directory contains a Vite + React single-page application that visualizes
intraday market headlines, impacted tickers, recommended actions, and supporting metadata.
It consumes a JSON endpoint exposed by your analytics backend (defaulting to `/api/news`).

### Key capabilities

- **Top 10 headline stream** with pagination to quickly review items five at a time.
- **Impacted tickers** rendered as chips for rapid symbol scanning.
- **Recommended actions** highlighted alongside each story for fast decision making.
- **Supporting metadata** such as publication time, source, and sentiment badges.
- **Manual refresh** control for intraday updates and responsive layout for desktop and
  mobile breakpoints.

### Running the frontend locally

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. (Optional) Point the UI at your backend endpoint by setting `VITE_NEWS_API_URL` in a
   `.env` file or your shell environment. Without a reachable backend the app falls back
   to bundled sample data.
3. Start the development server (defaults to [http://localhost:5173](http://localhost:5173)):
   ```bash
   npm run dev
   ```
   Requests to `/api/*` are proxied to `http://localhost:8000` during development. Adjust
   `vite.config.js` if your backend uses a different origin.
4. Create a production build when ready to deploy:
   ```bash
   npm run build
   ```
5. Preview the production build locally:
   ```bash
   npm run preview
   ```

### Expected backend response shape

The dashboard expects the backend endpoint to return either an array or an object with an
`items`/`data`/`results` field. Each item should resemble:

```json
{
  "id": "unique-id",
  "headline": "Short headline text",
  "summary": "Optional summary or bullet points",
  "tickers": ["SPY", "QQQ"],
  "actions": ["Monitor levels", "Share client update"],
  "sentiment": "Positive",
  "source": "Newswire name",
  "publishedAt": "2024-02-12T13:45:00Z",
  "url": "https://source-link"
}
```

Missing fields are gracefully handled and display sensible defaults. The UI always shows
up to the top ten items returned by the API.
