import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🎉 Tailwind CSS is Working!</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white text-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-primary-600">Primary Colors</h3>
          <p className="text-sm">Custom color scheme working</p>
        </div>
        <div className="bg-success-100 text-success-800 p-4 rounded-lg">
          <h3 className="font-semibold">Success Theme</h3>
          <p className="text-sm">Custom success colors</p>
        </div>
        <div className="bg-warning-100 text-warning-800 p-4 rounded-lg">
          <h3 className="font-semibold">Warning Theme</h3>
          <p className="text-sm">Custom warning colors</p>
        </div>
      </div>
      <div className="mt-4 flex space-x-4">
        <button className="btn-primary">Primary Button</button>
        <button className="btn-secondary">Secondary Button</button>
        <button className="btn-success">Success Button</button>
      </div>
      <div className="mt-4">
        <input 
          type="text" 
          placeholder="Input field test"
          className="input-field text-gray-900"
        />
      </div>
    </div>
  );
};

export default TailwindTest;
