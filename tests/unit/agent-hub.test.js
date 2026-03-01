/**
 * MarketingClaw Agent Hub Test Suite
 * Tests for marketplace.html agent hiring logic
 * These tests simulate browser localStorage interactions
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

// Mock localStorage for Node.js environment
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

    get length() {
        return Object.keys(this.store).length;
    }

    key(index) {
        return Object.keys(this.store)[index] || null;
    }
}

// Agent data (matches marketplace.html)
const AGENTS = [
    // Local Intel
    { id: 'localtrend', name: 'Local Trend Radar', icon: '📍', color: '#FF9F0A', category: 'local' },
    { id: 'competitor', name: 'Local Competitor Intel', icon: '🕵️', color: '#5856D6', category: 'local' },
    { id: 'weather', name: 'Weather Opportunity Finder', icon: '🌤️', color: '#64D2FF', category: 'local' },
    { id: 'seolocal', name: 'Local SEO Analyzer', icon: '📊', color: '#007AFF', category: 'local' },
    // Copywriting
    { id: 'homeprocopy', name: 'Home Pro Copywriter', icon: '✍️', color: '#AC8E68', category: 'copywriting' },
    { id: 'reviewresponse', name: 'Review Responder', icon: '⭐', color: '#FFD60A', category: 'copywriting' },
    { id: 'estimate', name: 'Estimate & Quote Writer', icon: '📋', color: '#30D158', category: 'copywriting' },
    // Visual
    { id: 'beforeafter', name: 'Before/After Generator', icon: '📸', color: '#AF52DE', category: 'visual' },
    { id: 'projectgallery', name: 'Project Gallery Builder', icon: '🖼️', color: '#FF3B30', category: 'visual' },
    { id: 'tipsvideo', name: 'Home Tips Video Creator', icon: '🎬', color: '#FF2D55', category: 'visual' },
    // Platform
    { id: 'googlebiz', name: 'Google Business Profile', icon: '📍', color: '#4285F4', category: 'platform' },
    { id: 'nextdoor', name: 'Nextdoor Pro', icon: '🏘️', color: '#8DC63F', category: 'platform' },
    { id: 'facebooklocal', name: 'Facebook Local', icon: '📘', color: '#1877F2', category: 'platform' },
    { id: 'thumbtack', name: 'Thumbtack Pro', icon: '📌', color: '#009FD9', category: 'platform' },
    // Industry
    { id: 'plumber', name: 'Plumber AI', icon: '🔧', color: '#007AFF', category: 'industry' },
    { id: 'electrician', name: 'Electrician AI', icon: '⚡', color: '#FFD60A', category: 'industry' },
    { id: 'hvac', name: 'HVAC AI', icon: '❄️', color: '#5AC8FA', category: 'industry' },
    { id: 'roofer', name: 'Roofer AI', icon: '🏠', color: '#8B4513', category: 'industry' },
    { id: 'landscaper', name: 'Landscaper AI', icon: '🌿', color: '#34C759', category: 'industry' },
    { id: 'realestate', name: 'Real Estate AI', icon: '🏡', color: '#FF6B35', category: 'industry' }
];

const STORAGE_KEY = 'addedAgentsHomePro';

/**
 * Agent Hub Logic Simulation
 * Replicates the logic from marketplace.html
 */
class AgentHubSimulator {
    constructor(localStorage) {
        this.localStorage = localStorage;
        this.agents = AGENTS;
    }

