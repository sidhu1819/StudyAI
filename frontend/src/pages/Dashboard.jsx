import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Clock, FileText, UploadCloud, Layers, Edit3, FolderOpen, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, title, value, subtitle, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass p-6 hover:border-accent-primary/50 transition-colors cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-accent-primary/10 transition-colors">
        <Icon className="text-accent-primary text-xl" size={24} />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-1 truncate">{value}</h3>
    <p className="text-sm font-medium text-text-secondary">{title}</p>
    {subtitle && <p className="text-xs text-text-secondary/70 mt-2 truncate">{subtitle}</p>}
  </motion.div>
);

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.get(`/api/materials/${user.id}`);
        setMaterials(res.data.materials);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchMaterials();
  }, [user]);

  const hasDocs = materials.length > 0;
  const latestDoc = hasDocs ? materials[0] : null;

  // Process data for Line Chart (Uploads Over Time)
  const processChartData = () => {
    if (!hasDocs) return [];
    
    // Group by date
    const dateCounts = {};
    materials.forEach(m => {
      const d = new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    });

    // Create array and sort chronologically
    const chartData = Object.keys(dateCounts).map(date => ({
      name: date,
      uploads: dateCounts[date],
      timestamp: new Date(date).getTime()
    })).sort((a, b) => a.timestamp - b.timestamp);

    return chartData;
  };

  const chartData = processChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasDocs) {
    return (
      <div className="max-w-7xl mx-auto h-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-3xl text-center max-w-2xl w-full border-dashed"
        >
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="text-5xl text-text-secondary" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">No Study Materials Uploaded</h2>
          <p className="text-text-secondary text-lg mb-8 leading-relaxed">
            Upload your first document to begin generating beautiful summaries, practice quizzes, and interactive flashcards instantly with AI.
          </p>
          <button 
            onClick={() => navigate('/app/materials')}
            className="btn-primary text-lg px-8 py-4 mx-auto flex items-center gap-2"
          >
            <UploadCloud size={24} /> Upload Material
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Scholar'}</span> 👋
        </h1>
        <p className="text-text-secondary text-lg">Here is an overview of your uploaded materials.</p>
      </motion.div>

      {/* QUICK ACTIONS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 mb-10"
      >
        <button onClick={() => navigate('/app/materials')} className="btn-secondary flex items-center gap-2">
          <UploadCloud size={18} /> Upload Material
        </button>
        <button onClick={() => navigate(`/app/material/${latestDoc.id}`)} className="btn-secondary flex items-center gap-2">
          <Book size={18} /> Generate Summary
        </button>
        <button onClick={() => navigate(`/app/material/${latestDoc.id}`)} className="btn-secondary flex items-center gap-2">
          <Layers size={18} /> Create Flashcards
        </button>
        <button onClick={() => navigate(`/app/material/${latestDoc.id}`)} className="btn-secondary flex items-center gap-2">
          <Edit3 size={18} /> Generate Quiz
        </button>
      </motion.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          icon={Book} 
          title="Total Documents" 
          value={materials.length} 
          subtitle="Processed by AI" 
          delay={0.1} 
        />
        <StatCard 
          icon={FileText} 
          title="Latest Document" 
          value={latestDoc.title} 
          subtitle="Most recently uploaded" 
          delay={0.2} 
        />
        <StatCard 
          icon={Clock} 
          title="Latest Upload Date" 
          value={new Date(latestDoc.created_at).toLocaleDateString()} 
          subtitle="Keep up the momentum" 
          delay={0.3} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* LINE CHART */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Documents Uploaded Over Time</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#BDBDBD" tick={{fill: '#BDBDBD', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#BDBDBD" tick={{fill: '#BDBDBD', fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#00E5FF' }}
                />
                <Area type="monotone" dataKey="uploads" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* FILLER FOR LAYOUT */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass p-6 flex flex-col items-center justify-center text-center"
        >
           <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mb-6">
              <Book className="text-accent-primary" size={32} />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">Ready to study?</h3>
           <p className="text-text-secondary mb-6">Open your latest document to begin interacting with the AI.</p>
           <button onClick={() => navigate(`/app/material/${latestDoc.id}`)} className="btn-primary w-full flex justify-center items-center gap-2">
             Open Latest <ArrowRight size={18} />
           </button>
        </motion.div>
      </div>

      {/* RECENT DOCUMENTS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Documents</h3>
          <button onClick={() => navigate('/app/materials')} className="text-sm text-accent-primary font-medium hover:underline">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-sm text-text-secondary">
                <th className="pb-3 font-medium px-4">Document Name</th>
                <th className="pb-3 font-medium px-4">Upload Date</th>
                <th className="pb-3 font-medium px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.slice(0, 5).map((m, idx) => (
                <tr key={idx} className="border-b border-border-subtle/50 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => navigate(`/app/material/${m.id}`)}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
                        <FileText size={20} />
                      </div>
                      <span className="font-semibold text-white group-hover:text-accent-primary transition-colors line-clamp-1">{m.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-text-secondary text-sm">
                    {new Date(m.created_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-accent-primary text-sm font-medium hover:underline flex items-center justify-end gap-1 w-full">
                      Open <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
