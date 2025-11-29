
import React, { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Search, Play, BookOpen, Leaf, AlertCircle, Info } from 'lucide-react';
import { SubtitleLine, DictionaryEntry, AppState } from './types';
import SubtitleDisplay from './components/SubtitleDisplay';
import WordCard from './components/WordCard';
import Notebook from './components/Notebook';
import { lookupWord, generateDemoTranscript } from './services/geminiService';

// Mock Data for the default "Animal Crossing" trailer experience
const DEMO_VIDEO_ID = "_3YNL0OWio0";
const DEMO_TRANSCRIPT: SubtitleLine[] = [
  { id: '1', startTime: 0, endTime: 4.5, textEn: "Tom Nook here! Welcome to your new island life.", textZh: "我是狸克！歡迎來到你的新島嶼生活。" },
  { id: '2', startTime: 4.5, endTime: 8.5, textEn: "The getaway package includes a tent, a lamp, and a radio.", textZh: "無人島移居套餐包含一個帳篷、一盞燈和一台收音機。" },
  { id: '3', startTime: 8.5, endTime: 13, textEn: "Explore the wilderness, catch bugs, and fish in the river.", textZh: "探索荒野、捕捉昆蟲，並在河邊釣魚。" },
  { id: '4', startTime: 13, endTime: 17, textEn: "Don't forget to pay your mortgage with bells!", textZh: "別忘了用鈴錢支付你的房貸！" },
  { id: '5', startTime: 17, endTime: 22, textEn: "Create your own paradise and invite friends over.", textZh: "創造你自己的天堂並邀請朋友過來。" },
  { id: '6', startTime: 22, endTime: 27, textEn: "The possibilities are endless on the horizon.", textZh: "在地平線上，可能性是無限的。" },
];

