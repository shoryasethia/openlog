# OpenLog - Multi-Provider AI Status Dashboard

> Real-time status monitoring for major AI service providers • Deployable on GitHub Pages

[![Deploy to GitHub Pages](https://img.shields.io/badge/deploy-github%20pages-blue)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

OpenLog tracks **uptime and incidents** for 8 major AI platforms: OpenAI, Claude (Anthropic), Gemini (Google), Groq, Cohere, Perplexity, Mistral AI, and Together AI.

## ✨ Features

- 🎯 **8 AI Providers** tracked simultaneously
- 📊 **Analytics Dashboard** with uptime comparisons
- 👨‍💻 **Developer Tools** with API documentation
- 🌙 **Dark Theme** with modern glass morphism design
- 📱 **Fully Responsive** - works on all devices
- 🚀 **Static Deployment** - no backend required!

## 🌐 Live Demo

**GitHub Pages:** `https://yourusername.github.io/openlog/`

## 🚀 Quick Start

### Option 1: Static GitHub Pages Deployment (Recommended)

#### Prerequisites
- GitHub account
- Git installed

#### Setup

1. **Fork/Clone this repository**
   ```bash
   git clone https://github.com/yourusername/openlog.git
   cd openlog
   ```

2. **Update Vite config**
   
   Edit `frontend/vite.config.js` and change the `base` to your repository name:
   ```javascript
   base: '/your-repo-name/',  // e.g., '/openlog/'
   ```

3. **Enable GitHub Pages**
   - Go to your repository Settings → Pages
   - Source: **GitHub Actions**

4. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

5. **GitHub Actions will automatically:**
   - Fetch RSS feeds from all providers (runs hourly)
   - Generate static JSON data files
   - Build and deploy the frontend

Your site will be live at `https://yourusername.github.io/openlog/` 🎉

### Option 2: Local Development

Run both backend and frontend for full development experience:

#### Prerequisites
- Python 3.8+
- Node.js 16+

#### Installation

1. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

#### Running Locally

1. **Terminal 1 - Backend API**
   ```bash
   cd backend
   python api.py
   ```
   Backend runs on `http://localhost:5000`

2. **Terminal 2 - Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 📂 Project Structure

```
openlog/
├── .github/workflows/
│   ├── update-status.yml  # Hourly RSS feed fetching
│   └── deploy.yml         # GitHub Pages deployment
├── backend/               # Flask API (dev only)
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # StatusPage, AnalyticsPage, DeveloperPage
│   │   ├── components/   # Navbar, etc.
│   │   └── index.css     # Dark theme design system
│   └── vite.config.js    # GitHub Pages config
├── public/data/           # Generated static JSON files
│   ├── providers.json
│   ├── status.json
│   ├── incidents.json
│   └── analytics.json
├── scripts/
│   └── fetch_status.py   # RSS feed parser & JSON generator
└── docs/                  # Built frontend (auto-generated)
```

## 🔧 How It Works

### Static Deployment Architecture

1. **GitHub Actions Workflow** (`.github/workflows/update-status.yml`):
   - Runs every hour (cron: `0 * * * *`)
   - Executes `scripts/fetch_status.py`
   - Commits updated JSON files to `public/data/`

2. **Data Generation** (`scripts/fetch_status.py`):
   - Fetches RSS feeds from all 8 providers
   - Parses incidents and calculates analytics
   - Generates static JSON files

3. **Frontend** (React + Vite):
   - Reads from static `public/data/*.json` files
   - Displays provider status, incidents, and analytics
   - No backend required in production!

### Development vs Production

The frontend automatically detects the environment:

```javascript
// Development: uses Flask backend API
const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : DATA_BASE;

// Production: uses static JSON files
const DATA_BASE = import.meta.env.BASE_URL + 'data';
```

## 📊 Monitored Providers

| Provider | Status Page | Feed Type |
|----------|-------------|-----------|
| OpenAI | status.openai.com | RSS |
| Anthropic (Claude) | status.anthropic.com | RSS |
| Google (Gemini) | status.cloud.google.com | Atom |
| Groq | status.groq.com | RSS |
| Cohere | status.cohere.com | RSS |
| Perplexity | status.perplexity.ai | RSS |
| Mistral AI | status.mistral.ai | RSS |
| Together AI | status.together.ai | RSS |

## ⚙️ Configuration

### Adding New Providers

Edit `scripts/fetch_status.py` and add to the `PROVIDERS` dictionary:

```python
PROVIDERS = {
    "newprovider": {
        "name": "newprovider",
        "display_name": "New AI Provider",
        "status_page": "https://status.newprovider.com",
        "rss_feed": "https://status.newprovider.com/history.rss",
        "logo_url": "https://newprovider.com/favicon.ico",
        "color": "#yourcolor",
        "description": "Provider description",
    },
}
```

### Changing Update Frequency

Edit `.github/workflows/update-status.yml`:

```yaml
schedule:
  - cron: '0 * * * *'  # Every hour
  # - cron: '*/30 * * * *'  # Every 30 minutes
  # - cron: '0 */6 * * *'  # Every 6 hours
```

## 🎨 Customization

### Update Base Path

In `frontend/vite.config.js`:

```javascript
base: '/your-custom-path/',
```

### Customize Theme

Edit `frontend/src/index.css` CSS variables:

```css
:root {
  --accent-primary: #6366f1;  /* Change accent color */
  --bg-primary: #0a0a0f;      /* Change background */
}
```

## 📝 API Endpoints (Development Only)

When running locally with the backend:

```bash
GET /api/providers          # List all providers
GET /api/status             # Current status
GET /api/incidents          # Recent incidents
GET /api/analytics?days=30  # Analytics data
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- Built for the AI developer community
- Thanks to all AI providers for public status pages
- Inspired by the need for centralized monitoring

---

**Deploy once, monitor forever** 🚀

Made with ❤️ for tracking AI service reliability