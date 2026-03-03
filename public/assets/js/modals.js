/**
 * MarketingClaw - Modal Management
 * Edit, Preview, and Publish modals
 */

import { state, getConnectedAccounts, setConnectedAccount } from './state.js';
import { platformNames } from './config.js';
import { showToast, delay, getPlatformName, copyPlatformContent } from './utils.js';

// ========== EDIT MODAL ==========
export function openEditModal(platform) {
    const pack = state.generatedContent?.pack;
    if (!pack) {
        showToast('No content to edit');
        return;
    }

    const content = pack.platforms[platform];
    let fullText = '';
    if (platform === 'google') {
        fullText = (content.title || '') + '\n\n' + (content.content || '');
    } else if (platform === 'facebook') {
        fullText = (content.hook || '') + '\n\n' + (content.content || '');
    } else {
        fullText = content.content || '';
    }

    const modal = document.createElement('div');
    modal.className = 'publish-modal show';
    modal.id = 'editModal';
    modal.innerHTML = `
        <div class="publish-dialog" style="max-width: 600px;">
            <h3>✏️ Edit ${getPlatformName(platform)} Post</h3>
            <div style="margin: 20px 0;">
                <textarea id="editTextarea" style="width: 100%; height: 200px; padding: 12px; border: 2px solid var(--border); border-radius: 8px; font-size: 14px; line-height: 1.6; resize: vertical;">${fullText}</textarea>
            </div>
            <div class="actions" style="display: flex; gap: 12px;">
                <button onclick="window.closeEditModal()" style="flex: 1; padding: 12px; background: var(--bg); border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
                <button onclick="window.saveEdit('${platform}')" style="flex: 1; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Save Changes</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

export function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.remove();
}

export function saveEdit(platform) {
    const newText = document.getElementById('editTextarea').value;
    if (state.generatedContent?.pack?.platforms?.[platform]) {
        state.generatedContent.pack.platforms[platform].content = newText;
    }
    closeEditModal();
    showToast('✅ Changes saved!');
}

// ========== PREVIEW MODAL ==========
export function openPreviewModal(platform) {
    const pack = state.generatedContent?.pack;
    const biz = state.generatedContent?.biz || state.businessInfo;
    if (!pack || !biz) {
        showToast('No content to preview');
        return;
    }

    const content = pack.platforms[platform];
    const image = pack.images[platform];

    let modalContent = '';

    if (platform === 'google') {
        modalContent = `
            <h3>📍 Google Business Post</h3>
            <div style="margin: 20px 0;">
                <img src="${image}" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 16px;">
                <h4 style="margin-bottom: 8px;">${content.title}</h4>
                <p style="white-space: pre-wrap; line-height: 1.6;">${content.content}</p>
                <p style="margin-top: 12px;"><strong>CTA:</strong> ${content.cta}</p>
            </div>
        `;
    } else if (platform === 'facebook') {
        modalContent = `
            <h3>📘 Facebook Post</h3>
            <div style="margin: 20px 0;">
                <img src="${image}" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 16px;">
                <p style="font-weight: 600; margin-bottom: 8px;">${content.hook}</p>
                <p style="white-space: pre-wrap; line-height: 1.6;">${content.content}</p>
                <p style="margin-top: 12px; color: var(--primary);">${(content.hashtags || []).join(' ')}</p>
            </div>
        `;
    } else if (platform === 'nextdoor') {
        modalContent = `
            <h3>🏘️ Nextdoor Post</h3>
            <div style="margin: 20px 0;">
                <img src="${image}" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 16px;">
                <p style="white-space: pre-wrap; line-height: 1.6;">${content.content}</p>
            </div>
        `;
    } else if (platform === 'instagram') {
        modalContent = `
            <h3>📸 Instagram Post</h3>
            <div style="margin: 20px 0;">
                <img src="${image}" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 16px;">
                <p style="white-space: pre-wrap; line-height: 1.6;">${content.caption || content.content}</p>
                <p style="margin-top: 12px; color: var(--primary);">${(content.hashtags || []).join(' ')}</p>
            </div>
        `;
    }

    const modal = document.createElement('div');
    modal.className = 'publish-modal show';
    modal.id = 'previewModal';
    modal.onclick = function(e) { if (e.target === modal) closePreviewModal(); };
    modal.innerHTML = `
        <div class="publish-dialog" style="max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative;">
            <button onclick="window.closePreviewModal()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-secondary);">✕</button>
            ${modalContent}
            <div class="actions" style="display: flex; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
                <button class="btn-cancel" onclick="window.closePreviewModal()" style="flex: 1; padding: 12px; background: var(--bg); border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">← Back</button>
                <button onclick="window.copyPlatformContent('${platform}')" style="flex: 1; padding: 12px; background: white; border: 2px solid var(--border); border-radius: 8px; font-weight: 600; cursor: pointer;">📋 Copy</button>
                <button onclick="window.closePreviewModal(); window.openPublishModal('${platform}')" style="flex: 1; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">🚀 Publish</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

export function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    if (modal) modal.remove();
}

