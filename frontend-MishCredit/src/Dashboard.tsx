import React, { useRef } from 'react';
import { useAuth } from './hooks/useAuth.hook';
import { RESOURCES } from '../constants';

function Dashboard() {
  const { user, logout } = useAuth();
  const rotation = useRef(0);

  const handleRotate = () => {
    const img = document.getElementById("dashboardLogo");
    if (img) {
      rotation.current += 360;
      img.style.transform = `rotate(${rotation.current}deg)`;
      img.style.transition = "transform 1s ease-in-out";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img
                id="dashboardLogo"
                onClick={handleRotate}
                className="w-10 h-10 rounded-full cursor-pointer hover:shadow-lg transition-shadow duration-200"
                src={RESOURCES.LOGO}
                alt="App Logo"
                title="Click to rotate!"
              />
              <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.username}! 👋</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Profile</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?._id}</dd>
            </div>
          </dl>
        </div>

        {/* Fun rotating logo section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Click the logo to make it spin! 🎯
          </h3>
          <p className="text-gray-600">
            Rotation count: <span className="font-bold">{rotation.current / 360}</span> full spins
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;