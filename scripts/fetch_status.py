"""
Static data generator for GitHub Pages deployment.
Fetches RSS feeds from all AI providers and generates static JSON files.
"""

import feedparser
import json
import re
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict

# Provider configurations
PROVIDERS = {
    "openai": {
        "name": "openai",
        "display_name": "OpenAI",
        "status_page": "https://status.openai.com",
        "rss_feed": "https://status.openai.com/history.rss",
        "logo_url": "https://openai.com/favicon.ico",
        "color": "#10a37f",
        "description": "ChatGPT, GPT-4, DALL-E, Whisper",
    },
    "anthropic": {
        "name": "anthropic",
        "display_name": "Anthropic (Claude)",
        "status_page": "https://status.anthropic.com",
        "rss_feed": "https://status.anthropic.com/history.rss",
        "logo_url": "https://www.anthropic.com/favicon.ico",
        "color": "#d4a27f",
        "description": "Claude AI Assistant",
    },
    "google": {
        "name": "google",
        "display_name": "Google (Gemini)",
        "status_page": "https://status.cloud.google.com/products/ai-platform/gemini-api",
        "rss_feed": "https://status.cloud.google.com/feed.atom",
        "logo_url": "https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg",
        "color": "#4285f4",
        "description": "Gemini AI, Google AI Studio",
    },
    "groq": {
        "name": "groq",
        "display_name": "Groq",
        "status_page": "https://status.groq.com",
        "rss_feed": "https://status.groq.com/history.rss",
        "logo_url": "https://groq.com/favicon.ico",
        "color": "#f55036",
        "description": "Ultra-fast AI Inference",
    },
    "cohere": {
        "name": "cohere",
        "display_name": "Cohere",
        "status_page": "https://status.cohere.com",
        "rss_feed": "https://status.cohere.com/history.rss",
        "logo_url": "https://cohere.com/favicon.ico",
        "color": "#39594d",
        "description": "Enterprise AI Platform",
    },
    "perplexity": {
        "name": "perplexity",
        "display_name": "Perplexity",
        "status_page": "https://status.perplexity.ai",
        "rss_feed": "https://status.perplexity.ai/history.rss",
        "logo_url": "https://www.perplexity.ai/favicon.svg",
        "color": "#20808d",
        "description": "AI-Powered Search",
    },
    "mistral": {
        "name": "mistral",
        "display_name": "Mistral AI",
        "status_page": "https://status.mistral.ai",
        "rss_feed": "https://status.mistral.ai/history.rss",
        "logo_url": "https://mistral.ai/favicon.ico",
        "color": "#f2a73b",
        "description": "Open and Portable AI",
    },
    "together": {
        "name": "together",
        "display_name": "Together AI",
        "status_page": "https://status.together.ai",
        "rss_feed": "https://status.together.ai/history.rss",
        "logo_url": "https://www.together.ai/favicon.ico",
        "color": "#7c3aed",
        "description": "Leading Open Source AI",
    },
    "xai": {
        "name": "xai",
        "display_name": "xAI (Grok)",
        "status_page": "https://status.x.ai",
        "rss_feed": "https://status.x.ai/history.rss",
        "logo_url": "https://x.ai/favicon.ico",
        "color": "#000000",
        "description": "Grok AI Assistant",
    },
    "cartesia": {
        "name": "cartesia",
        "display_name": "Cartesia",
        "status_page": "https://status.cartesia.ai",
        "rss_feed": "https://status.cartesia.ai/history.rss",
        "logo_url": "https://cartesia.ai/favicon.ico",
        "color": "#ff3366",
        "description": "Real-time Voice AI",
    },
    "deepgram": {
        "name": "deepgram",
        "display_name": "Deepgram",
        "status_page": "https://status.deepgram.com",
        "rss_feed": "https://status.deepgram.com/history.rss",
        "logo_url": "https://deepgram.com/favicon.ico",
        "color": "#38bdf8",
        "description": "Voice AI Platform",
    },
    "stability": {
        "name": "stability",
        "display_name": "Stability AI",
        "status_page": "https://status.stability.ai",
        "rss_feed": "https://status.stability.ai/history.rss",
        "logo_url": "https://stability.ai/favicon.ico",
        "color": "#4c1d95",
        "description": "Stable Diffusion & Audio",
    },
    "huggingface": {
        "name": "huggingface",
        "display_name": "Hugging Face",
        "status_page": "https://status.huggingface.co",
        "rss_feed": "https://status.huggingface.co/rss",
        "logo_url": "https://huggingface.co/favicon.ico",
        "color": "#fbbf24",
        "description": "The AI Community",
    },
    "replicate": {
        "name": "replicate",
        "display_name": "Replicate",
        "status_page": "https://replicatestatus.com",
        "rss_feed": "https://replicatestatus.com/feed",
        "logo_url": "https://replicate.com/favicon.ico",
        "color": "#000000",
        "description": "Run AI with an API",
    },
}


def clean_html(raw_html):
    """Remove HTML tags from text."""
    clean = re.sub(r'<[^>]+>', ' ', raw_html)
    clean = re.sub(r'\s+', ' ', clean)
    return clean.strip()


def extract_products(description):
    """Extract affected products from description."""
    products = re.findall(r'<li>([^<]+)</li>', description)
    return [p.replace(' (Operational)', '').strip() for p in products]


def extract_status(description):
    """Extract status from description."""
    match = re.search(r'<b>Status:\s*([^<]+)</b>', description)
    if match:
        return match.group(1).strip().lower().replace(' ', '_')
    return "operational"


