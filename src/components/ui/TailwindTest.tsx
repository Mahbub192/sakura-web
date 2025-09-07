import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🎉 Tailwind CSS is Working!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white text-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-blue-600">Primary Colors</h3>
          <p className="text-sm">Custom color scheme working</p>
        </div>
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
          <h3 className="font-semibold">Success Theme</h3>
          <p className="text-sm">Custom success colors</p>
        </div>
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
          <h3 className="font-semibold">Warning Theme</h3>
          <p className="text-sm">Custom warning colors</p>
        </div>
      </div>
      <div className="mt-4 flex space-x-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          Primary Button
        </button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          Secondary Button
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
          Success Button
        </button>
      </div>
      <div className="mt-4">
        <input 
          type="text" 
          placeholder="Input field test"
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900"
        />
      </div>
    </div>
  );
};

export default TailwindTest;
