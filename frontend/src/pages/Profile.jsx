import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Award, Zap, BookOpen } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [materialsCount, setMaterialsCount] = useState(0);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/materials/${user.id}`);
        setMaterialsCount(res.data.materials.length);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.id) fetchMaterials();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 mb-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary p-1 shrink-0 relative">
          <div className="w-full h-full rounded-full bg-bg-card flex items-center justify-center border-4 border-transparent">
            <span className="text-4xl font-black text-white">{user?.name?.charAt(0).toUpperCase() || 'S'}</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-bg-card rounded-full flex items-center justify-center border border-border-subtle">
            <Award className="text-accent-secondary" size={20} />
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-secondary/20 border border-accent-secondary/30 text-accent-secondary text-xs font-bold uppercase tracking-wider mb-3">
            <Zap size={14} fill="currentColor" /> Member
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{user?.name || 'Student Scholar'}</h1>
          <p className="text-text-secondary text-lg mb-6">{user?.email || 'student@university.edu'}</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            <div className="text-center md:text-left">
              <p className="text-3xl font-black text-white">{materialsCount}</p>
              <p className="text-sm font-medium text-text-secondary flex items-center gap-1"><BookOpen size={14}/> Uploaded Materials</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
