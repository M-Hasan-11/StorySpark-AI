
import React from 'react';
import { StoryPage } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface StoryDisplayProps {
  page: StoryPage | null;
  isImageLoading: boolean;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ page, isImageLoading }) => {
  if (!page) return null;

  return (
    <div className="w-full h-full flex flex-col items-center bg-white/70 rounded-3xl shadow-lg p-4 md:p-8 overflow-hidden">
      <div className="aspect-square w-full max-w-md bg-amber-100 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
        {isImageLoading && <LoadingSpinner size="lg" />}
        {!isImageLoading && page.imageUrl && (
          <img 
            src={page.imageUrl} 
            alt="Story illustration" 
            className="w-full h-full object-cover transition-opacity duration-500"
          />
        )}
        {!isImageLoading && !page.imageUrl && (
          <div className="text-amber-500 p-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm font-medium">Couldn't create image.</p>
          </div>
        )}
      </div>
      <div className="text-center text-stone-700 text-lg md:text-xl leading-relaxed">
        <p>{page.text}</p>
      </div>
    </div>
  );
};

export default StoryDisplay;
