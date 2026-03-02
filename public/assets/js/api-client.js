/**
 * MarketingClaw - API Client
 * Handles all API calls to backend
 */

// Send chat message
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const message = input.value.trim();
    if (!message || isLoading) return;

    // Add user message
    addMessage('user', message);
    conversationHistory.push({ role: 'user', content: message });
    input.value = '';
    input.style.height = 'auto';

    // Show loading
    isLoading = true;
    sendBtn.disabled = true;
    sendBtn.textContent = '...';
    const loadingEl = addLoadingMessage();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                history: conversationHistory.slice(-10)
            })
        });

        const data = await response.json();
        loadingEl.remove();

        if (data.success && data.response) {
            addMessage('assistant', data.response);
            conversationHistory.push({ role: 'assistant', content: data.response });
        } else {
            addMessage('assistant', '⚠️ Sorry, something went wrong. Please try again.');
        }
    } catch (error) {
        console.error('Chat error:', error);
        loadingEl.remove();
        addMessage('assistant', '⚠️ Connection error. Please check your internet and try again.');
    } finally {
        isLoading = false;
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
    }
}

// Generate content pack
async function generateContentPack(business, topic) {
    const chatArea = document.getElementById('chatArea');

    // Show progress
    const progressEl = document.createElement('div');
    progressEl.innerHTML = `
        <div class="progress-steps" id="progressSteps">
            <div class="step active" id="step1">
                <div class="step-icon">1</div>
                <span>Analyzing business...</span>
            </div>
            <div class="step" id="step2">
                <div class="step-icon">2</div>
                <span>Generating content...</span>
            </div>
            <div class="step" id="step3">
                <div class="step-icon">3</div>
                <span>Creating images...</span>
            </div>
        </div>
    `;
    chatArea.appendChild(progressEl);
    chatArea.scrollTop = chatArea.scrollHeight;

    try {
        // Step 1: Done
        await delay(500);
        document.getElementById('step1').className = 'step done';
        document.getElementById('step1').querySelector('.step-icon').textContent = '✓';
        document.getElementById('step2').className = 'step active';

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        // Call API
        const response = await fetch('/api/generate-pack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ business, topic }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Step 2: Done
        document.getElementById('step2').className = 'step done';
        document.getElementById('step2').querySelector('.step-icon').textContent = '✓';
        document.getElementById('step3').className = 'step active';

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        // Step 3: Done
        await delay(500);
        document.getElementById('step3').className = 'step done';
        document.getElementById('step3').querySelector('.step-icon').textContent = '✓';

        if (data.success && data.pack) {
            displayContentPack(data.pack);
        } else {
            addMessage('assistant', '⚠️ Failed to generate content pack. ' + (data.error || ''));
        }
    } catch (error) {
        console.error('Generate pack error:', error);
        let errorMsg = 'Error generating content pack. Please try again.';
        if (error.name === 'AbortError') {
            errorMsg = 'Request timed out (60s). The server may be slow. Please try again.';
        }
        addMessage('assistant', `⚠️ ${errorMsg}`);
    }
}

// Regenerate image for platform
async function regenerateImage(platform) {
    const pack = window.generatedContent?.pack;
    const biz = window.generatedContent?.biz || window.businessInfo;
    const topic = window.selectedTopicTitle || 'professional service';

    if (!pack || !biz) {
        showToast('❌ No content available - generate first');
        return;
    }

    showToast('🔄 Generating new image...');

    try {
        const platformStyle = platformImageStyles[platform] || platformImageStyles.google;
        const variations = [
            'morning golden hour lighting',
            'bright midday natural light',
            'warm afternoon glow',
            'soft diffused lighting',
            'dramatic professional lighting'
        ];
        const randomVariation = variations[Math.floor(Math.random() * variations.length)];

        const trade = biz.trade || 'professional';
        const prompt = `Professional ${trade} marketing photo for ${topic}. ${platformStyle}. Lighting: ${randomVariation}, high-end commercial photography, 4K quality`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, platform }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (data.success && data.image) {
            pack.images[platform] = data.image;
            displayContentPack(pack);
            showToast('✅ ' + platform + ' image updated!');
        } else {
            showToast('❌ Generation failed: ' + (data.error || 'unknown'));
        }
    } catch (error) {
        console.error('Regenerate image error:', error);
        if (error.name === 'AbortError') {
            showToast('❌ Request timeout, please retry');
        } else {
            showToast('❌ Error: ' + error.message);
        }
    }
}
