import React from 'react';
import { Menu, BellIcon, ChevronDownIcon } from 'lucide-react';

const Header = ({ networkStats }) => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center md:hidden">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
              <Menu size={24} />
            </button>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex space-x-4 text-sm text-gray-600">
              {networkStats && (
                <>
                  <div className="flex items-center">
                    <span className="font-semibold">Nodes:</span>
                    <span className="ml-1">{networkStats.node_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold">Edges:</span>
                    <span className="ml-1">{networkStats.edge_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold">Road Types:</span>
                    <span className="ml-1">{Object.keys(networkStats.road_types || {}).length}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <BellIcon size={20} />
            </button>
            <div className="ml-3 relative">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">U</span>
                </div>
                <button className="ml-1 flex text-sm rounded-full focus:outline-none">
                  <span className="sr-only">Open user menu</span>
                  <ChevronDownIcon size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;