    getAddedAgents() {
        try {
            return JSON.parse(this.localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }

    toggleAgent(agentId) {
        let addedAgents = this.getAddedAgents();
        const index = addedAgents.indexOf(agentId);

        if (index === -1) {
            // Add agent
            addedAgents.push(agentId);
            this.localStorage.setItem(STORAGE_KEY, JSON.stringify(addedAgents));
            return { action: 'added', count: addedAgents.length };
        } else {
            // Remove agent
            addedAgents.splice(index, 1);
            this.localStorage.setItem(STORAGE_KEY, JSON.stringify(addedAgents));
            return { action: 'removed', count: addedAgents.length };
        }
    }

    isAgentAdded(agentId) {
        return this.getAddedAgents().includes(agentId);
    }

    getAddedCount() {
        return this.getAddedAgents().length;
    }

    clearAllAgents() {
        this.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }

    getAgentById(agentId) {
        return this.agents.find(a => a.id === agentId);
    }

    getAgentsByCategory(category) {
        return this.agents.filter(a => a.category === category);
    }
}

/**
 * Test: Add Button Functionality
 */
function testAddButton() {
    TestUtils.log.section('Agent Add Button Tests');

    const localStorage = new MockLocalStorage();
    const hub = new AgentHubSimulator(localStorage);

    // Test: Add agent to localStorage
    TestUtils.log.info('Testing: Adding agent to localStorage');

    const result1 = hub.toggleAgent('plumber');

    if (result1.action === 'added' && hub.isAgentAdded('plumber')) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Add Agent to localStorage',
            status: 'PASS'
        });
        TestUtils.log.pass('Agent added to localStorage successfully');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Add Agent to localStorage',
            status: 'FAIL',
            reason: 'Agent not found in localStorage after adding'
        });
        TestUtils.log.fail('Agent not added to localStorage');
    }

    // Test: Agent shows "Added" status
    TestUtils.log.info('Testing: Agent shows Added status');

    if (hub.isAgentAdded('plumber')) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Agent Added Status',
            status: 'PASS'
        });
        TestUtils.log.pass('Agent correctly shows as added');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Agent Added Status',
            status: 'FAIL'
        });
        TestUtils.log.fail('Agent does not show as added');
    }

    // Test: WorkSpace badge updates
    TestUtils.log.info('Testing: Badge count updates');

    const count1 = hub.getAddedCount();
    hub.toggleAgent('electrician');
    const count2 = hub.getAddedCount();

    if (count2 === count1 + 1) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Badge Count Updates',
            status: 'PASS',
            details: { before: count1, after: count2 }
        });
        TestUtils.log.pass(`Badge count updated: ${count1} -> ${count2}`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Badge Count Updates',
            status: 'FAIL',
            reason: `Expected ${count1 + 1}, got ${count2}`
        });
        TestUtils.log.fail(`Badge count not updated correctly: ${count1} -> ${count2}`);
    }
}

/**
 * Test: Remove Agent Functionality
 */
function testRemoveAgent() {
    TestUtils.log.section('Agent Remove Tests');

    const localStorage = new MockLocalStorage();
    const hub = new AgentHubSimulator(localStorage);

    // Add an agent first
    hub.toggleAgent('hvac');

    // Test: Remove agent
    TestUtils.log.info('Testing: Removing agent');

    const result = hub.toggleAgent('hvac'); // Toggle again to remove

    if (result.action === 'removed' && !hub.isAgentAdded('hvac')) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Remove Agent',
            status: 'PASS'
        });
        TestUtils.log.pass('Agent removed successfully');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Remove Agent',
            status: 'FAIL'
        });
        TestUtils.log.fail('Agent not removed properly');
    }

    // Test: Count decrements
    TestUtils.log.info('Testing: Badge count decrements');

    hub.toggleAgent('roofer');
    hub.toggleAgent('landscaper');
    const countBefore = hub.getAddedCount();

    hub.toggleAgent('roofer'); // Remove one

    const countAfter = hub.getAddedCount();

    if (countAfter === countBefore - 1) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Badge Count Decrements',
            status: 'PASS'
        });
        TestUtils.log.pass(`Badge count decremented: ${countBefore} -> ${countAfter}`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Badge Count Decrements',
            status: 'FAIL'
        });
        TestUtils.log.fail(`Badge count not decremented: ${countBefore} -> ${countAfter}`);
    }
}

/**
 * Test: localStorage Persistence
 */
function testLocalStoragePersistence() {
    TestUtils.log.section('localStorage Persistence Tests');

    const localStorage = new MockLocalStorage();
    const hub1 = new AgentHubSimulator(localStorage);

    // Add agents
    hub1.toggleAgent('googlebiz');
    hub1.toggleAgent('nextdoor');
    hub1.toggleAgent('facebooklocal');

    // Simulate page reload by creating new hub with same localStorage
    TestUtils.log.info('Testing: Agents persist after page reload simulation');

    const hub2 = new AgentHubSimulator(localStorage);
    const addedAgents = hub2.getAddedAgents();

    const expectedAgents = ['googlebiz', 'nextdoor', 'facebooklocal'];
    const allPersisted = expectedAgents.every(id => addedAgents.includes(id));

    if (allPersisted && addedAgents.length === expectedAgents.length) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Agents Persist After Reload',
            status: 'PASS',
            agents: addedAgents
        });
        TestUtils.log.pass(`Agents persisted: ${addedAgents.join(', ')}`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Agents Persist After Reload',
            status: 'FAIL',
            expected: expectedAgents,
            actual: addedAgents
        });
        TestUtils.log.fail(`Persistence failed. Expected: ${expectedAgents}, Got: ${addedAgents}`);
    }
}

/**
 * Test: Category Filtering
 */
function testCategoryFiltering() {
    TestUtils.log.section('Category Filtering Tests');

    const localStorage = new MockLocalStorage();
    const hub = new AgentHubSimulator(localStorage);

    const categories = ['local', 'copywriting', 'visual', 'platform', 'industry'];

    for (const category of categories) {
        TestUtils.log.info(`Testing: ${category} category`);

        const agents = hub.getAgentsByCategory(category);

        if (agents.length > 0) {
            testResults.passed++;
            testResults.tests.push({
                name: `Category - ${category}`,
                status: 'PASS',
                count: agents.length
            });
            TestUtils.log.pass(`${category}: ${agents.length} agents found`);
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: `Category - ${category}`,
                status: 'FAIL'
            });
            TestUtils.log.fail(`${category}: No agents found`);
        }
    }
}

