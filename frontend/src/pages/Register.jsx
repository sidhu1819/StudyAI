import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      login(res.data.user);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass p-10 rounded-3xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-black font-black text-2xl shadow-[0_0_20px_rgba(0,229,255,0.4)] mx-auto mb-4">
            S
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-text-secondary">Join StudyAI and learn 10x faster.</p>
        </div>

        {error && (
          <div className="bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              minLength="6"
            />
          </div>
          <button type="submit" className="w-full btn-primary mt-4">
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-text-secondary text-sm">
          Already have an account? <Link to="/login" className="text-white font-semibold hover:text-accent-primary transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
