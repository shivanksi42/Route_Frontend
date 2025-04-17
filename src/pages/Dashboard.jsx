import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { TruckIcon, ClockIcon, MapIcon, TrendingUpIcon } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [congestionData, setCongestionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch network stats
        const statsResponse = await fetch(`${API_BASE_URL}/api/network/stats`);
        if (!statsResponse.ok) throw new Error('Failed to fetch network stats');
        const statsData = await statsResponse.json();
        
        // Fetch congestion data
        const congestionResponse = await fetch(`${API_BASE_URL}/api/congestion/classify`);
        if (!congestionResponse.ok) throw new Error('Failed to fetch congestion data');
        const congestionData = await congestionResponse.json();
        
        setStats(statsData);
        setCongestionData(congestionData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
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
        <p>Error loading dashboard data: {error}</p>
      </div>
    );
  }

  const roadTypeCount = stats ? Object.keys(stats.road_types).length : 0;
  const highCongestionCount = congestionData ? congestionData.risk_counts.high : 0;
  const highCongestionPercentage = congestionData ? 
    ((highCongestionCount / congestionData.total_roads) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of this route optimization system</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Nodes" 
          value={stats ? stats.node_count.toLocaleString() : '-'} 
          icon={<MapIcon size={24} />} 
          changeType="neutral" 
        />
        <StatCard 
          title="Total Roads" 
          value={stats ? stats.edge_count.toLocaleString() : '-'} 
          icon={<TruckIcon size={24} />} 
          changeType="neutral" 
        />
        <StatCard 
          title="Road Types" 
          value={roadTypeCount} 
          icon={<TrendingUpIcon size={24} />} 
          changeType="neutral" 
        />
        <StatCard 
          title="High Congestion" 
          value={`${highCongestionPercentage}%`} 
          icon={<ClockIcon size={24} />} 
          changeType="negative" 
          change="+2.1%" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Road Types Distribution</h2>
          <div className="space-y-4">
            {stats && Object.entries(stats.road_types).map(([type, count], index) => {
              const percentage = ((count / stats.edge_count) * 100).toFixed(1);
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{type}</span>
                    <span className="text-gray-500">{count.toLocaleString()} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Traffic Congestion Levels</h2>
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
      </div>
    </div>
  );
};

export default Dashboard;