def format_time(published):
    """Format timestamp."""
    if published:
        try:
            return datetime(*published[:6]).isoformat()
        except:
            pass
    return datetime.now().isoformat()


def fetch_provider_data(provider_config):
    """Fetch RSS feed for a single provider."""
    print(f"Fetching {provider_config['display_name']}...")
    
    try:
        feed = feedparser.parse(provider_config['rss_feed'])
        
        incidents = []
        for item in feed.entries[:20]:  # Last 20 incidents
            incident_id = item.get('id') or item.get('link') or item.get('guid')
            title = item.get('title', 'Unknown Incident')
            description = item.get('description', '')
            timestamp = format_time(item.get('published_parsed'))
            
            status = extract_status(description)
            products = extract_products(description)
            message = clean_html(description)
            
            # Clean up message
            if 'Affected components' in message:
                message = message.split('Affected components')[0]
            message = message.replace(f'Status: {status}', '').strip()
            
            incidents.append({
                'id': len(incidents) + 1,
                'incident_id': incident_id,
                'provider': provider_config['name'],
                'title': title,
                'status': status,
                'message': message[:500] if message else None,  # Limit message length
                'affected_products': products,
                'timestamp': timestamp,
                'resolved_at': None
            })
        
        # Determine current status from most recent incident
        current_status = 'operational'
        if incidents:
            current_status = incidents[0]['status']
        
        return {
            'incidents': incidents,
            'current_status': current_status,
            'last_checked': datetime.now().isoformat(),
            'total_incidents': len(incidents)
        }
    
    except Exception as e:
        print(f"Error fetching {provider_config['display_name']}: {e}")
        return {
            'incidents': [],
            'current_status': 'unknown',
            'last_checked': datetime.now().isoformat(),
            'total_incidents': 0
        }


def calculate_analytics(all_incidents, days=30):
    """Calculate analytics from incidents."""
    cutoff = datetime.now() - timedelta(days=days)
    
    incident_counts = defaultdict(int)
    provider_incidents = defaultdict(list)
    
    for incident in all_incidents:
        incident_time = datetime.fromisoformat(incident['timestamp'])
        if incident_time >= cutoff:
            incident_counts[incident['provider']] += 1
            provider_incidents[incident['provider']].append(incident)
    
    # Calculate uptime (simplified - assumes each incident = 1 hour downtime)
    uptime_stats = {}
    for provider_id in PROVIDERS.keys():
        incidents_count = incident_counts[provider_id]
        total_hours = days * 24
        downtime_hours = min(incidents_count, total_hours)  # Cap at total hours
        uptime_percentage = ((total_hours - downtime_hours) / total_hours) * 100
        
        uptime_stats[provider_id] = {
            'uptime_percentage': round(uptime_percentage, 2),
            'incident_count': incidents_count
        }
    
    return {
        'period_days': days,
        'incident_counts': dict(incident_counts),
        'uptime': uptime_stats,
        'mttr': {}  # Mean time to resolution - simplified for now
    }


def main():
    """Main function to fetch all data and generate JSON files."""
    print("Starting status data fetch...")
    
    # Create output directory in frontend/public for GitHub Pages
    output_dir = Path('frontend/public/data')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Fetch data for all providers
    all_incidents = []
    status_data = {}
    
    for provider_id, provider_config in PROVIDERS.items():
        data = fetch_provider_data(provider_config)
        
        # Add to incidents list
        all_incidents.extend(data['incidents'])
        
        # Build status data
        status_data[provider_id] = {
            **provider_config,
            'current_status': data['current_status'],
            'last_checked': data['last_checked'],
            'total_incidents': data['total_incidents'],
            'last_incident_at': data['incidents'][0]['timestamp'] if data['incidents'] else None
        }
    
    # Sort incidents by timestamp (newest first)
    all_incidents.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Limit to last 100 incidents
    all_incidents = all_incidents[:100]
    
    # Calculate analytics
    analytics = calculate_analytics(all_incidents, days=30)
    analytics_7d = calculate_analytics(all_incidents, days=7)
    analytics_90d = calculate_analytics(all_incidents, days=90)
    
    # Write providers.json
    providers_data = {
        'providers': list(PROVIDERS.values()),
        'count': len(PROVIDERS)
    }
    with open(output_dir / 'providers.json', 'w') as f:
        json.dump(providers_data, f, indent=2)
    print(f"✓ Generated providers.json")
    
    # Write status.json
    status_output = {
        'providers': status_data,
        'count': len(status_data),
        'last_updated': datetime.now().isoformat()
    }
    with open(output_dir / 'status.json', 'w') as f:
        json.dump(status_output, f, indent=2)
    print(f"✓ Generated status.json")
    
    # Write incidents.json
    incidents_output = {
        'incidents': all_incidents,
        'count': len(all_incidents),
        'last_updated': datetime.now().isoformat()
    }
    with open(output_dir / 'incidents.json', 'w') as f:
        json.dump(incidents_output, f, indent=2)
    print(f"✓ Generated incidents.json ({len(all_incidents)} incidents)")
    
    # Write analytics.json (multiple time periods)
    analytics_output = {
        'periods': {
            '7d': analytics_7d,
            '30d': analytics,
            '90d': analytics_90d
        },
        'last_updated': datetime.now().isoformat()
    }
    with open(output_dir / 'analytics.json', 'w') as f:
        json.dump(analytics_output, f, indent=2)
    print(f"✓ Generated analytics.json")
    
    print(f"\n✨ Successfully generated all data files!")
    print(f"Total providers: {len(PROVIDERS)}")
    print(f"Total incidents: {len(all_incidents)}")


if __name__ == "__main__":
    main()
