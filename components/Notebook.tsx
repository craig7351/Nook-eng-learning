
import React, { useState, useRef } from 'react';
import { DictionaryEntry } from '../types';
import { Trash2, Volume2, Book, Download, Upload, Brain, Check, XCircle, Trophy } from 'lucide-react';

interface NotebookProps {
  words: DictionaryEntry[];
  isOpen: boolean;
  onClose: () => void;
  onDelete: (word: string) => void;
  onImport: (words: DictionaryEntry[]) => void;
}

type Tab = 'collection' | 'quiz';

const Notebook: React.FC<NotebookProps> = ({ words, isOpen, onClose, onDelete, onImport }) => {
  const [activeTab, setActiveTab] = useState<Tab>('collection');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<{target: DictionaryEntry, options: DictionaryEntry[]}[]>([]);

  // Sound Effects (using simple speech synthesis as placeholders for SFX)
  const playSound = (type: 'correct' | 'wrong' | 'win') => {
      // In a real app, use Audio() with mp3 files. Here using synthesis to save assets.
      if ('speechSynthesis' in window) {
          // just silent feedback or logic here
      }
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }
  };

  // --- Import / Export Logic ---
  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "nook_vocabulary.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const importedWords = JSON.parse(event.target?.result as string);
              if (Array.isArray(importedWords)) {
                  onImport(importedWords);
                  alert(`Successfully imported ${importedWords.length} words!`);
              }
          } catch (err) {
              alert("Invalid JSON file");
          }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Quiz Logic ---
  const startQuiz = () => {
      if (words.length < 4) {
          alert("You need at least 4 words to start a quiz!");
          return;
      }
      
      // Generate 5 questions or max words
      const questionCount = Math.min(5, words.length);
      const shuffledWords = [...words].sort(() => 0.5 - Math.random());
      const selectedWords = shuffledWords.slice(0, questionCount);

      const questions = selectedWords.map(target => {
          // Pick 3 random distractors that are NOT the target
          const distractors = words
              .filter(w => w.word !== target.word)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3);
          
          // Combine and shuffle options
          const options = [target, ...distractors].sort(() => 0.5 - Math.random());
          return { target, options };
      });

      setQuizQuestions(questions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizStarted(true);
      setShowResult(false);
      setSelectedOption(null);
  };

  const handleAnswer = (option: DictionaryEntry) => {
      if (selectedOption !== null) return; // Prevent double click

      const isCorrect = option.word === quizQuestions[currentQuestionIndex].target.word;
      if (isCorrect) {
          setScore(s => s + 1);
          playSound('correct');
      } else {
          playSound('wrong');
      }

      // Hack to store index for UI highlighting
      const optionIndex = quizQuestions[currentQuestionIndex].options.indexOf(option);
      setSelectedOption(optionIndex);

      setTimeout(() => {
          if (currentQuestionIndex < quizQuestions.length - 1) {
              setCurrentQuestionIndex(prev => prev + 1);
              setSelectedOption(null);
          } else {
              setShowResult(true);
              playSound('win');
          }
      }, 1500);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[2px]" onClick={onClose}></div>
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#FAF8F1] z-50 shadow-2xl transform transition-transform duration-300 ease-out border-l-8 border-[#F3E5AB] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
            
            {/* Header */}
            <div className="bg-[#FF9E44] p-4 shadow-md">
                <div className="flex items-center justify-between mb-4">
                     <h2 className="text-white font-bold text-xl flex items-center gap-2 drop-shadow-md">
                        <Book className="fill-white" />
                        Nook's Notebook
                    </h2>
                    <button 
                      onClick={onClose}
                      className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full font-bold text-sm transition-colors"
                    >
                        Close
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-[#e88d3a] p-1 rounded-full">
                    <button 
                        onClick={() => setActiveTab('collection')}
                        className={`flex-1 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'collection' ? 'bg-white text-[#FF9E44] shadow-sm' : 'text-white/80 hover:text-white'}`}
                    >
                        Collection
                    </button>
                    <button 
                        onClick={() => setActiveTab('quiz')}
                        className={`flex-1 py-1.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'quiz' ? 'bg-white text-[#FF9E44] shadow-sm' : 'text-white/80 hover:text-white'}`}
                    >
                        <Brain size={14} />
                        Quiz Mode
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-[#FAF8F1]">
                
                {/* --- COLLECTION TAB --- */}
                {activeTab === 'collection' && (
                    <div className="h-full flex flex-col">
                         {/* Toolbar */}
                        <div className="px-4 py-2 border-b border-[#F3E5AB] flex justify-between items-center bg-[#FDFDF9]">
                            <span className="text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                                {words.length} Words Collected
                            </span>
                            <div className="flex gap-2">
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    onChange={handleFileChange} 
                                />
                                <button onClick={handleImportClick} title="Import JSON" className="p-2 text-[#76C39F] hover:bg-[#E6F5EE] rounded-full transition-colors">
                                    <Upload size={18} />
                                </button>
                                <button onClick={handleExport} title="Export JSON" className="p-2 text-[#FF9E44] hover:bg-[#FFF4E6] rounded-full transition-colors">
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
                            {words.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <span className="text-4xl mb-4 opacity-50">🍃</span>
                                    <p>No words collected yet!</p>
                                    <p className="text-sm">Click subtitles to add words.</p>
                                </div>
                            ) : (
                                words.map((entry, idx) => (
                                    <div key={idx} className="bg-white rounded-xl p-4 border-2 border-[#E0E0E0] hover:border-[#FF9E44] transition-colors group shadow-[2px_2px_0_rgba(0,0,0,0.05)]">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg text-[#444] font-['M_PLUS_Rounded_1c']">{entry.word}</h3>
                                                <span className="text-xs text-[#76C39F] font-bold bg-[#E6F5EE] px-2 py-0.5 rounded-full">{entry.partOfSpeech}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <button 
                                                onClick={() => playAudio(entry.word)}
                                                className="p-2 text-gray-400 hover:text-[#76C39F] transition-colors"
                                                >
                                                    <Volume2 size={18} />
                                                </button>
                                                <button 
                                                onClick={() => onDelete(entry.word)}
                                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 border-t border-dashed pt-2 mt-1">
                                            {entry.definitionEn}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-0.5">
                                            {entry.definitionZh}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* --- QUIZ TAB --- */}
                {activeTab === 'quiz' && (
                    <div className="h-full p-6 flex flex-col items-center justify-center bg-[radial-gradient(#F3E5AB_15%,transparent_16%)] bg-[length:20px_20px]">
                        {!quizStarted ? (
                            <div className="bg-white p-8 rounded-[30px] shadow-xl text-center border-4 border-[#FF9E44] max-w-sm">
                                <div className="text-5xl mb-4">🎓</div>
                                <h3 className="text-2xl font-bold text-[#444] mb-2 font-['M_PLUS_Rounded_1c']">Pop Quiz!</h3>
                                <p className="text-gray-500 mb-6">Review your words. I will ask you {Math.min(5, words.length)} questions.</p>
                                <button 
                                    onClick={startQuiz}
                                    disabled={words.length < 4}
                                    className={`w-full py-3 rounded-xl font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.1)] active:translate-y-1 active:shadow-none transition-all
                                        ${words.length < 4 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#76C39F] hover:bg-[#65b38d]'}`}
                                >
                                    {words.length < 4 ? 'Need 4 words' : 'Start Quiz'}
                                </button>
                            </div>
                        ) : showResult ? (
                             <div className="bg-white p-8 rounded-[30px] shadow-xl text-center border-4 border-[#76C39F] animate-fade-in w-full max-w-sm">
                                <Trophy className="w-16 h-16 mx-auto text-[#FF9E44] mb-4" />
                                <h3 className="text-2xl font-bold text-[#444] mb-2">Quiz Complete!</h3>
                                <p className="text-lg mb-6">
                                    You scored <span className="font-bold text-[#76C39F] text-2xl">{score}</span> / {quizQuestions.length}
                                </p>
                                <button 
                                    onClick={() => setQuizStarted(false)}
                                    className="w-full bg-[#FF9E44] text-white py-3 rounded-xl font-bold hover:bg-[#f59033] shadow-[0_4px_0_#d67d2b] active:translate-y-1 active:shadow-none"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div className="w-full max-w-md">
                                {/* Progress */}
                                <div className="flex justify-between text-xs font-bold text-[#8B7355] mb-2 px-2">
                                    <span>Question {currentQuestionIndex + 1}</span>
                                    <span>Score: {score}</span>
                                </div>
                                
                                {/* Question Box */}
                                <div className="bg-white rounded-[30px] border-4 border-[#76C39F] p-8 text-center shadow-lg relative mb-6">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#76C39F] text-white px-4 py-1 rounded-full text-xs font-bold">
                                        Translate this
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-[#444] mb-2 font-['M_PLUS_Rounded_1c']">
                                        {quizQuestions[currentQuestionIndex].target.word}
                                    </h2>
                                    <button onClick={() => playAudio(quizQuestions[currentQuestionIndex].target.word)} className="text-[#76C39F] hover:scale-110 transition-transform">
                                        <Volume2 size={24} />
                                    </button>
                                </div>

                                {/* Options */}
                                <div className="grid gap-3">
                                    {quizQuestions[currentQuestionIndex].options.map((opt, idx) => {
                                        const isSelected = selectedOption === idx;
                                        const isCorrect = opt.word === quizQuestions[currentQuestionIndex].target.word;
                                        
                                        let btnClass = "bg-white border-2 border-[#E0E0E0] text-[#555] hover:border-[#FF9E44]";
                                        if (selectedOption !== null) {
                                            if (isCorrect) btnClass = "bg-[#76C39F] border-[#76C39F] text-white";
                                            else if (isSelected) btnClass = "bg-red-400 border-red-400 text-white";
                                            else btnClass = "bg-gray-100 border-gray-100 text-gray-400 opacity-50";
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswer(opt)}
                                                disabled={selectedOption !== null}
                                                className={`w-full p-4 rounded-xl font-bold text-left transition-all shadow-[0_2px_0_rgba(0,0,0,0.05)] flex items-center justify-between ${btnClass}`}
                                            >
                                                <span className="truncate mr-2">{opt.definitionZh}</span>
                                                {selectedOption !== null && isCorrect && <Check size={20} />}
                                                {selectedOption !== null && isSelected && !isCorrect && <XCircle size={20} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="p-3 bg-[#F3E5AB] text-center text-[#8B7355] text-[10px] font-bold uppercase tracking-widest">
                Animal Crossing Vocabulary
            </div>
        </div>
      </div>
    </>
  );
};

export default Notebook;