// ========== PUBLISH MODAL ==========
export function openPublishModal(platform) {
    state.currentPublishPlatform = platform;
    const p = platformNames[platform] || { name: platform, icon: '📱' };
    const pack = state.generatedContent?.pack;
    const content = pack?.platforms?.[platform];
    const image = pack?.images?.[platform];
    const accounts = getConnectedAccounts();
    const isConnected = accounts[platform];

    // Build preview content
    let previewHTML = '';
    if (platform === 'google' && content) {
        previewHTML = `
            <div style="margin-bottom: 16px;">
                <img src="${image}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
            </div>
            <h4 style="margin-bottom: 8px;">${content.title || ''}</h4>
            <p style="font-size: 14px; line-height: 1.5; max-height: 100px; overflow-y: auto;">${(content.content || '').substring(0, 200)}...</p>
        `;
    } else if (platform === 'facebook' && content) {
        previewHTML = `
            <div style="margin-bottom: 16px;">
                <img src="${image}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
            </div>
            <p style="font-weight: 600; margin-bottom: 8px;">${content.hook || ''}</p>
            <p style="font-size: 14px; line-height: 1.5; max-height: 100px; overflow-y: auto;">${(content.content || '').substring(0, 200)}...</p>
        `;
    } else if (content) {
        previewHTML = `
            <div style="margin-bottom: 16px;">
                <img src="${image}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
            </div>
            <p style="font-size: 14px; line-height: 1.5; max-height: 100px; overflow-y: auto;">${(content.content || '').substring(0, 200)}...</p>
        `;
    }

    const titleEl = document.getElementById('publishTitle');
    if (titleEl) titleEl.innerHTML = `${p.icon} Publish to ${p.name}`;

    const statusDiv = document.getElementById('publishStatus');
    if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = `
            <div style="background: white; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                <div style="font-weight: 600; margin-bottom: 12px;">📝 Content Preview</div>
                ${previewHTML || '<p style="color: var(--text-secondary);">No content to preview</p>'}
            </div>

            <div style="background: white; padding: 16px; border-radius: 12px;">
                <div style="font-weight: 600; margin-bottom: 12px;">🔗 Account Status</div>
                ${isConnected ? `
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary), #FF8F6B); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">${p.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${isConnected.name || p.name + ' Account'}</div>
                            <div style="font-size: 13px; color: var(--success);">✓ Connected</div>
                        </div>
                        <button onclick="window.disconnectAccount('${platform}')" style="padding: 6px 12px; background: var(--bg); border: none; border-radius: 6px; font-size: 13px; cursor: pointer;">Disconnect</button>
                    </div>

                    <!-- Schedule Options -->
                    <div style="background: var(--bg); border-radius: 12px; padding: 16px;">
                        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                            <button id="tabNow" onclick="window.switchPublishTab('now')" style="flex: 1; padding: 10px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">🚀 Now</button>
                            <button id="tabSchedule" onclick="window.switchPublishTab('schedule')" style="flex: 1; padding: 10px; background: white; color: var(--text); border: 1px solid var(--border); border-radius: 8px; font-weight: 600; cursor: pointer;">📅 Schedule</button>
                        </div>

                        <div id="scheduleOptions" style="display: none;">
                            <div style="margin-bottom: 12px;">
                                <label style="font-size: 13px; font-weight: 500; display: block; margin-bottom: 6px;">Date & Time</label>
                                <input type="datetime-local" id="scheduleDateTime" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px;">
                            </div>
                            <div style="margin-bottom: 12px;">
                                <label style="font-size: 13px; font-weight: 500; display: block; margin-bottom: 6px;">Repeat</label>
                                <select id="scheduleRepeatSelect" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px;">
                                    <option value="">Don't repeat</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div style="padding: 20px;">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <div style="font-size: 48px; margin-bottom: 12px;">${p.icon}</div>
                            <h3 style="margin: 0 0 8px;">Connect ${p.name}</h3>
                            <p style="color: var(--text-secondary); margin: 0;">One-time setup to enable direct publishing</p>
                        </div>

                        <div style="background: var(--bg); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                            <div style="font-weight: 600; margin-bottom: 12px;">📋 Setup Steps:</div>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 28px; height: 28px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;">1</div>
                                    <span>Click "Connect" to authorize MarketingClaw</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 28px; height: 28px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;">2</div>
                                    <span>Log in to your ${p.name} account</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 28px; height: 28px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;">3</div>
                                    <span>Grant permission to post on your behalf</span>
                                </div>
                            </div>
                        </div>

                        <div style="background: #e8f5e9; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                            <div style="display: flex; align-items: flex-start; gap: 12px;">
                                <span style="font-size: 20px;">🔒</span>
                                <div>
                                    <div style="font-weight: 600; color: #2e7d32;">Secure & Private</div>
                                    <div style="font-size: 13px; color: #558b2f;">We only post content you approve. Revoke access anytime from your ${p.name} settings.</div>
                                </div>
                            </div>
                        </div>

                        <button onclick="window.connectAccount('${platform}')" style="width: 100%; padding: 16px 24px; background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            🔗 Connect ${p.name} Account
                        </button>

                        <p style="text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-secondary);">
                            Or <a href="#" onclick="window.copyPlatformContent('${platform}'); return false;" style="color: var(--primary);">copy content</a> to post manually
                        </p>
                    </div>
                `}
            </div>
        `;
    }

    const resultEl = document.getElementById('publishResult');
    if (resultEl) resultEl.style.display = 'none';

    const confirmBtn = document.getElementById('publishConfirmBtn');
    if (confirmBtn) {
        confirmBtn.style.display = isConnected ? 'block' : 'none';
        confirmBtn.disabled = !isConnected;
        confirmBtn.textContent = '🚀 Publish Now';
    }

    const modalEl = document.getElementById('publishModal');
    if (modalEl) modalEl.classList.add('show');
}

