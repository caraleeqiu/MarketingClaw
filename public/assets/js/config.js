/**
 * MarketingClaw - Configuration & Constants
 * Contains all static data: agents, images, platform configs
 */

// Available agents - synced with marketplace
export const availableAgents = [
    // Local Intel
    { id: 'localtrend', name: 'Trend Radar', icon: '📍' },
    { id: 'competitor', name: 'Competitor Intel', icon: '🕵️' },
    { id: 'weather', name: 'Weather Finder', icon: '🌤️' },
    { id: 'seolocal', name: 'Local SEO', icon: '📊' },
    // Copywriting
    { id: 'homeprocopy', name: 'Pro Copywriter', icon: '✍️' },
    { id: 'reviewresponse', name: 'Review Responder', icon: '⭐' },
    { id: 'estimate', name: 'Quote Writer', icon: '📋' },
    // Visual
    { id: 'beforeafter', name: 'Before/After', icon: '📸' },
    { id: 'projectgallery', name: 'Gallery Builder', icon: '🖼️' },
    { id: 'tipsvideo', name: 'Video Creator', icon: '🎬' },
    // Platform
    { id: 'googlebiz', name: 'Google Business', icon: '📍' },
    { id: 'nextdoor', name: 'Nextdoor Pro', icon: '🏘️' },
    { id: 'facebooklocal', name: 'Facebook Local', icon: '📘' },
    { id: 'thumbtack', name: 'Thumbtack Pro', icon: '📌' },
    // WhatsApp & Referral
    { id: 'whatsapp-referral', name: 'WhatsApp Referral', icon: '📱', featured: true,
      description: 'Turn completed jobs into 5-star reviews & new customer referrals. Send job photos, request reviews, auto-generate referral codes.' },
    // Industry
    { id: 'plumber', name: 'Plumber AI', icon: '🔧' },
    { id: 'electrician', name: 'Electrician AI', icon: '⚡' },
    { id: 'hvac', name: 'HVAC AI', icon: '❄️' },
    { id: 'roofer', name: 'Roofer AI', icon: '🏠' },
    { id: 'landscaper', name: 'Landscaper AI', icon: '🌿' },
    { id: 'realestate', name: 'Real Estate AI', icon: '🏡' }
];

// Reliable fallback images - used when pack images are missing
export const fallbackImages = {
    plumber: 'https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&w=800',
    electrician: 'https://images.pexels.com/photos/8005397/pexels-photo-8005397.jpeg?auto=compress&w=800',
    hvac: 'https://images.pexels.com/photos/4489749/pexels-photo-4489749.jpeg?auto=compress&w=800',
    roofer: 'https://images.pexels.com/photos/8961001/pexels-photo-8961001.jpeg?auto=compress&w=800',
    landscaper: 'https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg?auto=compress&w=800',
    realtor: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&w=800',
    default: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&w=800'
};

// Topic-based fallback images
export const topicFallbackImages = {
    spring: 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&w=800',
    emergency: 'https://images.pexels.com/photos/8005368/pexels-photo-8005368.jpeg?auto=compress&w=800',
    discount: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&w=800',
    safety: 'https://images.pexels.com/photos/5691625/pexels-photo-5691625.jpeg?auto=compress&w=800',
    warning: 'https://images.pexels.com/photos/5691631/pexels-photo-5691631.jpeg?auto=compress&w=800',
    diy: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&w=800',
    quality: 'https://images.pexels.com/photos/8005397/pexels-photo-8005397.jpeg?auto=compress&w=800'
};

// Platform names and icons
export const platformNames = {
    google: { name: 'Google Business', icon: '📍' },
    nextdoor: { name: 'Nextdoor', icon: '🏘️' },
    facebook: { name: 'Facebook', icon: '📘' },
    instagram: { name: 'Instagram', icon: '📸' },
    yelp: { name: 'Yelp', icon: '⭐' },
    thumbtack: { name: 'Thumbtack', icon: '📌' }
};

