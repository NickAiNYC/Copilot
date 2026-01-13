// aiEngine.js - OpenAI/Grok integration
export async function generateFlair(prompt, styleProfile) {
  // Get API key from storage (user-provided)
  const { apiKey, aiProvider } = await chrome.storage.local.get(['apiKey', 'aiProvider']);
  
  const endpoint = aiProvider === 'grok' 
    ? 'https://api.x.ai/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: aiProvider === 'grok' ? 'grok-beta' : 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert luxury watch copywriter. Style preferences: ${JSON.stringify(styleProfile)}. 
                    Write concise, authentic listings. Avoid spam triggers. Max 150 words.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export async function analyzePhoto(imageData) {
  // Multimodal analysis for condition, authenticity
  const { apiKey } = await chrome.storage.local.get('apiKey');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this watch photo. Identify: brand, model, condition (1-10), any red flags for authenticity. Be concise.'
            },
            {
              type: 'image_url',
              image_url: { url: imageData }
            }
          ]
        }
      ],
      max_tokens: 200
    })
  });
  
  const data = await response.json();
  return parsePhotoAnalysis(data.choices[0].message.content);
}

function parsePhotoAnalysis(text) {
  // Extract structured data from AI response
  return {
    brand: text.match(/brand:?\s*(\w+)/i)?.[1] || 'Unknown',
    condition: text.match(/condition:?\s*(\d+)/i)?.[1] || '7',
    authenticity: text.toLowerCase().includes('authentic') ? 'likely' : 'review needed'
  };
}