export function closePublishModal() {
    const modal = document.getElementById('publishModal');
    if (modal) modal.classList.remove('show');
    state.currentPublishPlatform = null;
}

export function switchPublishTab(mode) {
    state.publishMode = mode;

    // Update tab buttons
    const tabNow = document.getElementById('tabNow');
    const tabSchedule = document.getElementById('tabSchedule');
    if (tabNow) {
        tabNow.style.background = mode === 'now' ? 'var(--primary)' : 'white';
        tabNow.style.color = mode === 'now' ? 'white' : 'var(--text)';
        tabNow.style.border = mode === 'now' ? 'none' : '1px solid var(--border)';
    }
    if (tabSchedule) {
        tabSchedule.style.background = mode === 'schedule' ? 'var(--primary)' : 'white';
        tabSchedule.style.color = mode === 'schedule' ? 'white' : 'var(--text)';
        tabSchedule.style.border = mode === 'schedule' ? 'none' : '1px solid var(--border)';
    }

    // Show/hide schedule options
    const scheduleOptions = document.getElementById('scheduleOptions');
    if (scheduleOptions) {
        scheduleOptions.style.display = mode === 'schedule' ? 'block' : 'none';
    }

    // Set default datetime to tomorrow 9am
    if (mode === 'schedule') {
        const dateInput = document.getElementById('scheduleDateTime');
        if (dateInput && !dateInput.value) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            dateInput.value = tomorrow.toISOString().slice(0, 16);
        }
    }

    // Legacy tab support
    const nowContent = document.getElementById('publishNowContent');
    const scheduleContent = document.getElementById('scheduleContent');
    if (nowContent) nowContent.style.display = mode === 'now' ? 'block' : 'none';
    if (scheduleContent) scheduleContent.style.display = mode === 'schedule' ? 'block' : 'none';

    // Update confirm button
    const btn = document.getElementById('publishConfirmBtn');
    if (btn) btn.textContent = mode === 'now' ? '🚀 Publish Now' : '📅 Schedule Post';
}

