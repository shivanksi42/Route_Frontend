import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const Settings = () => {
  const [settings, setSettings] = useState({
    selectedTimePeriod: "Morning Rush (8 AM)",
    mapType: "enhanced",
    refreshInterval: 30,
    showCongestionOverlay: true,
    routeOptimizationAlgorithm: "fastest",
    showHistoricalData: true,
    dataRetentionDays: 30,
    theme: 'light'
  });
  
  const [settingsOptions, setSettingsOptions] = useState({
    timePeriods: [],
    mapTypes: [],
    congestionLevels: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettingsOptions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        if (!response.ok) {
          throw new Error('Failed to fetch settings options');
        }
        const data = await response.json();
        setSettingsOptions({
          timePeriods: data.time_periods || [],
          mapTypes: data.map_types || [],
          congestionLevels: data.congestion_levels || []
        });
      } catch (err) {
        setError(err.message);
        console.error('Error fetching settings options:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettingsOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTimePeriodChange = (e) => {
    const selectedLabel = e.target.value;
    const selectedPeriod = settingsOptions.timePeriods.find(period => period.label === selectedLabel);
    
    setSettings({
      ...settings,
      selectedTimePeriod: selectedLabel,
      // Store the actual time period values for API calls
      hour: selectedPeriod?.hour,
      day_of_week: selectedPeriod?.day_of_week,
      is_weekend: selectedPeriod?.is_weekend
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    
    // Note: The backend doesn't actually have a POST endpoint for settings,
    // so we'll just simulate a successful save for now
    try {
      // In a real implementation, you would send this to an API endpoint
      // const response = await fetch(`${API_BASE_URL}/api/settings`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(settings)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to save settings');
      // }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Store settings in localStorage for persistence
      localStorage.setItem('trafficAppSettings', JSON.stringify(settings));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReloadSystem = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/system/reload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to reload system');
      }
      
      const data = await response.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error reloading system:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && settingsOptions.timePeriods.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">Traffic Management Settings</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Settings saved successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="selectedTimePeriod">
              Default Time Period
            </label>
            <select
              id="selectedTimePeriod"
              name="selectedTimePeriod"
              value={settings.selectedTimePeriod}
              onChange={handleTimePeriodChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {settingsOptions.timePeriods.map((period) => (
                <option key={period.label} value={period.label}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="mapType">
              Default Map Type
            </label>
            <select
              id="mapType"
              name="mapType"
              value={settings.mapType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {settingsOptions.mapTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="refreshInterval">
              Data Refresh Interval (seconds)
            </label>
            <input
              type="number"
              id="refreshInterval"
              name="refreshInterval"
              value={settings.refreshInterval}
              onChange={handleInputChange}
              min="5"
              max="300"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="routeOptimizationAlgorithm">
              Route Optimization Algorithm
            </label>
            <select
              id="routeOptimizationAlgorithm"
              name="routeOptimizationAlgorithm"
              value={settings.routeOptimizationAlgorithm}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fastest">Fastest Route</option>
              <option value="shortest">Shortest Distance</option>
              <option value="balanced">Balanced (Time/Distance)</option>
              <option value="congestion-aware">Congestion-Aware</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="dataRetentionDays">
              Data Retention Period (days)
            </label>
            <input
              type="number"
              id="dataRetentionDays"
              name="dataRetentionDays"
              value={settings.dataRetentionDays}
              onChange={handleInputChange}
              min="1"
              max="365"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="theme">
              UI Theme
            </label>
            <select
              id="theme"
              name="theme"
              value={settings.theme}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showCongestionOverlay"
              name="showCongestionOverlay"
              checked={settings.showCongestionOverlay}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-gray-700" htmlFor="showCongestionOverlay">
              Show Congestion Overlay on Maps
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showHistoricalData"
              name="showHistoricalData"
              checked={settings.showHistoricalData}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-gray-700" htmlFor="showHistoricalData">
              Show Historical Data Comparisons
            </label>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleReloadSystem}
            className="px-4 py-2 mr-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            disabled={isLoading}
          >
            {isLoading ? 'Reloading...' : 'Reload System'}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;