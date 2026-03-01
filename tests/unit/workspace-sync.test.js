/**
 * MarketingClaw WorkSpace Sync Test Suite
 * Tests for chat.html agent synchronization with marketplace
 */

// Test utilities
const TestUtils = {
    colors: {
        green: '\x1b[32m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        reset: '\x1b[0m',
        bold: '\x1b[1m'
    },

    log: {
        pass: (msg) => console.log(`${TestUtils.colors.green}[PASS]${TestUtils.colors.reset} ${msg}`),
        fail: (msg) => console.log(`${TestUtils.colors.red}[FAIL]${TestUtils.colors.reset} ${msg}`),
        info: (msg) => console.log(`${TestUtils.colors.blue}[INFO]${TestUtils.colors.reset} ${msg}`),
        warn: (msg) => console.log(`${TestUtils.colors.yellow}[WARN]${TestUtils.colors.reset} ${msg}`),
        section: (msg) => console.log(`\n${TestUtils.colors.bold}=== ${msg} ===${TestUtils.colors.reset}\n`)
    }
};

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
};

// Mock localStorage
class MockLocalStorage {
    constructor() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }

    clear() {
        this.store = {};
    }
}

// Available agents (same as chat.html)
const AVAILABLE_AGENTS = [
    { id: 'localtrend', name: 'Trend Radar', icon: '📍' },
    { id: 'competitor', name: 'Competitor Intel', icon: '🕵️' },
    { id: 'weather', name: 'Weather Finder', icon: '🌤️' },
    { id: 'seolocal', name: 'Local SEO', icon: '📊' },
    { id: 'homeprocopy', name: 'Pro Copywriter', icon: '✍️' },
    { id: 'reviewresponse', name: 'Review Responder', icon: '⭐' },
    { id: 'estimate', name: 'Quote Writer', icon: '📋' },
    { id: 'beforeafter', name: 'Before/After', icon: '📸' },
    { id: 'projectgallery', name: 'Gallery Builder', icon: '🖼️' },
    { id: 'tipsvideo', name: 'Video Creator', icon: '🎬' },
    { id: 'googlebiz', name: 'Google Business', icon: '📍' },
    { id: 'nextdoor', name: 'Nextdoor Pro', icon: '🏘️' },
    { id: 'facebooklocal', name: 'Facebook Local', icon: '📘' },
    { id: 'thumbtack', name: 'Thumbtack Pro', icon: '📌' },
    { id: 'plumber', name: 'Plumber AI', icon: '🔧' },
    { id: 'electrician', name: 'Electrician AI', icon: '⚡' },
    { id: 'hvac', name: 'HVAC AI', icon: '❄️' },
    { id: 'roofer', name: 'Roofer AI', icon: '🏠' },
    { id: 'landscaper', name: 'Landscaper AI', icon: '🌿' },
    { id: 'realestate', name: 'Real Estate AI', icon: '🏡' }
];

const STORAGE_KEY = 'addedAgentsHomePro';

/**
 * WorkSpace Sync Simulator
 * Replicates the logic from chat.html
 */
class WorkSpaceSyncSimulator {
    constructor(localStorage) {
        this.localStorage = localStorage;
        this.availableAgents = AVAILABLE_AGENTS;
        this.hiredAgents = [];
    }

    // Sync hired agents from localStorage (matches chat.html syncHiredAgents function)
    syncHiredAgents() {
        this.hiredAgents = [];

        try {
            const addedAgents = JSON.parse(this.localStorage.getItem(STORAGE_KEY) || '[]');

            addedAgents.forEach(agentId => {
                const agent = this.availableAgents.find(a => a.id === agentId);
                if (agent && !this.hiredAgents.find(h => h.name === agent.name)) {
                    this.hiredAgents.push({ icon: agent.icon, name: agent.name, id: agent.id });
                }
            });
        } catch (error) {
            this.hiredAgents = [];
        }

        return this.hiredAgents;
    }

    // Get hired agents for sidebar display
    getHiredAgentsForSidebar() {
        return this.hiredAgents.map(a => ({
            icon: a.icon,
            name: `@${a.name}`,
            status: 'Active'
        }));
    }

