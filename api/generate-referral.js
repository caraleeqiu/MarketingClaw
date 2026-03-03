// Vercel Serverless Function - Generate Referral Content (WhatsApp + Social)
// v1.0 - WhatsApp Referral Flow

export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `You are MarketingClaw. Generate referral content for home service professionals who just completed a job.

IMPORTANT: Respond with ONLY valid JSON. Use \\n for line breaks.

Generate:
1. A WhatsApp message to send to the customer (friendly, includes review request and referral offer)
2. Social media posts showcasing the completed work

{
  "whatsappMessage": "Hi {customerName}! 👋\\n\\nThanks for choosing {businessName} today!...\\n\\n⭐ Review link...\\n\\n🎁 Referral offer...",
  "socialPosts": {
    "google": {
      "title": "max 58 chars - completed job post",
      "content": "Just completed...\\n\\nCall us: phone",
      "cta": "Call Now"
    },
    "facebook": {
      "hook": "✅ Job Complete!",
      "content": "Another satisfied customer...\\n\\nHashtags",
      "hashtags": ["#HomeServices", "#LocalBusiness"]
    },
    "nextdoor": {
      "content": "Hey neighbors! Just finished up...\\n\\n- Business Name"
    }
  },
  "referralCode": "CUST25"
}

RULES:
- WhatsApp message should be warm, personal, not too salesy
- Include Google review link placeholder
- Referral code should be based on customer name + discount amount
- Social posts should be about showcasing work quality, not asking for reviews
- Use \\n for line breaks`;

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
    const { business, customerName, jobDescription, hasBeforeAfter } = await req.json();

    if (!business || !business.name) {
      return new Response(JSON.stringify({ error: 'Business info required' }), {
        status: 400, headers,
      });
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      // Return fallback content if no API key
      return new Response(JSON.stringify({
        success: true,
        ...generateFallbackContent(business, customerName, jobDescription)
      }), { headers });
    }

    const userPrompt = `Generate referral content for:
Business: ${business.name}
Trade: ${business.trade || 'home services'}
Location: ${business.location || 'local area'}
Customer Name: ${customerName || 'Customer'}
Job Description: ${jobDescription || 'completed service'}
Has Before/After Photos: ${hasBeforeAfter ? 'Yes' : 'No'}

Generate WhatsApp message, social posts, and referral code.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'I understand. I will generate referral content as valid JSON only.' }] },
            { role: 'user', parts: [{ text: userPrompt }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return new Response(JSON.stringify({
        success: true,
        ...generateFallbackContent(business, customerName, jobDescription)
      }), { headers });
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({
        success: true,
        ...generateFallbackContent(business, customerName, jobDescription)
      }), { headers });
    }

    const content = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({
      success: true,
      whatsappMessage: content.whatsappMessage,
      socialPosts: content.socialPosts,
      referralCode: content.referralCode
    }), { headers });

  } catch (error) {
    console.error('Generate referral error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500, headers });
  }
}

// Fallback content generation
function generateFallbackContent(business, customerName, jobDescription) {
  const customer = customerName || 'Customer';
  const job = jobDescription || 'your recent service';
  const referralCode = customer.toUpperCase().substring(0, 4) + '25';

  return {
    whatsappMessage: `Hi ${customer}! 👋

Thanks for choosing ${business.name} today! Here's a photo of the completed work.

If you're happy with the service, we'd really appreciate a quick review - it helps other neighbors find us:
⭐ Leave us a review on Google!

🎁 REFERRAL BONUS: Get $25 off your next service for each friend you refer! Just have them mention code: ${referralCode}

Thanks again!
- The ${business.name} Team`,

    socialPosts: {
      google: {
        title: 'Another Happy Customer!',
        content: `Just completed ${job} in ${business.location || 'the area'}. Our team takes pride in every job, big or small. Need help with your home? Give us a call!`,
        cta: 'Call Now'
      },
      facebook: {
        hook: '✅ Job Complete!',
        content: `Another satisfied customer in ${business.location || 'the area'}! ${job ? `Today we helped with: ${job}` : ''}\n\nWe love what we do, and it shows in our work. Thanks for trusting ${business.name}! 🙏`,
        hashtags: ['#HomeServices', '#LocalBusiness', '#5StarService']
      },
      nextdoor: {
        content: `Hey neighbors! Just finished up a job nearby. If you need any ${business.trade || 'home service'} help, we're always happy to help our community. ${business.name} - your local experts! 📞`
      }
    },
    referralCode
  };
}
