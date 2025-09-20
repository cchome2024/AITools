# AITools

This repository demonstrates a lightweight analytics pipeline that converts
stored news articles into actionable investment intelligence.  The core
components are written in Python and are intentionally rule-based so that they
can run in constrained environments without model dependencies.

## Features

- **Article analysis:** `backend/analysis.py` ingests stored articles, scores
  them for keyword intensity, sentiment, and social buzz, and extracts ticker
  symbols through pattern matching and optional metadata.
- **Equity impact ranking:** Aggregated scores reveal which equities are most
  affected by recent coverage and assigns an investment suggestion (buy, hold,
  sell, or watch).
- **Service helpers:** `backend/service.py` exposes the top ranked articles and
  tickers as serialised JSON that can back an API endpoint, job, or CLI tool.

## Usage

1. Install dependencies (only the Python standard library is required).
2. Populate `data/articles.json` with the articles you want to analyse.  A small
   illustrative dataset is included.
3. Run the service helper to generate the ranked output:

   ```bash
   python -m backend.service
   ```

   The command prints a JSON payload describing the top 10 articles and tickers
   along with their suggested investment actions.

## Extending the pipeline

- Replace the keyword weights or sentiment lexicon in `ArticleAnalyzer` to tune
  the scoring for your domain.
- Wire `generate_ranked_results` into a web framework (Flask, FastAPI, etc.) to
  serve the JSON payload over HTTP.
- Swap the rule-based sentiment classifier with a machine-learning model for
  higher fidelity scoring.

## Repository structure

```
backend/
  __init__.py
  analysis.py        # Core analysis and ranking pipeline
  service.py         # JSON/CLI service helpers

data/
  articles.json      # Example data set used for testing
```
