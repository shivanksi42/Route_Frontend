// src/components/TimeSelector.jsx
import React from 'react';

const TimeSelector = ({ value, onChange, timePeriods }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Time Period</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {timePeriods.map((period, index) => (
          <button
            key={index}
            type="button"
            className={`py-2 px-4 border rounded-md text-sm font-medium transition-colors ${
              value && value.hour === period.hour && value.day_of_week === period.day_of_week
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onChange(period)}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSelector;
