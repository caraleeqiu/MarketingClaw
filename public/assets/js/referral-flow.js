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

// Show referral flow
export function showReferralFlow() {
    const chatArea = document.getElementById('chatArea');

    // Check if we have business info
    const hasBizInfo = state.businessInfo && state.businessInfo.name;

    const html = `
        <div class="referral-flow" id="referralFlow">
            <div class="referral-header">
                <span class="referral-icon">📱</span>
                <h2>Share & Get Reviews</h2>
                <p>Turn your completed work into 5-star reviews and new referrals</p>
            </div>

            <!-- Step 1: Business & Customer Info -->
            <div class="referral-step" id="referralStep1">
                <div class="step-badge">Step 1</div>
                <h3>Customer Information</h3>

                ${hasBizInfo ? `
                    <div class="biz-info-card">
                        <div class="biz-info-header">
                            <span>Your Business</span>
                            <button onclick="window.editBizInfo()" class="edit-btn">✏️ Edit</button>
                        </div>
                        <div class="biz-info-content">
                            <strong>${state.businessInfo.name}</strong><br>
                            📍 ${state.businessInfo.location || 'Location not set'}
                        </div>
                    </div>
                ` : `
                    <div class="form-group">
                        <label>Your Business Name</label>
                        <input type="text" id="refBizName" placeholder="e.g. Mike's Plumbing" class="ref-input">
                    </div>
                    <div class="form-group">
                        <label>Your Location</label>
                        <input type="text" id="refBizLocation" placeholder="e.g. Austin, TX" class="ref-input">
                    </div>
                `}

                <div class="form-group">
                    <label>Customer's Name</label>
                    <input type="text" id="customerName" placeholder="e.g. John" class="ref-input">
                </div>
                <div class="form-group">
                    <label>Customer's Phone (for WhatsApp)</label>
                    <input type="tel" id="customerPhone" placeholder="e.g. +1 512-555-0000" class="ref-input">
                </div>
            </div>

            <!-- Step 2: Photo Upload -->
            <div class="referral-step" id="referralStep2">
                <div class="step-badge">Step 2</div>
                <h3>Upload Job Photos</h3>

                <div class="photo-toggle">
                    <label class="toggle-label">
                        <input type="checkbox" id="hasBeforeAfter" onchange="window.toggleBeforeAfter(this.checked)">
                        <span>I have Before & After photos</span>
                    </label>
                </div>

                <div class="photo-upload-area" id="singlePhotoArea">
                    <div class="photo-box" id="afterPhotoBox" onclick="window.triggerPhotoUpload('after')">
                        <input type="file" id="afterPhotoInput" accept="image/*" onchange="window.handlePhotoUpload('after', this)" style="display:none">
                        <div class="photo-placeholder" id="afterPlaceholder">
                            <span class="upload-icon">📷</span>
                            <span>Upload completed work photo</span>
                        </div>
                        <img id="afterPreview" class="photo-preview" style="display:none">
                    </div>
                </div>

                <div class="photo-upload-area before-after" id="beforeAfterArea" style="display:none">
                    <div class="photo-box" onclick="window.triggerPhotoUpload('before')">
                        <input type="file" id="beforePhotoInput" accept="image/*" onchange="window.handlePhotoUpload('before', this)" style="display:none">
                        <div class="photo-placeholder" id="beforePlaceholder">
                            <span class="upload-icon">📷</span>
                            <span>BEFORE</span>
                        </div>
                        <img id="beforePreview" class="photo-preview" style="display:none">
                    </div>
                    <div class="arrow-between">→</div>
                    <div class="photo-box" onclick="window.triggerPhotoUpload('after2')">
                        <input type="file" id="after2PhotoInput" accept="image/*" onchange="window.handlePhotoUpload('after', this)" style="display:none">
                        <div class="photo-placeholder" id="after2Placeholder">
                            <span class="upload-icon">📷</span>
                            <span>AFTER</span>
                        </div>
                        <img id="after2Preview" class="photo-preview" style="display:none">
                    </div>
                </div>

                <div class="form-group" style="margin-top: 16px;">
                    <label>Brief description (optional - AI will analyze photo)</label>
                    <input type="text" id="jobDescription" placeholder="e.g. Fixed burst pipe under kitchen sink" class="ref-input">
                </div>
            </div>

            <!-- Generate Button -->
            <button class="generate-btn" id="generateReferralBtn" onclick="window.generateReferralContent()">
                ✨ Generate WhatsApp Message & Posts
            </button>
        </div>

        <style>
            .referral-flow {
                max-width: 600px;
                margin: 0 auto;
                padding: 24px;
            }
            .referral-header {
                text-align: center;
                margin-bottom: 32px;
            }
            .referral-icon {
                font-size: 48px;
                display: block;
                margin-bottom: 12px;
            }
            .referral-header h2 {
                margin: 0 0 8px;
                font-size: 28px;
            }
            .referral-header p {
                color: var(--text-secondary);
                margin: 0;
            }
            .referral-step {
                background: white;
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 20px;
                border: 1px solid var(--border);
            }
            .step-badge {
                display: inline-block;
                background: var(--primary-light);
                color: var(--primary);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 12px;
            }
            .referral-step h3 {
                margin: 0 0 16px;
                font-size: 18px;
            }
            .form-group {
                margin-bottom: 16px;
            }
            .form-group label {
                display: block;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 6px;
                color: var(--text-secondary);
            }
            .ref-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid var(--border);
                border-radius: 10px;
                font-size: 15px;
                transition: border-color 0.2s;
            }
            .ref-input:focus {
                outline: none;
                border-color: var(--primary);
            }
            .biz-info-card {
                background: var(--primary-light);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 16px;
            }
            .biz-info-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                font-size: 12px;
                color: var(--primary);
                font-weight: 600;
            }
            .edit-btn {
                background: none;
                border: none;
                color: var(--primary);
                cursor: pointer;
                font-size: 12px;
            }
            .biz-info-content {
                font-size: 15px;
            }
            .photo-toggle {
                margin-bottom: 16px;
            }
            .toggle-label {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                font-size: 14px;
            }
            .toggle-label input {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            .photo-upload-area {
                display: flex;
                gap: 16px;
                justify-content: center;
            }
            .photo-upload-area.before-after {
                align-items: center;
            }
            .arrow-between {
                font-size: 24px;
                color: var(--primary);
            }
            .photo-box {
                flex: 1;
                max-width: 200px;
                aspect-ratio: 1;
                border: 2px dashed var(--border);
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: border-color 0.2s, background 0.2s;
                overflow: hidden;
                position: relative;
            }
            .photo-box:hover {
                border-color: var(--primary);
                background: var(--primary-light);
            }
            .photo-placeholder {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                color: var(--text-secondary);
            }
            .upload-icon {
                font-size: 32px;
            }
            .photo-preview {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .generate-btn {
                width: 100%;
                padding: 18px;
                background: linear-gradient(135deg, #25D366, #128C7E);
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 18px;
                font-weight: 700;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .generate-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(37, 211, 102, 0.3);
            }
            .generate-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
        </style>
    `;

    chatArea.innerHTML = html;
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
⭐ Google: https://g.page/${biz.name.replace(/\s+/g, '')}

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
}
