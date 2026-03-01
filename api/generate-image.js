// Vercel Serverless Function - Generate Marketing Images using Imagen API
export const config = {
  runtime: 'edge',
};

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

    // Call Imagen API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: aspectRatio,
            personGeneration: 'allow_adult'  // Allow professional workers in marketing photos
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imagen API error:', errorText);
      return new Response(JSON.stringify({
        error: 'Image generation failed',
        details: errorText
      }), {
        status: 500, headers,
      });
    }

    const data = await response.json();

    // Imagen returns base64 encoded images
    const imageData = data.predictions?.[0]?.bytesBase64Encoded;

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
      image: `data:image/png;base64,${imageData}`,
      aspectRatio: aspectRatio,
      platform: platform
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