/**
 * Test: Agent Data Integrity
 */
function testAgentDataIntegrity() {
    TestUtils.log.section('Agent Data Integrity Tests');

    const localStorage = new MockLocalStorage();
    const hub = new AgentHubSimulator(localStorage);

    let valid = 0;
    let invalid = 0;

    for (const agent of AGENTS) {
        const hasRequiredFields = agent.id && agent.name && agent.icon && agent.category;

        if (hasRequiredFields) {
            valid++;
        } else {
            invalid++;
            TestUtils.log.warn(`Agent ${agent.id || 'unknown'} missing required fields`);
        }
    }

    TestUtils.log.info(`Testing: All agents have required fields`);

    if (invalid === 0) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Agent Data Integrity',
            status: 'PASS',
            totalAgents: AGENTS.length
        });
        TestUtils.log.pass(`All ${valid} agents have valid data`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Agent Data Integrity',
            status: 'FAIL',
            validAgents: valid,
            invalidAgents: invalid
        });
        TestUtils.log.fail(`${invalid} agents have missing fields`);
    }

    // Test unique IDs
    TestUtils.log.info('Testing: All agent IDs are unique');

    const ids = AGENTS.map(a => a.id);
    const uniqueIds = new Set(ids);

    if (ids.length === uniqueIds.size) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Agent IDs Unique',
            status: 'PASS'
        });
        TestUtils.log.pass('All agent IDs are unique');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Agent IDs Unique',
            status: 'FAIL'
        });
        TestUtils.log.fail('Duplicate agent IDs found');
    }
}

/**
 * Test: Edge Cases
 */
function testEdgeCases() {
    TestUtils.log.section('Edge Case Tests');

    // Test: Invalid agent ID
    TestUtils.log.info('Testing: Toggle invalid agent ID');

    const localStorage = new MockLocalStorage();
    const hub = new AgentHubSimulator(localStorage);

    try {
        hub.toggleAgent('nonexistent_agent_xyz');
        // The toggle function should still work (just adds the ID)
        // But getAgentById should return undefined
        const agent = hub.getAgentById('nonexistent_agent_xyz');

        if (agent === undefined) {
            testResults.passed++;
            testResults.tests.push({
                name: 'Invalid Agent ID Handled',
                status: 'PASS'
            });
            TestUtils.log.pass('Invalid agent ID handled gracefully');
        } else {
            testResults.failed++;
            TestUtils.log.fail('Invalid agent ID not handled properly');
        }
    } catch (error) {
        testResults.failed++;
        testResults.tests.push({
            name: 'Invalid Agent ID Handled',
            status: 'FAIL',
            reason: error.message
        });
        TestUtils.log.fail(`Error with invalid agent ID: ${error.message}`);
    }

    // Test: Empty localStorage
    TestUtils.log.info('Testing: Empty localStorage handling');

    const emptyStorage = new MockLocalStorage();
    const emptyHub = new AgentHubSimulator(emptyStorage);

    const count = emptyHub.getAddedCount();

    if (count === 0) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Empty localStorage',
            status: 'PASS'
        });
        TestUtils.log.pass('Empty localStorage returns 0 count');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Empty localStorage',
            status: 'FAIL',
            reason: `Expected 0, got ${count}`
        });
        TestUtils.log.fail(`Empty localStorage: Expected 0, got ${count}`);
    }

    // Test: Corrupted localStorage
    TestUtils.log.info('Testing: Corrupted localStorage handling');

    const corruptStorage = new MockLocalStorage();
    corruptStorage.setItem(STORAGE_KEY, 'not valid json {{{');

    const corruptHub = new AgentHubSimulator(corruptStorage);
    const corruptAgents = corruptHub.getAddedAgents();

    if (Array.isArray(corruptAgents)) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Corrupted localStorage',
            status: 'PASS'
        });
        TestUtils.log.pass('Corrupted localStorage handled gracefully');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Corrupted localStorage',
            status: 'FAIL'
        });
        TestUtils.log.fail('Corrupted localStorage not handled');
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('  Agent Hub (Marketplace) Test Suite');
    console.log('  Testing: marketplace.html logic');
    console.log('  Time: ' + new Date().toISOString());
    console.log('='.repeat(60));

    const startTime = Date.now();

    testAddButton();
    testRemoveAgent();
    testLocalStoragePersistence();
    testCategoryFiltering();
    testAgentDataIntegrity();
    testEdgeCases();

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

module.exports = { runTests, testResults, AgentHubSimulator, MockLocalStorage };

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
