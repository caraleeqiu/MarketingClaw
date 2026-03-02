/**
 * MarketingClaw - Main Entry Point
 * ES Modules Architecture - v3.0
 */

// Import all modules
import { state } from './state.js';
import { availableAgents } from './config.js';
import { updateAgentCount, renderAgentSelector, renderActiveAgents, syncHiredAgents, checkMention, hideMentionPopup } from './agents.js';
import { processConversation, addChatBubble } from './chat-ui.js';
import { sendMessage, generateContentPack, regenerateImage } from './api-client.js';
import './modals.js';  // Auto-registers window functions
import './preview-renders.js';  // Auto-registers window functions
import './utils.js';  // Auto-registers window functions

// Initialize app
function init() {
    // Initialize agents
    updateAgentCount();
    renderAgentSelector();
    renderActiveAgents();
    syncHiredAgents();

    // Get textarea
    const textarea = document.getElementById('messageInput');
    if (!textarea) return;

    // Auto-resize textarea
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';

        // Check for @ mention
        checkMention(this.value);
    });

    // Enter to send, Shift+Enter for newline
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                return true;
            } else {
                e.preventDefault();
                e.stopPropagation();
                hideMentionPopup();

                // Use conversation flow instead of direct API
                const message = this.value.trim();
                if (message) {
                    addChatBubble('user', message);
                    this.value = '';
                    this.style.height = 'auto';
                    processConversation(message);
                }
                return false;
            }
        }
        if (e.key === 'Escape') {
            hideMentionPopup();
        }
    });

    // Close mention popup when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.input-wrapper')) {
            hideMentionPopup();
        }
    });

    console.log('MarketingClaw initialized (ES Modules)');
}

// Export to window for API calls from other modules
window.sendMessage = sendMessage;
window.generateContentPack = generateContentPack;
window.regenerateImage = regenerateImage;

// Start on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
