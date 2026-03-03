/**
 * MarketingClaw - Referral Flow (WhatsApp)
 * Flow 2: Share completed work, get reviews & referrals
 */

import { state } from './state.js';
import { showToast, capitalize, delay } from './utils.js';
import { addChatBubble } from './chat-ui.js';

// Referral-specific state
export const referralState = {
    customerName: '',
    customerPhone: '',
    jobDescription: '',
    beforePhoto: null,
    afterPhoto: null,
    hasBeforeAfter: false
};

// Start flow - entry point from welcome screen
export function startFlow(flowType) {
    const chatArea = document.getElementById('chatArea');
    const welcome = chatArea.querySelector('.welcome');
    if (welcome) welcome.style.display = 'none';

    if (flowType === 'promote') {
        // Show trade selection (existing flow)
        showTradeSelection();
    } else if (flowType === 'referral') {
        // Show referral flow
        showReferralFlow();
    }
}

// Show trade selection for promote flow
function showTradeSelection() {
    addChatBubble('assistant', `
        <strong>Let's get you more customers! 📣</strong><br><br>
        What kind of work do you do?
    `, `
        <div class="quick-replies">
            <button class="quick-reply" onclick="window.selectTradeFromChat('plumber')">🔧 Plumber</button>
            <button class="quick-reply" onclick="window.selectTradeFromChat('electrician')">⚡ Electrician</button>
            <button class="quick-reply" onclick="window.selectTradeFromChat('hvac')">❄️ HVAC</button>
            <button class="quick-reply" onclick="window.selectTradeFromChat('roofer')">🏠 Roofer</button>
        </div>
    `);
}

// Show referral flow - CONVERSATION STYLE
export function showReferralFlow() {
    // Start conversation flow
    addChatBubble('assistant', `
        <strong>📱 Share & Get Reviews</strong><br><br>
        Let's turn your completed work into 5-star reviews!<br><br>
        First, what's your customer's name?
    `);

    // Set flow state
    referralState.flowStep = 'customer_name';
}

// Process referral conversation input
export async function processReferralInput(message) {
    const step = referralState.flowStep;

    if (step === 'customer_name') {
        referralState.customerName = message;
        addChatBubble('user', message);
        await delay(300);
        addChatBubble('assistant', `
            <strong>Great!</strong> And what's ${message}'s phone number?<br>
            <span style="color: var(--text-secondary); font-size: 13px;">(For WhatsApp - e.g., +1 512-555-0000)</span>
        `);
        referralState.flowStep = 'customer_phone';
    }
    else if (step === 'customer_phone') {
        referralState.customerPhone = message;
        addChatBubble('user', message);
        await delay(300);
        addChatBubble('assistant', `
            <strong>Perfect!</strong> Now let's add your work photos.<br><br>
            What type of photos do you have?
        `, `
            <div class="quick-replies">
                <button class="quick-reply" onclick="window.selectPhotoType('after')">📷 Just the completed work</button>
                <button class="quick-reply" onclick="window.selectPhotoType('beforeafter')">📸 Before & After</button>
            </div>
        `);
        referralState.flowStep = 'photo_type';
    }
    else if (step === 'job_description') {
        referralState.jobDescription = message;
        addChatBubble('user', message);
        await delay(300);
        await generateReferralFromConversation();
    }
}

// Select photo type
export function selectPhotoType(type) {
    referralState.hasBeforeAfter = (type === 'beforeafter');
    addChatBubble('user', type === 'beforeafter' ? 'Before & After photos' : 'Just the completed work');

    setTimeout(() => {
        if (type === 'beforeafter') {
            showBeforeAfterUpload();
        } else {
            showSinglePhotoUpload();
        }
    }, 300);
}

// Show single photo upload in chat
function showSinglePhotoUpload() {
    addChatBubble('assistant', `
        <strong>📷 Upload your completed work photo:</strong>
        <div class="chat-upload-area" style="margin-top: 16px;">
            <div class="chat-photo-box" onclick="document.getElementById('chatAfterInput').click()">
                <input type="file" id="chatAfterInput" accept="image/*" onchange="window.handleChatPhotoUpload('after', this)" style="display:none">
                <div id="chatAfterPlaceholder" style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px;">📷</div>
                    <div style="margin-top: 8px; color: var(--text-secondary);">Tap to upload photo</div>
                </div>
                <img id="chatAfterPreview" style="display:none; width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
            </div>
        </div>
    `, `
        <div class="quick-replies" id="photoNextStep" style="display: none;">
            <button class="quick-reply" onclick="window.proceedAfterPhoto()">✅ Continue</button>
        </div>
    `);
    referralState.flowStep = 'upload_photo';
}

