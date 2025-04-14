// src/components/StopSelector.js
import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';

const StopSelector = ({ stops, setStops, depot, setDepot }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mode, setMode] = useState('map'); // 'map' or 'nodeId'
  const [error, setError] = useState(null);
  const [mapUrl, setMapUrl] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const mapContainerRef = useRef(null);
  
  // Load the initial map when component mounts
  useEffect(() => {
    if (mode === 'map') {
      loadInitialMap();
    }
  }, [mode]);

  const loadInitialMap = async () => {
    setIsMapLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/map/initial`);
      if (!response.ok) {
        throw new Error('Failed to load map');
      }
      
      // We expect the backend to return HTML content of a folium map
      const mapHtml = await response.text();
      
      // Set the map HTML to be rendered in an iframe
      setMapUrl(URL.createObjectURL(new Blob([mapHtml], { type: 'text/html' })));
    } catch (err) {
      setError(`Error loading map: ${err.message}`);
      console.error('Error loading initial map:', err);
    } finally {
      setIsMapLoading(false);
    }
  };

  // Function to handle map click events
  // This would be sent from the Folium map via postMessage
  // Update the useEffect for handling map messages
useEffect(() => {
  const handleMapMessage = (event) => {
    // Check if we have valid data
    if (!event.data || !event.data.type) return;
    
    const { type, data } = event.data;
    
    if (type === 'NODE_SELECTED' && data) {
      const { lat, lon } = data;
      console.log("Map click received:", lat, lon);
      
      // Call your API to find nearby nodes
      searchNearbyNodes(lat, lon);
    }
  };
  
  window.addEventListener('message', handleMapMessage);
  return () => window.removeEventListener('message', handleMapMessage);
}, []);

const searchNearbyNodes = async (lat, lon) => {
  if (!lat || !lon) {
    console.error("Invalid coordinates", lat, lon);
    return;
  }
  
  setIsSearching(true);
  setError(null);
  
  try {
    const endpoint = `${API_BASE_URL}/api/network/nearby-nodes`;
    const response = await fetch(`${endpoint}?lat=${lat}&lon=${lon}&radius=0.001&limit=10`);
    
    if (!response.ok) {
      throw new Error('Failed to search for nodes');
    }
    
    const data = await response.json();
    console.log("Nearby nodes found:", data.nodes);
    
    if (data.nodes && data.nodes.length > 0) {
      setSearchResults(data.nodes);
    } else {
      setError("No nodes found near this location");
    }
  } catch (err) {
    setError(`Error searching for nearby nodes: ${err.message}`);
    console.error('Error searching for nearby nodes:', err);
  } finally {
    setIsSearching(false);
  }
};

  const handleSearch = async () => {
    if (!searchTerm.trim() && mode === 'nodeId') {
      setError('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const endpoint = `${API_BASE_URL}/api/network/nodes`;
      const params = new URLSearchParams();
      params.append('search', searchTerm);
      params.append('limit', 10);
      
      const response = await fetch(`${endpoint}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to search for nodes');
      }
      
      const data = await response.json();
      
      // Filter results by search term if needed
      const filteredNodes = data.nodes.filter(node => 
        node.id.toString().includes(searchTerm)
      );
      setSearchResults(filteredNodes);
      
      // If we have results, update the map to show them
      if (filteredNodes.length > 0) {
        updateMapWithSearchResults(filteredNodes);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error searching for nodes:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const updateMapWithSearchResults = async (nodes) => {
    try {
      // Prepare the data for the backend
      const nodeData = nodes.map(node => ({
        id: node.id,
        lat: node.lat,
        lon: node.lon
      }));
      
      // Send the node data to the backend to generate an updated map
      const response = await fetch(`${API_BASE_URL}/api/map/update-with-nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes: nodeData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update map');
      }
      
      // Get the updated map HTML
      const mapHtml = await response.text();
      setMapUrl(URL.createObjectURL(new Blob([mapHtml], { type: 'text/html' })));
    } catch (err) {
      setError(`Error updating map: ${err.message}`);
      console.error('Error updating map with search results:', err);
    }
  };

  const handleAddNode = async (node, isDepot = false) => {
    if (isDepot) {
      setDepot(node.id);
    } else {
      if (!stops.includes(node.id)) {
        setStops([...stops, node.id]);
      }
    }
    
    // Update the map to show the selected depot and stops
    try {
      const updatedStops = isDepot 
        ? stops 
        : [...stops, node.id].filter(id => id !== null);
      
      const updatedDepot = isDepot ? node.id : depot;
      
      const response = await fetch(`${API_BASE_URL}/api/map/update-route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          stops: updatedStops,
          depot: updatedDepot
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update route on map');
      }
      
      // Get the updated map HTML with the route
      const mapHtml = await response.text();
      setMapUrl(URL.createObjectURL(new Blob([mapHtml], { type: 'text/html' })));
    } catch (err) {
      setError(`Error updating route on map: ${err.message}`);
      console.error('Error updating route on map:', err);
    }
    
    // Clear search results after adding
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSearchResults([]);
    setSearchTerm('');
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('nodeId')}
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            mode === 'nodeId' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Search by Node ID
        </button>
        <button
          type="button"
          onClick={() => setMode('map')}
          className={`px-3 py-1 text-sm font-medium rounded-md ${
            mode === 'map' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Select on Map
        </button>
      </div>

      {mode === 'nodeId' ? (
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter node ID or partial ID"
            className="flex-1 block border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-64 w-full rounded-md overflow-hidden border border-gray-300" ref={mapContainerRef}>
            {isMapLoading ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <span className="text-gray-500">Loading map...</span>
              </div>
            ) : mapUrl ? (
              <iframe 
                src={mapUrl} 
                className="w-full h-full border-0"
                title="Road Network Map"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <span className="text-gray-500">Map not available</span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Click on the map to find nearby nodes. The backend will handle the node selection.
          </div>
          {isSearching && (
            <div className="text-blue-600 text-sm">
              Searching for nodes near clicked location...
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm mt-1">
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="mt-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Search Results</h4>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear Results
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Node ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((node) => (
                  <tr key={node.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900">{node.id}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {node.lat.toFixed(4)}, {node.lon.toFixed(4)}
                      {node.distance_km && <span className="ml-1 text-xs text-gray-400">({node.distance_km.toFixed(2)} km)</span>}
                    </td>
                    <td className="px-3 py-2 text-sm text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleAddNode(node, true)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        As Depot
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddNode(node, false)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        As Stop
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopSelector;