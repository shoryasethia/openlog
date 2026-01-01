import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, RefreshCw, Clock } from 'lucide-react';
import './StatusPage.css';

// Use static JSON files for GitHub Pages deployment
const DATA_BASE = import.meta.env.BASE_URL + 'data';
// Fallback to local API for development
const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : DATA_BASE;

function StatusPage() {
  const [providers, setProviders] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isDataStale, setIsDataStale] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastUpdated) {
      const dataAge = Date.now() - new Date(lastUpdated).getTime();
      setIsDataStale(dataAge > 2 * 60 * 60 * 1000); // 2 hours
    }
  }, [lastUpdated]);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      const timestamp = Date.now();
      
      // Add aggressive cache bypass headers
      const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      const statusUrl = import.meta.env.DEV
        ? `${API_BASE}/status`
        : `${API_BASE}/status.json?t=${timestamp}`;
      const incidentsUrl = import.meta.env.DEV
        ? `${API_BASE}/incidents?limit=20`
        : `${API_BASE}/incidents.json?t=${timestamp}`;

      const [statusRes, incidentsRes] = await Promise.all([
        axios.get(statusUrl, { headers }),
        axios.get(incidentsUrl, { headers })
      ]);

      setProviders(Object.values(statusRes.data.providers));
      setLastUpdated(statusRes.data.last_updated);

      // For static files, incidents are already in the response
      const incidents = incidentsRes.data.incidents || incidentsRes.data;
      setIncidents(incidents.slice(0, 20));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    } finally {
      if (isManualRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  const getStatusColor = (status) => {
    if (status === 'operational') return 'operational';
    if (status === 'degraded' || status === 'partial_outage') return 'degraded';
    if (status === 'outage') return 'outage';
    return 'unknown';
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filteredIncidents = selectedProvider
    ? incidents.filter(inc => inc.provider === selectedProvider)
    : incidents;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading status data...</p>
      </div>
    );
  }

  return (
    <div className="status-page">
      <div className="container">
        <header className="page-header fade-in">
          <div>
            <h1>AI Provider Status</h1>
            <p>Real-time monitoring of major AI service providers</p>
            {lastUpdated && (
              <p className="last-updated">
                <Clock size={14} />
                Last updated: {getRelativeTime(lastUpdated)} 
                ({new Date(lastUpdated).toLocaleString()})
                {' • '}Refreshes hourly
              </p>
            )}
            {isDataStale && (
              <p className="stale-warning" style={{ 
                color: '#f59e0b', 
                fontSize: '0.9rem',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ⚠️ Data may be outdated - refresh to get latest status
              </p>
            )}
          </div>
          <button 
            className="btn-secondary" 
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={isRefreshing ? 'spinning' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </header>

        <div className="providers-section slide-in">
          <h2 className="section-title">Service Status</h2>
          <div className="providers-grid">
            {providers.map((provider, index) => (
              <div
                key={provider.name}
                className="provider-card glass-card"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedProvider(
                  selectedProvider === provider.name ? null : provider.name
                )}
              >
                <div className="provider-header">
                  <div className="provider-info">
                    <h3>{provider.display_name}</h3>
                    <p className="provider-description">{provider.description}</p>
                  </div>
                  <div
                    className={`status-indicator ${getStatusColor(provider.current_status)}`}
                  />
                </div>

                <div className="provider-status">
                  <span className={`status-badge ${getStatusColor(provider.current_status)}`}>
                    {provider.current_status.replace('_', ' ')}
                  </span>
                </div>

                <div className="provider-meta">
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>Last checked: {provider.last_checked ? formatTime(provider.last_checked) : 'Never'}</span>
                  </div>
                  <a
                    href={provider.status_page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="status-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                    Status Page
                  </a>
                </div>

                {provider.total_incidents > 0 && (
                  <div className="incident-count">
                    {provider.total_incidents} total incident{provider.total_incidents !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="incidents-section slide-in">
          <div className="incidents-header">
            <h2 className="section-title">
              Recent Incidents
              {selectedProvider && ` - ${providers.find(p => p.name === selectedProvider)?.display_name}`}
            </h2>
            {selectedProvider && (
              <button
                className="btn-secondary"
                onClick={() => setSelectedProvider(null)}
              >
                Show All
              </button>
            )}
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="no-incidents glass-card">
              <p>No recent incidents found.</p>
              <p className="text-muted">All systems operational! 🎉</p>
            </div>
          ) : (
            <div className="incidents-timeline">
              {filteredIncidents.map((incident, index) => (
                <div
                  key={incident.id}
                  className="incident-card glass-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="incident-header">
                    <div className="incident-provider">
                      {providers.find(p => p.name === incident.provider)?.display_name || incident.provider}
                    </div>
                    <div className="incident-time">
                      {formatTime(incident.timestamp)}
                    </div>
                  </div>

                  <h3 className="incident-title">{incident.title}</h3>

                  <div className="incident-status">
                    <span className={`status-badge ${getStatusColor(incident.status)}`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                  </div>

                  {incident.message && (
                    <p className="incident-message">{incident.message}</p>
                  )}

                  {incident.affected_products && incident.affected_products.length > 0 && (
                    <div className="affected-products">
                      <strong>Affected:</strong> {incident.affected_products.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatusPage;
