import React, { useState } from 'react';
import './Flashcards.css';

const Flashcards = ({ flashcards = [] }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [studyMode, setStudyMode] = useState('normal'); // 'normal', 'shuffle', 'difficult'
  const [masteredCards, setMasteredCards] = useState(new Set());
  const [shuffledOrder, setShuffledOrder] = useState([]);

  if (!flashcards.length) {
    return <div className="flashcards-empty">No flashcards generated</div>;
  }

  const getActiveOrder = () => {
    if (studyMode === 'shuffle' && shuffledOrder.length === 0) {
      const shuffled = [...Array(flashcards.length).keys()].sort(() => Math.random() - 0.5);
      setShuffledOrder(shuffled);
      return shuffled;
    }
    return studyMode === 'shuffle' ? shuffledOrder : [...Array(flashcards.length).keys()];
  };

  const nextCard = () => {
    const order = getActiveOrder();
    const currentIndex = order.indexOf(currentCard);
    const nextIndex = (currentIndex + 1) % order.length;
    setCurrentCard(order[nextIndex]);
    setIsFlipped(false);
  };

  const prevCard = () => {
    const order = getActiveOrder();
    const currentIndex = order.indexOf(currentCard);
    const prevIndex = (currentIndex - 1 + order.length) % order.length;
    setCurrentCard(order[prevIndex]);
    setIsFlipped(false);
  };

  const markAsMastered = () => {
    const newMastered = new Set(masteredCards);
    if (masteredCards.has(currentCard)) {
      newMastered.delete(currentCard);
    } else {
      newMastered.add(currentCard);
    }
    setMasteredCards(newMastered);
  };

  const resetProgress = () => {
    setMasteredCards(new Set());
    setCurrentCard(0);
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
        <h3>Flashcards ({getActiveOrder().indexOf(currentCard) + 1} of {flashcards.length})</h3>
        <div className="flashcard-controls-top">
          <select 
            value={studyMode} 
            onChange={(e) => {
              setStudyMode(e.target.value);
              if (e.target.value === 'shuffle') {
                setShuffledOrder([...Array(flashcards.length).keys()].sort(() => Math.random() - 0.5));
              }
              setCurrentCard(0);
              setIsFlipped(false);
            }}
            className="study-mode-select"
          >
            <option value="normal">Normal Order</option>
            <option value="shuffle">Shuffle</option>
          </select>
          <button onClick={() => setShowAll(true)} className="view-all-btn">
            View All
          </button>
        </div>
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
      
      <div className="flashcard-actions">
        <button 
          onClick={markAsMastered}
          className={`mastery-btn ${masteredCards.has(currentCard) ? 'mastered' : ''}`}
        >
          {masteredCards.has(currentCard) ? '★ Mastered' : '☆ Mark as Mastered'}
        </button>
        {masteredCards.size > 0 && (
          <div className="progress-indicator">
            Mastered: {masteredCards.size}/{flashcards.length}
          </div>
        )}
        {masteredCards.size > 0 && (
          <button onClick={resetProgress} className="reset-btn">
            Reset Progress
          </button>
        )}
      </div>
    </div>
  );
};

export default Flashcards;