// Platform-specific image styles for regeneration
export const platformImageStyles = {
    google: 'professional business photo, clean background, trust and reliability, Google Business Profile style',
    facebook: 'engaging social media photo, warm and friendly, lifestyle feel, Facebook post style, square format',
    nextdoor: 'neighborly community photo, local business feel, approachable, outdoor residential setting'
};

// Topics by trade
export const topicsByTrade = {
    plumber: [
        { icon: '🌧️', title: 'Spring Plumbing Inspection', reason: 'Spring rain season starting - sump pump & drain checks trending. Search volume up 180%', heat: '🔥🔥🔥 Very High' },
        { icon: '🌱', title: 'Outdoor Faucet & Sprinkler Startup', reason: 'Homeowners preparing yards for spring. Irrigation system repairs in demand', heat: '🔥🔥 High' },
        { icon: '🚿', title: 'Water Heater Flush Special', reason: 'Spring cleaning mindset - customers maintaining home systems', heat: '🔥 Medium' }
    ],
    electrician: [
        { icon: '⚡', title: 'EV Charger Installation', reason: 'Electric vehicle sales up 45% - home charging demand surging', heat: '🔥🔥🔥 Very High' },
        { icon: '🌤️', title: 'Outdoor Lighting & Landscape Electrical', reason: 'Spring outdoor projects booming - patio, deck, and garden lighting', heat: '🔥🔥 High' },
        { icon: '🔌', title: 'Whole Home Surge Protection', reason: 'Spring storm season = power surges. Protect electronics', heat: '🔥 Medium' }
    ],
    hvac: [
        { icon: '❄️', title: 'AC Tune-Up Before Summer', reason: 'Smart homeowners booking AC maintenance now. Searches up 320%', heat: '🔥🔥🔥 Very High' },
        { icon: '🌸', title: 'Spring Allergy Relief - Air Quality', reason: 'Pollen season! Air filtration & duct cleaning demand spiking', heat: '🔥🔥 High' },
        { icon: '🌡️', title: 'Heat Pump Efficiency Check', reason: 'Transition season - optimize for cooling mode', heat: '🔥 Medium' }
    ],
    roofer: [
        { icon: '🌧️', title: 'Spring Storm Damage Inspection', reason: 'Spring storms causing damage - insurance claims up 200%', heat: '🔥🔥🔥 Very High' },
        { icon: '🏠', title: 'Post-Winter Roof Assessment', reason: 'Winter damage revealed - shingle replacement season', heat: '🔥🔥 High' },
        { icon: '🌿', title: 'Gutter Cleaning & Maintenance', reason: 'Spring debris buildup - prevent water damage', heat: '🔥 Medium' }
    ]
};

// Quick prompts for demo
export const quickPrompts = {
    start: "Hi! I want to create marketing content for my home service business. Help me get started.",
    plumber: "I'm a plumber. My business is called 'Quick Fix Plumbing', located in Austin, TX (78704). I want to get more local leads. What platforms should I focus on and can you create content for me?",
    electrician: "I'm an electrician. My business is 'Spark Electric Services' in Phoenix, AZ (85001). I specialize in panel upgrades and EV charger installations. Help me create marketing content.",
    hvac: "I'm an HVAC technician. My company is 'Cool Comfort HVAC' in Denver, CO (80202). Summer is coming and I want to promote AC tune-ups. What content should I create?",
    roofer: "I'm a roofing contractor. My company is 'Summit Roofing' in Dallas, TX (75201). Storm season is here and I want to promote free roof inspections. Help me create marketing content.",
    google: "Create a Google Business post for my plumbing company 'Mike's Plumbing' in Austin TX (78704). Promote our $79 winter pipe inspection special.",
    nextdoor: "Create a Nextdoor post for my plumbing business. I want to warn neighbors in Travis Heights about the upcoming freeze and offer tips to protect their pipes.",
    facebook: "Create a Facebook post for my plumbing company. I just completed a beautiful bathroom renovation and want to showcase the before/after with a project story.",
    thumbtack: "Help me optimize my Thumbtack profile. I'm a plumber in Austin with 15 years experience, family owned, 24/7 emergency service. Also give me a quote response template."
};
