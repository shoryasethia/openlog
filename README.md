# openlog: OpenAI Status Tracker

Monitors [status.openai.com](https://status.openai.com/) for incidents using RSS feed with HTTP conditional requests (ETag/Last-Modified). Efficient and scalable.

## Setup

```
pip install feedparser
```

## Run

```
python status-tracker.py
```

## Output

```
[2025-12-17 04:12:31] Incident: Codex & Responses API Experiencing Elevated Errors
Status: Resolved
Message: All impacted services have now fully recovered.
Affected Products: Responses, Codex
```

## Config

Edit `config.py` to change feed URL or check interval.