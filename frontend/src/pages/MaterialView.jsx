import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Layers, Edit3, Calendar, RefreshCw, CheckCircle, Copy, Download, Share2, FileText, ChevronRight, ChevronLeft, Shuffle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const parseSchedule = (markdown) => {
  if (!markdown) return null;
  const days = markdown.split(/##?\s+Day\s+\d+:?/i).slice(1);
  if (days.length === 0) return null;
  
  return days.map((dayText, idx) => {
    const lines = dayText.trim().split('\n');
    const title = lines[0].replace(/\*/g, '').trim();
    const tasks = lines.slice(1).filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-/, '').trim());
    return { day: idx + 1, title, tasks };
  });
};

const Flashcard = ({ card, index, isFlipped, setIsFlipped }) => {
  return (
    <div 
      className="relative h-80 w-full cursor-pointer perspective-1000 group mx-auto max-w-2xl"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden glass flex flex-col justify-center items-center p-12 text-center border-2 border-border-subtle hover:border-accent-primary/50 transition-colors rounded-3xl">
          <div className="absolute top-6 left-6 text-sm font-bold text-text-secondary">Card {index + 1}</div>
          <h3 className="text-3xl font-bold text-white leading-tight">{card.front}</h3>
          <p className="absolute bottom-6 text-sm text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            Press <kbd className="bg-white/10 px-2 py-1 rounded">Space</kbd> to flip
          </p>
        </div>
        {/* Back */}
        <div className="absolute w-full h-full backface-hidden glass flex flex-col justify-center items-center p-12 text-center border-t-8 border-t-accent-secondary rounded-3xl" style={{ transform: "rotateY(180deg)" }}>
          <div className="absolute top-6 right-6 text-xs font-bold px-3 py-1.5 rounded-lg bg-accent-secondary/20 text-accent-secondary">Answer</div>
          <p className="text-2xl font-medium text-white leading-relaxed">{card.back}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default function MaterialView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [flashcards, setFlashcards] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [materialsList, setMaterialsList] = useState([]);
  
  // Flashcard State
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz State
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);

  const tabs = [
    { id: 'summary', name: 'AI Summary', icon: BookOpen },
    { id: 'flashcards', name: 'Flashcards', icon: Layers },
    { id: 'quiz', name: 'Practice Quiz', icon: Edit3 },
    { id: 'schedule', name: 'Study Planner', icon: Calendar },
  ];

  useEffect(() => {
    fetchData();
    fetchMaterialsList();
  }, [id]);

  const fetchMaterialsList = async () => {
    try {
      const res = await api.get(`/api/materials/${user.id}`);
      setMaterialsList(res.data.materials);
    } catch (err) {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, flashRes, quizRes, schedRes] = await Promise.all([
        api.get(`/api/summary/${id}`),
        api.get(`/api/flashcards/${id}`),
        api.get(`/api/quiz/${id}`),
        api.get(`/api/schedule/${id}`)
      ]);
      setSummary(sumRes.data.summary);
      setFlashcards(flashRes.data.flashcardSet);
      setQuiz(quizRes.data.quiz);
      setSchedule(schedRes.data.schedule);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type) => {
    setGenerating(true);
    try {
      const res = await api.post(`/api/${type}`, { material_id: id, user_id: user.id });
      if (type === 'summary') setSummary(res.data.summary);
      if (type === 'flashcards') {
        setFlashcards(res.data.flashcardSet);
        setCurrentCardIdx(0);
        setIsFlipped(false);
      }
      if (type === 'quiz') {
        setQuiz(res.data.quiz);
        setQuizScore(null);
        setUserAnswers({});
        setCurrentQuizIdx(0);
      }
      if (type === 'schedule') setSchedule(res.data.schedule);
    } catch (err) {
      alert(`Failed to generate ${type}`);
    } finally {
      setGenerating(false);
    }
  };

  const submitQuiz = () => {
    if (!quiz) return;
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) score++;
    });
    setQuizScore({ score, total: quiz.questions.length });
  };

  // Keyboard Shortcuts for Flashcards
  const handleKeyDown = useCallback((e) => {
    if (activeTab !== 'flashcards' || !flashcards) return;
    if (e.key === ' ') {
      e.preventDefault();
      setIsFlipped(prev => !prev);
    } else if (e.key === 'ArrowRight') {
      if (currentCardIdx < flashcards.cards.length - 1) {
        setIsFlipped(false);
        setTimeout(() => setCurrentCardIdx(prev => prev + 1), 150);
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentCardIdx > 0) {
        setIsFlipped(false);
        setTimeout(() => setCurrentCardIdx(prev => prev - 1), 150);
      }
    }
  }, [activeTab, flashcards, currentCardIdx]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const parsedSchedule = schedule ? parseSchedule(schedule.content) : null;
  const currentMaterial = materialsList.find(m => m.id === id);

  return (
    <div className="max-w-[1600px] mx-auto pb-6 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button 
          onClick={() => navigate('/app/materials')}
          className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-text-secondary hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight">{currentMaterial?.title || 'Material Studio'}</h1>
          <p className="text-sm text-text-secondary mt-1">Harness AI to master this content.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Sidebar Nav */}
        <div className="lg:w-64 shrink-0 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-semibold transition-all relative ${
                activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="active-tab-bg" 
                  className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon size={20} className={`relative z-10 ${activeTab === tab.id ? 'text-accent-primary' : ''}`} />
              <span className="relative z-10">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          <AnimatePresence mode="wait">
            
            {/* SUMMARY VIEW (Split Screen) */}
            {activeTab === 'summary' && (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex gap-6"
              >
                {/* Left Panel: Documents */}
                <div className="hidden xl:flex flex-col w-1/3 glass rounded-3xl p-6 h-full overflow-y-auto custom-scrollbar">
                  <h3 className="text-lg font-bold text-white mb-4">Your Documents</h3>
                  <div className="space-y-3">
                    {materialsList.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => navigate(`/app/material/${m.id}`)}
                        className={`w-full text-left p-4 rounded-xl flex items-start gap-3 transition-colors ${m.id === id ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'}`}
                      >
                        <FileText className={m.id === id ? 'text-accent-primary' : 'text-text-secondary'} size={20} />
                        <div>
                          <div className={`font-semibold ${m.id === id ? 'text-white' : 'text-text-secondary'}`}>{m.title}</div>
                          <div className="text-xs text-text-secondary mt-1">{new Date(m.created_at).toLocaleDateString()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Panel: Summary */}
                <div className="flex-1 h-full">
                  {!summary ? (
                    <div className="h-full flex flex-col items-center justify-center glass rounded-3xl border-dashed">
                      <h3 className="text-2xl font-bold text-white mb-2">Generate AI Summary</h3>
                      <p className="text-text-secondary mb-8 text-center max-w-md">Extract key insights, definitions, and important concepts instantly.</p>
                      <button onClick={() => handleGenerate('summary')} disabled={generating} className="btn-primary">
                        {generating ? 'Generating...' : 'Generate Summary'}
                      </button>
                    </div>
                  ) : (
                    <div className="glass p-8 rounded-3xl h-full flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between mb-6 pb-6 border-b border-border-subtle shrink-0">
                        <div>
                          <h2 className="text-2xl font-bold text-white">Executive Summary</h2>
                          <div className="text-sm text-text-secondary mt-1 flex items-center gap-2"><Clock size={14}/> ~3 min read</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg bg-white/5 text-text-secondary hover:text-white transition-colors" title="Copy"><Copy size={18} /></button>
                          <button className="p-2 rounded-lg bg-white/5 text-text-secondary hover:text-white transition-colors" title="Download"><Download size={18} /></button>
                          <button onClick={() => handleGenerate('summary')} disabled={generating} className="ml-2 btn-secondary flex items-center gap-2 text-sm">
                            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} /> Regenerate
                          </button>
                        </div>
                      </div>
                      <div className="markdown-body max-w-none text-lg overflow-y-auto custom-scrollbar pr-4 pb-12">
                        <ReactMarkdown>{summary.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* FLASHCARDS VIEW */}
            {activeTab === 'flashcards' && (
              <motion.div 
                key="flashcards"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                {!flashcards ? (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass rounded-3xl border-dashed">
                    <h3 className="text-2xl font-bold text-white mb-2">Create Flashcards</h3>
                    <p className="text-text-secondary mb-8 text-center max-w-md">Turn your notes into interactive flashcards to test your memory.</p>
                    <button onClick={() => handleGenerate('flashcards')} disabled={generating} className="btn-primary">
                      {generating ? 'Generating...' : 'Generate Flashcards'}
                    </button>
                  </div>
                ) : (
                  <div className="glass p-8 rounded-3xl flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-12">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Flashcard Deck</h2>
                        <p className="text-text-secondary mt-1">Master these concepts using spaced repetition.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button onClick={() => {
                          const shuffled = [...flashcards.cards].sort(() => 0.5 - Math.random());
                          setFlashcards({cards: shuffled});
                          setCurrentCardIdx(0);
                          setIsFlipped(false);
                        }} className="btn-secondary flex items-center gap-2 text-sm">
                          <Shuffle size={16} /> Shuffle
                        </button>
                        <button onClick={() => handleGenerate('flashcards')} disabled={generating} className="btn-secondary flex items-center gap-2 text-sm">
                          <RefreshCw size={16} className={generating ? 'animate-spin' : ''} /> Regenerate
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center">
                      <Flashcard 
                        card={flashcards.cards[currentCardIdx]} 
                        index={currentCardIdx} 
                        isFlipped={isFlipped}
                        setIsFlipped={setIsFlipped}
                      />
                      
                      {/* Controls */}
                      <div className="flex items-center justify-center gap-8 mt-12 w-full max-w-md">
                        <button 
                          onClick={() => { setIsFlipped(false); setTimeout(() => setCurrentCardIdx(prev => prev - 1), 150); }}
                          disabled={currentCardIdx === 0}
                          className="p-4 rounded-full glass hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        
                        <div className="text-center font-bold text-xl text-white min-w-[100px]">
                          {currentCardIdx + 1} <span className="text-text-secondary font-medium">/ {flashcards.cards.length}</span>
                        </div>
                        
                        <button 
                          onClick={() => { setIsFlipped(false); setTimeout(() => setCurrentCardIdx(prev => prev + 1), 150); }}
                          disabled={currentCardIdx === flashcards.cards.length - 1}
                          className="p-4 rounded-full glass hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full max-w-xl bg-white/5 h-2 rounded-full mt-10 overflow-hidden">
                        <div 
                          className="h-full bg-accent-primary transition-all duration-300"
                          style={{ width: `${((currentCardIdx + 1) / flashcards.cards.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* QUIZ VIEW */}
            {activeTab === 'quiz' && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                {!quiz ? (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass rounded-3xl border-dashed">
                    <h3 className="text-2xl font-bold text-white mb-2">Practice Exam</h3>
                    <p className="text-text-secondary mb-8 text-center max-w-md">Test your comprehension with an AI-generated multiple-choice quiz.</p>
                    <button onClick={() => handleGenerate('quiz')} disabled={generating} className="btn-primary">
                      {generating ? 'Generating...' : 'Generate Quiz'}
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex gap-6">
                    {/* Left Panel: Question Navigator */}
                    <div className="hidden lg:flex flex-col w-64 shrink-0 glass rounded-3xl p-6 h-full">
                      <h3 className="text-lg font-bold text-white mb-6">Exam Navigator</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {quiz.questions.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentQuizIdx(idx)}
                            className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                              currentQuizIdx === idx ? 'bg-accent-primary text-black' :
                              userAnswers[idx] ? 'bg-white/20 text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                      {quizScore === null && (
                        <button 
                          onClick={submitQuiz}
                          disabled={Object.keys(userAnswers).length !== quiz.questions.length}
                          className="mt-auto btn-primary w-full shadow-lg shadow-accent-primary/20"
                        >
                          Submit Exam
                        </button>
                      )}
                      {quizScore !== null && (
                        <button 
                          onClick={() => handleGenerate('quiz')}
                          className="mt-auto btn-secondary w-full"
                        >
                          Retake Exam
                        </button>
                      )}
                    </div>

                    {/* Right Panel: Quiz Area */}
                    <div className="flex-1 h-full overflow-y-auto custom-scrollbar">
                      {quizScore !== null ? (
                        <div className="glass p-12 rounded-3xl flex flex-col items-center justify-center min-h-full">
                          <h2 className="text-3xl font-bold text-white mb-8">Exam Results</h2>
                          <div className="w-64 h-64 relative mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Correct', value: quizScore.score },
                                    { name: 'Incorrect', value: quizScore.total - quizScore.score }
                                  ]}
                                  cx="50%" cy="50%" innerRadius={80} outerRadius={100}
                                  startAngle={90} endAngle={-270}
                                  dataKey="value" stroke="none"
                                >
                                  <Cell fill="#22C55E" />
                                  <Cell fill="rgba(255,255,255,0.1)" />
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-5xl font-black text-white">{Math.round((quizScore.score / quizScore.total) * 100)}%</span>
                              <span className="text-text-secondary font-medium mt-1">Accuracy</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-12 text-center">
                            <div>
                              <div className="text-3xl font-bold text-status-success">{quizScore.score}</div>
                              <div className="text-sm text-text-secondary mt-1">Correct Answers</div>
                            </div>
                            <div>
                              <div className="text-3xl font-bold text-status-danger">{quizScore.total - quizScore.score}</div>
                              <div className="text-sm text-text-secondary mt-1">Incorrect Answers</div>
                            </div>
                          </div>
                          
                          <button onClick={() => setQuizScore(null)} className="mt-12 text-accent-primary hover:underline font-medium">
                            Review Explanations
                          </button>
                        </div>
                      ) : (
                        <div className="glass p-10 rounded-3xl min-h-full flex flex-col">
                          <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xl font-bold text-accent-secondary uppercase tracking-wider">Question {currentQuizIdx + 1} of {quiz.questions.length}</h4>
                            <div className="text-text-secondary font-medium">Timer: <span className="text-white">12:45</span></div>
                          </div>
                          
                          <h3 className="text-3xl font-semibold text-white mb-10 leading-tight">
                            {quiz.questions[currentQuizIdx].question}
                          </h3>
                          
                          <div className="space-y-4 mb-10 flex-1">
                            {quiz.questions[currentQuizIdx].options.map((opt, oIdx) => {
                              const isSelected = userAnswers[currentQuizIdx] === opt;
                              return (
                                <label 
                                  key={oIdx} 
                                  className={`block p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                                    isSelected 
                                      ? "border-accent-primary bg-accent-primary/10 text-white shadow-[0_0_20px_rgba(0,229,255,0.15)]" 
                                      : "border-border-subtle hover:border-white/30 hover:bg-white/5 text-text-secondary"
                                  }`}
                                >
                                  <input 
                                    type="radio" 
                                    name={`question-${currentQuizIdx}`} 
                                    value={opt}
                                    checked={isSelected}
                                    onChange={() => setUserAnswers({...userAnswers, [currentQuizIdx]: opt})}
                                    className="hidden"
                                  />
                                  <div className="flex items-center gap-4 text-lg">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-accent-primary' : 'border-text-secondary'}`}>
                                      {isSelected && <div className="w-3 h-3 rounded-full bg-accent-primary"></div>}
                                    </div>
                                    <span>{opt}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-border-subtle mt-auto">
                            <button 
                              onClick={() => setCurrentQuizIdx(prev => prev - 1)}
                              disabled={currentQuizIdx === 0}
                              className="btn-secondary"
                            >
                              Previous
                            </button>
                            <button 
                              onClick={() => setCurrentQuizIdx(prev => prev + 1)}
                              disabled={currentQuizIdx === quiz.questions.length - 1}
                              className="btn-secondary"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SCHEDULE VIEW */}
            {activeTab === 'schedule' && (
              <motion.div 
                key="schedule"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                {!schedule ? (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass rounded-3xl border-dashed">
                    <h3 className="text-2xl font-bold text-white mb-2">Study Planner</h3>
                    <p className="text-text-secondary mb-8 text-center max-w-md">Generate a personalized, multi-day study schedule to tackle this material.</p>
                    <button onClick={() => handleGenerate('schedule')} disabled={generating} className="btn-primary">
                      {generating ? 'Generating...' : 'Generate Study Plan'}
                    </button>
                  </div>
                ) : (
                  <div className="glass p-8 rounded-3xl min-h-full">
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-border-subtle">
                      <div>
                        <h2 className="text-3xl font-bold text-white">Your Study Timeline</h2>
                        <p className="text-text-secondary mt-1">Structured learning path for maximum retention.</p>
                      </div>
                      <button onClick={() => handleGenerate('schedule')} disabled={generating} className="btn-secondary flex items-center gap-2">
                        <RefreshCw className={generating ? 'animate-spin' : ''} size={18} /> Regenerate
                      </button>
                    </div>
                    
                    {parsedSchedule ? (
                      <div className="space-y-6">
                        {parsedSchedule.map((day, idx) => (
                          <div key={idx} className="flex flex-col md:flex-row gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                            <div className="md:w-32 shrink-0">
                              <div className="text-sm font-bold text-accent-secondary uppercase tracking-widest mb-1">Day {day.day}</div>
                              <div className="text-xl font-bold text-white leading-tight">{day.title}</div>
                            </div>
                            <div className="flex-1 space-y-3">
                              {day.tasks.map((task, tIdx) => (
                                <label key={tIdx} className="flex items-start gap-3 group cursor-pointer">
                                  <div className="w-5 h-5 rounded border border-text-secondary mt-0.5 group-hover:border-accent-primary flex items-center justify-center transition-colors">
                                    <CheckCircle size={14} className="text-accent-primary opacity-0 group-hover:opacity-50" />
                                  </div>
                                  <span className="text-text-secondary group-hover:text-white transition-colors leading-relaxed">{task}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="markdown-body max-w-none">
                        <ReactMarkdown>{schedule.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
