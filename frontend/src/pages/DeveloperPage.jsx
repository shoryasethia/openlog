import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Copy, Check, Book, Webhook, Code } from 'lucide-react';
import './DeveloperPage.css';

const DATA_BASE = import.meta.env.BASE_URL + 'data';
const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : DATA_BASE;

function DeveloperPage() {
  const [templates, setTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('javascript');
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      // In production (static), use hardcoded templates since we can't run Python templates
      if (!import.meta.env.DEV) {
        // Use default templates for static deployment
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE}/webhooks/templates`);
      setTemplates(response.data.templates);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentTemplate = templates[selectedTemplate];

  const apiDocumentation = [
    {
      title: 'Get All Providers',
      method: 'GET',
      endpoint: '/api/providers',
      description: 'Returns list of all monitored AI providers with their configurations.',
      example: `curl ${API_BASE}/providers`
    },
    {
      title: 'Get Current Status',
      method: 'GET',
      endpoint: '/api/status',
      description: 'Get real-time status for all providers or filter by specific provider.',
      example: `curl ${API_BASE}/status\n# Or for specific provider:\ncurl ${API_BASE}/status?provider=openai`
    },
    {
      title: 'Get Recent Incidents',
      method: 'GET',
      endpoint: '/api/incidents',
      description: 'Fetch recent incidents with optional pagination and provider filtering.',
      example: `curl "${API_BASE}/incidents?limit=20&offset=0"\n# Filter by provider:\ncurl "${API_BASE}/incidents?provider=anthropic"`
    },
    {
      title: 'Get Analytics',
      method: 'GET',
      endpoint: '/api/analytics',
      description: 'Retrieve aggregated analytics including uptime stats and MTTR.',
      example: `curl "${API_BASE}/analytics?days=30"`
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading developer tools...</p>
      </div>
    );
  }

  return (
    <div className="developer-page">
      <div className="container">
        <header className="page-header fade-in">
          <div>
            <h1>Developer Tools</h1>
            <p>Integration guides, API documentation, and webhook templates</p>
          </div>
        </header>

        <div className="dev-section slide-in">
          <div className="section-header">
            <Book className="section-icon" />
            <h2>API Documentation</h2>
          </div>
          <div className="api-docs-grid">
            {apiDocumentation.map((doc, index) => (
              <div key={index} className="api-doc-card glass-card">
                <div className="api-header">
                  <h3>{doc.title}</h3>
                  <span className="method-badge">{doc.method}</span>
                </div>
                <div className="api-endpoint">
                  <code>{doc.endpoint}</code>
                </div>
                <p className="api-description">{doc.description}</p>
                <div className="code-block">
                  <button
                    className="copy-button"
                    onClick={() => copyToClipboard(doc.example, `doc-${index}`)}
                  >
                    {copiedId === `doc-${index}` ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === `doc-${index}` ? 'Copied!' : 'Copy'}
                  </button>
                  <pre>{doc.example}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dev-section slide-in">
          <div className="section-header">
            <Webhook className="section-icon" />
            <h2>Webhook Templates</h2>
          </div>
          <p className="section-description">
            Ready-to-use code snippets for integrating OpenLog with your applications
          </p>

          <div className="template-selector">
            {Object.keys(templates).map((key) => (
              <button
                key={key}
                className={`template-btn ${selectedTemplate === key ? 'active' : ''}`}
                onClick={() => setSelectedTemplate(key)}
              >
                <Code size={16} />
                {templates[key].name}
              </button>
            ))}
          </div>

          {currentTemplate && (
            <div className="template-content glass-card">
              <div className="template-header">
                <div>
                  <h3>{currentTemplate.name}</h3>
                  <p>{currentTemplate.description}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => copyToClipboard(currentTemplate.code, 'template')}
                >
                  {copiedId === 'template' ? <Check size={18} /> : <Copy size={18} />}
                  {copiedId === 'template' ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <div className="code-block large">
                <pre>
                  <code className={`language-${currentTemplate.language}`}>
                    {currentTemplate.code}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="dev-section slide-in">
          <div className="section-header">
            <Code size={24} className="section-icon" />
            <h2>Quick Start Examples</h2>
          </div>

          <div className="examples-grid">
            <div className="example-card glass-card">
              <h3>Monitor All Providers</h3>
              <p>Get status of all AI providers and display alerts</p>
              <div className="code-block">
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(`fetch('${API_BASE}/status')
  .then(res => res.json())
  .then(data => {
    Object.values(data.providers).forEach(provider => {
      if (provider.current_status !== 'operational') {
        console.log(\`⚠️ \${provider.display_name}: \${provider.current_status}\`);
      }
    });
  });`, 'example-1')}
                >
                  {copiedId === 'example-1' ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <pre>{`fetch('${API_BASE}/status')
  .then(res => res.json())
  .then(data => {
    Object.values(data.providers).forEach(provider => {
      if (provider.current_status !== 'operational') {
        console.log(\`⚠️ \${provider.display_name}: \${provider.current_status}\`);
      }
    });
  });`}</pre>
              </div>
            </div>

            <div className="example-card glass-card">
              <h3>Get Latest Incidents</h3>
              <p>Fetch and display most recent incidents</p>
              <div className="code-block">
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(`fetch('${API_BASE}/incidents?limit=5')
  .then(res => res.json())
  .then(data => {
    data.incidents.forEach(inc => {
      console.log(\`[\${inc.provider}] \${inc.title} - \${inc.status}\`);
    });
  });`, 'example-2')}
                >
                  {copiedId === 'example-2' ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <pre>{`fetch('${API_BASE}/incidents?limit=5')
  .then(res => res.json())
  .then(data => {
    data.incidents.forEach(inc => {
      console.log(\`[\${inc.provider}] \${inc.title} - \${inc.status}\`);
    });
  });`}</pre>
              </div>
            </div>

            <div className="example-card glass-card">
              <h3>Calculate Uptime</h3>
              <p>Get 30-day uptime statistics for all providers</p>
              <div className="code-block">
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(`fetch('${API_BASE}/analytics?days=30')
  .then(res => res.json())
  .then(data => {
    Object.entries(data.uptime).forEach(([provider, stats]) => {
      console.log(\`\${provider}: \${stats.uptime_percentage.toFixed(2)}% uptime\`);
    });
  });`, 'example-3')}
                >
                  {copiedId === 'example-3' ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <pre>{`fetch('${API_BASE}/analytics?days=30')
  .then(res => res.json())
  .then(data => {
    Object.entries(data.uptime).forEach(([provider, stats]) => {
      console.log(\`\${provider}: \${stats.uptime_percentage.toFixed(2)}% uptime\`);
    });
  });`}</pre>
              </div>
            </div>
          </div>
        </div>

        <div className="dev-section slide-in">
          <div className="info-card glass-card">
            <h3>Rate Limiting</h3>
            <p>Currently no rate limiting is enforced. Please be respectful and don't hammer the API.</p>
          </div>

          <div className="info-card glass-card">
            <h3>CORS</h3>
            <p>All origins are currently allowed. Configure CORS settings in the backend as needed for production.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeveloperPage;
