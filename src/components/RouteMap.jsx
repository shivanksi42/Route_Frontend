// src/components/RouteMap.jsx
import React, { useEffect, useRef } from 'react';     

const RouteMap = ({ routeData, mapUrl }) => {
  const iframeRef = useRef(null);

  // Display map via iframe if mapUrl is provided
  if (mapUrl) {
    return (
      <div className="w-full h-full min-h-96 bg-white rounded-lg shadow overflow-hidden">
        <iframe
          ref={iframeRef}
          src={mapUrl}
          className="w-full h-full min-h-96 border-0"
          title="Route Map"
        />
      </div>
    );
  }

  // If no mapUrl but we have routeData, we could show a placeholder or loading state
  if (routeData) {
    return (
      <div className="w-full h-full min-h-96 bg-white rounded-lg shadow p-4 flex flex-col">
        <h3 className="text-lg font-medium text-gray-900">Route Details</h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Total Distance: {(routeData.total_distance_km || 0).toFixed(2)} km
          </p>
          <p className="text-sm text-gray-500">
            Total Time: {(routeData.total_time_minutes || 0).toFixed(2)} minutes
          </p>
          <p className="text-sm text-gray-500">
            Stops: {routeData.nodes?.length || 0}
          </p>
        </div>
        <div className="mt-4 flex-1 flex items-center justify-center bg-gray-100 rounded">
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  // If no data at all
  return (
    <div className="w-full h-full min-h-96 bg-white rounded-lg shadow p-4 flex items-center justify-center">
      <p className="text-gray-500">Select parameters and generate a route to view the map</p>
    </div>
  );
};

export default RouteMap;