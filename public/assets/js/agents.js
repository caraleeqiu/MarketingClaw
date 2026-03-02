/**
 * MarketingClaw - Agent System
 * Handles hired agents, mentions, and agent UI
 */

// Check for @ mention in input
function checkMention(text) {
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
function showMentionPopup(filter) {
    const popup = document.getElementById('mentionPopup');
    const list = document.getElementById('mentionList');

    const filtered = hiredAgents.filter(a =>
        filter === '' || a.name.toLowerCase().includes(filter)
    );

    if (filtered.length === 0 && hiredAgents.length === 0) {
        list.innerHTML = '<div style="padding: 16px; color: var(--text-secondary); text-align: center;">No agents hired yet.<br><a href="marketplace.html" style="color: var(--primary);">Go to Agent Hub</a></div>';
    } else if (filtered.length === 0) {
        list.innerHTML = '<div style="padding: 16px; color: var(--text-secondary); text-align: center;">No matching agents</div>';
    } else {
        list.innerHTML = filtered.map(a => `
            <div class="mention-item" onclick="insertMention('${a.name}')">
                <span class="icon">${a.icon}</span>
                <span class="name">@${a.name}</span>
                <span class="status">Active</span>
            </div>
        `).join('');
    }

    popup.style.display = 'block';
}

// Hide mention popup
function hideMentionPopup() {
    document.getElementById('mentionPopup').style.display = 'none';
}

// Insert mention into input
function insertMention(name) {
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
function updateAgentCount() {
    document.getElementById('agentCount').textContent = addedAgents.length;
}

// Sync hired agents from localStorage
function syncHiredAgents() {
    hiredAgents = [];

    addedAgents.forEach(agentId => {
        const agent = availableAgents.find(a => a.id === agentId);
        if (agent && !hiredAgents.find(h => h.name === agent.name)) {
            hiredAgents.push({ icon: agent.icon, name: agent.name });
        }
    });

    if (hiredAgents.length > 0) {
        document.getElementById('hiredAgentsSection').style.display = 'block';
        const list = document.getElementById('hiredAgentsList');
        list.innerHTML = hiredAgents.map(a => `
            <div style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: white; border-radius: 8px; font-size: 13px;">
                <span>${a.icon}</span>
                <span style="flex: 1;">@${a.name}</span>
                <span style="color: var(--success); font-size: 11px;">Active</span>
            </div>
        `).join('');
        updateInputPlaceholder();
    } else {
        document.getElementById('hiredAgentsSection').style.display = 'none';
    }
}

// Add hired agent
function addHiredAgent(icon, name) {
    if (hiredAgents.find(a => a.name === name)) return;

    hiredAgents.push({ icon, name });

    document.getElementById('hiredAgentsSection').style.display = 'block';

    const list = document.getElementById('hiredAgentsList');
    list.innerHTML = hiredAgents.map(a => `
        <div style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: white; border-radius: 8px; font-size: 13px;">
            <span>${a.icon}</span>
            <span style="flex: 1;">@${a.name}</span>
            <span style="color: var(--success); font-size: 11px;">Active</span>
        </div>
    `).join('');

    updateInputPlaceholder();
}

// Update input placeholder based on hired agents
function updateInputPlaceholder() {
    const input = document.getElementById('messageInput');
    if (hiredAgents.length > 0) {
        if (hiredAgents.length <= 2) {
            const names = hiredAgents.map(a => '@' + a.name).join(', ');
            input.placeholder = `Message ${names}...`;
        } else {
            input.placeholder = `Message ${hiredAgents.length} agents... Type @ to mention`;
        }
    } else {
        input.placeholder = 'Describe what content you need...';
    }
}

// Clear all hired agents
function clearHiredAgents() {
    hiredAgents = [];
    document.getElementById('hiredAgentsSection').style.display = 'none';
    document.getElementById('hiredAgentsList').innerHTML = '';
    document.getElementById('agentCount').textContent = '0';
}

// Render agent selector in header
function renderAgentSelector() {
    const selector = document.getElementById('agentSelector');
    const activeIds = addedAgents.slice(0, 4);

    selector.innerHTML = availableAgents
        .filter(a => activeIds.includes(a.id))
        .map(a => `
            <div class="agent-chip active" onclick="toggleAgentInChat('${a.id}')">
                ${a.icon} ${a.name}
            </div>
        `).join('');

    if (activeIds.length === 0) {
        selector.innerHTML = `<a href="marketplace.html" class="agent-chip">➕ Add Agents</a>`;
    }
}

// Render active agents below input
function renderActiveAgents() {
    const container = document.getElementById('activeAgents');
    const activeIds = addedAgents.slice(0, 4);

    container.innerHTML = availableAgents
        .filter(a => activeIds.includes(a.id))
        .map(a => `
            <div class="active-agent-pill">
                ${a.icon} @${a.name}
                <span class="remove" onclick="removeAgent('${a.id}')">✕</span>
            </div>
        `).join('');
}

// Remove agent
function removeAgent(agentId) {
    addedAgents = addedAgents.filter(id => id !== agentId);
    localStorage.setItem('addedAgentsHomePro', JSON.stringify(addedAgents));
    updateAgentCount();
    renderAgentSelector();
    renderActiveAgents();
}

// Toggle agent in chat
function toggleAgentInChat(agentId) {
    // Toggle active state for chat context
}

// Display agents used in generation
function displayAgentsUsed(agents) {
    // Update hired agents display
    agents.forEach(a => addHiredAgent(a.icon, a.name));
}

// Update agent status during generation
function updateAgent(id, status, message) {
    const el = document.getElementById(id);
    if (el) {
        el.className = `agent-working ${status}`;
        const statusEl = el.querySelector('.status');
        if (statusEl) statusEl.textContent = message;
    }
}

// Update agent status in chat
function updateAgentStatus(num, status, icon) {
    const el = document.getElementById(`agent-status-${num}`);
    if (el) {
        el.className = status === 'done' ? 'done' : status === 'working' ? 'working' : '';
        el.innerHTML = `${icon} ${el.textContent.replace(/^[^\s]+\s/, '')}`;
    }
}

// Update sidebar agent status
function updateSidebarAgentStatus(num, icon) {
    const el = document.getElementById(`sidebar-agent-${num}`);
    if (el) {
        el.querySelector('.icon').textContent = icon;
    }
}