// Show before/after upload in chat
function showBeforeAfterUpload() {
    addChatBubble('assistant', `
        <strong>📸 Upload your Before & After photos:</strong>
        <div class="chat-upload-area" style="margin-top: 16px; display: flex; gap: 12px; align-items: center;">
            <div class="chat-photo-box" onclick="document.getElementById('chatBeforeInput').click()" style="flex: 1;">
                <input type="file" id="chatBeforeInput" accept="image/*" onchange="window.handleChatPhotoUpload('before', this)" style="display:none">
                <div id="chatBeforePlaceholder" style="text-align: center; padding: 30px;">
                    <div style="font-size: 32px;">📷</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">BEFORE</div>
                </div>
                <img id="chatBeforePreview" style="display:none; width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
            </div>
            <div style="font-size: 24px; color: var(--primary);">→</div>
            <div class="chat-photo-box" onclick="document.getElementById('chatAfterInput2').click()" style="flex: 1;">
                <input type="file" id="chatAfterInput2" accept="image/*" onchange="window.handleChatPhotoUpload('after', this)" style="display:none">
                <div id="chatAfter2Placeholder" style="text-align: center; padding: 30px;">
                    <div style="font-size: 32px;">📷</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">AFTER</div>
                </div>
                <img id="chatAfter2Preview" style="display:none; width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
            </div>
        </div>
    `, `
        <div class="quick-replies" id="photoNextStep" style="display: none;">
            <button class="quick-reply" onclick="window.proceedAfterPhoto()">✅ Continue</button>
        </div>
    `);
    referralState.flowStep = 'upload_photo';
}

// Handle chat photo upload
export function handleChatPhotoUpload(type, input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;

        if (type === 'before') {
            referralState.beforePhoto = imageData;
            const preview = document.getElementById('chatBeforePreview');
            const placeholder = document.getElementById('chatBeforePlaceholder');
            if (preview) { preview.src = imageData; preview.style.display = 'block'; }
            if (placeholder) placeholder.style.display = 'none';
        } else {
            referralState.afterPhoto = imageData;
            // Update all after previews
            ['chatAfterPreview', 'chatAfter2Preview'].forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.src = imageData; el.style.display = 'block'; }
            });
            ['chatAfterPlaceholder', 'chatAfter2Placeholder'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
        }

        // Show continue button
        const nextBtn = document.getElementById('photoNextStep');
        if (nextBtn && referralState.afterPhoto) {
            nextBtn.style.display = 'flex';
        }

        showToast('Photo uploaded!');
    };
    reader.readAsDataURL(file);
}

// Proceed after photo upload
export function proceedAfterPhoto() {
    if (!referralState.afterPhoto) {
        showToast('Please upload a photo first');
        return;
    }

    addChatBubble('user', '📷 Photo uploaded');

    setTimeout(() => {
        addChatBubble('assistant', `
            <strong>Great photo!</strong> 📸<br><br>
            Briefly describe the work you did:<br>
            <span style="color: var(--text-secondary); font-size: 13px;">(e.g., "Fixed burst pipe under kitchen sink")</span>
        `);
        referralState.flowStep = 'job_description';
    }, 300);
}

// Generate referral from conversation
async function generateReferralFromConversation() {
    // Show agent hiring animation
    addChatBubble('assistant', `
        <div class="agent-flow">
            <div class="flow-step active">
                <div class="step-header">📱 Generating Review Request</div>
                <div class="step-agents">
                    <div class="agent-item hiring">📝 Message Writer Agent</div>
                    <div class="agent-item hiring">🎁 Referral Code Generator</div>
                    <div class="agent-item">📣 Social Post Writer</div>
                </div>
                <div class="step-status">Creating personalized WhatsApp message...</div>
            </div>
        </div>
    `);

    // Get or create business info
    let biz = state.businessInfo;
    if (!biz || !biz.name) {
        biz = { name: 'Your Business', location: 'Local Area', trade: 'professional' };
    }

    try {
        const response = await fetch('/api/generate-referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                business: biz,
                customerName: referralState.customerName,
                jobDescription: referralState.jobDescription,
                hasBeforeAfter: referralState.hasBeforeAfter,
                afterPhoto: referralState.afterPhoto
            })
        });

        const data = await response.json();

        if (data.success) {
            await delay(500);
            displayReferralResult(data);
        } else {
            const localResult = generateLocalReferralContent();
            await delay(500);
            displayReferralResult({ success: true, ...localResult });
        }
    } catch (error) {
        console.error('Generate referral error:', error);
        const localResult = generateLocalReferralContent();
        await delay(500);
        displayReferralResult({ success: true, ...localResult });
    }
}

