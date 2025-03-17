// src/pages/
import React, { useState, useEffect } from 'react';
import TimeSelector from '../components/TimeSelector';
import RouteMap from '../components/RouteMap';
import { API_BASE_URL } from '../config';

const RouteOptimizer = () => {
  const [timePeriods, setTimePeriods] = useState([]);
  const [mapTypes, setMapTypes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedMapType, setSelectedMapType] = useState('enhanced');
  const [stops, setStops] = useState([]);
  const [depot, setDepot] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [mapUrl, setMapUrl] = useState(null);
  const [error, setError] = useState(null);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        
        setTimePeriods(data.time_periods);
        setMapTypes(data.map_types);
        setSelectedTime(data.time_periods[0]); // Default to first time period
      } catch (err) {
        setError(err.message);
        console.error('Error fetching settings:', err);
      }
    };

    fetchSettings();
  }, []);

  const handleAddStop = () => {
    setStops([...stops, '']);
  };

  const handleRemoveStop = (index) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const handleStopChange = (index, value) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const handleGenerateRoute = async () => {
    if (!selectedTime) {
      setError('Please select a time period');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      // First optimize the route
      const routeResponse = await fetch(`${API_BASE_URL}/api/route/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hour: selectedTime.hour,
          day_of_week: selectedTime.day_of_week,
          depot_id: depot || undefined,
          stop_ids: stops.filter(stop => stop.trim() !== '')
        })
      });

      if (!routeResponse.ok) {
        throw new Error('Failed to optimize route');
      }

      const routeData = await routeResponse.json();
      setRouteData(routeData);

      // Then generate the map
      const mapResponse = await fetch(`${API_BASE_URL}/api/map/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: routeData.route,
          hour: selectedTime.hour,
          day_of_week: selectedTime.day_of_week,
          map_type: selectedMapType
        })
      });

      if (!mapResponse.ok) {
        throw new Error('Failed to generate route map');
      }

      // Create a blob URL for the map HTML
      const mapBlob = await mapResponse.blob();
      const mapUrl = URL.createObjectURL(mapBlob);
      setMapUrl(mapUrl);

    } catch (err) {
      setError(err.message);
      console.error('Error generating route:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Route Optimizer</h1>
        <p className="text-gray-500">Optimize delivery routes based on traffic conditions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            {/* Time Period Selector */}
            {timePeriods.length > 0 && (
              <TimeSelector 
                value={selectedTime} 
                onChange={setSelectedTime}
                timePeriods={timePeriods}
              />
            )}

            {/* Map Type Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Map Type</label>
              <select
                value={selectedMapType}
                onChange={(e) => setSelectedMapType(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {mapTypes.map((type, index) => (
                  <option key={index} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Depot Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Depot ID (Optional)</label>
              <input
                type="text"
                value={depot}
                onChange={(e) => setDepot(e.target.value)}
                placeholder="Enter depot node ID"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Stops Inputs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Stops</label>
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  + Add Stop
                </button>
              </div>
              
              {stops.map((stop, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={stop}
                    onChange={(e) => handleStopChange(index, e.target.value)}
                    placeholder={`Stop ${index + 1} node ID`}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {stops.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No stops added. Random stops will be used if none are specified.
                </p>
              )}
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerateRoute}
              disabled={isGenerating}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isGenerating ? 'Generating...' : 'Generate Route'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <RouteMap routeData={routeData} mapUrl={mapUrl} />
          
          {/* Route Details */}
          {routeData && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Route Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Time</p>
                  <p className="text-xl font-semibold">{routeData.total_time_minutes.toFixed(1)} min</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Stops</p>
                  <p className="text-xl font-semibold">{routeData.nodes.length}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Time Period</p>
                  <p className="text-xl font-semibold">
                    {routeData.is_weekend ? 'Weekend' : 'Weekday'} {routeData.hour}:00
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-md font-medium text-gray-900 mb-2">Segments</h3>
                <div className="max-h-48 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time (min)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {routeData.segments.map((segment, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-500">{segment.from_node}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{segment.to_node}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{segment.time_minutes.toFixed(1)}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{segment.cumulative_time.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizer;