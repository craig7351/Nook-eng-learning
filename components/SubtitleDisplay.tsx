import React, { useEffect, useRef } from 'react';
import { SubtitleLine } from '../types';

interface SubtitleDisplayProps {
  subtitles: SubtitleLine[];
  currentTime: number;
  onWordClick: (word: string, context: string) => void;
}

const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({ subtitles, currentTime, onWordClick }) => {
  const activeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeEl = activeRef.current;
      
      const containerHeight = container.clientHeight;
      const activeTop = activeEl.offsetTop;
      const activeHeight = activeEl.clientHeight;

      container.scrollTo({
        top: activeTop - containerHeight / 2 + activeHeight / 2,
        behavior: 'smooth'
      });
    }
  }, [currentTime]);

  const renderTextWithClickableWords = (text: string, context: string) => {
    // Split by space but preserve rough punctuation for display, strip for logic
    return text.split(' ').map((chunk, i) => {
        // Clean word for dictionary lookup
        const cleanWord = chunk.replace(/[.,!?;:"()]/g, '');
        if (!cleanWord) return <span key={i} className="mr-1">{chunk}</span>;
        
        return (
          <span 
            key={i} 
            className="inline-block mr-1.5 cursor-pointer hover:text-[#FF9E44] hover:scale-105 transition-all rounded px-0.5 hover:bg-[#FFF4E6]"
            onClick={(e) => {
              e.stopPropagation();
              onWordClick(cleanWord, context);
            }}
          >
            {chunk}
          </span>
        );
    });
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-[30px] shadow-inner overflow-hidden border-4 border-[#FAF8F1]">
       <div className="bg-[#8FD3B4] p-3 text-center border-b-4 border-[#FAF8F1]">
          <h3 className="text-white font-bold tracking-widest text-lg drop-shadow-sm">TRANSCRIPT</h3>
       </div>
       
       <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-[#FDFDF9]">
          {subtitles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                <span className="text-4xl mb-2">🍃</span>
                <p>Waiting for video...</p>
            </div>
          ) : (
            subtitles.map((sub) => {
              const isActive = currentTime >= sub.startTime && currentTime < sub.endTime;
              
              return (
                <div 
                  key={sub.id} 
                  ref={isActive ? activeRef : null}
                  className={`transition-all duration-300 rounded-2xl p-4 border-2 ${
                    isActive 
                      ? 'bg-[#FAF8F1] border-[#76C39F] shadow-md scale-[1.02]' 
                      : 'bg-transparent border-transparent hover:bg-white hover:border-gray-100 opacity-60 hover:opacity-100'
                  }`}
                >
                  <p className="text-lg font-bold text-[#444] mb-2 leading-relaxed font-['M_PLUS_Rounded_1c']">
                    {renderTextWithClickableWords(sub.textEn, sub.textEn)}
                  </p>
                  <p className="text-md text-[#888] font-medium">
                    {sub.textZh}
                  </p>
                </div>
              );
            })
          )}
       </div>
    </div>
  );
};

export default SubtitleDisplay;
