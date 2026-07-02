import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UploadCloud, FileText, Layers, Edit3, Calendar, PieChart, ArrowRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5 }}
    className="glass p-6 group cursor-pointer"
  >
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-accent-primary/10 transition-colors">
      <Icon className="text-text-secondary group-hover:text-accent-primary transition-colors" size={24} />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-text-secondary leading-relaxed">{description}</p>
  </motion.div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-hidden selection:bg-accent-primary/30">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">StudyAI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-text-secondary hover:text-white font-medium transition-colors">Sign In</Link>
          <Link to="/register" className="btn-primary py-2 px-5 rounded-lg text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-20 pb-32 px-8 max-w-7xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-accent-primary/20 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-accent-secondary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-accent-primary/30">
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
              <span className="text-sm font-medium text-text-secondary">StudyAI V3 is now live</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-tight">
              Study Smarter <br/>
              <span className="gradient-text italic pr-4">with AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload notes, generate summaries, create quizzes, flashcards and personalized study plans using AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2 group">
                Start Learning <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                Explore Features
              </a>
            </div>
          </motion.div>

          {/* Animated Statistics */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border-subtle"
          >
            {[
              { value: "10x", label: "Faster Learning" },
              { value: "2M+", label: "Flashcards Created" },
              { value: "99%", label: "Quiz Accuracy" },
              { value: "50k+", label: "Active Students" }
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-text-secondary uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-32 px-8 bg-bg-secondary relative border-t border-border-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Everything you need to ace your exams.</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">A complete suite of AI tools designed to transform any document into an interactive learning experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={UploadCloud} title="Smart Upload" description="Drag and drop your PDFs and DOCX files. Our AI instantly processes and understands your material." delay={0.1} />
            <FeatureCard icon={FileText} title="AI Summaries" description="Extract key insights, definitions, and important concepts into highly readable executive summaries." delay={0.2} />
            <FeatureCard icon={Layers} title="3D Flashcards" description="Automatically generate interactive flashcards with spaced repetition difficulty ratings." delay={0.3} />
            <FeatureCard icon={Edit3} title="Practice Quizzes" description="Test your knowledge with multiple choice exams graded instantly with detailed explanations." delay={0.4} />
            <FeatureCard icon={Calendar} title="Study Schedules" description="Get a personalized day-by-day study timeline to ensure you master the topic before exam day." delay={0.5} />
            <FeatureCard icon={PieChart} title="Deep Analytics" description="Track your study hours, quiz accuracy, and weak topics across a beautiful interactive dashboard." delay={0.6} />
          </div>
        </div>
      </section>
    </div>
  );
}
