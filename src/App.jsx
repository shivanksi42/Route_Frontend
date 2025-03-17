// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import RouteOptimizer from './pages/RouteOptimizer';
import TrafficAnalysis from './pages/TrafficAnalysis';
import CongestionMap from './pages/CongestionMap';
import Settings from './pages/Settings';
import { API_BASE_URL } from './config';

function App() {
  const [networkStats, setNetworkStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNetworkStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/network/stats`);
        if (!response.ok) {
          throw new Error('Failed to fetch network stats');
        }
        const data = await response.json();
        setNetworkStats(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching network stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworkStats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header networkStats={networkStats} />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/route-optimizer" element={<RouteOptimizer />} />
            <Route path="/traffic-analysis" element={<TrafficAnalysis />} />
            <Route path="/congestion-map" element={<CongestionMap />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;