// Toggle before/after photo mode
export function toggleBeforeAfter(checked) {
    referralState.hasBeforeAfter = checked;
    document.getElementById('singlePhotoArea').style.display = checked ? 'none' : 'flex';
    document.getElementById('beforeAfterArea').style.display = checked ? 'flex' : 'none';
}

// Trigger photo upload
export function triggerPhotoUpload(type) {
    if (type === 'after2') type = 'after';
    const input = document.getElementById(type + 'PhotoInput') || document.getElementById('after2PhotoInput');
    if (input) input.click();
}

// Handle photo upload
export function handlePhotoUpload(type, input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;

        if (type === 'before') {
            referralState.beforePhoto = imageData;
            document.getElementById('beforePreview').src = imageData;
            document.getElementById('beforePreview').style.display = 'block';
            document.getElementById('beforePlaceholder').style.display = 'none';
        } else {
            referralState.afterPhoto = imageData;
            // Update both after previews
            const afterPreview = document.getElementById('afterPreview');
            const after2Preview = document.getElementById('after2Preview');
            if (afterPreview) {
                afterPreview.src = imageData;
                afterPreview.style.display = 'block';
            }
            if (after2Preview) {
                after2Preview.src = imageData;
                after2Preview.style.display = 'block';
            }
            const afterPlaceholder = document.getElementById('afterPlaceholder');
            const after2Placeholder = document.getElementById('after2Placeholder');
            if (afterPlaceholder) afterPlaceholder.style.display = 'none';
            if (after2Placeholder) after2Placeholder.style.display = 'none';
        }

        showToast('Photo uploaded!');
    };
    reader.readAsDataURL(file);
}

// Generate referral content
export async function generateReferralContent() {
    // Collect form data
    const customerName = document.getElementById('customerName')?.value.trim() || 'Customer';
    const customerPhone = document.getElementById('customerPhone')?.value.trim() || '';
    const jobDescription = document.getElementById('jobDescription')?.value.trim() || '';

    // Get or create business info
    let bizName = state.businessInfo?.name;
    let bizLocation = state.businessInfo?.location;

    if (!bizName) {
        bizName = document.getElementById('refBizName')?.value.trim();
        bizLocation = document.getElementById('refBizLocation')?.value.trim();
        if (bizName) {
            state.businessInfo = {
                name: bizName,
                location: bizLocation,
                trade: state.selectedTrade || 'professional'
            };
        }
    }

    if (!bizName) {
        showToast('Please enter your business name');
        return;
    }

    if (!referralState.afterPhoto) {
        showToast('Please upload a photo of your completed work');
        return;
    }

    referralState.customerName = customerName;
    referralState.customerPhone = customerPhone;
    referralState.jobDescription = jobDescription;

    // Show loading
    const btn = document.getElementById('generateReferralBtn');
    btn.disabled = true;
    btn.innerHTML = '⏳ Generating...';

    try {
        // Call API to generate content
        const response = await fetch('/api/generate-referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                business: state.businessInfo,
                customerName,
                jobDescription,
                hasBeforeAfter: referralState.hasBeforeAfter,
                afterPhoto: referralState.afterPhoto
            })
        });

        const data = await response.json();

        if (data.success) {
            displayReferralResult(data);
        } else {
            // Fallback to local generation
            const localResult = generateLocalReferralContent();
            displayReferralResult({ success: true, ...localResult });
        }
    } catch (error) {
        console.error('Generate referral error:', error);
        // Fallback to local generation
        const localResult = generateLocalReferralContent();
        displayReferralResult({ success: true, ...localResult });
    }
}

