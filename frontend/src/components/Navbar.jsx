import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 p-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800 tracking-tight">
          Study<span className="text-primary">AI</span>
        </Link>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Hello, {user.name || user.email}</span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-4 py-2 text-primary font-semibold hover:text-blue-700 transition">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
