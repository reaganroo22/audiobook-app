import React, { useState, useEffect } from 'react';
import './Quiz.css';

const Quiz = ({ flashcards = [] }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizMode, setQuizMode] = useState('multiple-choice'); // 'multiple-choice' or 'open-ended'
  
  // Generate multiple choice options for each flashcard
  const [multipleChoiceQuestions, setMultipleChoiceQuestions] = useState([]);

  useEffect(() => {
    if (flashcards.length > 0) {
      generateMultipleChoiceQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashcards]);

  const generateMultipleChoiceQuestions = () => {
    const mcQuestions = flashcards.map((card, index) => {
      const correctAnswer = card.answer;
      const otherAnswers = flashcards
        .filter((_, i) => i !== index)
        .map(c => c.answer)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      const allOptions = [correctAnswer, ...otherAnswers].sort(() => 0.5 - Math.random());
      
      return {
        ...card,
        options: allOptions,
        correctAnswer: correctAnswer
      };
    });
    
    setMultipleChoiceQuestions(mcQuestions);
  };

  if (!flashcards.length) {
    return (
      <div className="quiz-empty">
        <h3>No Quiz Available</h3>
        <p>Generate flashcards first to access the quiz mode.</p>
      </div>
    );
  }

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    const currentCard = quizMode === 'multiple-choice' 
      ? multipleChoiceQuestions[currentQuestion]
      : flashcards[currentQuestion];
    
    let isCorrect = false;
    
    if (quizMode === 'multiple-choice') {
      isCorrect = selectedAnswer.toLowerCase().trim() === currentCard.correctAnswer.toLowerCase().trim();
    } else {
      // For open-ended, be more flexible with matching
      const userAnswer = selectedAnswer.toLowerCase().trim();
      const correctAnswer = currentCard.answer.toLowerCase().trim();
      
      // Check if user answer contains key words from correct answer or vice versa
      const userWords = userAnswer.split(/\s+/).filter(word => word.length > 3);
      const correctWords = correctAnswer.split(/\s+/).filter(word => word.length > 3);
      
      // If user answer is very short, require exact match
      if (userAnswer.length < 20) {
        isCorrect = correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer);
      } else {
        // For longer answers, check if they share significant words
        const commonWords = userWords.filter(word => correctWords.some(cWord => 
          cWord.includes(word) || word.includes(cWord)
        ));
        isCorrect = commonWords.length >= Math.min(3, Math.floor(correctWords.length * 0.3));
      }
    }
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setUserAnswers([...userAnswers, {
      question: currentCard.question,
      userAnswer: selectedAnswer,
      correctAnswer: currentCard.answer,
      isCorrect
    }]);

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < flashcards.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setUserAnswers([]);
    if (quizMode === 'multiple-choice') {
      generateMultipleChoiceQuestions();
    }
  };

  const getScoreColor = () => {
    const percentage = (score / flashcards.length) * 100;
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 70) return '#FF9800';
    return '#F44336';
  };

  if (quizComplete) {
    return (
      <div className="quiz-complete">
        <div className="quiz-results">
          <h2>Quiz Complete!</h2>
          <div className="final-score" style={{ color: getScoreColor() }}>
            {score}/{flashcards.length} ({Math.round((score / flashcards.length) * 100)}%)
          </div>
          
          <div className="score-breakdown">
            <h3>Review Your Answers</h3>
            {userAnswers.map((answer, index) => (
              <div key={index} className={`answer-review ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-text">Q: {answer.question}</div>
                <div className="answer-text">
                  Your answer: <span className={answer.isCorrect ? 'correct-answer' : 'wrong-answer'}>
                    {answer.userAnswer}
                  </span>
                </div>
                {!answer.isCorrect && (
                  <div className="correct-answer-text">
                    Correct answer: <span className="correct-answer">{answer.correctAnswer}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="quiz-actions">
            <button onClick={restartQuiz} className="restart-btn">
              Take Quiz Again
            </button>
            <button 
              onClick={() => setQuizMode(quizMode === 'multiple-choice' ? 'open-ended' : 'multiple-choice')}
              className="switch-mode-btn"
            >
              Switch to {quizMode === 'multiple-choice' ? 'Open-Ended' : 'Multiple Choice'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = quizMode === 'multiple-choice' 
    ? multipleChoiceQuestions[currentQuestion]
    : flashcards[currentQuestion];

  if (!currentCard) return <div>Loading...</div>;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-progress">
          Question {currentQuestion + 1} of {flashcards.length}
        </div>
        <div className="quiz-score">Score: {score}</div>
        <div className="quiz-mode-toggle">
          <button
            onClick={() => {
              setQuizMode(quizMode === 'multiple-choice' ? 'open-ended' : 'multiple-choice');
              restartQuiz();
            }}
            className="mode-toggle-btn"
          >
            {quizMode === 'multiple-choice' ? 'Switch to Open-Ended' : 'Switch to Multiple Choice'}
          </button>
        </div>
      </div>

      <div className="quiz-question">
        <h3>{currentCard.question}</h3>
      </div>

      {!showResult && (
        <div className="quiz-answers">
          {quizMode === 'multiple-choice' ? (
            <div className="multiple-choice-options">
              {currentCard.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="open-ended-input">
              <textarea
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="answer-input"
                rows={4}
              />
            </div>
          )}
          
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer.trim()}
            className="submit-answer-btn"
          >
            Submit Answer
          </button>
        </div>
      )}

      {showResult && (
        <div className="quiz-result">
          <div className={`result-indicator ${userAnswers[userAnswers.length - 1]?.isCorrect ? 'correct' : 'incorrect'}`}>
            {userAnswers[userAnswers.length - 1]?.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </div>
          
          <div className="correct-answer-display">
            <strong>Correct Answer:</strong> {currentCard.answer}
          </div>
          
          {!userAnswers[userAnswers.length - 1]?.isCorrect && (
            <div className="your-answer-display">
              <strong>Your Answer:</strong> {selectedAnswer}
            </div>
          )}
          
          <button onClick={handleNextQuestion} className="next-question-btn">
            {currentQuestion < flashcards.length - 1 ? 'Next Question' : 'View Results'}
          </button>
        </div>
      )}

      <div className="quiz-progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentQuestion + 1) / flashcards.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Quiz;