// Generate content locally (fallback)
function generateLocalReferralContent() {
    const biz = state.businessInfo;
    const customer = referralState.customerName;
    const job = referralState.jobDescription || 'your recent service';
    const referralCode = customer.toUpperCase().substring(0, 4) + '25';

    return {
        whatsappMessage: `Hi ${customer}! 👋

Thanks for choosing ${biz.name} today! Here's a photo of the completed work.

If you're happy with the service, we'd really appreciate a quick review - it helps other neighbors find us:
⭐ Leave us a review on Google!

🎁 REFERRAL BONUS: Get $25 off your next service for each friend you refer! Just have them mention code: ${referralCode}

Thanks again!
- The ${biz.name} Team`,

        socialPosts: {
            google: {
                title: 'Another Happy Customer!',
                content: `Just completed ${job} in ${biz.location}. Our team takes pride in every job, big or small. Need help with your home? Give us a call!`,
                cta: 'Call Now'
            },
            facebook: {
                hook: `✅ Job Complete!`,
                content: `Another satisfied customer in ${biz.location}! ${job ? `Today we helped with: ${job}` : ''}\n\nWe love what we do, and it shows in our work. Thanks for trusting ${biz.name}! 🙏`,
                hashtags: ['#HomeServices', '#LocalBusiness', '#5StarService']
            },
            nextdoor: {
                content: `Hey neighbors! Just finished up a job nearby. If you need any ${biz.trade || 'home service'} help, we're always happy to help our community. ${biz.name} - your local experts! 📞`
            }
        },
        referralCode
    };
}

