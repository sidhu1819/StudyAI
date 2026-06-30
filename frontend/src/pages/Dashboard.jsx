import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiBook, FiLayers, FiCheckCircle, FiClock, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const weeklyData = [
  { name: 'Mon', hours: 2 },
  { name: 'Tue', hours: 3.5 },
  { name: 'Wed', hours: 1.5 },
  { name: 'Thu', hours: 4 },
  { name: 'Fri', hours: 2.5 },
  { name: 'Sat', hours: 5 },
  { name: 'Sun', hours: 3 },
];

const topicData = [
  { name: 'Computer Science', value: 40 },
  { name: 'Mathematics', value: 30 },
  { name: 'Physics', value: 20 },
  { name: 'Literature', value: 10 },
];
const COLORS = ['#00E5FF', '#7C3AED', '#22C55E', '#F59E0B'];

const StatCard = ({ icon: Icon, title, value, subtitle, trend, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass p-6 hover:border-accent-primary/50 transition-colors cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-accent-primary/10 transition-colors">
        <Icon className="text-accent-primary text-xl" />
      </div>
      {trend && (
        <span className={`text-sm font-semibold flex items-center gap-1 ${trend > 0 ? 'text-status-success' : 'text-status-danger'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
    <p className="text-sm font-medium text-text-secondary">{title}</p>
    {subtitle && <p className="text-xs text-text-secondary/70 mt-2">{subtitle}</p>}
  </motion.div>
);

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ materials: 0 });

  useEffect(() => {
    // Fetch some basic stats
    const fetchStats = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/materials/${user.id}`);
        setStats({ materials: res.data.materials.length });
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.id) fetchStats();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Scholar'}</span> 👋
          </h1>
          <p className="text-text-secondary text-lg">You're on a 5-day study streak! Keep the momentum going.</p>
        </div>
        <div className="glass-panel px-6 py-4 flex items-center gap-4">
          <div className="p-3 bg-accent-secondary/20 rounded-xl">
            <FiActivity className="text-accent-secondary text-2xl" />
          </div>
          <div>
            <p className="text-sm font-semibold text-accent-secondary">AI Recommendation</p>
            <p className="text-sm text-text-secondary">Review "Linear Algebra" flashcards next.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={FiBook} title="Uploaded Notes" value={stats.materials} subtitle="2 uploaded this week" trend={12} delay={0.1} />
        <StatCard icon={FiLayers} title="Flashcards Mastered" value="248" subtitle="Top 15% of users" trend={24} delay={0.2} />
        <StatCard icon={FiCheckCircle} title="Quiz Accuracy" value="86%" subtitle="Target: 90%" trend={-2} delay={0.3} />
        <StatCard icon={FiClock} title="Study Hours" value="24.5h" subtitle="This week" trend={8} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Study Progress</h3>
            <select className="bg-bg-secondary border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-secondary focus:outline-none">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#B5B5B5" tick={{fill: '#B5B5B5', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#B5B5B5" tick={{fill: '#B5B5B5', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#00E5FF' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="glass p-6"
        >
          <h3 className="text-xl font-bold text-white mb-8">Topic Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topicData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {topicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {topicData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                  <span className="text-sm text-text-secondary">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          <button className="text-sm text-accent-primary font-medium hover:underline">View All</button>
        </div>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-subtle before:to-transparent">
          {[
            { title: "Completed 'Advanced Algorithms' Quiz", time: "2 hours ago", icon: FiCheckCircle, color: "text-status-success" },
            { title: "Generated summary for 'Chapter 4: Metabolism'", time: "Yesterday", icon: FiBook, color: "text-accent-primary" },
            { title: "Mastered 45 flashcards in 'Spanish Vocabulary'", time: "2 days ago", icon: FiLayers, color: "text-accent-secondary" }
          ].map((item, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border-subtle bg-bg-card text-text-secondary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <item.icon className={item.color} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-4 rounded-xl">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-white text-sm">{item.title}</div>
                  <time className="text-xs font-medium text-text-secondary/70">{item.time}</time>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
