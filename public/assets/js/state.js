/**
 * MarketingClaw - Global State Management
 * Manages application state and localStorage
 */

// State variables
let addedAgents = JSON.parse(localStorage.getItem('addedAgentsHomePro') || '[]');
let messages = [];
let hiredAgents = [];
let conversationHistory = [];
let isLoading = false;
let currentPublishPlatform = null;
let publishMode = 'now';
let selectedTrade = 'plumber';
let selectedTopic = 0;

// Window-level state (for cross-module access)
window.businessInfo = null;
window.generatedContent = null;
window.selectedTopicTitle = null;

// Connected accounts (localStorage)
function getConnectedAccounts() {
    return JSON.parse(localStorage.getItem('marketingclaw_accounts') || '{}');
}

function setConnectedAccount(platform, data) {
    const accounts = getConnectedAccounts();
    accounts[platform] = data;
    localStorage.setItem('marketingclaw_accounts', JSON.stringify(accounts));
}

// History management
function saveToHistory(pack, biz, topic) {
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
            phone: biz.phone || '(555) 123-4567',
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

function getHistory() {
    return JSON.parse(localStorage.getItem('marketingclaw_history') || '[]');
}
