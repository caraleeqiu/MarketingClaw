/**
 * MarketingClaw - Main Entry Point
 * Initialization and event bindings
 */

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

    console.log('MarketingClaw initialized');
}

// Start on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Also call init if already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
}
