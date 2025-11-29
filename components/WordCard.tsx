import React, { useState } from 'react';
import { DictionaryEntry } from '../types';
import { X, Volume2, Save, Loader2, Check } from 'lucide-react';

interface WordCardProps {
  wordData: DictionaryEntry | null;
  loading: boolean;
  onClose: () => void;
  onSave: (entry: DictionaryEntry) => void;
  isSaved: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ wordData, loading, onClose, onSave, isSaved }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!wordData && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F1] w-full max-w-md rounded-[35px] border-8 border-white shadow-2xl overflow-hidden relative transform transition-all scale-100">
        
        {/* Header Strip */}
        <div className="bg-[#76C39F] h-16 flex items-center justify-between px-6">
          <h2 className="text-white font-bold text-xl tracking-wide flex items-center gap-2">
            <span className="bg-white/20 p-1.5 rounded-full">📖</span> 
            Dictionary
          </h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 relative min-h-[300px] flex flex-col justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-[#7BA69E] gap-3">
              <Loader2 className="animate-spin" size={40} />
              <p className="font-bold animate-pulse">Asking Tom Nook...</p>
            </div>
          ) : wordData ? (
            <div className="space-y-4">
              {/* Word & IPA */}
              <div className="text-center pb-4 border-b-2 border-dashed border-[#76C39F]/30">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <h3 className="text-4xl font-extrabold text-[#555] font-['M_PLUS_Rounded_1c']">
                    {wordData.word}
                  </h3>
                  <button 
                    onClick={() => playAudio(wordData.word)}
                    disabled={isPlaying}
                    className="bg-[#76C39F] text-white p-2 rounded-full hover:bg-[#5da886] transition-colors shadow-sm active:scale-95"
                  >
                    <Volume2 size={20} />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 text-[#888]">
                  <span className="italic font-serif text-lg text-[#76C39F]">{wordData.partOfSpeech}</span>
                  <span>•</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded-md">{wordData.ipa}</span>
                </div>
              </div>

              {/* Definitions */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border-2 border-[#E0E0E0]">
                <div>
                  <h4 className="text-xs font-bold text-[#76C39F] uppercase tracking-wider mb-1">Meaning</h4>
                  <p className="text-lg font-bold text-[#444] leading-snug">{wordData.definitionEn}</p>
                  <p className="text-md text-[#666] mt-1">{wordData.definitionZh}</p>
                </div>
              </div>

              {/* Example */}
              <div className="bg-[#F0F8FF] p-4 rounded-2xl border-2 border-[#BCE0FD] relative">
                 <div className="absolute -top-3 left-4 bg-[#BCE0FD] text-[#0066CC] text-xs font-bold px-2 py-1 rounded-full">
                   Example
                 </div>
                 <div className="mt-1 flex items-start gap-2">
                    <p className="text-[#444] italic leading-relaxed text-sm">
                      "{wordData.exampleEn}"
                      <button 
                        onClick={() => playAudio(wordData.exampleEn)} 
                        className="inline-block ml-2 text-[#76C39F] hover:text-[#5da886] align-middle"
                      >
                         <Volume2 size={14} />
                      </button>
                    </p>
                 </div>
                 <p className="text-[#666] text-xs mt-1 pl-1">{wordData.exampleZh}</p>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex justify-center">
                 <button 
                   onClick={() => onSave(wordData)}
                   disabled={isSaved}
                   className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-all active:translate-y-1 active:shadow-none
                     ${isSaved 
                       ? 'bg-gray-200 text-gray-400 cursor-default' 
                       : 'bg-[#FF9E44] text-white hover:bg-[#f59033]'}`}
                 >
                   {isSaved ? <Check size={20} /> : <Save size={20} />}
                   {isSaved ? 'Collected!' : 'Collect Word'}
                 </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default WordCard;
