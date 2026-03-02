/**
 * MarketingClaw - Agent System
 * Handles hired agents, mentions, and agent UI
 */

import { availableAgents } from './config.js';
import { state, saveAddedAgents } from './state.js';

// Check for @ mention in input
export function checkMention(text) {
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
        const afterAt = text.substring(lastAtIndex + 1);
        if (afterAt === '' || (!afterAt.includes(' ') && afterAt.length < 20)) {
            showMentionPopup(afterAt.toLowerCase());
            return;
        }
    }
    hideMentionPopup();
}

// Show mention popup with filtered agents
export function showMentionPopup(filter) {
    const popup = document.getElementById('mentionPopup');
    const list = document.getElementById('mentionList');
    if (!popup || !list) return;

    const filtered = state.hiredAgents.filter(a =>
        filter === '' || a.name.toLowerCase().includes(filter)
    );

    if (filtered.length === 0 && state.hiredAgents.length === 0) {
        list.innerHTML = '<div style="padding: 16px; color: var(--text-secondary); text-align: center;">No agents hired yet.<br><a href="marketplace.html" style="color: var(--primary);">Go to Agent Hub</a></div>';
    } else if (filtered.length === 0) {
        list.innerHTML = '<div style="padding: 16px; color: var(--text-secondary); text-align: center;">No matching agents</div>';
    } else {
        list.innerHTML = filtered.map(a => `
            <div class="mention-item" onclick="window.insertMention('${a.name}')">
                <span class="icon">${a.icon}</span>
                <span class="name">@${a.name}</span>
                <span class="status">Active</span>
            </div>
        `).join('');
    }

    popup.style.display = 'block';
}

// Hide mention popup
export function hideMentionPopup() {
    const popup = document.getElementById('mentionPopup');
    if (popup) popup.style.display = 'none';
}

// Insert mention into input
export function insertMention(name) {
    const input = document.getElementById('messageInput');
    const text = input.value;
    const lastAtIndex = text.lastIndexOf('@');

    if (lastAtIndex !== -1) {
        input.value = text.substring(0, lastAtIndex) + '@' + name + ' ';
    } else {
        input.value += '@' + name + ' ';
    }

    hideMentionPopup();
    input.focus();
}

// Update agent count badge
export function updateAgentCount() {
    const el = document.getElementById('agentCount');
    if (el) el.textContent = state.addedAgents.length;
}

// Sync hired agents from localStorage
export function syncHiredAgents() {
    state.hiredAgents = [];

    state.addedAgents.forEach(agentId => {
        const agent = availableAgents.find(a => a.id === agentId);
        if (agent && !state.hiredAgents.find(h => h.name === agent.name)) {
            state.hiredAgents.push({ icon: agent.icon, name: agent.name });
        }
    });

    const section = document.getElementById('hiredAgentsSection');
    const list = document.getElementById('hiredAgentsList');

    if (state.hiredAgents.length > 0 && section && list) {
        section.style.display = 'block';
        list.innerHTML = state.hiredAgents.map(a => `
            <div style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: white; border-radius: 8px; font-size: 13px;">
                <span>${a.icon}</span>
                <span style="flex: 1;">@${a.name}</span>
                <span style="color: var(--success); font-size: 11px;">Active</span>
            </div>
        `).join('');
        updateInputPlaceholder();
    } else if (section) {
        section.style.display = 'none';
    }
}

// Add hired agent
export function addHiredAgent(icon, name) {
    if (state.hiredAgents.find(a => a.name === name)) return;

    state.hiredAgents.push({ icon, name });

    const section = document.getElementById('hiredAgentsSection');
    const list = document.getElementById('hiredAgentsList');

    if (section) section.style.display = 'block';

    if (list) {
        list.innerHTML = state.hiredAgents.map(a => `
            <div style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: white; border-radius: 8px; font-size: 13px;">
                <span>${a.icon}</span>
                <span style="flex: 1;">@${a.name}</span>
                <span style="color: var(--success); font-size: 11px;">Active</span>
            </div>
        `).join('');
    }

    updateInputPlaceholder();
}

// Update input placeholder based on hired agents
export function updateInputPlaceholder() {
    const input = document.getElementById('messageInput');
    if (!input) return;

    if (state.hiredAgents.length > 0) {
        if (state.hiredAgents.length <= 2) {
            const names = state.hiredAgents.map(a => '@' + a.name).join(', ');
            input.placeholder = `Message ${names}...`;
        } else {
            input.placeholder = `Message ${state.hiredAgents.length} agents... Type @ to mention`;
        }
    } else {
        input.placeholder = 'Describe what content you need...';
    }
}

// Render agent selector in header
export function renderAgentSelector() {
    const selector = document.getElementById('agentSelector');
    if (!selector) return;

    const activeIds = state.addedAgents.slice(0, 4);

    selector.innerHTML = availableAgents
        .filter(a => activeIds.includes(a.id))
        .map(a => `
            <div class="agent-chip active" onclick="window.toggleAgentInChat('${a.id}')">
                ${a.icon} ${a.name}
            </div>
        `).join('');

    if (activeIds.length === 0) {
        selector.innerHTML = `<a href="marketplace.html" class="agent-chip">➕ Add Agents</a>`;
    }
}

// Render active agents below input
export function renderActiveAgents() {
    const container = document.getElementById('activeAgents');
    if (!container) return;

    const activeIds = state.addedAgents.slice(0, 4);

    container.innerHTML = availableAgents
        .filter(a => activeIds.includes(a.id))
        .map(a => `
            <div class="active-agent-pill">
                ${a.icon} @${a.name}
                <span class="remove" onclick="window.removeAgent('${a.id}')">✕</span>
            </div>
        `).join('');
}

// Remove agent
export function removeAgent(agentId) {
    state.addedAgents = state.addedAgents.filter(id => id !== agentId);
    saveAddedAgents();
    updateAgentCount();
    renderAgentSelector();
    renderActiveAgents();
}

// Toggle agent in chat
export function toggleAgentInChat(agentId) {
    // Toggle active state for chat context
}

// Export functions to window for HTML onclick handlers
if (typeof window !== 'undefined') {
    window.insertMention = insertMention;
    window.hideMentionPopup = hideMentionPopup;
    window.removeAgent = removeAgent;
    window.toggleAgentInChat = toggleAgentInChat;
}
