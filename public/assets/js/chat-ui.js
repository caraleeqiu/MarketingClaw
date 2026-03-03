/**
 * MarketingClaw - Chat UI
 * Message display, conversation flow, and chat interactions
 */

import { state, getHistory, saveToHistory } from './state.js';
import { quickPrompts, topicsByTrade } from './config.js';
import { formatMarkdown, capitalize, getTradeIcon, getTopicsForTrade, delay, getSelectedPlatforms } from './utils.js';
import { renderGooglePreview, renderFacebookPreview, renderNextdoorPreview, renderInstagramPreview, generateGoogleBusinessContent } from './preview-renders.js';

// Add loading message
export function addLoadingMessage() {
    const chatArea = document.getElementById('chatArea');
    const loadingEl = document.createElement('div');
    loadingEl.className = 'message assistant';
    loadingEl.innerHTML = `
        <div class="message-content" style="display: flex; gap: 8px;">
            <span class="loading-dot">●</span>
            <span class="loading-dot">●</span>
            <span class="loading-dot">●</span>
        </div>
    `;
    chatArea.appendChild(loadingEl);
    chatArea.scrollTop = chatArea.scrollHeight;
    return loadingEl;
}

// Add message to chat
export function addMessage(role, content) {
    const chatArea = document.getElementById('chatArea');

    const welcome = chatArea.querySelector('.welcome');
    if (welcome) welcome.remove();

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedContent = role === 'assistant' ? formatMarkdown(content) : content.replace(/\n/g, '<br>');

    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    messageEl.innerHTML = `
        <div class="message-content">${formattedContent}</div>
        <div class="message-meta">${role === 'user' ? 'You' : '🏠🔧 MarketingClaw'} • ${time}</div>
    `;

    chatArea.appendChild(messageEl);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Add chat bubble (for conversation flow)
export function addChatBubble(role, content, extras = '') {
    const chatArea = document.getElementById('chatArea');

    const welcome = chatArea.querySelector('.welcome');
    if (welcome) welcome.remove();

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = `
        <div class="bubble">
            ${content}
            ${extras}
        </div>
        <div class="time">${role === 'user' ? 'You' : '🏠🔧'} • ${time}</div>
    `;

    chatArea.appendChild(bubble);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Process conversation for business info extraction
export async function processConversation(message) {
    const lowerMsg = message.toLowerCase();

    // Check for greetings
    if (['hi', 'hello', 'hey', 'help'].some(g => lowerMsg.includes(g)) && lowerMsg.length < 30) {
        addChatBubble('assistant', `
            <strong>Hi there! 👋</strong><br><br>
            I'm MarketingClaw, your AI marketing assistant for home service businesses.<br><br>
            What kind of work do you do?
        `, `
            <div class="quick-replies">
                <button class="quick-reply" onclick="window.selectTradeFromChat('plumber')">🔧 Plumber</button>
                <button class="quick-reply" onclick="window.selectTradeFromChat('electrician')">⚡ Electrician</button>
                <button class="quick-reply" onclick="window.selectTradeFromChat('hvac')">❄️ HVAC</button>
                <button class="quick-reply" onclick="window.selectTradeFromChat('roofer')">🏠 Roofer</button>
            </div>
        `);
        return;
    }

    // Detect trade
    const tradeKeywords = {
        plumber: ['plumber', 'plumbing', 'pipes', 'drain', 'water heater'],
        electrician: ['electrician', 'electrical', 'wiring', 'panel', 'ev charger'],
        hvac: ['hvac', 'ac', 'air conditioning', 'heating', 'furnace'],
        roofer: ['roofer', 'roofing', 'roof', 'shingles', 'gutter']
    };

    let detectedTrade = null;
    for (const [trade, keywords] of Object.entries(tradeKeywords)) {
        if (keywords.some(k => lowerMsg.includes(k))) {
            detectedTrade = trade;
            break;
        }
    }

    if (detectedTrade) {
        state.selectedTrade = detectedTrade;

        // Try to extract business info
        const nameMatch = message.match(/(?:called|named|is|business)\s+['"]?([A-Z][A-Za-z'\s]+)['"]?/i) ||
                          message.match(/['"]([A-Z][A-Za-z'\s]+(?:Plumbing|Electric|HVAC|Roofing|Services?))['"]?/i);

        const locationMatch = message.match(/in\s+([A-Za-z\s]+,?\s*[A-Z]{2})/i) ||
                              message.match(/([A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5})/i);

        const phoneMatch = message.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);

        if (nameMatch && locationMatch) {
            state.businessInfo = {
                name: nameMatch[1].trim(),
                trade: state.selectedTrade,
                location: locationMatch[1].trim(),
                phone: phoneMatch ? phoneMatch[1] : ''
            };

            addChatBubble('assistant', `
                <strong>Got it! 📝</strong><br><br>
                <strong>${state.businessInfo.name}</strong><br>
                📍 ${state.businessInfo.location}<br>
                🔧 ${capitalize(state.selectedTrade)}<br><br>
                Let me find trending topics for your area...
            `);

            await delay(1000);
            await showTopicRecommendationsChat();
        } else {
            addChatBubble('assistant', `
                <strong>Great, you're a ${capitalize(detectedTrade)}! 🔧</strong><br><br>
                What's your business name and location?<br><br>
                <em>Example: "Mike's Plumbing in Austin, TX 78704"</em>
            `);
        }
    } else {
        // Generic response - call API
        await window.sendMessage();
    }
}

// Select trade from chat
export function selectTradeFromChat(trade) {
    state.selectedTrade = trade;
    addChatBubble('user', `I'm a ${capitalize(trade)}`);

    setTimeout(() => {
        addChatBubble('assistant', `
            <strong>Awesome! ${getTradeIcon(trade)} ${capitalize(trade)} it is!</strong><br><br>
            What's your business name and location?<br><br>
            <em>Example: "Quick Fix Plumbing in Austin, TX 78704"</em>
        `);
    }, 300);
}

// Show topic recommendations in chat
export async function showTopicRecommendationsChat() {
    const trade = state.selectedTrade || 'plumber';
    const tradeIcon = getTradeIcon(trade);
    const tradeName = capitalize(trade);

    // Step 1: DISCOVER - Show agents analyzing
    addChatBubble('assistant', `
        <div class="agent-flow">
            <div class="flow-step active">
                <div class="step-header">🔍 DISCOVER: Hiring Research Agents</div>
                <div class="step-agents">
                    <div class="agent-item hiring">🌡️ Local Weather Agent</div>
                    <div class="agent-item hiring">📰 Community News Agent</div>
                    <div class="agent-item hiring">📊 Trend Radar Agent</div>
                </div>
                <div class="step-status">Analyzing ${state.businessInfo?.location || 'your area'}...</div>
            </div>
        </div>
    `);

    await delay(1200);

    // Step 2: Show expert agent
    addChatBubble('assistant', `
        <div class="agent-flow">
            <div class="flow-step active">
                <div class="step-header">💡 ANALYZE: Hiring ${tradeName} Expert</div>
                <div class="step-agents">
                    <div class="agent-item hiring">${tradeIcon} ${tradeName} Industry Expert</div>
                    <div class="agent-item hiring">📈 Market Trend Analyst</div>
                </div>
                <div class="step-status">Finding best topics for ${tradeName}s...</div>
            </div>
        </div>
    `);

    await delay(1000);

    // Now show topics
    const topics = getTopicsForTrade(state.selectedTrade);

    addChatBubble('assistant', `
        <strong>📊 Hot Topics for ${capitalize(state.selectedTrade)}s This Week:</strong>
        ${topics.map((t, i) => `
            <div style="background: ${i === 0 ? 'var(--primary-light)' : 'white'}; padding: 12px 16px; border-radius: 10px; margin: 8px 0; cursor: pointer; border: 1px solid var(--border);" onclick="window.selectTopicFromChat('${t.title}')">
                <div style="font-weight: 600;">${t.icon} ${t.title} ${i === 0 ? '⭐ Recommended' : ''}</div>
                <div style="font-size: 13px; color: var(--text-secondary);">${t.reason}</div>
            </div>
        `).join('')}
    `, `
        <div class="quick-replies">
            <button class="quick-reply" onclick="window.selectTopicFromChat('${topics[0].title}')">✨ Use recommended</button>
            <button class="quick-reply" onclick="window.showMoreTopics()">📊 More options</button>
        </div>
    `);
}

// Show more topics
export function showMoreTopics() {
    addChatBubble('user', 'Show other topics');
    const topics = getTopicsForTrade(state.selectedTrade);

    setTimeout(() => {
        addChatBubble('assistant', `
            <strong>📊 All recommended topics:</strong>
            ${topics.map((t, i) => `
                <div style="background: ${i === 0 ? 'var(--primary-light)' : 'white'}; padding: 12px 16px; border-radius: 10px; margin: 8px 0; cursor: pointer; border: 1px solid var(--border);" onclick="window.selectTopicFromChat('${t.title}')">
                    <div style="font-weight: 600;">${t.icon} ${t.title} ${i === 0 ? '⭐' : ''}</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">${t.reason}</div>
                </div>
            `).join('')}
        `);
    }, 300);
}

// Select topic from chat
export function selectTopicFromChat(topic) {
    state.selectedTopicTitle = topic;
    addChatBubble('user', `Selected: ${topic}`);
    setTimeout(() => {
        addChatBubble('assistant', `Great choice! Ready to generate content about "${topic}"?`, `
            <div class="quick-replies">
                <button class="quick-reply" onclick="window.generateAllContent()">✨ Generate content</button>
            </div>
        `);
    }, 300);
}

// Generate all content
export async function generateAllContent() {
    addChatBubble('user', 'Generate content');
    const trade = state.selectedTrade || 'plumber';
    const tradeIcon = getTradeIcon(trade);
    const tradeName = capitalize(trade);

    // Step 1: Show hiring agents
    await delay(300);
    addChatBubble('assistant', `
        <div class="agent-flow">
            <div class="flow-step active" id="step-discover">
                <div class="step-header">🔍 Step 1: DISCOVER</div>
                <div class="step-agents">
                    <div class="agent-item hiring">🌡️ Local Weather Agent</div>
                    <div class="agent-item">📰 Community News Agent</div>
                    <div class="agent-item">📊 Trend Radar Agent</div>
                </div>
                <div class="step-status">Analyzing local opportunities...</div>
            </div>
        </div>
    `);

    await delay(800);

    // Step 2: Connect
    addChatBubble('assistant', `
        <div class="agent-flow">
            <div class="flow-step active" id="step-connect">
                <div class="step-header">💡 Step 2: CONNECT</div>
                <div class="step-agents">
                    <div class="agent-item hiring">${tradeIcon} ${tradeName} Expert Agent</div>
                    <div class="agent-item">🧠 Local Psychology Agent</div>
                </div>
                <div class="step-status">Finding the best angle for your audience...</div>
            </div>
        </div>
    `);

    await delay(600);

    // Step 3: Strategize
    addChatBubble('assistant', `
        <div class="agent-flow">
            <div class="flow-step active" id="step-strategize">
                <div class="step-header">📊 Step 3: STRATEGIZE</div>
                <div class="step-agents">
                    <div class="agent-item hiring">📱 Platform Strategist</div>
                </div>
                <div class="step-status">Selecting best platforms: Google Business, Facebook, Nextdoor</div>
            </div>
        </div>
    `);

    await delay(600);

    // Step 4: Generate
    addChatBubble('assistant', `
        <div class="agent-flow">
            <div class="flow-step active" id="step-generate">
                <div class="step-header">✍️ Step 4: GENERATE</div>
                <div class="step-agents">
                    <div class="agent-item hiring">📍 Google Business Writer</div>
                    <div class="agent-item hiring">📘 Facebook Writer</div>
                    <div class="agent-item hiring">🏘️ Nextdoor Writer</div>
                    <div class="agent-item">🖼️ AI Image Generator</div>
                </div>
                <div class="step-status">Creating platform-optimized content...</div>
            </div>
        </div>
    `);

    const biz = state.businessInfo;
    const topic = state.selectedTopicTitle;

    await window.generateContentPack(biz, topic);
}

// Use example message
export function useExample(el) {
    const text = el.textContent.replace(/"/g, '');
    document.getElementById('messageInput').value = text;
    document.getElementById('messageInput').focus();
}

// Quick prompt
export function quickPrompt(type) {
    const prompt = quickPrompts[type] || '';
    document.getElementById('messageInput').value = prompt;
    document.getElementById('messageInput').focus();
}

// Quick generate
export function quickGenerate() {
    const welcome = document.querySelector('.welcome');
    if (welcome) welcome.remove();

    const biz = state.businessInfo;
    if (!biz || !biz.name) {
        addChatBubble('assistant', '⚠️ Please tell me about your business first.');
        return;
    }

    const topic = state.selectedTopicTitle || 'Spring maintenance tips';
    window.generateContentPack(biz, topic);
}

// Show history
export function showHistory() {
    const chatArea = document.getElementById('chatArea');
    const history = getHistory();

    if (history.length === 0) {
        addChatBubble('assistant', 'No content history yet. Generate some content first!');
        return;
    }

    const byDate = {};
    history.forEach(entry => {
        if (!byDate[entry.date]) byDate[entry.date] = [];
        byDate[entry.date].push(entry);
    });

    let html = '<h2 style="margin-bottom: 20px;">📅 Content History</h2>';
    for (const [date, entries] of Object.entries(byDate)) {
        html += `<h3 style="margin: 16px 0 8px; color: var(--text-secondary);">${date}</h3>`;
        entries.forEach(e => {
            html += `
                <div style="background: white; padding: 16px; border-radius: 12px; margin-bottom: 12px; border: 1px solid var(--border);">
                    <div style="font-weight: 600;">${e.topic}</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">${e.business} • ${e.platforms.join(', ')}</div>
                </div>
            `;
        });
    }

    chatArea.innerHTML = html;
}

// Show auto publish
export function showAutoPublish() {
    const chatArea = document.getElementById('chatArea');
    const welcome = chatArea.querySelector('.welcome');
    if (welcome) welcome.remove();

    chatArea.innerHTML = `
        <div style="max-width: 700px; margin: 0 auto; padding: 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 48px; margin-bottom: 12px;">🚀</div>
                <h2 style="margin-bottom: 8px;">Auto Publish</h2>
                <p style="color: var(--text-secondary);">Schedule posts to keep your social media active</p>
            </div>

            <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid var(--border);">
                <h3 style="margin-bottom: 16px;">📅 Scheduled Posts</h3>
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <div style="font-size: 32px; margin-bottom: 12px;">📭</div>
                    <p>No scheduled posts yet</p>
                    <p style="font-size: 13px; margin-top: 8px;">Generate content first, then schedule it for later</p>
                </div>
            </div>

            <div style="background: white; border-radius: 16px; padding: 24px; border: 1px solid var(--border);">
                <h3 style="margin-bottom: 16px;">⚡ Quick Schedule</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                    <div style="background: var(--bg); padding: 16px; border-radius: 12px; text-align: center; cursor: pointer;" onclick="window.location.href='chat.html'">
                        <div style="font-size: 24px; margin-bottom: 8px;">📍</div>
                        <div style="font-weight: 500; font-size: 14px;">Google Business</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Weekly updates</div>
                    </div>
                    <div style="background: var(--bg); padding: 16px; border-radius: 12px; text-align: center; cursor: pointer;" onclick="window.location.href='chat.html'">
                        <div style="font-size: 24px; margin-bottom: 8px;">🏘️</div>
                        <div style="font-weight: 500; font-size: 14px;">Nextdoor</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">2x per week</div>
                    </div>
                    <div style="background: var(--bg); padding: 16px; border-radius: 12px; text-align: center; cursor: pointer;" onclick="window.location.href='chat.html'">
                        <div style="font-size: 24px; margin-bottom: 8px;">📘</div>
                        <div style="font-weight: 500; font-size: 14px;">Facebook</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">3x per week</div>
                    </div>
                </div>
            </div>

            <button onclick="window.location.href='chat.html'" style="width: 100%; margin-top: 20px; padding: 16px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;">
                ← Back to WorkSpace
            </button>
        </div>
    `;
}

// Select trade
export function selectTrade(trade) {
    state.selectedTrade = trade;
    document.querySelectorAll('.trade-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.trade === trade);
    });
}

// Display content pack
export function displayContentPack(pack) {
    const chatArea = document.getElementById('chatArea');
    const biz = state.businessInfo;

    const gbpContent = generateGoogleBusinessContent(biz, pack);
    const selectedPlatforms = getSelectedPlatforms();

    state.generatedContent = { pack, gbp: gbpContent, biz };
    saveToHistory(pack, biz, state.selectedTopicTitle || 'Marketing Content');

    chatArea.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <div>
                    <h2 style="margin-bottom: 4px;">✅ Content Ready</h2>
                    <p style="color: var(--text-secondary);">${biz.name} • ${state.selectedTopicTitle || 'Marketing Content'}</p>
                </div>
                <button class="generate-pack-btn" onclick="window.publishAll()" style="margin: 0;">
                    🚀 Publish All
                </button>
            </div>

            <p style="margin-bottom: 16px; color: var(--text-secondary);">Click any card to preview, edit, or publish</p>

            <div class="preview-grid">
                ${selectedPlatforms.includes('google') ? renderGooglePreview(pack, biz) : ''}
                ${selectedPlatforms.includes('facebook') ? renderFacebookPreview(pack, biz) : ''}
                ${selectedPlatforms.includes('nextdoor') ? renderNextdoorPreview(pack, biz) : ''}
                ${selectedPlatforms.includes('instagram') ? renderInstagramPreview(pack, biz) : ''}
            </div>
        </div>
    `;

    chatArea.scrollTop = 0;
}

// Export functions to window for HTML onclick handlers
if (typeof window !== 'undefined') {
    window.selectTradeFromChat = selectTradeFromChat;
    window.selectTopicFromChat = selectTopicFromChat;
    window.showMoreTopics = showMoreTopics;
    window.generateAllContent = generateAllContent;
    window.useExample = useExample;
    window.quickPrompt = quickPrompt;
    window.quickGenerate = quickGenerate;
    window.showHistory = showHistory;
    window.showAutoPublish = showAutoPublish;
    window.selectTrade = selectTrade;
}
