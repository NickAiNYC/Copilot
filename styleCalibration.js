// styleCalibration.js - ML-powered style learning
export async function runOnboarding() {
  const samples = [
    {
      id: 1,
      text: "🔥 RARE Rolex Submariner 16610 from 2005! Mint condition, full set with box & papers. Investment piece! $12,500 - DM me!",
      style: 'enthusiastic'
    },
    {
      id: 2,
      text: "Rolex Submariner ref. 16610, circa 2005. Excellent condition with complete set. Asking $12,500. Serious inquiries welcome.",
      style: 'professional'
    },
    {
      id: 3,
      text: "Beautiful Sub 16610 available. 2005 vintage, pristine condition. Comes with everything. Fair price at $12.5k. Let's chat!",
      style: 'friendly'
    }
  ];
  
  const rankings = await showRankingUI(samples);
  const editedSample = await showEditingUI(samples[rankings[0]]);
  
  // Analyze preferences
  const styleProfile = {
    preferredTone: analyzeRankings(rankings, samples),
    vocabulary: extractVocabulary(editedSample),
    formality: calculateFormality(editedSample),
    emojiUsage: countEmojis(editedSample) > 0 ? 'moderate' : 'none'
  };
  
  await chrome.storage.local.set({ styleProfile, onboardingComplete: true });
  return styleProfile;
}

function analyzeRankings(rankings, samples) {
  const topChoice = samples[rankings[0]];
  return topChoice.style;
}

function extractVocabulary(text) {
  const preferred = [];
  if (text.includes('pristine') || text.includes('mint')) preferred.push('quality_emphasis');
  if (text.includes('investment') || text.includes('collector')) preferred.push('value_focus');
  if (text.includes('rare') || text.includes('unique')) preferred.push('scarcity_angle');
  return preferred;
}

function calculateFormality(text) {
  const informalWords = ['hey', 'awesome', 'cool', 'grab'];
  const formalWords = ['inquire', 'available', 'please', 'excellent'];
  
  const informalCount = informalWords.filter(w => text.toLowerCase().includes(w)).length;
  const formalCount = formalWords.filter(w => text.toLowerCase().includes(w)).length;
  
  return formalCount > informalCount ? 'high' : 'medium';
}
