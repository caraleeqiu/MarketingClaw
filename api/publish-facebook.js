// Vercel Serverless Function - Publish to Facebook Page
// Requires Facebook Page Access Token

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
    const { pageId, accessToken, message, imageUrl } = await req.json();

    if (!pageId || !accessToken || !message) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        required: ['pageId', 'accessToken', 'message']
      }), { status: 400, headers });
    }

    let postId;

    if (imageUrl) {
      // Post with image
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/photos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: imageUrl,
            caption: message,
            access_token: accessToken
          })
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      postId = data.post_id || data.id;
    } else {
      // Text-only post
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message,
            access_token: accessToken
          })
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      postId = data.id;
    }

    return new Response(JSON.stringify({
      success: true,
      postId: postId,
      message: 'Posted successfully to Facebook!'
    }), { status: 200, headers });

  } catch (error) {
    console.error('Facebook publish error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to publish',
      message: error.message
    }), { status: 500, headers });
  }
}
