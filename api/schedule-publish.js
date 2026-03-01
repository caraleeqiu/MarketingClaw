// Vercel Serverless Function - Scheduled Publish API
// Handles scheduling, storing, and triggering automated posts

export const config = {
  runtime: 'edge',
};

// In production, use a proper database (Supabase, Planetscale, etc.)
// This is a simple in-memory store for demo purposes
const scheduledPosts = new Map();

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    // GET - List scheduled posts
    if (req.method === 'GET') {
      const userId = url.searchParams.get('userId') || 'demo';
      const posts = Array.from(scheduledPosts.values())
        .filter(p => p.userId === userId)
        .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

      return new Response(JSON.stringify({
        success: true,
        posts
      }), { status: 200, headers });
    }

    // POST - Create scheduled post
    if (req.method === 'POST') {
      const body = await req.json();
      const {
        userId = 'demo',
        platform,
        content,
        image,
        scheduledTime,
        recurring,
        requireConfirmation = true
      } = body;

      if (!platform || !content || !scheduledTime) {
        return new Response(JSON.stringify({
          error: 'Missing required fields: platform, content, scheduledTime'
        }), { status: 400, headers });
      }

      const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const scheduledPost = {
        id: postId,
        userId,
        platform,
        content,
        image,
        scheduledTime: new Date(scheduledTime).toISOString(),
        recurring: recurring || null, // 'daily', 'weekly', 'monthly'
        requireConfirmation,
        status: requireConfirmation ? 'pending_confirmation' : 'scheduled',
        createdAt: new Date().toISOString(),
        confirmedAt: null,
        publishedAt: null
      };

      scheduledPosts.set(postId, scheduledPost);

      // If confirmation required, send notification (email/SMS in production)
      if (requireConfirmation) {
        // In production: send email/push notification
        console.log(`[NOTIFY] Post ${postId} pending confirmation for ${scheduledTime}`);
      }

      return new Response(JSON.stringify({
        success: true,
        post: scheduledPost,
        message: requireConfirmation
          ? 'Post scheduled. Confirmation required before publishing.'
          : 'Post scheduled and will publish automatically.'
      }), { status: 201, headers });
    }

    // DELETE - Cancel scheduled post
    if (req.method === 'DELETE') {
      const postId = url.searchParams.get('postId');

      if (!postId || !scheduledPosts.has(postId)) {
        return new Response(JSON.stringify({
          error: 'Post not found'
        }), { status: 404, headers });
      }

      scheduledPosts.delete(postId);

      return new Response(JSON.stringify({
        success: true,
        message: 'Scheduled post cancelled'
      }), { status: 200, headers });
    }

    // Action: Confirm post
    if (action === 'confirm') {
      const { postId } = await req.json();

      if (!scheduledPosts.has(postId)) {
        return new Response(JSON.stringify({
          error: 'Post not found'
        }), { status: 404, headers });
      }

      const post = scheduledPosts.get(postId);
      post.status = 'scheduled';
      post.confirmedAt = new Date().toISOString();
      scheduledPosts.set(postId, post);

      return new Response(JSON.stringify({
        success: true,
        post,
        message: 'Post confirmed and will publish at scheduled time'
      }), { status: 200, headers });
    }

    // Action: Trigger publish (called by cron job)
    if (action === 'trigger') {
      const now = new Date();
      const postsToPublish = Array.from(scheduledPosts.values())
        .filter(p =>
          p.status === 'scheduled' &&
          new Date(p.scheduledTime) <= now
        );

      const results = [];

      for (const post of postsToPublish) {
        try {
          // Call the appropriate publish API
          const publishResult = await publishToplatform(post);

          post.status = 'published';
          post.publishedAt = new Date().toISOString();
          scheduledPosts.set(post.id, post);

          // Handle recurring posts
          if (post.recurring) {
            const nextTime = calculateNextTime(post.scheduledTime, post.recurring);
            const newPost = {
              ...post,
              id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              scheduledTime: nextTime,
              status: post.requireConfirmation ? 'pending_confirmation' : 'scheduled',
              confirmedAt: null,
              publishedAt: null,
              createdAt: new Date().toISOString()
            };
            scheduledPosts.set(newPost.id, newPost);
          }

          results.push({ postId: post.id, success: true });
        } catch (error) {
          post.status = 'failed';
          post.error = error.message;
          scheduledPosts.set(post.id, post);
          results.push({ postId: post.id, success: false, error: error.message });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        processed: results.length,
        results
      }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400, headers
    });

  } catch (error) {
    console.error('Schedule API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), { status: 500, headers });
  }
}

// Helper: Calculate next recurring time
function calculateNextTime(currentTime, recurring) {
  const date = new Date(currentTime);

  switch (recurring) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }

  return date.toISOString();
}

// Helper: Publish to platform (stub - integrate with actual APIs)
async function publishToplatform(post) {
  // In production, call actual platform APIs:
  // - Google Business Profile API
  // - Facebook Graph API
  // - Nextdoor API

  console.log(`[PUBLISH] Publishing to ${post.platform}:`, post.content.substring(0, 50));

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));

  return { success: true, platformPostId: `${post.platform}_${Date.now()}` };
}
