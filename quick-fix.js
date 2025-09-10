// Quick fix to add flashcards to existing audiobook for testing
const audiobooks = JSON.parse(localStorage.getItem('audiobooks') || '[]');
console.log('Current audiobooks:', audiobooks);

// Add flashcards to the first/latest audiobook
if (audiobooks.length > 0) {
  const latestAudiobook = audiobooks[audiobooks.length - 1];
  console.log('Adding flashcards to:', latestAudiobook.title);
  
  latestAudiobook.flashcards = [
    {"question": "What three physical elements are recommended to 'own your presence'?", "answer": "Stand tall with relaxed shoulders, breathe slower than the room, and make sustained eye contact with an easy smile."},
    {"question": "What does 'Warm > Edgy' mean?", "answer": "Kindness reads as confidence and is safer than sarcasm. Be warm and kind rather than trying to be edgy."},
    {"question": "What is the 'Listen 70/30' rule?", "answer": "Listen 70% of the time and speak 30%. Use open prompts and mirror what people say so they feel heard."},
    {"question": "What are the key style components?", "answer": "Style = Fit + Simple. Clean sneakers, well-fitting basics, avoid logos, good grooming, one signature accessory."},
    {"question": "What health signals contribute to appearing cool?", "answer": "Prioritize sleep, clear skin, steady energy, hydration, subtle scent, fresh breath, exercise for posture."}
  ];
  
  latestAudiobook.fullDocumentSummary = "This is a practical guide on how to appear cool without trying too hard. Key areas include physical presence, communication, style, health, and social interactions.";
  
  localStorage.setItem('audiobooks', JSON.stringify(audiobooks));
  console.log('✅ Added flashcards to existing audiobook');
  
  // Trigger React re-render by dispatching storage event
  window.dispatchEvent(new Event('storage'));
  
  // Refresh the page
  window.location.reload();
} else {
  console.log('No audiobooks found');
}