function App() {
  // State
  const [videoId, setVideoId] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  
  // Dictionary / Interaction State
  const [selectedWordData, setSelectedWordData] = useState<DictionaryEntry | null>(null);
  const [isDictionaryLoading, setIsDictionaryLoading] = useState(false);
  const [savedWords, setSavedWords] = useState<DictionaryEntry[]>([]);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  // Refs
  const playerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  // Handlers
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleLoadVideo = async () => {
    const id = extractVideoId(inputValue);
    if (!id) {
        alert("Please enter a valid YouTube URL");
        return;
    }
    
    setAppState(AppState.LOADING);
    setVideoId(id);
    setSubtitles([]); 

    // Simulation logic because we can't fetch real YT subtitles client-side due to CORS
    if (id === DEMO_VIDEO_ID) {
        setTimeout(() => {
            setSubtitles(DEMO_TRANSCRIPT);
            setAppState(AppState.READY);
        }, 1000);
    } else {
        // Generate dummy transcript (No API Key used)
        try {
            const generated = await generateDemoTranscript("General English Conversation");
            const newSubs = generated.map((line, idx) => ({
                id: idx.toString(),
                startTime: idx * 5, // Artificial timing
                endTime: (idx * 5) + 4.5,
                textEn: line.en,
                textZh: line.zh
            }));
            setSubtitles(newSubs);
            setAppState(AppState.READY);
        } catch (e) {
            console.error(e);
            setAppState(AppState.ERROR);
        }
    }
  };

  const handleDemoClick = () => {
      setInputValue(`https://www.youtube.com/watch?v=${DEMO_VIDEO_ID}`);
      setVideoId(DEMO_VIDEO_ID);
      setAppState(AppState.LOADING);
      setTimeout(() => {
        setSubtitles(DEMO_TRANSCRIPT);
        setAppState(AppState.READY);
      }, 1000);
  };

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    // Start polling for time
    timerRef.current = window.setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 200);
  };

  const onPlayerStateChange = (event: any) => {
     // 1 = Playing, 2 = Paused
  };

  const handleWordClick = async (word: string, context: string) => {
    // Pause video for better experience
    if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
    }

    setIsDictionaryLoading(true);
    setSelectedWordData(null); // Clear previous

    try {
        const data = await lookupWord(word, context);
        setSelectedWordData(data);
    } catch (e) {
        console.error("Dictionary failed", e);
    } finally {
        setIsDictionaryLoading(false);
    }
  };

  const saveWord = (entry: DictionaryEntry) => {
    if (!savedWords.some(w => w.word === entry.word)) {
        setSavedWords([...savedWords, entry]);
    }
  };

  const deleteWord = (word: string) => {
      setSavedWords(savedWords.filter(w => w.word !== word));
  };

  const handleImportWords = (newWords: DictionaryEntry[]) => {
      // Merge unique words
      const currentWords = [...savedWords];
      let addedCount = 0;
      newWords.forEach(nw => {
          if (!currentWords.some(cw => cw.word === nw.word)) {
              currentWords.push(nw);
              addedCount++;
          }
      });
      setSavedWords(currentWords);
  };

  useEffect(() => {
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      fs: 0, // Disable fullscreen to keep transcript visible
    },
  };

  return (
    <div className="min-h-screen pb-10">
      
      {/* Header */}
      <header className="bg-[#76C39F] shadow-[0_4px_0_#5DA886] p-4 sticky top-0 z-30 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors" onClick={() => setAppState(AppState.IDLE)}>
                <Leaf className="text-[#FAF8F1] fill-[#FAF8F1]" size={28} />
                <h1 className="text-2xl font-extrabold text-white tracking-wider font-['M_PLUS_Rounded_1c'] drop-shadow-md">
                    Nook's Classroom
                </h1>
            </div>

            <div className="flex items-center w-full md:w-auto gap-2">
                <div className="relative flex-1 md:w-96">
                    <input 
                        type="text" 
                        placeholder="Paste YouTube Link here..." 
                        className="w-full pl-4 pr-12 py-3 rounded-full border-4 border-[#FAF8F1] focus:outline-none focus:border-[#F3E5AB] font-bold text-gray-600 shadow-inner"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()}
                    />
                    <button 
                        onClick={handleLoadVideo}
                        className="absolute right-2 top-2 bg-[#FF9E44] text-white p-1.5 rounded-full shadow-sm hover:bg-[#ff8f24] active:scale-95 transition-transform"
                    >
                        <Search size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>

            <button 
                onClick={() => setIsNotebookOpen(true)}
                className="bg-[#FAF8F1] text-[#76C39F] px-4 py-2 rounded-full font-bold shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:bg-white flex items-center gap-2 ac-btn"
            >
                <BookOpen size={20} />
                Collection ({savedWords.length})
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Empty State / Welcome */}
        {appState === AppState.IDLE && (
            <div className="bg-[#FAF8F1] rounded-[40px] p-10 text-center shadow-lg border-8 border-white max-w-2xl mx-auto mt-10 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-[#76C39F]/20"></div>
                <div className="text-6xl mb-6 animate-float inline-block">🏕️</div>
                <h2 className="text-3xl font-extrabold text-[#76C39F] mb-4 font-['M_PLUS_Rounded_1c']">Ready to learn English?</h2>
                <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                    Watch videos, get dual subtitles, and click any word to see Nook's definitions! <br/>
                    We use smart tools to explain words in context.
                </p>
                <button 
                    onClick={handleDemoClick}
                    className="bg-[#FF9E44] text-white text-xl font-bold px-8 py-4 rounded-full shadow-[0_6px_0_#d67d2b] hover:bg-[#ff8f24] active:translate-y-1 active:shadow-[0_2px_0_#d67d2b] transition-all flex items-center gap-3 mx-auto"
                >
                    <Play fill="white" />
                    Load Demo Video
                </button>
            </div>
        )}

        {/* Video & Subtitle Layout */}
        {(appState === AppState.READY || appState === AppState.LOADING) && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
                
                {/* Left: Video Player */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="bg-black rounded-[30px] overflow-hidden shadow-xl border-8 border-[#FAF8F1] aspect-video relative group">
                        {appState === AppState.LOADING && (
                             <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F1] z-10">
                                 <div className="text-[#76C39F] font-bold text-xl animate-pulse flex flex-col items-center gap-4">
                                     <span className="text-6xl animate-bounce">✈️</span>
                                     <span>Flying to the island...</span>
                                 </div>
                             </div>
                        )}
                        <YouTube 
                            videoId={videoId} 
                            opts={opts} 
                            onReady={onPlayerReady} 
                            onStateChange={onPlayerStateChange}
                            className="h-full w-full"
                        />
                    </div>
                    
                    {/* Helper Tip */}
                    <div className="bg-white/80 p-4 rounded-2xl flex items-start gap-3 border-2 border-dashed border-[#8FD3B4] backdrop-blur-sm">
                        <Info className="text-[#76C39F] shrink-0 mt-0.5" />
                        <div>
                             <p className="text-[#555] font-bold text-sm">How to use:</p>
                             <ul className="text-[#666] text-sm list-disc list-inside mt-1 space-y-1">
                                <li>Click any English word in the transcript to open the Dictionary.</li>
                                <li>The video will pause automatically when you look up a word.</li>
                                <li>Press the audio icon to hear pronunciation.</li>
                             </ul>
                        </div>
                    </div>
                </div>

                {/* Right: Transcript */}
                <div className="h-full max-h-[80vh] min-h-[400px]">
                    <SubtitleDisplay 
                        subtitles={subtitles} 
                        currentTime={currentTime} 
                        onWordClick={handleWordClick}
                    />
                </div>
             </div>
        )}

        {/* Error State */}
        {appState === AppState.ERROR && (
             <div className="bg-[#FFCCCB] rounded-[40px] p-8 text-center border-8 border-white max-w-lg mx-auto mt-10">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-[#444] mb-2">Oh no!</h3>
                <p className="text-[#666]">Could not load the transcript. Please try the Demo Video first.</p>
                <button 
                    onClick={() => setAppState(AppState.IDLE)}
                    className="mt-4 bg-white text-red-500 font-bold px-6 py-2 rounded-full hover:bg-red-50"
                >
                    Go Back
                </button>
            </div>
        )}
      </main>

      {/* Modals */}
      <WordCard 
        wordData={selectedWordData} 
        loading={isDictionaryLoading} 
        onClose={() => setSelectedWordData(null)}
        onSave={saveWord}
        isSaved={selectedWordData ? savedWords.some(w => w.word === selectedWordData.word) : false}
      />
      
      <Notebook 
        words={savedWords} 
        isOpen={isNotebookOpen} 
        onClose={() => setIsNotebookOpen(false)}
        onDelete={deleteWord}
        onImport={handleImportWords}
      />

    </div>
  );
}

export default App;
