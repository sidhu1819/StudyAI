import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUploadCloud, FiFileText } from 'react-icons/fi';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'text'
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
        setError("Please provide a title");
        return;
    }
    if (uploadType === 'file' && !file) {
        setError("Please select a file");
        return;
    }
    if (uploadType === 'text' && !text) {
        setError("Please enter some text");
        return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('title', title);
    
    if (uploadType === 'file') {
      formData.append('file', file);
    } else {
      formData.append('text', text);
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploadSuccess(response.data.material);
      setFile(null);
      setText('');
      setTitle('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload material');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Upload Material</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
              
              <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setUploadType('file')}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${uploadType === 'file' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <FiUploadCloud className="inline mr-2" /> File (PDF/DOCX)
                </button>
                <button 
                  onClick={() => setUploadType('text')}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${uploadType === 'text' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <FiFileText className="inline mr-2" /> Paste Text
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Biology Chapter 4"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                {uploadType === 'file' ? (
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Select File</label>
                    <input 
                      type="file" 
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Allowed formats: PDF, DOCX, TXT</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Raw Text</label>
                    <textarea 
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste your study notes here..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none h-40 resize-none"
                    ></textarea>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-4 hover:bg-blue-600 transition flex items-center justify-center disabled:opacity-50"
                >
                  {isUploading ? 'Uploading & Extracting...' : 'Upload & Process'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
