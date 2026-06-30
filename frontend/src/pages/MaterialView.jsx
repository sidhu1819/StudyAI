import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiBookOpen, FiLayers, FiEdit3, FiCalendar, FiRefreshCw, FiCheckCircle, FiCopy, FiDownload, FiShare2 } from 'react-icons/fi';

const Flashcard = ({ card, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const difficultyColors = {
    easy: 'bg-status-success/20 text-status-success',
    medium: 'bg-status-warning/20 text-status-warning',
    hard: 'bg-status-danger/20 text-status-danger',
  };

  return (
    <div 
      className="relative h-64 w-full cursor-pointer perspective-1000 group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden glass flex flex-col justify-center items-center p-8 text-center border border-border-subtle hover:border-accent-primary/50 transition-colors">
          <div className="absolute top-4 left-4 text-xs font-bold text-text-secondary">#{index + 1}</div>
          <h3 className="text-xl font-bold text-white">{card.front}</h3>
          <p className="absolute bottom-4 text-sm text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">Click to flip</p>
        </div>
        {/* Back */}
        <div className="absolute w-full h-full backface-hidden glass flex flex-col justify-center items-center p-8 text-center border-t-4 border-t-accent-secondary" style={{ transform: "rotateY(180deg)" }}>
          <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-md bg-white/10 text-white">Answer</div>
          <p className="text-lg font-medium text-white">{card.back}</p>
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

  const tabs = [
    { id: 'summary', name: 'AI Summary', icon: FiBookOpen },
    { id: 'flashcards', name: 'Flashcards', icon: FiLayers },
    { id: 'quiz', name: 'Practice Quiz', icon: FiEdit3 },
    { id: 'schedule', name: 'Study Planner', icon: FiCalendar },
  ];

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, flashRes, quizRes, schedRes] = await Promise.all([
        axios.get(`http://127.0.0.1:5000/api/summary/${id}`),
        axios.get(`http://127.0.0.1:5000/api/flashcards/${id}`),
        axios.get(`http://127.0.0.1:5000/api/quiz/${id}`),
        axios.get(`http://127.0.0.1:5000/api/schedule/${id}`)
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
      const res = await axios.post(`http://127.0.0.1:5000/api/${type}`, { material_id: id, user_id: user.id });
      if (type === 'summary') setSummary(res.data.summary);
      if (type === 'flashcards') setFlashcards(res.data.flashcardSet);
      if (type === 'quiz') {
        setQuiz(res.data.quiz);
        setQuizScore(null);
        setUserAnswers({});
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

  return (
    <div className="max-w-7xl mx-auto pb-12 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/materials')}
          className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-text-secondary hover:text-white"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight">Study Material Studio</h1>
          <p className="text-sm text-text-secondary mt-1">Harness AI to master this content.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Modern Segmented Control Sidebar */}
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
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-4">
          <AnimatePresence mode="wait">
            {/* SUMMARY VIEW */}
            {activeTab === 'summary' && (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                {!summary ? (
                  <div className="h-full flex flex-col items-center justify-center glass rounded-3xl border-dashed">
                    <h3 className="text-2xl font-bold text-white mb-2">Generate AI Summary</h3>
                    <p className="text-text-secondary mb-8 text-center max-w-md">Extract key insights, definitions, and important concepts instantly.</p>
                    <button onClick={() => handleGenerate('summary')} disabled={generating} className="btn-primary">
                      {generating ? 'Generating...' : 'Generate Summary'}
                    </button>
                  </div>
                ) : (
                  <div className="glass p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-subtle">
                      <h2 className="text-2xl font-bold text-white">Executive Summary</h2>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-white/5 text-text-secondary hover:text-white transition-colors"><FiCopy /></button>
                        <button className="p-2 rounded-lg bg-white/5 text-text-secondary hover:text-white transition-colors"><FiDownload /></button>
                        <button className="p-2 rounded-lg bg-white/5 text-text-secondary hover:text-white transition-colors"><FiShare2 /></button>
                        <button onClick={() => handleGenerate('summary')} disabled={generating} className="ml-2 btn-secondary flex items-center gap-2">
                          <FiRefreshCw className={generating ? 'animate-spin' : ''} /> Regenerate
                        </button>
                      </div>
                    </div>
                    <div className="markdown-body max-w-none text-lg">
                      <ReactMarkdown>{summary.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* FLASHCARDS VIEW */}
            {activeTab === 'flashcards' && (
              <motion.div 
                key="flashcards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Flashcard Deck</h2>
                        <p className="text-text-secondary mt-1">{flashcards.cards.length} cards in this deck</p>
                      </div>
                      <button onClick={() => handleGenerate('flashcards')} disabled={generating} className="btn-secondary flex items-center gap-2">
                        <FiRefreshCw className={generating ? 'animate-spin' : ''} /> Regenerate
                      </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                      {flashcards.cards.map((card, index) => (
                        <Flashcard key={index} card={card} index={index} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* QUIZ VIEW */}
            {activeTab === 'quiz' && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-bold text-white">Practice Quiz</h2>
                      <button onClick={() => handleGenerate('quiz')} disabled={generating} className="btn-secondary flex items-center gap-2">
                        <FiRefreshCw className={generating ? 'animate-spin' : ''} /> New Quiz
                      </button>
                    </div>

                    {quizScore && (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-10 p-8 glass rounded-3xl text-center relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary"></div>
                        <h4 className="text-xl font-bold text-white mb-2">Final Score</h4>
                        <div className="text-6xl font-black gradient-text">
                          {quizScore.score} / {quizScore.total}
                        </div>
                        <p className="mt-4 text-text-secondary font-medium">
                          {quizScore.score === quizScore.total ? 'Perfect! You mastered this material.' : 'Great effort! Review the incorrect answers below.'}
                        </p>
                      </motion.div>
                    )}

                    <div className="space-y-8">
                      {quiz.questions.map((q, idx) => (
                        <div key={idx} className="glass p-8 rounded-3xl">
                          <h4 className="text-xl font-semibold text-white mb-6 leading-relaxed">
                            <span className="text-accent-primary mr-2">{idx + 1}.</span> {q.question}
                          </h4>
                          <div className="space-y-3">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = userAnswers[idx] === opt;
                              const isCorrect = opt === q.answer;
                              const showResult = quizScore !== null;
                              
                              let optionClass = "border-border-subtle hover:border-white/30 hover:bg-white/5 text-text-secondary";
                              if (isSelected && !showResult) optionClass = "border-accent-primary bg-accent-primary/10 text-white";
                              if (showResult && isCorrect) optionClass = "border-status-success bg-status-success/10 text-status-success font-semibold";
                              if (showResult && isSelected && !isCorrect) optionClass = "border-status-danger bg-status-danger/10 text-status-danger";

                              return (
                                <label 
                                  key={oIdx} 
                                  className={`block p-5 rounded-2xl border-2 transition-all cursor-pointer ${optionClass}`}
                                >
                                  <input 
                                    type="radio" 
                                    name={`question-${idx}`} 
                                    value={opt}
                                    checked={isSelected}
                                    onChange={() => setUserAnswers({...userAnswers, [idx]: opt})}
                                    className="hidden"
                                    disabled={showResult}
                                  />
                                  <div className="flex items-center justify-between">
                                    <span>{opt}</span>
                                    {showResult && isCorrect && <FiCheckCircle className="text-status-success text-xl" />}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                          
                          {quizScore !== null && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-6 pt-6 border-t border-border-subtle"
                            >
                              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-xs font-bold text-accent-secondary uppercase tracking-wider mb-1 block">Explanation</span>
                                <p className="text-text-secondary text-sm leading-relaxed">{q.explanation}</p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>

                    {quizScore === null && (
                      <div className="mt-10 flex justify-center sticky bottom-6">
                         <button 
                          onClick={submitQuiz}
                          disabled={Object.keys(userAnswers).length !== quiz.questions.length}
                          className="btn-glow-purple px-12 shadow-2xl"
                         >
                           Submit Answers
                         </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* SCHEDULE VIEW */}
            {activeTab === 'schedule' && (
              <motion.div 
                key="schedule"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
                  <div className="glass p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-subtle">
                      <h2 className="text-2xl font-bold text-white">Your Study Plan</h2>
                      <button onClick={() => handleGenerate('schedule')} disabled={generating} className="btn-secondary flex items-center gap-2">
                        <FiRefreshCw className={generating ? 'animate-spin' : ''} /> Re-plan
                      </button>
                    </div>
                    <div className="markdown-body max-w-none">
                      <ReactMarkdown>{schedule.content}</ReactMarkdown>
                    </div>
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
