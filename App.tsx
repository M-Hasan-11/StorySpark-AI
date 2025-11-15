
import React from 'react';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-amber-50 font-sans text-stone-800 flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-4xl mx-auto text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-bold text-amber-600" style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif" }}>
          StorySpark AI
        </h1>
        <p className="text-stone-500 mt-2 text-lg">Your Magical Storyteller</p>
      </header>
      <main className="w-full flex-grow flex items-center justify-center">
        <ChatInterface />
      </main>
    </div>
  );
};

export default App;
