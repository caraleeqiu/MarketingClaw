/**
 * MarketingClaw Auth Module
 * Supabase-based authentication with credits system
 */

const SUPABASE_URL = 'https://sygylcdxubqgswnzapku.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Z3lsY2R4dWJxZ3N3bnphcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzE1MzUsImV4cCI6MjA4Njk0NzUzNX0.L8AD16JIRsFKahBYdneCPU4nvnKtw02_AiL3NPulvvg';

let supabaseClient = null;
let currentUser = null;
let currentCredits = 0;

// Detect language from URL
function getLang() {
    const path = window.location.pathname;
    if (path.includes('/zh/')) return 'zh';
    if (path.includes('/en/')) return 'en';
    return 'en'; // default
}

// Get base path for current language
function getBasePath() {
    return '/' + getLang() + '/';
}

// Initialize Supabase
function initAuth() {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase SDK not loaded');
        return null;
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
}

// Check auth status
async function requireAuth(redirect = false) {
    if (!supabaseClient) initAuth();

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (!session) {
            if (redirect) {
                window.location.href = getBasePath() + 'login.html';
            }
            return null;
        }

        currentUser = session.user;
        await loadCredits();
        return session;
    } catch (e) {
        console.error('Auth check failed:', e);
        return null;
    }
}

// Get current user
async function getCurrentUser() {
    if (currentUser) return currentUser;
    if (!supabaseClient) initAuth();

    const { data: { user } } = await supabaseClient.auth.getUser();
    currentUser = user;
    return user;
}

// Load credits from database
async function loadCredits() {
    if (!currentUser) return 0;

    // For now, return mock credits - replace with actual DB call
    currentCredits = parseInt(localStorage.getItem('userCredits') || '50');
    return currentCredits;
}

// Consume credits
async function consumeCredits(amount, action) {
    if (currentCredits < amount) {
        const lang = getLang();
        const msg = lang === 'zh' ? '积分不足' : 'Insufficient credits';
        showToast(msg, 'error');
        return false;
    }

    currentCredits -= amount;
    localStorage.setItem('userCredits', currentCredits.toString());
    updateCreditsDisplay();

    // Log action (for analytics)
    console.log(`Credits consumed: ${amount} for ${action}`);
    return true;
}

// Update credits display in UI
function updateCreditsDisplay() {
    const displays = document.querySelectorAll('.credits-count');
    displays.forEach(el => {
        el.textContent = currentCredits;
    });
}

// Sign out
async function signOut() {
    if (!supabaseClient) initAuth();
    await supabaseClient.auth.signOut();
    window.location.href = getBasePath() + 'login.html';
}

// Get access token for API calls
async function getAccessToken() {
    if (!supabaseClient) initAuth();
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session?.access_token || null;
}

// Authenticated fetch
async function authFetch(url, options = {}) {
    const token = await getAccessToken();

    if (!token) {
        window.location.href = getBasePath() + 'login.html';
        return null;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    return fetch(url, { ...options, headers });
}

// Render user info in sidebar
function renderUserInfo(containerId) {
    getCurrentUser().then(user => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!user) {
            const lang = getLang();
            container.innerHTML = `
                <a href="${getBasePath()}login.html" class="btn btn-primary" style="width:100%">
                    ${lang === 'zh' ? '登录' : 'Sign In'}
                </a>
            `;
            return;
        }

        const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        const lang = getLang();

        container.innerHTML = `
            <div class="user-card" onclick="toggleUserMenu()">
                <div class="user-avatar">
                    ${avatar ? `<img src="${avatar}" alt="avatar">` : name[0].toUpperCase()}
                </div>
                <div class="user-info">
                    <div class="name">${name}</div>
                    <div class="plan">
                        <span class="credits-display">⚡ <span class="credits-count">${currentCredits}</span></span>
                    </div>
                </div>
            </div>
            <div id="userMenu" class="user-menu" style="display: none;">
                <a href="${getBasePath()}profile.html">${lang === 'zh' ? '个人中心' : 'Profile'}</a>
                <a href="${getBasePath()}pricing.html">${lang === 'zh' ? '购买积分' : 'Buy Credits'}</a>
                <a href="#" onclick="signOut(); return false;" style="color: var(--error);">
                    ${lang === 'zh' ? '退出登录' : 'Sign Out'}
                </a>
            </div>
        `;
    });
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

// Close menu on outside click
document.addEventListener('click', (e) => {
    const menu = document.getElementById('userMenu');
    const userCard = document.querySelector('.user-card');
    if (menu && !menu.contains(e.target) && !userCard?.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// Toast notifications
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.background = type === 'error' ? 'var(--error)' : '#1d1d1f';
    toast.classList.add('show');

    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Language switcher
function switchLanguage(lang) {
    const currentPath = window.location.pathname;
    const currentLang = getLang();
    const newPath = currentPath.replace(`/${currentLang}/`, `/${lang}/`);
    window.location.href = newPath;
}

// Auto-init on DOM ready
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        initAuth();
    });
}

// Export for global access
window.MarketingClaw = {
    initAuth,
    requireAuth,
    getCurrentUser,
    signOut,
    authFetch,
    renderUserInfo,
    consumeCredits,
    showToast,
    getLang,
    getBasePath,
    switchLanguage
};