    // Filter agents for @ mention popup
    filterAgentsForMention(searchTerm) {
        if (!searchTerm) return this.hiredAgents;

        return this.hiredAgents.filter(a =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Insert mention into input
    insertMention(currentText, agentName) {
        const lastAtIndex = currentText.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            return currentText.substring(0, lastAtIndex) + '@' + agentName + ' ';
        }

        return currentText + '@' + agentName + ' ';
    }

    // Check if @ mention should show popup
    shouldShowMentionPopup(text) {
        const lastAtIndex = text.lastIndexOf('@');
        if (lastAtIndex === -1) return false;

        const afterAt = text.substring(lastAtIndex + 1);

        // Show popup if @ is at end or followed by partial text (no space yet)
        return afterAt === '' || (!afterAt.includes(' ') && afterAt.length < 20);
    }

    // Get agent count for badge
    getAgentCount() {
        return this.hiredAgents.length;
    }
}

/**
 * Test: Hired Agents Sync from Marketplace
 */
function testHiredAgentsSync() {
    TestUtils.log.section('Hired Agents Sync Tests');

    const localStorage = new MockLocalStorage();

    // Simulate marketplace adding agents
    const marketplaceAgents = ['plumber', 'googlebiz', 'nextdoor'];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(marketplaceAgents));

    const workspace = new WorkSpaceSyncSimulator(localStorage);
    const hiredAgents = workspace.syncHiredAgents();

    TestUtils.log.info('Testing: Agents from marketplace appear in workspace');

    if (hiredAgents.length === marketplaceAgents.length) {
        const allFound = marketplaceAgents.every(id =>
            hiredAgents.find(h => h.id === id)
        );

        if (allFound) {
            testResults.passed++;
            testResults.tests.push({
                name: 'Marketplace to Workspace Sync',
                status: 'PASS',
                synced: hiredAgents.map(h => h.name)
            });
            TestUtils.log.pass(`Synced agents: ${hiredAgents.map(h => h.name).join(', ')}`);
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: 'Marketplace to Workspace Sync',
                status: 'FAIL',
                reason: 'Not all agents found'
            });
            TestUtils.log.fail('Not all marketplace agents synced');
        }
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Marketplace to Workspace Sync',
            status: 'FAIL',
            expected: marketplaceAgents.length,
            actual: hiredAgents.length
        });
        TestUtils.log.fail(`Expected ${marketplaceAgents.length} agents, got ${hiredAgents.length}`);
    }
}

/**
 * Test: Sidebar "Hired Agents" Display
 */
function testSidebarDisplay() {
    TestUtils.log.section('Sidebar Hired Agents Display Tests');

    const localStorage = new MockLocalStorage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['electrician', 'hvac']));

    const workspace = new WorkSpaceSyncSimulator(localStorage);
    workspace.syncHiredAgents();

    const sidebarAgents = workspace.getHiredAgentsForSidebar();

    TestUtils.log.info('Testing: Sidebar displays hired agents correctly');

    // Check format
    let formatCorrect = true;
    for (const agent of sidebarAgents) {
        if (!agent.icon || !agent.name.startsWith('@') || agent.status !== 'Active') {
            formatCorrect = false;
            break;
        }
    }

    if (formatCorrect && sidebarAgents.length === 2) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Sidebar Agent Display Format',
            status: 'PASS',
            agents: sidebarAgents.map(a => a.name)
        });
        TestUtils.log.pass(`Sidebar shows: ${sidebarAgents.map(a => a.name).join(', ')}`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Sidebar Agent Display Format',
            status: 'FAIL'
        });
        TestUtils.log.fail('Sidebar format incorrect');
    }
}

/**
 * Test: @ Mention Popup
 */
