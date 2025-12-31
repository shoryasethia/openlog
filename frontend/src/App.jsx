import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import StatusPage from './pages/StatusPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DeveloperPage from './pages/DeveloperPage';

function App() {
  return (
    <Router basename="/openlog">
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<StatusPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/developer" element={<DeveloperPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
