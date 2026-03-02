// Vercel Serverless Function - Generate Marketing Images using Gemini 3.1 Flash Image
export const config = {
  runtime: 'edge',
};

const IMAGE_MODEL = 'gemini-3.1-flash-image-preview';

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
    const { prompt, platform } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400, headers,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers,
      });
    }

    // Platform-specific aspect ratios
    const aspectRatios = {
      google: '4:3',      // 1200x900
      nextdoor: '16:9',   // 1200x628
      facebook: '1:1',    // 1080x1080
      default: '1:1'
    };

    const aspectRatio = aspectRatios[platform] || aspectRatios.default;

    // Call Gemini 3.1 Flash Image API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageConfig: {
              aspectRatio: aspectRatio,
              imageSize: '1K'
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini Image API error:', errorText);
      return new Response(JSON.stringify({
        error: 'Image generation failed',
        details: errorText
      }), {
        status: 500, headers,
      });
    }

    const data = await response.json();

    // Gemini returns inlineData with base64 encoded images
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData);
    const imageData = imagePart?.inlineData?.data;
    const mimeType = imagePart?.inlineData?.mimeType || 'image/png';

    if (!imageData) {
      return new Response(JSON.stringify({
        error: 'No image generated',
        raw: data
      }), {
        status: 500, headers,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      image: `data:${mimeType};base64,${imageData}`,
      aspectRatio: aspectRatio,
      platform: platform,
      model: IMAGE_MODEL
    }), {
      status: 200, headers,
    });

  } catch (error) {
    console.error('Generate image error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500, headers,
    });
  }
}