export async function confirmPublish() {
    if (!state.currentPublishPlatform || !state.generatedContent) return;

    const confirmBtn = document.getElementById('publishConfirmBtn');
    const isScheduled = state.publishMode === 'schedule';
    const scheduleDateTime = document.getElementById('scheduleDateTime')?.value;
    const scheduleRepeat = document.getElementById('scheduleRepeatSelect')?.value;

    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = isScheduled ? 'Scheduling...' : 'Publishing...';
    }

    try {
        // If scheduling, show scheduled confirmation
        if (isScheduled && scheduleDateTime) {
            await delay(800);

            const scheduledDate = new Date(scheduleDateTime);
            const formattedDate = scheduledDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });

            const repeatText = scheduleRepeat ? ` (Repeats ${scheduleRepeat})` : '';

            const statusEl = document.getElementById('publishStatus');
            if (statusEl) statusEl.style.display = 'none';

            const result = document.getElementById('publishResult');
            if (result) {
                result.className = 'publish-result success';
                result.innerHTML = `
                    <div class="icon">📅</div>
                    <div class="message">Scheduled for ${platformNames[state.currentPublishPlatform]?.name || state.currentPublishPlatform}!</div>
                    <p style="margin-top:10px; font-size:14px; color:var(--text-secondary);">${formattedDate}${repeatText}</p>
                    <div style="margin-top: 16px; padding: 12px; background: var(--bg); border-radius: 8px; font-size: 13px;">
                        <strong>What happens next:</strong><br>
                        We'll send you a reminder 30 min before posting. You can modify or cancel anytime from the History tab.
                    </div>
                `;
                result.style.display = 'block';
            }
            if (confirmBtn) confirmBtn.style.display = 'none';

            // Save to scheduled posts
            saveScheduledPost(state.currentPublishPlatform, scheduleDateTime, scheduleRepeat);
            return;
        }

        // Immediate publish flow
        updatePublishStep(1, 'active');
        await delay(800);
        updatePublishStep(1, 'done');

        updatePublishStep(2, 'active');
        await delay(1200);
        updatePublishStep(2, 'done');

        updatePublishStep(3, 'active');
        await delay(1000);
        updatePublishStep(3, 'done');

        const statusEl = document.getElementById('publishStatus');
        if (statusEl) statusEl.style.display = 'none';

        const result = document.getElementById('publishResult');
        if (result) {
            result.className = 'publish-result success';
            result.innerHTML = `
                <div class="icon">✓</div>
                <div class="message">Published successfully to ${platformNames[state.currentPublishPlatform]?.name || state.currentPublishPlatform}!</div>
                <p style="margin-top:10px; font-size:14px; color:var(--text-secondary);">Your post is now live.</p>
            `;
            result.style.display = 'block';
        }
        if (confirmBtn) confirmBtn.style.display = 'none';

    } catch (error) {
        console.error('Publish error:', error);
        updatePublishStep(3, 'error');

        const statusEl = document.getElementById('publishStatus');
        if (statusEl) statusEl.style.display = 'none';

        const result = document.getElementById('publishResult');
        if (result) {
            result.className = 'publish-result error';
            result.innerHTML = `
                <div class="icon">✕</div>
                <div class="message">Failed to publish</div>
                <p style="margin-top:10px; font-size:14px;">${error.message}</p>
            `;
            result.style.display = 'block';
        }
        if (confirmBtn) {
            confirmBtn.textContent = 'Try Again';
            confirmBtn.disabled = false;
        }
    }
}

function updatePublishStep(stepNum, status) {
    const step = document.getElementById(`pubStep${stepNum}`);
    if (!step) return;
    step.className = `step ${status}`;
    const icon = step.querySelector('.step-icon');
    if (icon) {
        if (status === 'done') icon.textContent = '✓';
        else if (status === 'error') icon.textContent = '✕';
        else if (status === 'active') icon.textContent = stepNum;
    }
}

export function connectAccount(platform) {
    const p = platformNames[platform];
    const mockName = state.businessInfo?.name || 'My Business';

    setTimeout(() => {
        setConnectedAccount(platform, {
            name: mockName,
            connectedAt: new Date().toISOString()
        });
        showToast(`${p.name} connected successfully!`);
        openPublishModal(platform);
    }, 500);
}

export function disconnectAccount(platform) {
    const accounts = getConnectedAccounts();
    delete accounts[platform];
    localStorage.setItem('marketingclaw_accounts', JSON.stringify(accounts));
    showToast('Account disconnected');
    openPublishModal(platform);
}

export function quickPublish(platform) {
    openPublishModal(platform);
}

export function publishAll() {
    showToast('Publishing to all platforms...');
}

// Save scheduled post to localStorage
function saveScheduledPost(platform, dateTime, repeat) {
    try {
        const scheduled = JSON.parse(localStorage.getItem('marketingclaw_scheduled') || '[]');
        const newPost = {
            id: Date.now(),
            platform,
            dateTime,
            repeat: repeat || null,
            content: state.generatedContent?.pack?.platforms?.[platform],
            image: state.generatedContent?.pack?.images?.[platform],
            business: state.businessInfo,
            createdAt: new Date().toISOString()
        };
        scheduled.push(newPost);
        localStorage.setItem('marketingclaw_scheduled', JSON.stringify(scheduled));
        showToast('📅 Post scheduled!');
    } catch (e) {
        console.error('Failed to save scheduled post:', e);
    }
}

// Get scheduled posts
export function getScheduledPosts() {
    return JSON.parse(localStorage.getItem('marketingclaw_scheduled') || '[]');
}

// Export functions to window for HTML onclick handlers
if (typeof window !== 'undefined') {
    window.openEditModal = openEditModal;
    window.closeEditModal = closeEditModal;
    window.saveEdit = saveEdit;
    window.openPreviewModal = openPreviewModal;
    window.closePreviewModal = closePreviewModal;
    window.openPublishModal = openPublishModal;
    window.closePublishModal = closePublishModal;
    window.switchPublishTab = switchPublishTab;
    window.confirmPublish = confirmPublish;
    window.connectAccount = connectAccount;
    window.disconnectAccount = disconnectAccount;
    window.quickPublish = quickPublish;
    window.publishAll = publishAll;
    window.copyPlatformContent = copyPlatformContent;
}