function testMentionPopup() {
    TestUtils.log.section('@ Mention Popup Tests');

    const localStorage = new MockLocalStorage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['plumber', 'electrician', 'hvac', 'roofer']));

    const workspace = new WorkSpaceSyncSimulator(localStorage);
    workspace.syncHiredAgents();

    // Test: Popup should show on @
    TestUtils.log.info('Testing: Popup shows when typing @');

    const testCases = [
        { input: '@', shouldShow: true, description: '@ alone' },
        { input: 'Hello @', shouldShow: true, description: 'text followed by @' },
        { input: '@Plum', shouldShow: true, description: '@ with partial name' },
        { input: '@Plumber ', shouldShow: false, description: '@ with complete name and space' },
        { input: 'No mention here', shouldShow: false, description: 'no @ symbol' }
    ];

    for (const tc of testCases) {
        const shows = workspace.shouldShowMentionPopup(tc.input);

        if (shows === tc.shouldShow) {
            testResults.passed++;
            testResults.tests.push({
                name: `Mention Popup - ${tc.description}`,
                status: 'PASS'
            });
            TestUtils.log.pass(`"${tc.input}" -> Popup ${shows ? 'shows' : 'hidden'}`);
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: `Mention Popup - ${tc.description}`,
                status: 'FAIL',
                expected: tc.shouldShow,
                actual: shows
            });
            TestUtils.log.fail(`"${tc.input}" -> Expected ${tc.shouldShow}, got ${shows}`);
        }
    }
}

/**
 * Test: Mention Filtering
 */
function testMentionFiltering() {
    TestUtils.log.section('Mention Filtering Tests');

    const localStorage = new MockLocalStorage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
        'plumber', 'electrician', 'googlebiz', 'facebooklocal'
    ]));

    const workspace = new WorkSpaceSyncSimulator(localStorage);
    workspace.syncHiredAgents();

    // Test: Filter by partial name
    TestUtils.log.info('Testing: Filter agents by partial name');

    const filtered1 = workspace.filterAgentsForMention('plum');
    if (filtered1.length === 1 && filtered1[0].name.toLowerCase().includes('plum')) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Filter by Partial Name',
            status: 'PASS'
        });
        TestUtils.log.pass(`Filter "plum" found: ${filtered1[0].name}`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Filter by Partial Name',
            status: 'FAIL'
        });
        TestUtils.log.fail(`Filter "plum" failed, found ${filtered1.length} results`);
    }

    // Test: Empty filter returns all
    TestUtils.log.info('Testing: Empty filter returns all agents');

    const filtered2 = workspace.filterAgentsForMention('');
    if (filtered2.length === 4) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Empty Filter Returns All',
            status: 'PASS',
            count: filtered2.length
        });
        TestUtils.log.pass(`Empty filter returned ${filtered2.length} agents`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Empty Filter Returns All',
            status: 'FAIL'
        });
        TestUtils.log.fail(`Empty filter returned ${filtered2.length}, expected 4`);
    }

    // Test: No match returns empty
    TestUtils.log.info('Testing: No match returns empty array');

    const filtered3 = workspace.filterAgentsForMention('xyz123');
    if (filtered3.length === 0) {
        testResults.passed++;
        testResults.tests.push({
            name: 'No Match Returns Empty',
            status: 'PASS'
        });
        TestUtils.log.pass('No match returned empty array');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'No Match Returns Empty',
            status: 'FAIL'
        });
        TestUtils.log.fail(`Expected 0, got ${filtered3.length}`);
    }
}

/**
 * Test: Mention Insertion
 */
function testMentionInsertion() {
    TestUtils.log.section('Mention Insertion Tests');

    const localStorage = new MockLocalStorage();
    const workspace = new WorkSpaceSyncSimulator(localStorage);

    // Test: Insert mention at @
    TestUtils.log.info('Testing: Insert mention replaces @');

    const result1 = workspace.insertMention('@', 'Plumber AI');
    if (result1 === '@Plumber AI ') {
        testResults.passed++;
        testResults.tests.push({
            name: 'Insert Mention - Replace @',
            status: 'PASS'
        });
        TestUtils.log.pass(`"@" -> "${result1}"`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Insert Mention - Replace @',
            status: 'FAIL',
            expected: '@Plumber AI ',
            actual: result1
        });
        TestUtils.log.fail(`Expected "@Plumber AI ", got "${result1}"`);
    }

    // Test: Insert mention replaces partial
    TestUtils.log.info('Testing: Insert mention replaces partial text');

    const result2 = workspace.insertMention('Hello @Plum', 'Plumber AI');
    if (result2 === 'Hello @Plumber AI ') {
        testResults.passed++;
        testResults.tests.push({
            name: 'Insert Mention - Replace Partial',
            status: 'PASS'
        });
        TestUtils.log.pass(`"Hello @Plum" -> "${result2}"`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Insert Mention - Replace Partial',
            status: 'FAIL',
            expected: 'Hello @Plumber AI ',
            actual: result2
        });
        TestUtils.log.fail(`Expected "Hello @Plumber AI ", got "${result2}"`);
    }

    // Test: Insert mention with no @ appends
    TestUtils.log.info('Testing: Insert mention with no @ appends');

    const result3 = workspace.insertMention('No mention here', 'HVAC AI');
    if (result3.includes('@HVAC AI ')) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Insert Mention - No @ Appends',
            status: 'PASS'
        });
        TestUtils.log.pass(`Appended mention to text`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Insert Mention - No @ Appends',
            status: 'FAIL'
        });
        TestUtils.log.fail(`Mention not appended properly`);
    }
}

