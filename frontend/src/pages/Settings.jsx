import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Shield, Cpu, Save } from 'lucide-react';

const SettingToggle = ({ icon: Icon, title, desc, defaultChecked }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-4 glass-panel mb-4 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setChecked(!checked)}>
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white/5 rounded-lg text-text-secondary">
          <Icon size={20} />
        </div>
        <div>
          <h4 className="text-white font-medium">{title}</h4>
          <p className="text-xs text-text-secondary">{desc}</p>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-accent-primary' : 'bg-white/10'}`}>
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
};

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-text-secondary mb-10">Manage your account preferences and AI settings.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-2">
            {['General', 'Notifications', 'AI Preferences', 'Security'].map((tab, idx) => (
              <button key={idx} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${idx === 0 ? 'bg-white/10 text-white' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-xl font-bold text-white mb-4">Appearance</h3>
              <div className="glass p-6 rounded-2xl">
                <SettingToggle icon={Moon} title="Dark Mode" desc="Use the dark theme by default" defaultChecked={true} />
                <SettingToggle icon={Sun} title="Sync with System" desc="Automatically switch based on OS" defaultChecked={false} />
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-4">AI Preferences</h3>
              <div className="glass p-6 rounded-2xl">
                <SettingToggle icon={Cpu} title="Advanced Generation" desc="Use larger LLM models (slower but better)" defaultChecked={true} />
                <div className="mt-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">Default Study Schedule Length</label>
                  <select className="input-field bg-white/5">
                    <option>3 Days</option>
                    <option>5 Days</option>
                    <option>7 Days</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <button className="btn-primary flex items-center gap-2">
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
