import React, { useState, useEffect } from 'react';
import RouteMap from '../components/RouteMap';
import { API_BASE_URL } from '../config';

const CongestionMap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapUrl, setMapUrl] = useState(null);
  const [congestionData, setCongestionData] = useState(null);
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    const fetchCongestionData = async () => {
      setIsLoading(true);
      try {
        const congestionResponse = await fetch(`${API_BASE_URL}/api/congestion/classify`);
        if (!congestionResponse.ok) {
          throw new Error('Failed to fetch congestion data');
        }
        const congestionData = await congestionResponse.json();
        setCongestionData(congestionData);
        
        const hotspotsResponse = await fetch(`${API_BASE_URL}/api/network/congestion-hotspots`);
        if (!hotspotsResponse.ok) {
          throw new Error('Failed to fetch congestion hotspots');
        }
        const hotspotsData = await hotspotsResponse.json();
        setHotspots(hotspotsData.hotspots);
        
        const routeParams = {
          hour: 8,
          day_of_week: 1, 
          map_type: 'enhanced' 
        };
        
        const mapResponse = await fetch(`${API_BASE_URL}/api/map/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(routeParams)
        });
        
        if (!mapResponse.ok) {
          throw new Error('Failed to generate congestion map');
        }
        
        // Create a blob URL for the map HTML
        const mapBlob = await mapResponse.blob();
        const mapUrl = URL.createObjectURL(mapBlob);
        setMapUrl(mapUrl);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching congestion data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCongestionData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Congestion Map</h1>
        <p className="text-gray-500">Visualize traffic congestion patterns in the network</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RouteMap mapUrl={mapUrl} />
          </div>
          
          <div className="space-y-6">
            {/* Congestion Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Congestion Statistics</h2>
              
              {congestionData && (
                <div className="space-y-4">
                  {[
                    { level: 'Low', count: congestionData.risk_counts.low, color: 'bg-green-500' },
                    { level: 'Medium', count: congestionData.risk_counts.medium, color: 'bg-yellow-500' },
                    { level: 'High', count: congestionData.risk_counts.high, color: 'bg-red-500' }
                  ].map((item, index) => {
                    const percentage = ((item.count / congestionData.total_roads) * 100).toFixed(1);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{item.level}</span>
                          <span className="text-gray-500">{item.count.toLocaleString()} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${item.color} h-2 rounded-full`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Congestion Hotspots */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Congestion Hotspots</h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {hotspots.map((hotspot, index) => (
                  <div key={index} className="p-3 border border-red-100 bg-red-50 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Node {hotspot.id}</span>
                      <span className="text-red-600 font-medium">{hotspot.high_risk_road_count} high-risk roads</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p className="text-gray-500">
                        Lat: {hotspot.lat.toFixed(6)}, Lon: {hotspot.lon.toFixed(6)}
                      </p>
                      <p className="text-gray-500 mt-1">
                        Area: {hotspot.area_name || 'Unknown'}, Priority: {hotspot.priority}
                      </p>
                      <p className="text-gray-500 mt-1">
                        Peak Congestion: {hotspot.peak_hour}:00 - {hotspot.peak_hour + 1}:00
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Time-based Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Time-based Analysis</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-700 mb-2">Peak Hours</div>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Morning</span>
                      <span className="text-gray-700">07:00 - 09:00</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-900">Evening</span>
                      <span className="text-gray-700">17:00 - 19:00</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Weekly Patterns</div>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div 
                        key={index} 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          index < 5 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
        
        <div className="flex flex-wrap gap-4">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => alert('Analysis report would be generated here')}
          >
            Generate Report
          </button>
          
          <button 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            onClick={() => alert('Congestion data would be exported here')}
          >
            Export Data
          </button>
          
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            onClick={() => alert('Mitigation strategies would be suggested here')}
          >
            Suggest Mitigation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CongestionMap;