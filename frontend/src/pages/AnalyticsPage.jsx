import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';
import './AnalyticsPage.css';

const DATA_BASE = import.meta.env.BASE_URL + 'data';
const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : DATA_BASE;

const COLORS = ['#10b981', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6'];

function AnalyticsPage() {
  const [providers, setProviders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const timestamp = new Date().getTime();
      const providersUrl = import.meta.env.DEV
        ? `${API_BASE}/providers`
        : `${API_BASE}/providers.json?t=${timestamp}`;
      const analyticsUrl = import.meta.env.DEV
        ? `${API_BASE}/analytics?days=${period}`
        : `${API_BASE}/analytics.json?t=${timestamp}`;

      const [providersRes, analyticsRes] = await Promise.all([
        axios.get(providersUrl),
        axios.get(analyticsUrl)
      ]);

      setProviders(providersRes.data.providers);

      // For static files, get the appropriate period
      const analyticsData = import.meta.env.DEV
        ? analyticsRes.data
        : analyticsRes.data.periods[period === 7 ? '7d' : period === 90 ? '90d' : '30d'];

      setAnalytics(analyticsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  // Prepare data for charts
  const uptimeData = providers.map(provider => ({
    name: provider.display_name,
    uptime: analytics.uptime[provider.name]?.uptime_percentage || 100,
    incidents: analytics.incident_counts[provider.name] || 0
  }));

  const incidentData = providers
    .map(provider => ({
      name: provider.display_name,
      count: analytics.incident_counts[provider.name] || 0,
      color: provider.color
    }))
    .filter(p => p.count > 0)
    .sort((a, b) => b.count - a.count);

  const mttrData = providers
    .map(provider => ({
      name: provider.display_name,
      mttr: analytics.mttr[provider.name] || 0
    }))
    .filter(p => p.mttr > 0)
    .sort((a, b) => a.mttr - b.mttr);

  const totalIncidents = Object.values(analytics.incident_counts).reduce((a, b) => a + b, 0);
  const avgUptime = uptimeData.reduce((a, b) => a + b.uptime, 0) / uptimeData.length;

  return (
    <div className="analytics-page">
      <div className="container">
        <header className="page-header fade-in">
          <div>
            <h1>Analytics Dashboard</h1>
            <p>Comparative analysis of AI provider reliability</p>
          </div>
          <div className="period-selector">
            <button
              className={`btn-secondary ${period === 7 ? 'active' : ''}`}
              onClick={() => setPeriod(7)}
            >
              7 Days
            </button>
            <button
              className={`btn-secondary ${period === 30 ? 'active' : ''}`}
              onClick={() => setPeriod(30)}
            >
              30 Days
            </button>
            <button
              className={`btn-secondary ${period === 90 ? 'active' : ''}`}
              onClick={() => setPeriod(90)}
            >
              90 Days
            </button>
          </div>
        </header>

        <div className="stats-overview slide-in">
          <div className="stat-card glass-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <TrendingUp size={24} color="#10b981" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{avgUptime.toFixed(2)}%</div>
              <div className="stat-label">Average Uptime</div>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <AlertCircle size={24} color="#ef4444" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalIncidents}</div>
              <div className="stat-label">Total Incidents</div>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <Clock size={24} color="#6366f1" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{period} Days</div>
              <div className="stat-label">Analysis Period</div>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card glass-card fade-in">
            <h2>Uptime Percentage by Provider</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={uptimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis domain={[95, 100]} stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)'
                  }}
                />
                <Legend />
                <Bar dataKey="uptime" fill="#10b981" name="Uptime %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card glass-card fade-in">
            <h2>Incident Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incidentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {incidentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {mttrData.length > 0 && (
            <div className="chart-card glass-card fade-in chart-full-width">
              <h2>Mean Time to Resolution (MTTR)</h2>
              <p className="chart-subtitle">Average time to resolve incidents (in minutes)</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mttrData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                  <XAxis type="number" stroke="var(--text-secondary)" />
                  <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="mttr" fill="#6366f1" name="MTTR (minutes)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="provider-rankings slide-in">
          <h2>Provider Reliability Rankings</h2>
          <div className="rankings-list">
            {uptimeData
              .sort((a, b) => b.uptime - a.uptime)
              .map((provider, index) => (
                <div key={provider.name} className="ranking-item glass-card">
                  <div className="ranking-position">#{index + 1}</div>
                  <div className="ranking-info">
                    <div className="ranking-name">{provider.name}</div>
                    <div className="ranking-stats">
                      <span className="uptime-stat">
                        {provider.uptime.toFixed(2)}% uptime
                      </span>
                      <span className="incidents-stat">
                        {provider.incidents} incident{provider.incidents !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="ranking-bar">
                    <div
                      className="ranking-fill"
                      style={{ width: `${provider.uptime}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