/**
 * Test: Badge Count Sync
 */
function testBadgeCountSync() {
    TestUtils.log.section('Badge Count Sync Tests');

    const localStorage = new MockLocalStorage();

    // Test with varying numbers of agents
    const testCases = [0, 1, 5, 10];

    for (const count of testCases) {
        TestUtils.log.info(`Testing: Badge shows ${count} agents`);

        const agentIds = AVAILABLE_AGENTS.slice(0, count).map(a => a.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(agentIds));

        const workspace = new WorkSpaceSyncSimulator(localStorage);
        workspace.syncHiredAgents();

        const badgeCount = workspace.getAgentCount();

        if (badgeCount === count) {
            testResults.passed++;
            testResults.tests.push({
                name: `Badge Count - ${count} agents`,
                status: 'PASS'
            });
            TestUtils.log.pass(`Badge correctly shows ${badgeCount}`);
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: `Badge Count - ${count} agents`,
                status: 'FAIL',
                expected: count,
                actual: badgeCount
            });
            TestUtils.log.fail(`Expected ${count}, got ${badgeCount}`);
        }
    }
}

/**
 * Test: Empty State
 */
function testEmptyState() {
    TestUtils.log.section('Empty State Tests');

    const localStorage = new MockLocalStorage();
    // Empty or no agents
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

    const workspace = new WorkSpaceSyncSimulator(localStorage);
    workspace.syncHiredAgents();

    TestUtils.log.info('Testing: Empty state handling');

    if (workspace.hiredAgents.length === 0) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Empty State - No Agents',
            status: 'PASS'
        });
        TestUtils.log.pass('Empty state handled correctly');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Empty State - No Agents',
            status: 'FAIL'
        });
        TestUtils.log.fail('Empty state not handled');
    }

    // Test sidebar should be hidden
    const sidebarAgents = workspace.getHiredAgentsForSidebar();
    if (sidebarAgents.length === 0) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Empty State - Sidebar Hidden',
            status: 'PASS'
        });
        TestUtils.log.pass('Sidebar empty in empty state');
    } else {
        testResults.failed++;
        TestUtils.log.fail('Sidebar should be empty');
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('  WorkSpace Sync Test Suite');
    console.log('  Testing: chat.html agent sync logic');
    console.log('  Time: ' + new Date().toISOString());
    console.log('='.repeat(60));

    const startTime = Date.now();

    testHiredAgentsSync();
    testSidebarDisplay();
    testMentionPopup();
    testMentionFiltering();
    testMentionInsertion();
    testBadgeCountSync();
    testEmptyState();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('  TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Total Tests: ${testResults.passed + testResults.failed}`);
    console.log(`  ${TestUtils.colors.green}Passed: ${testResults.passed}${TestUtils.colors.reset}`);
    console.log(`  ${TestUtils.colors.red}Failed: ${testResults.failed}${TestUtils.colors.reset}`);
    console.log(`  Duration: ${duration}s`);
    console.log('='.repeat(60) + '\n');

    return testResults;
}

module.exports = { runTests, testResults, WorkSpaceSyncSimulator, MockLocalStorage };

if (require.main === module) {
    runTests()
        .then(results => {
            process.exit(results.failed > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('Test suite failed:', error);
            process.exit(1);
        });
}
