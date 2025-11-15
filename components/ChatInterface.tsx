
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StoryPage, GameState } from '../types';
import { generateStoryPages, generateImage, generateSpeech } from '../services/geminiService';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import StoryDisplay from './StoryDisplay';
import LoadingSpinner from './LoadingSpinner';

const ChatInterface: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [userPrompt, setUserPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  const { play, stop, isPlaying } = useAudioPlayer();
  const audioQueue = useRef<string | null>(null);

  const currentPageData = storyPages[currentPageIndex];

  const handleStartStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    stop();
    setGameState(GameState.LOADING_STORY);
    setError(null);
    setStoryPages([]);
    setCurrentPageIndex(0);

    try {
      const pagesText = await generateStoryPages(userPrompt);
      const newPages: StoryPage[] = pagesText.map((text, index) => ({
        id: index,
        text,
      }));
      setStoryPages(newPages);
      setGameState(GameState.PLAYING);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setGameState(GameState.ERROR);
    }
    setUserPrompt('');
  };

  const loadPageResources = useCallback(async () => {
    if (!currentPageData) return;

    if (!currentPageData.imageUrl) {
      setIsImageLoading(true);
      try {
        const imageUrl = await generateImage(currentPageData.text);
        setStoryPages(pages => pages.map(p => p.id === currentPageData.id ? { ...p, imageUrl } : p));
      } catch (e) {
        console.error(e);
      } finally {
        setIsImageLoading(false);
      }
    }
    
    if (!currentPageData.audioData) {
      setIsAudioLoading(true);
      try {
        const audioData = await generateSpeech(currentPageData.text);
        setStoryPages(pages => {
          const updatedPages = pages.map(p => p.id === currentPageData.id ? { ...p, audioData } : p);
          // If this is the current page, queue the audio for playing
          if (updatedPages[currentPageIndex]?.id === currentPageData.id) {
            audioQueue.current = audioData;
          }
          return updatedPages;
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsAudioLoading(false);
      }
    } else {
        // If audio data already exists, queue it for playing
        audioQueue.current = currentPageData.audioData;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageData]);
  
  useEffect(() => {
    if (gameState === GameState.PLAYING && currentPageData) {
      loadPageResources();
    }
  }, [gameState, currentPageData, loadPageResources]);

  useEffect(() => {
    if (audioQueue.current && !isAudioLoading) {
      play(audioQueue.current);
      audioQueue.current = null;
    }
  }, [audioQueue, isAudioLoading, play]);

  const goToNextPage = () => {
    if (currentPageIndex < storyPages.length - 1) {
      stop();
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      stop();
      setCurrentPageIndex(prev => prev - 1);
    }
  };
  
  const replayAudio = () => {
    if (currentPageData?.audioData) {
        play(currentPageData.audioData);
    }
  }

  const startNewStory = () => {
    stop();
    setGameState(GameState.IDLE);
    setStoryPages([]);
    setCurrentPageIndex(0);
    setError(null);
  }

  const renderContent = () => {
    switch (gameState) {
      case GameState.IDLE:
      case GameState.ERROR:
        return (
          <div className="text-center bg-white/70 p-8 rounded-3xl shadow-lg">
            <h2 className="text-2xl font-bold text-amber-700 mb-4">What should our story be about?</h2>
            {gameState === GameState.ERROR && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
            <form onSubmit={handleStartStory} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="A cat who wants to be an astronaut..."
                className="w-full flex-grow px-4 py-3 rounded-full border-2 border-amber-300 focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
              />
              <button type="submit" className="px-6 py-3 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600 transition-transform transform hover:scale-105 shadow-md">
                Create Story!
              </button>
            </form>
          </div>
        );
      
      case GameState.LOADING_STORY:
        return (
           <div className="text-center bg-white/70 p-8 rounded-3xl shadow-lg">
              <h2 className="text-2xl font-bold text-amber-700 mb-4 animate-pulse">Dreaming up a new adventure...</h2>
              <LoadingSpinner size="md" />
           </div>
        );

      case GameState.PLAYING:
        return (
          <div className="w-full h-full max-w-2xl flex flex-col gap-4">
            <StoryDisplay page={currentPageData} isImageLoading={isImageLoading} />
            <div className="flex justify-between items-center bg-white/70 p-3 rounded-full shadow-lg">
                <button onClick={goToPrevPage} disabled={currentPageIndex === 0} className="p-3 rounded-full disabled:opacity-30 enabled:hover:bg-amber-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>

                 <button onClick={replayAudio} disabled={!currentPageData?.audioData || isAudioLoading} className="p-3 rounded-full disabled:opacity-30 enabled:hover:bg-amber-100 transition text-amber-600">
                    {isAudioLoading ? <LoadingSpinner size="sm" /> : 
                    isPlaying ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-1 1v12a1 1 0 002 0V3a1 1 0 00-1-1zM3 5a1 1 0 011-1h2a1 1 0 110 2H4a1 1 0 01-1-1zm12 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" /></svg> :
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.447-.894L4 9.44V4a1 1 0 00-2 0v12a1 1 0 002 0v-5.44l12.553 6.276A1 1 0 0018 17V3z" /></svg>
                    }
                </button>

                <button onClick={goToNextPage} disabled={currentPageIndex === storyPages.length - 1} className="p-3 rounded-full disabled:opacity-30 enabled:hover:bg-amber-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
             <button onClick={startNewStory} className="w-full mt-2 py-2 bg-stone-500 text-white font-semibold rounded-full hover:bg-stone-600 transition shadow">
                Start a New Story
             </button>
          </div>
        );
    }
  };

  return <div className="w-full max-w-2xl p-4">{renderContent()}</div>;
};

export default ChatInterface;
