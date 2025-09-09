import React, { useState } from 'react';
import './Flashcards.css';

const Flashcards = ({ flashcards = [] }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (!flashcards.length) {
    return <div className="flashcards-empty">No flashcards generated</div>;
  }

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  };

  if (showAll) {
    return (
      <div className="flashcards-container">
        <div className="flashcards-header">
          <h3>All Flashcards ({flashcards.length})</h3>
          <button onClick={() => setShowAll(false)} className="back-btn">
            Back to Study Mode
          </button>
        </div>
        <div className="all-flashcards">
          {flashcards.map((card, index) => (
            <div key={index} className="flashcard-pair">
              <div className="card-number">#{index + 1}</div>
              <div className="question-section">
                <strong>Q:</strong> {card.question}
              </div>
              <div className="answer-section">
                <strong>A:</strong> {card.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flashcards-container">
      <div className="flashcards-header">
        <h3>Flashcards ({currentCard + 1} of {flashcards.length})</h3>
        <button onClick={() => setShowAll(true)} className="view-all-btn">
          View All
        </button>
      </div>
      
      <div className="flashcard-wrapper">
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
          <div className="flashcard-front">
            <div className="card-type">Question</div>
            <div className="card-content">
              {flashcards[currentCard]?.question}
            </div>
            <div className="flip-hint">Click to reveal answer</div>
          </div>
          <div className="flashcard-back">
            <div className="card-type">Answer</div>
            <div className="card-content">
              {flashcards[currentCard]?.answer}
            </div>
          </div>
        </div>
      </div>

      <div className="flashcard-controls">
        <button onClick={prevCard} disabled={flashcards.length <= 1}>
          ← Previous
        </button>
        <button 
          onClick={() => setIsFlipped(!isFlipped)}
          className="flip-btn"
        >
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>
        <button onClick={nextCard} disabled={flashcards.length <= 1}>
          Next →
        </button>
      </div>
    </div>
  );
};

export default Flashcards;