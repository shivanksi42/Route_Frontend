import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, TruckIcon, ChartBarIcon, 
  MapIcon, CogIcon, TrendingUpIcon
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <HomeIcon size={20} /> },
    { name: 'Route Optimizer', path: '/route-optimizer', icon: <TruckIcon size={20} /> },
    { name: 'Traffic Analysis', path: '/traffic-analysis', icon: <TrendingUpIcon size={20} /> },
    { name: 'Congestion Map', path: '/congestion-map', icon: <MapIcon size={20} /> },
    { name: 'Settings', path: '/settings', icon: <CogIcon size={20} /> },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-blue-800 text-white">
      <div className="flex items-center justify-center h-16 px-4 bg-blue-900">
        <h1 className="text-xl font-bold">Route Optimizer</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
               ${isActive ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-700'}`
            }
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 bg-blue-900">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="font-bold">RO</span>
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium">Route Optimizer</p>
            <p className="text-xs text-blue-300">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;