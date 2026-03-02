/**
 * MarketingClaw - Chat UI
 * Message display, conversation flow, and chat interactions
 */

// Add loading message
function addLoadingMessage() {
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
function addMessage(role, content) {
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
function addChatBubble(role, content, extras = '') {
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
async function processConversation(message) {
    const chatArea = document.getElementById('chatArea');
    const lowerMsg = message.toLowerCase();

    // Check for greetings
    if (['hi', 'hello', 'hey', 'help'].some(g => lowerMsg.includes(g)) && lowerMsg.length < 30) {
        addChatBubble('assistant', `
            <strong>Hi there! 👋</strong><br><br>
            I'm MarketingClaw, your AI marketing assistant for home service businesses.<br><br>
            What kind of work do you do?
        `, `
            <div class="quick-replies">
                <button class="quick-reply" onclick="selectTradeFromChat('plumber')">🔧 Plumber</button>
                <button class="quick-reply" onclick="selectTradeFromChat('electrician')">⚡ Electrician</button>
                <button class="quick-reply" onclick="selectTradeFromChat('hvac')">❄️ HVAC</button>
                <button class="quick-reply" onclick="selectTradeFromChat('roofer')">🏠 Roofer</button>
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
        selectedTrade = detectedTrade;

        // Try to extract business info
        const nameMatch = message.match(/(?:called|named|is|business)\s+['"]?([A-Z][A-Za-z'\s]+)['"]?/i) ||
                          message.match(/['"]([A-Z][A-Za-z'\s]+(?:Plumbing|Electric|HVAC|Roofing|Services?))['"]?/i);

        const locationMatch = message.match(/in\s+([A-Za-z\s]+,?\s*[A-Z]{2})/i) ||
                              message.match(/([A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5})/i);

        const phoneMatch = message.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);

        if (nameMatch && locationMatch) {
            window.businessInfo = {
                name: nameMatch[1].trim(),
                trade: selectedTrade,
                location: locationMatch[1].trim(),
                phone: phoneMatch ? phoneMatch[1] : '(555) 123-4567'
            };

            addChatBubble('assistant', `
                <strong>Got it! 📝</strong><br><br>
                <strong>${window.businessInfo.name}</strong><br>
                📍 ${window.businessInfo.location}<br>
                🔧 ${capitalize(selectedTrade)}<br><br>
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
        await sendMessage();
    }
}

// Select trade from chat
function selectTradeFromChat(trade) {
    selectedTrade = trade;
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
async function showTopicRecommendationsChat() {
    const topics = getTopicsForTrade(selectedTrade);

    addChatBubble('assistant', `
        <strong>📊 Hot Topics for ${capitalize(selectedTrade)}s This Week:</strong>
        ${topics.map((t, i) => `
            <div style="background: ${i === 0 ? 'var(--primary-light)' : 'white'}; padding: 12px 16px; border-radius: 10px; margin: 8px 0; cursor: pointer; border: 1px solid var(--border);" onclick="selectTopicFromChat('${t.title}')">
                <div style="font-weight: 600;">${t.icon} ${t.title} ${i === 0 ? '⭐ Recommended' : ''}</div>
                <div style="font-size: 13px; color: var(--text-secondary);">${t.reason}</div>
            </div>
        `).join('')}
    `, `
        <div class="quick-replies">
            <button class="quick-reply" onclick="selectTopicFromChat('${topics[0].title}')">✨ Use recommended</button>
            <button class="quick-reply" onclick="showMoreTopics()">📊 More options</button>
        </div>
    `);
}

// Show more topics
function showMoreTopics() {
    addChatBubble('user', 'Show other topics');
    const topics = getTopicsForTrade(selectedTrade);

    setTimeout(() => {
        addChatBubble('assistant', `
            <strong>📊 All recommended topics:</strong>
            ${topics.map((t, i) => `
                <div style="background: ${i === 0 ? 'var(--primary-light)' : 'white'}; padding: 12px 16px; border-radius: 10px; margin: 8px 0; cursor: pointer; border: 1px solid var(--border);" onclick="selectTopicFromChat('${t.title}')">
                    <div style="font-weight: 600;">${t.icon} ${t.title} ${i === 0 ? '⭐' : ''}</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">${t.reason}</div>
                </div>
            `).join('')}
        `);
    }, 300);
}

// Select topic from chat
function selectTopicFromChat(topic) {
    window.selectedTopicTitle = topic;
    addChatBubble('user', `Selected: ${topic}`);
    setTimeout(() => {
        addChatBubble('assistant', `Great choice! Ready to generate content about "${topic}"?`, `
            <div class="quick-replies">
                <button class="quick-reply" onclick="generateAllContent()">✨ Generate content</button>
            </div>
        `);
    }, 300);
}

// Generate all content
async function generateAllContent() {
    addChatBubble('user', 'Generate content');

    await delay(300);
    addChatBubble('assistant', `
        <strong>✨ Generating your content pack...</strong><br><br>
        <div id="gen-progress">
            <div>📍 Creating Google Business post...</div>
            <div>📘 Creating Facebook post...</div>
            <div>🏘️ Creating Nextdoor post...</div>
            <div>🖼️ Generating AI images...</div>
        </div>
    `);

    const biz = window.businessInfo;
    const topic = window.selectedTopicTitle;

    await generateContentPack(biz, topic);
}

// Use example message
function useExample(el) {
    const text = el.textContent.replace(/"/g, '');
    document.getElementById('messageInput').value = text;
    document.getElementById('messageInput').focus();
}

// Quick prompt
function quickPrompt(type) {
    const prompt = quickPrompts[type] || '';
    document.getElementById('messageInput').value = prompt;
    document.getElementById('messageInput').focus();
}

// Quick generate
function quickGenerate() {
    const welcome = document.querySelector('.welcome');
    if (welcome) welcome.remove();

    const biz = window.businessInfo;
    if (!biz || !biz.name) {
        addChatBubble('assistant', '⚠️ Please tell me about your business first.');
        return;
    }

    const topic = window.selectedTopicTitle || 'Spring maintenance tips';
    generateContentPack(biz, topic);
}

// Show history
function showHistory() {
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
function showAutoPublish() {
    addChatBubble('assistant', `
        <strong>🚀 Auto Publish</strong><br><br>
        Set up automatic posting schedules to keep your social media active.<br><br>
        <em>Coming soon! This feature is in development.</em>
    `);
}

// Select trade
function selectTrade(trade) {
    selectedTrade = trade;
    document.querySelectorAll('.trade-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.trade === trade);
    });
}

// Show result tab
function showResultTab(tabName) {
    const parent = event.target.closest('.platform-content') || document;
    parent.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
    parent.querySelectorAll('.result-section').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(`section-${tabName}`)?.classList.add('active');
}

// Show platform tab
function showPlatformTab(platform) {
    document.querySelectorAll('.platform-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.platform-content').forEach(c => c.classList.remove('active'));
    event.target.closest('.platform-tab')?.classList.add('active');
    document.getElementById(`platform-${platform}`)?.classList.add('active');
}
