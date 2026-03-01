// Vercel Serverless Function - Generate Marketing Content Pack
// Returns structured JSON with content for each platform + image prompts

export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `You are MarketingClaw. Generate marketing content for home service professionals.

IMPORTANT: Respond with ONLY valid JSON. Use \\n for line breaks in content.

{
  "business": { "name": "", "trade": "", "location": "", "zip": "", "phone": "" },
  "topic": "main topic",
  "imagePrompt": "professional photo of [trade] at work, marketing style",
  "platforms": {
    "google": {
      "title": "max 58 chars",
      "content": "First paragraph here.\\n\\n• Bullet point 1\\n• Bullet point 2\\n• Bullet point 3\\n\\nCall us: phone",
      "cta": "Get Quote",
      "hashtags": []
    },
    "nextdoor": {
      "content": "Hey neighbors!\\n\\nMain content here.\\n\\n• Tip 1\\n• Tip 2\\n\\n- Name, Business\\nphone",
      "hashtags": []
    },
    "facebook": {
      "hook": "🔧 Attention grabbing line!",
      "content": "Story content.\\n\\n• Point 1\\n• Point 2\\n\\nCall: phone",
      "hashtags": ["#LocalBusiness"]
    }
  }
}

CRITICAL RULES:
- Use \\n for EVERY line break (not actual newlines in JSON)
- Each bullet point (•) MUST be on its own line with \\n before it
- PLAIN TEXT only, no markdown
- Include phone number in every post`;

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers,
    });
  }

  try {
    const { business, topic } = await req.json();

    if (!business || !topic) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        required: { business: 'object with name, trade, location, zip, phone', topic: 'string' }
      }), {
        status: 400, headers,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers,
      });
    }

    const userPrompt = `Generate marketing content for:
Business: ${business.name}
Trade: ${business.trade}
Location: ${business.location} (ZIP: ${business.zip})
Phone: ${business.phone}
Marketing Topic: ${topic}

Generate content for Google Business, Nextdoor, and Facebook. Return ONLY valid JSON.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I will respond with only valid JSON containing marketing content for all three platforms.' }]
      },
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ];

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500, headers,
      });
    }

    const data = await response.json();
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean up response - remove markdown code blocks if present
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    let contentPack;
    try {
      contentPack = JSON.parse(aiResponse);
    } catch (e) {
      console.error('JSON parse error:', e, 'Response:', aiResponse);
      return new Response(JSON.stringify({
        error: 'Failed to parse AI response',
        raw: aiResponse
      }), {
        status: 500, headers,
      });
    }

    // Build image prompt from ACTUAL generated content
    // Extract key themes from the generated post content
    const googleContent = contentPack.platforms?.google?.content || '';
    const googleTitle = contentPack.platforms?.google?.title || '';
    const postText = `${googleTitle} ${googleContent}`.substring(0, 200);

    // Create a content-aware image prompt
    const contentBasedPrompt = `Professional marketing photo for: ${postText}. Style: clean, modern, trustworthy, warm lighting, suitable for ${business.trade} business marketing.`;

    const imagePrompt = contentPack.imagePrompt || contentBasedPrompt;
    console.log('Image prompt:', imagePrompt.substring(0, 100));

    contentPack.images = {};

    try {
      console.log('Calling Imagen API...');
      const imgResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: imagePrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: '1:1',
              personGeneration: 'allow_adult'
            }
          }),
        }
      );

      console.log('Imagen response status:', imgResponse.status);

      if (imgResponse.ok) {
        const imgData = await imgResponse.json();
        console.log('Imagen response has predictions:', !!imgData.predictions?.[0]);
        if (imgData.predictions?.[0]?.bytesBase64Encoded) {
          const base64 = imgData.predictions[0].bytesBase64Encoded;
          contentPack.images.google = `data:image/png;base64,${base64}`;
          contentPack.images.nextdoor = contentPack.images.google;
          contentPack.images.facebook = contentPack.images.google;
          console.log('Imagen SUCCESS - image generated');
        }
      } else {
        const errorText = await imgResponse.text();
        console.error('Imagen error:', errorText);
      }
    } catch (e) {
      console.error('Image generation failed:', e);
    }

    console.log('Final images:', contentPack.images.google ? 'Imagen generated' : 'Using fallback');

    // Fallback - use Topic + Trade based image selection
    if (!contentPack.images.google) {
      // Topic-based image keywords mapping
      const topicKeywords = {
        spring: ['spring', 'maintenance', 'inspection', 'seasonal', 'checkup'],
        emergency: ['emergency', 'urgent', 'fast', '24/7', 'immediate', 'quick'],
        discount: ['off', 'special', 'discount', 'deal', 'save', 'offer', 'price'],
        safety: ['safety', 'safe', 'protect', 'secure', 'guide', 'tips'],
        warning: ['warning', 'signs', 'watch', 'problem', 'issue', 'danger'],
        diy: ['diy', 'tips', 'trick', 'how to', 'guide', 'advice'],
        quality: ['quality', 'professional', 'expert', 'best', 'trusted']
      };

      // Topic-specific images (general, works for all trades)
      const topicImages = {
        spring: [
          'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&w=800',
          'https://images.pexels.com/photos/5691618/pexels-photo-5691618.jpeg?auto=compress&w=800'
        ],
        emergency: [
          'https://images.pexels.com/photos/8005368/pexels-photo-8005368.jpeg?auto=compress&w=800',
          'https://images.pexels.com/photos/5691636/pexels-photo-5691636.jpeg?auto=compress&w=800'
        ],
        discount: [
          'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&w=800',
          'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&w=800'
        ],
        safety: [
          'https://images.pexels.com/photos/5691625/pexels-photo-5691625.jpeg?auto=compress&w=800',
          'https://images.pexels.com/photos/5691629/pexels-photo-5691629.jpeg?auto=compress&w=800'
        ],
        warning: [
          'https://images.pexels.com/photos/5691631/pexels-photo-5691631.jpeg?auto=compress&w=800',
          'https://images.pexels.com/photos/5691634/pexels-photo-5691634.jpeg?auto=compress&w=800'
        ],
        diy: [
          'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&w=800',
          'https://images.pexels.com/photos/4246119/pexels-photo-4246119.jpeg?auto=compress&w=800'
        ],
        quality: [
          'https://images.pexels.com/photos/8005397/pexels-photo-8005397.jpeg?auto=compress&w=800',
          'https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&w=800'
        ]
      };

      // Trade-specific default images (fallback)
      const tradeImages = {
        plumber: 'https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&w=800',
        electrician: 'https://images.pexels.com/photos/8005397/pexels-photo-8005397.jpeg?auto=compress&w=800',
        hvac: 'https://images.pexels.com/photos/4489749/pexels-photo-4489749.jpeg?auto=compress&w=800',
        roofer: 'https://images.pexels.com/photos/8961001/pexels-photo-8961001.jpeg?auto=compress&w=800',
        landscaper: 'https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg?auto=compress&w=800',
        realtor: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&w=800'
      };

      // Detect topic type from BOTH the topic string AND the actual generated content
      const googleContent = contentPack.platforms?.google?.content || '';
      const googleTitle = contentPack.platforms?.google?.title || '';
      const allText = `${topic} ${googleTitle} ${googleContent}`.toLowerCase();

      let detectedTopic = 'quality'; // default
      for (const [topicType, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(kw => allText.includes(kw))) {
          detectedTopic = topicType;
          break;
        }
      }

      console.log('Topic detection:', { topic, detectedTopic, matchedIn: allText.substring(0, 100) });

      // Get topic-specific images or fall back to trade default
      const selectedImages = topicImages[detectedTopic] || [tradeImages[business.trade?.toLowerCase()] || tradeImages.plumber];
      const mainImage = selectedImages[0];
      const altImage = selectedImages[1] || mainImage;

      contentPack.images = {
        google: mainImage,
        nextdoor: altImage,
        facebook: mainImage
      };

      // Store detected topic for frontend reference
      contentPack.detectedTopic = detectedTopic;
    }

    return new Response(JSON.stringify({
      success: true,
      pack: contentPack
    }), {
      status: 200, headers,
    });

  } catch (error) {
    console.error('Generate pack error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
      status: 500, headers,
    });
  }
}
