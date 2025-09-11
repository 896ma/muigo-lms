import React from 'react';

const ColorTest = () => {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Color Test Component</h1>
      
      {/* Test Maroon Colors */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Maroon Colors:</h2>
        <div className="p-4 bg-maroon-600 text-white rounded">Maroon 600 Background</div>
        <div className="p-4 bg-maroon-500 text-white rounded">Maroon 500 Background</div>
        <div className="p-4 bg-maroon-400 text-white rounded">Maroon 400 Background</div>
        <button className="px-4 py-2 bg-maroon-600 text-white rounded hover:bg-maroon-700">
          Maroon Button
        </button>
      </div>
      
      {/* Test Jungle Colors */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Jungle Colors:</h2>
        <div className="p-4 bg-jungle-600 text-white rounded">Jungle 600 Background</div>
        <div className="p-4 bg-jungle-500 text-white rounded">Jungle 500 Background</div>
        <div className="p-4 bg-jungle-400 text-white rounded">Jungle 400 Background</div>
        <button className="px-4 py-2 bg-jungle-600 text-white rounded hover:bg-jungle-700">
          Jungle Button
        </button>
      </div>
      
      {/* Test Standard Colors */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Standard Colors (should work):</h2>
        <div className="p-4 bg-red-600 text-white rounded">Red 600 Background</div>
        <div className="p-4 bg-blue-600 text-white rounded">Blue 600 Background</div>
        <div className="p-4 bg-green-600 text-white rounded">Green 600 Background</div>
        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Red Button
        </button>
      </div>
    </div>
  );
};

export default ColorTest;

