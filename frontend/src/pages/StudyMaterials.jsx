import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Trash2, Folder, Search, Filter } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function StudyMaterials() {
  const { user } = useContext(AuthContext);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [user]);

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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file && !title) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('title', title || (file ? file.name : 'Untitled Note'));
    if (file) formData.append('file', file);

    try {
      await api.post('/api/materials/upload', formData);
      setShowUploadModal(false);
      setFile(null);
      setTitle('');
      fetchMaterials();
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      await api.delete(`/api/materials/${id}`);
      setMaterials(materials.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Study Materials</h1>
          <p className="text-text-secondary">Manage your notes, PDFs, and generate AI tools.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UploadCloud size={20} /> New Upload
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input 
            type="text" 
            placeholder="Search materials..." 
            className="input-field pl-12"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass h-48 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 glass rounded-2xl border-dashed">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Folder className="text-3xl text-text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No materials yet</h3>
            <p className="text-text-secondary mb-6">Upload your first document to get started.</p>
            <button onClick={() => setShowUploadModal(true)} className="btn-secondary">Upload Document</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {materials.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="glass p-5 flex flex-col group cursor-pointer"
                  onClick={() => navigate(`/app/material/${m.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary">
                      <FileText size={24} />
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                      className="text-text-secondary hover:text-status-danger transition-colors p-2 rounded-lg hover:bg-status-danger/10 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">{m.title}</h3>
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs text-text-secondary font-medium">
                    <span>{new Date(m.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><FileText size={12} /> {m.content ? Math.round(m.content.length / 5) : 0} words</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modern Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-bg-card border border-border-subtle rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Upload Material</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Document Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field" 
                    placeholder="E.g., Quantum Physics Midterm Notes"
                  />
                </div>

                <div 
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 group cursor-pointer ${
                    isDragActive 
                      ? 'border-accent-primary bg-accent-primary/5 shadow-[0_0_30px_rgba(0,229,255,0.15)]' 
                      : 'border-border-subtle hover:bg-white/5'
                  }`}
                  onDragEnter={(e) => { e.preventDefault(); setIsDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      setFile(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files[0])}
                    accept=".pdf,.docx,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ${isDragActive ? 'bg-accent-primary/20 scale-110' : 'bg-accent-primary/10 group-hover:scale-110'}`}>
                    <UploadCloud className={`text-3xl ${isDragActive ? 'text-accent-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : 'text-accent-primary'}`} size={32} />
                  </div>
                  <p className="text-white font-semibold mb-1">
                    {file ? file.name : (isDragActive ? 'Drop file here' : 'Click or drag file to upload')}
                  </p>
                  <p className="text-sm text-text-secondary">PDF, DOCX up to 10MB</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={uploading || (!file && !title)}
                    className="flex-1 btn-primary"
                  >
                    {uploading ? 'Uploading...' : 'Upload & Process'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
