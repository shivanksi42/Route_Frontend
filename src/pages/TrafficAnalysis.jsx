import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { API_BASE_URL } from '../config';

const TrafficAnalysis = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrafficData = async () => {
      setIsLoading(true);
      try {
        // Fetch traffic data for all hours of the day (weekday)
        const weekdayData = await Promise.all(
          [...Array(24).keys()].map(hour => 
            fetch(`${API_BASE_URL}/api/traffic/predict`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ hour, day_of_week: 1 }) // Monday
            }).then(res => res.json())
          )
        );
        
        // Fetch traffic data for all hours of the day (weekend)
        const weekendData = await Promise.all(
          [...Array(24).keys()].map(hour => 
            fetch(`${API_BASE_URL}/api/traffic/predict`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ hour, day_of_week: 6 }) // Saturday
            }).then(res => res.json())
          )
        );
        
        const formattedData = weekdayData.map((data, index) => ({
          hour: index,
          weekdayTraffic: data.average_multiplier,
          weekendTraffic: weekendData[index].average_multiplier,
          weekdayMin: data.min_multiplier,
          weekdayMax: data.max_multiplier,
          weekendMin: weekendData[index].min_multiplier,
          weekendMax: weekendData[index].max_multiplier
        }));
        
        setTrafficData(formattedData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching traffic data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrafficData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>Error loading traffic data: {error}</p>
      </div>
    );
  }

  // Find rush hours (highest traffic periods)
  const rushHours = [...trafficData]
    .sort((a, b) => b.weekdayTraffic - a.weekdayTraffic)
    .slice(0, 3)
    .map(data => data.hour);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Traffic Analysis</h1>
        <p className="text-gray-500">Analyze traffic patterns throughout the day</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Traffic Comparison Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Weekday vs Weekend Traffic</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trafficData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour"
                  label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }}
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis 
                  label={{ value: 'Traffic Multiplier', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip formatter={(value) => value.toFixed(2)} labelFormatter={(hour) => `${hour}:00`} />
                <Legend />
                <Line type="monotone" dataKey="weekdayTraffic" name="Weekday" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="weekendTraffic" name="Weekend" stroke="#7c3aed" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Range Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Traffic Variability by Hour</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trafficData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour"
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis />
                <Tooltip formatter={(value) => value.toFixed(2)} labelFormatter={(hour) => `${hour}:00`} />
                <Legend />
                <Bar dataKey="weekdayTraffic" name="Weekday Avg" fill="#2563eb" />
                <Bar dataKey="weekendTraffic" name="Weekend Avg" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Rush Hour Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Rush Hour Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rushHours.map((hour, index) => {
            const hourData = trafficData.find(data => data.hour === hour);
            return (
              <div key={index} className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-md font-medium">{hour}:00 - {hour+1}:00</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm flex justify-between">
                    <span className="text-gray-500">Weekday:</span>
                    <span className="font-medium">{hourData.weekdayTraffic.toFixed(2)}x</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span className="text-gray-500">Weekend:</span>
                    <span className="font-medium">{hourData.weekendTraffic.toFixed(2)}x</span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span className="text-gray-500">Range:</span>
                    <span className="font-medium">{hourData.weekdayMin.toFixed(2)}x - {hourData.weekdayMax.toFixed(2)}x</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalysis;