import React from 'react';

const StatCard = ({ title, value, icon, change, changeType }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${
          changeType === 'positive' ? 'bg-green-100 text-green-600' : 
          changeType === 'negative' ? 'bg-red-100 text-red-600' : 
          'bg-blue-100 text-blue-600'
        }`}>
          {icon}
        </div>
      </div>
      {change && (
        <div className="flex items-center mt-2">
          <span className={
            changeType === 'positive' ? 'text-green-600' : 
            changeType === 'negative' ? 'text-red-600' : 
            'text-blue-600'
          }>
            {change}
          </span>
          <span className="text-gray-500 text-sm ml-1">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;