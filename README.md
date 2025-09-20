# AITools

## News ingestion backend

This repository includes a lightweight backend module that ingests U.S. market
news and stores it locally for same-day reuse. The feature lives in
`backend/news_ingestion.py`.

### Setup

1. Create and activate a Python 3.11+ virtual environment.
2. Install the project dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Configure your API credentials:

   - Copy `.env.example` to `.env`.
   - Replace `your_newsapi_key_here` with a valid [NewsAPI](https://newsapi.org/)
     or compatible provider key in the new `.env` file.
   - Alternatively, export the key directly before running the ingestor:

     ```bash
     export NEWSAPI_API_KEY="sk_your_key"
     ```

### Usage

Run the ingestion script to fetch, normalize, and store the latest
U.S. market articles:

```bash
python -m backend.news_ingestion
```

On success, the script caches articles for the current day in
`data/news_cache.db`. Subsequent calls will only add new articles and discard
items older than today. Use `NewsIngestionService.get_articles_for_day()` to
load cached content within your own application code.

> **Note**
> The ingestion will raise a clear error if the API key is missing or invalid.
