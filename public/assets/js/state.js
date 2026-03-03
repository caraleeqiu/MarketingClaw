/**
 * MarketingClaw - Global State Management
 * Manages application state and localStorage
 */

// Reactive state object
export const state = {
    addedAgents: JSON.parse(localStorage.getItem('addedAgentsHomePro') || '[]'),
    messages: [],
    hiredAgents: [],
    conversationHistory: [],
    isLoading: false,
    currentPublishPlatform: null,
    publishMode: 'now',
    selectedTrade: 'plumber',
    selectedTopic: 0,
    businessInfo: null,
    generatedContent: null,
    selectedTopicTitle: null
};

// Connected accounts (localStorage)
export function getConnectedAccounts() {
    return JSON.parse(localStorage.getItem('marketingclaw_accounts') || '{}');
}

export function setConnectedAccount(platform, data) {
    const accounts = getConnectedAccounts();
    accounts[platform] = data;
    localStorage.setItem('marketingclaw_accounts', JSON.stringify(accounts));
}

// History management
export function saveToHistory(pack, biz, topic) {
    try {
        const history = JSON.parse(localStorage.getItem('marketingclaw_history') || '[]');
        const today = new Date().toISOString().split('T')[0];

        // Create lightweight copy without base64 images
        const lightPack = {
            ...pack,
            images: {}
        };
        if (pack.images) {
            for (const [key, val] of Object.entries(pack.images)) {
                if (val && !val.startsWith('data:')) {
                    lightPack.images[key] = val;
                }
            }
        }

        const entry = {
            id: Date.now(),
            date: today,
            time: new Date().toLocaleTimeString(),
            business: biz.name,
            trade: biz.trade,
            location: biz.location || 'Local Area',
            phone: biz.phone || '',
            topic: topic,
            platforms: Object.keys(pack.platforms),
            status: 'draft',
            pack: lightPack
        };

        history.unshift(entry);
        while (history.length > 20) history.pop();

        localStorage.setItem('marketingclaw_history', JSON.stringify(history));
    } catch (e) {
        console.warn('Failed to save to history:', e.message);
        if (e.name === 'QuotaExceededError') {
            localStorage.removeItem('marketingclaw_history');
        }
    }
}

export function getHistory() {
    return JSON.parse(localStorage.getItem('marketingclaw_history') || '[]');
}

// Save added agents to localStorage
export function saveAddedAgents() {
    localStorage.setItem('addedAgentsHomePro', JSON.stringify(state.addedAgents));
}
