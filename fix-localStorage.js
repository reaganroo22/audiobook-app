// Fix script to add flashcards to existing audiobook in localStorage
// The backend logs showed 15 flashcards were generated but not saved to localStorage

const existingAudiobooks = JSON.parse(localStorage.getItem('audiobooks') || '[]');
console.log('Current audiobooks:', existingAudiobooks);

// Find the "how_to_be_cool" audiobook
const coolAudiobook = existingAudiobooks.find(book => 
  book.title?.toLowerCase().includes('cool') || 
  book.title?.toLowerCase().includes('how_to_be_cool')
);

if (coolAudiobook) {
  console.log('Found audiobook:', coolAudiobook.title);
  
  // Add the flashcards that were generated in the backend logs
  coolAudiobook.flashcards = [
    {
      "question": "What three physical elements are recommended to 'own your presence' and why do they matter?",
      "answer": "Stand tall with relaxed shoulders, breathe slower than the room, and make sustained eye contact with an easy smile. These elements create a calm, deliberate physical vibe that signals confidence and reduces nervous fidgeting."
    },
    {
      "question": "Explain the concept 'Warm > Edgy' and give two practical ways to apply it.",
      "answer": "Warm > Edgy means kindness reads as confidence and is safer than sarcasm. Apply it by greeting people by name with specific sincere compliments, and defaulting to playful rather than sarcastic humor unless you know someone's taste well."
    },
    {
      "question": "What does 'Listen 70/30' mean and what techniques are suggested to implement it?",
      "answer": "Listen 70/30 means you should listen roughly 70% of the time and speak 30%. Use open prompts (e.g., \"What's been the highlight of your week?\") and techniques like mirroring and labeling (e.g., \"Sounds like you loved the challenge\") so people feel seen."
    },
    {
      "question": "Summarize the guidance on speaking style under 'Talk Clean & Crisp.'",
      "answer": "Use short, concrete sentences rather than rambling. Be specific in invitations (e.g., \"I'm heading to the gym at 4—join?\") and carry pocket openers like \"What's your go-to coffee order?\" to start conversation."
    },
    {
      "question": "According to the guide, what two components define 'Style' and what minimalist wardrobe and grooming rules are recommended?",
      "answer": "Style = Fit + Simple. Recommendations: clean sneakers, well-fitting basics in black/white/gray/navy, avoid obvious logos, keep grooming prioritized (haircut, clean nails), and limit to one signature accessory."
    },
    {
      "question": "List at least five health signals the guide says contribute to appearing cool.",
      "answer": "Prioritize sleep, clear skin, clear eyes, steady energy, hydration, subtle scent (max ~2 sprays), fresh breath, and regular exercise for posture and mood."
    },
    {
      "question": "Outline the 'Style Mini-Capsule (Mens Example)' including tops, bottoms, and shoes.",
      "answer": "Tops: black/white tees, one high-quality quarter-zip, one light jacket. Bottoms: tailored dark jeans, clean joggers, fitted grey sweatpants. Shoes: clean trainers plus one step-up sneaker—keep all items immaculate."
    },
    {
      "question": "What is 'social gravity' and what are two behaviors that build it?",
      "answer": "Social gravity is the ability to draw people and create connections. Behaviors that build it include being a connector by introducing people with shared interests and hosting consistent small gatherings like study sprints or coffee walks."
    },
    {
      "question": "What phone etiquette does the guide prescribe and why is it important?",
      "answer": "Keep your phone facedown when with people. This habit signals respect and presence, communicating that you prioritize the in-person interaction."
    },
    {
      "question": "In the 'First Week / Party Introductions' section, what structure is recommended for introducing yourself and others?",
      "answer": "Lead with your name plus an anchor (e.g., \"I'm Reagan—Dallas kid, first-year MSB. You?\"), introduce two people at every event to expand your social network, and leave conversations on a high note rather than when they dip."
    },
    {
      "question": "What behaviors are emphasized in 'Upgrade Your Reputation' and why do they matter?",
      "answer": "Be reliable by showing up when you say you will, remember small details (birthdays, test days), send quick supportive messages (10-second voice notes), own and fix mistakes quickly, and avoid drama—these build trust and long-term social capital."
    },
    {
      "question": "What is the 'Social Anxiety MicroProtocol' and what three actions does it include?",
      "answer": "A quick protocol to manage anxiety: box-breathe for three cycles (4 in, 4 hold, 4 out, 4 hold), pick one easy social action (ask a name, give a compliment, or make an intro), and if overwhelmed, reset with a short walk, water, or shoulder roll before returning."
    },
    {
      "question": "Pick five items from the 'Cool Habit Checklist' and explain how they support the guide's core rule: 'less effort, more intention.'",
      "answer": "Five items: 7-8h sleep (maintains energy and clear signals), 1 real compliment given (builds warmth with minimal time), phone down during convos (maximizes presence), 30–60 min skill practice (consistent improvement with small effort), quick room reset (5-min tidy) (reduces friction in life). Each is a small intentional action that produces outsized social or personal returns, aligning with less effort, more intention."
    },
    {
      "question": "What specific actions are suggested for interacting with professors to build rapport?",
      "answer": "Sit in the front third of class, ask one helpful, concise question per week, and follow up with a brief message: thank them for today's point about X and ask if they recommend an article to go deeper."
    },
    {
      "question": "Describe the recommended approach to online presence and content creation.",
      "answer": "Post about what you're building or learning 2–3 times per week, prioritize creating over consuming (80/20), avoid vague flexing or attention-seeking, and mute feeds that hijack your focus."
    }
  ];

  // Add the full document summary from backend logs
  coolAudiobook.fullDocumentSummary = "🎯 Overall Theme: The document provides a practical guide on how to emit a \"cool\" vibe without trying too hard. It includes suggestions on physical presence, interpersonal communication, style, health, social interactions, phone etiquette, and online presence.\n\n💡 Key Points: \n1. Physical presence: Stand tall, slow down your breathing, make eye contact, and use silence effectively.\n2. Interpersonal communication: Be kind, listen more than you speak, use short and clear sentences, and give genuine compliments.\n3. Style: Wear clean, well-fitted basics, keep grooming on point, and have a signature accessory.\n4. Health: Prioritize sleep, hydration, and regular exercise.\n5. Social interactions: Connect people, host small gatherings, and show respect by keeping your phone facedown when with others.\n6. Online presence: Post about what you're learning or building, consume less, and avoid distractions.\n7. Reputation: Be reliable, remember important events, and own up to your mistakes.\n\n🧠 Core Insights: \nThe key to appearing cool is not about trying hard to impress others, but more about being confident, kind, reliable, and respectful. It's about being comfortable in your own skin and treating others well. This includes maintaining a positive physical presence, fostering good listening skills, maintaining personal style and health, being a good social connector, having good phone etiquette, maintaining a positive online presence, and keeping a good reputation.\n\n📝 Conclusion: \nBeing cool is less about effort and more about intention. It's about being warm, reliable, and authentic. Following these tips can help individuals develop a cool vibe that is both attractive and respectful to others.";

  // Save back to localStorage
  localStorage.setItem('audiobooks', JSON.stringify(existingAudiobooks));
  console.log('✅ Updated audiobook with flashcards and summary');
  
  // Reload the page to reflect changes
  window.location.reload();
} else {
  console.log('❌ Could not find the cool audiobook');
}