// Display referral result
export function displayReferralResult(data) {
    const chatArea = document.getElementById('chatArea');
    const biz = state.businessInfo;
    const customer = referralState.customerName;
    const phone = referralState.customerPhone;
    const afterPhoto = referralState.afterPhoto;
    const beforePhoto = referralState.beforePhoto;

    // Format phone for WhatsApp (remove non-digits)
    const whatsappPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(data.whatsappMessage)}`;

    const html = `
        <div class="referral-result">
            <div class="result-header">
                <span class="result-icon">✅</span>
                <h2>Content Ready!</h2>
                <p>Send to ${customer} and share on social media</p>
            </div>

            <!-- WhatsApp Message Card -->
            <div class="result-card whatsapp-card">
                <div class="card-header whatsapp-header">
                    <span>📱 WhatsApp Message</span>
                    <span class="priority-badge">Send First!</span>
                </div>
                <div class="card-content">
                    <div class="message-preview">
                        ${beforePhoto && referralState.hasBeforeAfter ? `
                            <div class="photo-comparison">
                                <img src="${beforePhoto}" alt="Before" class="preview-photo">
                                <span class="comparison-arrow">→</span>
                                <img src="${afterPhoto}" alt="After" class="preview-photo">
                            </div>
                        ` : `
                            <img src="${afterPhoto}" alt="Completed work" class="single-preview-photo">
                        `}
                        <div class="message-text">${data.whatsappMessage.replace(/\n/g, '<br>')}</div>
                    </div>
                    <div class="card-actions">
                        <button onclick="window.editWhatsAppMessage()" class="action-btn secondary">✏️ Edit</button>
                        <button onclick="window.copyWhatsAppMessage()" class="action-btn secondary">📋 Copy</button>
                        <a href="${whatsappUrl}" target="_blank" class="action-btn primary whatsapp-btn">
                            📱 Send via WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            <!-- Referral Code Card -->
            <div class="result-card referral-code-card">
                <div class="card-header">
                    <span>🎁 Referral Code for ${customer}</span>
                </div>
                <div class="card-content" style="text-align: center; padding: 24px;">
                    <div class="referral-code">${data.referralCode}</div>
                    <p style="color: var(--text-secondary); margin-top: 8px;">$25 off for ${customer} and each friend they refer</p>
                </div>
            </div>

            <!-- Social Media Posts -->
            <div class="result-card">
                <div class="card-header">
                    <span>📣 Also Post to Social Media</span>
                </div>
                <div class="card-content">
                    <div class="social-grid">
                        <div class="social-post-mini" onclick="window.openReferralPreview('google')">
                            <div class="platform-badge google">📍 Google</div>
                            <p>${data.socialPosts.google.content.substring(0, 80)}...</p>
                            <button class="mini-publish-btn">Publish →</button>
                        </div>
                        <div class="social-post-mini" onclick="window.openReferralPreview('facebook')">
                            <div class="platform-badge facebook">📘 Facebook</div>
                            <p>${data.socialPosts.facebook.content.substring(0, 80)}...</p>
                            <button class="mini-publish-btn">Publish →</button>
                        </div>
                        <div class="social-post-mini" onclick="window.openReferralPreview('nextdoor')">
                            <div class="platform-badge nextdoor">🏘️ Nextdoor</div>
                            <p>${data.socialPosts.nextdoor.content.substring(0, 80)}...</p>
                            <button class="mini-publish-btn">Publish →</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Start Over -->
            <button onclick="window.location.reload()" class="start-over-btn">
                ← Start New
            </button>
        </div>

        <style>
            .referral-result {
                max-width: 600px;
                margin: 0 auto;
                padding: 24px;
            }
            .result-header {
                text-align: center;
                margin-bottom: 32px;
            }
            .result-icon {
                font-size: 48px;
                display: block;
                margin-bottom: 12px;
            }
            .result-header h2 {
                margin: 0 0 8px;
            }
            .result-header p {
                color: var(--text-secondary);
                margin: 0;
            }
            .result-card {
                background: white;
                border-radius: 16px;
                overflow: hidden;
                margin-bottom: 20px;
                border: 1px solid var(--border);
            }
            .card-header {
                padding: 16px 20px;
                background: var(--bg);
                font-weight: 600;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .whatsapp-header {
                background: linear-gradient(135deg, #25D366, #128C7E);
                color: white;
            }
            .priority-badge {
                background: white;
                color: #128C7E;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 12px;
            }
            .card-content {
                padding: 20px;
            }
            .message-preview {
                background: #e7ffdb;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 16px;
            }
            .preview-photo, .single-preview-photo {
                width: 100%;
                max-height: 200px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 12px;
            }
            .photo-comparison {
                display: flex;
                gap: 8px;
                align-items: center;
                margin-bottom: 12px;
            }
            .photo-comparison .preview-photo {
                flex: 1;
                margin-bottom: 0;
            }
            .comparison-arrow {
                font-size: 20px;
                color: #128C7E;
            }
            .message-text {
                font-size: 14px;
                line-height: 1.6;
            }
            .card-actions {
                display: flex;
                gap: 10px;
            }
            .action-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                text-decoration: none;
                text-align: center;
                font-size: 14px;
            }
            .action-btn.secondary {
                background: var(--bg);
                color: var(--text);
            }
            .action-btn.primary {
                background: linear-gradient(135deg, #25D366, #128C7E);
                color: white;
            }
            .whatsapp-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            .referral-code-card .card-header {
                background: linear-gradient(135deg, #FF6B35, #FF8F6B);
                color: white;
            }
            .referral-code {
                font-size: 36px;
                font-weight: 800;
                color: var(--primary);
                letter-spacing: 4px;
                background: var(--primary-light);
                padding: 16px 32px;
                border-radius: 12px;
                display: inline-block;
            }
            .social-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
            }
            .social-post-mini {
                background: var(--bg);
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .social-post-mini:hover {
                transform: translateY(-2px);
            }
            .platform-badge {
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            .platform-badge.google { color: #4285f4; }
            .platform-badge.facebook { color: #1877f2; }
            .platform-badge.nextdoor { color: #8bc34a; }
            .social-post-mini p {
                font-size: 13px;
                color: var(--text-secondary);
                margin: 0 0 12px;
                line-height: 1.4;
            }
            .mini-publish-btn {
                width: 100%;
                padding: 8px;
                background: white;
                border: 1px solid var(--border);
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
            }
            .start-over-btn {
                width: 100%;
                padding: 16px;
                background: var(--bg);
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                color: var(--text-secondary);
            }
            @media (max-width: 600px) {
                .social-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;

    chatArea.innerHTML = html;
    chatArea.scrollTop = 0;

    // Store generated content
    state.generatedReferralContent = data;
}

// Copy WhatsApp message
export function copyWhatsAppMessage() {
    const msg = state.generatedReferralContent?.whatsappMessage;
    if (msg) {
        navigator.clipboard.writeText(msg);
        showToast('Message copied!');
    }
}

// Edit WhatsApp message
export function editWhatsAppMessage() {
    const msg = state.generatedReferralContent?.whatsappMessage;
    // TODO: Open edit modal
    showToast('Edit feature coming soon');
}

// Open referral preview for social platform
export function openReferralPreview(platform) {
    // TODO: Open preview modal
    showToast(`Opening ${platform} preview...`);
}

// Export to window
if (typeof window !== 'undefined') {
    window.startFlow = startFlow;
    window.toggleBeforeAfter = toggleBeforeAfter;
    window.triggerPhotoUpload = triggerPhotoUpload;
    window.handlePhotoUpload = handlePhotoUpload;
    window.generateReferralContent = generateReferralContent;
    window.copyWhatsAppMessage = copyWhatsAppMessage;
    window.editWhatsAppMessage = editWhatsAppMessage;
    window.openReferralPreview = openReferralPreview;
    // New conversation flow functions
    window.processReferralInput = processReferralInput;
    window.selectPhotoType = selectPhotoType;
    window.handleChatPhotoUpload = handleChatPhotoUpload;
    window.proceedAfterPhoto = proceedAfterPhoto;
}
