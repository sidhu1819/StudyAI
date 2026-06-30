import { NavLink } from 'react-router-dom';
import { FiHome, FiBook, FiCpu, FiLayers, FiEdit3, FiCalendar, FiPieChart, FiSettings, FiLogOut } from 'react-icons/fi';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: FiHome },
  { name: 'Study Materials', path: '/materials', icon: FiBook },
  { name: 'Analytics', path: '/analytics', icon: FiPieChart },
  { name: 'Study Planner', path: '/planner', icon: FiCalendar },
];

export default function Sidebar() {
  const { logout } = useContext(AuthContext);

  return (
    <div className="w-64 bg-bg-sidebar border-r border-border-subtle h-screen sticky top-0 flex flex-col p-4">
      <div className="flex items-center gap-3 px-4 py-6 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(0,229,255,0.4)]">
          S
        </div>
        <span className="text-xl font-bold tracking-tight text-white">StudyAI</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/10 text-accent-primary font-semibold'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={isActive ? 'text-accent-primary' : 'opacity-70'} size={20} />
                {item.name}
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator" 
                    className="absolute left-0 w-1 h-8 bg-accent-primary rounded-r-full shadow-[0_0_10px_rgba(0,229,255,0.8)]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-4 border-t border-border-subtle">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive ? 'bg-white/10 text-white font-semibold' : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`
          }
        >
          <FiSettings size={20} /> Settings
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-status-danger hover:bg-status-danger/10 text-left"
        >
          <FiLogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}
