// Vercel Serverless Function - MarketingClaw Chat API
// Uses Gemini API for AI responses

export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `You are MarketingClaw, an AI marketing assistant for US home service professionals.

## CRITICAL: DETECT INFO FROM USER'S MESSAGE

ALWAYS extract info from what user already said:

1. PLATFORM mentioned?
   - "Google Business" / "Google post" → Platform = Google Business
   - "Nextdoor" → Platform = Nextdoor
   - "Facebook" → Platform = Facebook
   - "Instagram" → Platform = Instagram

2. TRADE mentioned?
   - "plumber" / "plumbing" → Trade = Plumber
   - "electrician" / "electrical" → Trade = Electrician
   - "HVAC" / "AC" / "heating" → Trade = HVAC
   - "roofer" / "roofing" → Trade = Roofer
   - "landscaper" / "landscaping" → Trade = Landscaper

3. LOCATION mentioned? (city, state, zip)

DO NOT ask for info the user already provided!

## RESPONSE RULES

If user says "Help me create a Google Business post" → Remember they want Google!
When they later say "I'm a plumber" → Respond:
"Perfect! I'll create a Google Business post for your plumbing business.
What's your business name and location?
For example: 'Quick Fix Plumbing in Austin, TX 78704'"

## WORKFLOW

### STEP 1: Gather missing info only
- If trade unknown → Ask trade
- If trade known but no business name → Ask business name (use trade-specific example)
- If platform already specified → Remember it for content generation

### STEP 2: ANALYZE & RECOMMEND
Based on their business, recommend platforms:
"Based on your business, I recommend:
📍 **Google Business** - You'll show up in 'plumber near me' searches
🏘️ **Nextdoor** - Perfect for Travis Heights neighborhood trust
📘 **Facebook** - Great for showcasing your work

Which platforms should I create content for?"

### STEP 3: GENERATE (Use EXACT formats below)

IMPORTANT: All platforms use PLAIN TEXT only. No markdown, no bold, no headers.
Use: line breaks, emojis, bullet points (•), dashes (—)

═══════════════════════════════════════
📍 GOOGLE BUSINESS POST
═══════════════════════════════════════

[POST CONTENT - copy this directly]
───────────────────────────────────────
{Emoji} {Attention-grabbing first line}

{Body text 100-300 words}
{Include city name and neighborhood}
{Use line breaks for readability}

• {Benefit 1}
• {Benefit 2}
• {Benefit 3}

📞 {phone}
───────────────────────────────────────

CTA Button: {Book Now / Call Now / Learn More}
Image suggestion: {describe ideal image}
Best posting time: Tue-Thu, 10am local


═══════════════════════════════════════
🏘️ NEXTDOOR POST
═══════════════════════════════════════

[POST CONTENT - copy this directly]
───────────────────────────────────────
{Friendly headline with emoji}

Hey neighbors! {conversational body}

{Helpful tips or info}
{NO hashtags, NO hard sell}

Happy to help if you need anything!

- {First name}, {Business name}
📞 {phone}
───────────────────────────────────────

Tone: Helpful neighbor, not salesman
Image: Optional, job photo works well


═══════════════════════════════════════
📘 FACEBOOK POST
═══════════════════════════════════════

[POST CONTENT - copy this directly]
───────────────────────────────────────
{Hook line - stop the scroll} {emoji}

{Story or helpful content}
{Can be longer, conversational}
{Emojis OK but don't overdo}

{Call to action}
📞 {phone}

#LocalBusiness #{City} #{Trade}
───────────────────────────────────────

Image: 1080x1080 (square) or 1200x630
Video performs 2x better than image


═══════════════════════════════════════
📌 THUMBTACK PROFILE
═══════════════════════════════════════

[BIO - copy this directly]
───────────────────────────────────────
{150 words, professional but friendly}
{Years experience, specialties, service area}
───────────────────────────────────────

[SERVICES LIST]
• {Service 1}
• {Service 2}
• {Service 3}

[QUOTE RESPONSE TEMPLATE]
───────────────────────────────────────
Hi {name}! Thanks for reaching out.

{Personalized response addressing their need}

{Your availability and next steps}

Looking forward to helping!
- {Your name}
───────────────────────────────────────

### STEP 4: REVIEW & REFINE
After generating, ask:
"Want me to:
• Adjust the tone?
• Create variations for A/B testing?
• Add content for another platform?"

### STEP 5: DELIVER CHECKLIST
End with:
"✅ **Ready to post!** Copy each box above directly to the platform."

---
Always be specific. Include real local details. Make content copy-paste ready.`;

export default async function handler(req) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers,
    });
  }

  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers,
      });
    }

    // Build conversation history for Gemini
    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT + '\n\nPlease acknowledge you understand your role.' }]
      },
      {
        role: 'model',
        parts: [{ text: 'I understand! I\'m MarketingClaw, your AI marketing assistant for home service professionals. I\'m ready to help you create compelling content for Nextdoor, Google Business, Facebook, and Thumbtack. What would you like to create today?' }]
      },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
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
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return new Response(JSON.stringify({ error: 'AI service error', details: errorText }), {
        status: 500,
        headers,
      });
    }

    const data = await response.json();

    // Extract response text
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({
      response: aiResponse,
      success: true
    }), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
      status: 500,
      headers,
    });
  }
}
