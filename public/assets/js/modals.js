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
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary), #FF8F6B); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">${p.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${isConnected.name || p.name + ' Account'}</div>
                            <div style="font-size: 13px; color: var(--success);">✓ Connected</div>
                        </div>
                        <button onclick="window.disconnectAccount('${platform}')" style="padding: 6px 12px; background: var(--bg); border: none; border-radius: 6px; font-size: 13px; cursor: pointer;">Disconnect</button>
                    </div>
                ` : `
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 32px; margin-bottom: 12px;">${p.icon}</div>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Connect your ${p.name} account to publish directly</p>
                        <button onclick="window.connectAccount('${platform}')" style="padding: 12px 24px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            🔗 Connect ${p.name}
                        </button>
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
    document.querySelectorAll('.option-tab').forEach(t => t.classList.remove('active'));
    event?.target?.classList.add('active');

    const nowContent = document.getElementById('publishNowContent');
    const scheduleContent = document.getElementById('scheduleContent');
    if (nowContent) nowContent.style.display = mode === 'now' ? 'block' : 'none';
    if (scheduleContent) scheduleContent.style.display = mode === 'schedule' ? 'block' : 'none';

    const btn = document.getElementById('publishConfirmBtn');
    if (btn) btn.textContent = mode === 'now' ? '🚀 Publish Now' : '📅 Schedule Post';
}

export async function confirmPublish() {
    if (!state.currentPublishPlatform || !state.generatedContent) return;

    const confirmBtn = document.getElementById('publishConfirmBtn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Publishing...';
    }

    try {
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
