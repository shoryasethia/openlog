# OpenLog - Multi-Provider AI Status Dashboard

> Real-time status monitoring for major AI service providers

[![Deploy to GitHub Pages](https://img.shields.io/badge/deploy-github%20pages-blue)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

OpenLog is a static web application that monitors uptime and incident reports from major AI platforms including OpenAI, Claude (Anthropic), Gemini (Google), Groq, Cohere, Perplexity, Mistral AI, and Together AI.

## Features

- **Multi-Provider Tracking** - Monitors 8+ major AI service providers
- **Analytics Dashboard** - Comparative uptime analysis and incident metrics
- **Developer Tools** - REST API documentation and integration examples
- **Real-Time Updates** - Automated hourly data refresh via GitHub Actions
- **Dark Theme** - Modern interface with responsive design
- **Static Deployment** - Serverless architecture hosted on GitHub Pages

## Live Demo

When deployed to GitHub Pages, the application will be available at:
`https://username.github.io/openlog/`

## Architecture

### Static Deployment
OpenLog uses GitHub Actions to periodically fetch RSS feeds from AI provider status pages, parse incidents, and generate static JSON files. The frontend consumes these JSON files, eliminating the need for a backend server or database.

### Components
- **GitHub Actions** - Scheduled workflows for data updates and deployment
- **Python Scripts** - RSS feed parsing and JSON generation
- **React Frontend** - Status dashboard, analytics, and developer documentation
- **Static Data** - JSON files stored in repository

## Installation

### Prerequisites
- Git
- Node.js 16+
- Python 3.8+ (for local development)

### Setup

Clone the repository:
```bash
git clone https://github.com/username/openlog.git
cd openlog
```

Install frontend dependencies:
```bash
cd frontend
npm install
```

## Deployment

### GitHub Pages

1. **Configure Repository**
   
   Update `frontend/vite.config.js`:
   ```javascript
   base: '/repository-name/',
   ```

2. **Enable GitHub Pages**
   
   Repository Settings → Pages → Source: GitHub Actions

3. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy OpenLog"
   git push origin main
   ```

GitHub Actions will automatically:
- Fetch RSS feeds from all providers
- Generate static JSON data files
- Build and deploy the frontend

Site will be available at `https://username.github.io/repository-name/`

### Local Development

Run backend (optional, for development):
```bash
cd backend
python api.py
```

Run frontend:
```bash
cd frontend
npm run dev
```

Access at `http://localhost:5173`

## Project Structure

```
openlog/
├── .github/workflows/    # GitHub Actions workflows
├── backend/              # Development-only Flask API
├── frontend/             # React application
│   ├── public/data/     # Static JSON data files
│   └── src/             # React components
├── scripts/             # Data generation scripts
└── docs/                # Built static site
```

## API Endpoints

The application provides read-only access to status data:

```
GET /data/providers.json    # Provider configurations
GET /data/status.json       # Current status
GET /data/incidents.json    # Recent incidents
GET /data/analytics.json    # Uptime statistics
```

## Monitored Providers

| Provider | Status Page | Data Source |
|----------|-------------|-------------|
| OpenAI | status.openai.com | RSS |
| Anthropic | status.anthropic.com | RSS |
| Google Gemini | status.cloud.google.com | Atom |
| Groq | status.groq.com | RSS |
| Cohere | status.cohere.com | RSS |
| Perplexity | status.perplexity.ai | RSS |
| Mistral AI | status.mistral.ai | RSS |
| Together AI | status.together.ai | RSS |

## Configuration

### Adding Providers

Edit `scripts/fetch_status.py` and add provider configuration:

```python
PROVIDERS = {
    "provider_id": {
        "name": "provider_id",
        "display_name": "Provider Name",
        "status_page": "https://status.provider.com",
        "rss_feed": "https://status.provider.com/history.rss",
        "color": "#hexcolor",
        "description": "Service description",
    }
}
```

### Update Frequency

Modify `.github/workflows/update-status.yml`:

```yaml
schedule:
  - cron: '0 * * * *'  # Hourly (default)
```

## Development

### Building for Production

```bash
cd frontend
npm run build
```

Output will be in `docs/` directory.

### Data Generation

```bash
python scripts/fetch_status.py
```

Generates JSON files in `frontend/public/data/`

## Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Submit a pull request

## License

MIT License - see LICENSE file

## Technical Stack

- **Frontend:** React, Vite, Recharts, Axios
- **Backend (dev only):** Flask, feedparser
- **Deployment:** GitHub Actions, GitHub Pages
- **Data Storage:** Static JSON files

---

Built for the AI developer community to track service reliability across major providers.