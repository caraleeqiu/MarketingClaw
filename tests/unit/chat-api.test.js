/**
 * MarketingClaw Chat API Test Suite
 * Tests for industry matching and AI response validation
 */

const BASE_URL = process.env.TEST_BASE_URL || 'https://marketingclaw.vercel.app';

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
    },

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Industry keywords for validation
const INDUSTRY_KEYWORDS = {
    electrician: ['electric', 'electrical', 'wiring', 'panel', 'circuit', 'outlet', 'lighting', 'electrician', 'spark', 'voltage', 'power'],
    plumber: ['plumb', 'pipe', 'drain', 'water', 'leak', 'faucet', 'toilet', 'sewer', 'plumber', 'plumbing', 'water heater'],
    hvac: ['hvac', 'heating', 'cooling', 'air condition', 'ac', 'furnace', 'heat pump', 'ventilation', 'temperature', 'thermostat'],
    roofer: ['roof', 'roofing', 'shingle', 'gutter', 'leak', 'storm damage', 'roofer', 'summit'],
    landscaper: ['landscape', 'landscaping', 'lawn', 'garden', 'yard', 'tree', 'shrub', 'grass', 'green thumb', 'outdoor']
};

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
};

/**
 * Call Chat API
 */
async function callChatAPI(message, history = []) {
    try {
        const response = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Chat API call failed: ${error.message}`);
    }
}

/**
 * Check if response contains industry-relevant keywords
 */
function containsIndustryKeywords(response, industry) {
    const keywords = INDUSTRY_KEYWORDS[industry] || [];
    const responseLower = response.toLowerCase();

    const matches = keywords.filter(keyword => responseLower.includes(keyword));
    return {
        found: matches.length > 0,
        matches: matches,
        keywordsChecked: keywords.length
    };
}

/**
 * Test Case: Industry Matching
 */
async function testIndustryMatching() {
    TestUtils.log.section('Chat API Industry Matching Tests');

    const testCases = [
        {
            name: 'Electrician Industry Match',
            message: "I'm an electrician",
            expectedIndustry: 'electrician',
            antiKeywords: ['plumb', 'plumber', 'pipe', 'drain'] // Should NOT contain plumber keywords
        },
        {
            name: 'Plumber Industry Match',
            message: "I'm a plumber",
            expectedIndustry: 'plumber',
            antiKeywords: ['electric', 'wiring', 'panel', 'circuit']
        },
        {
            name: 'HVAC Tech Industry Match',
            message: "I'm a HVAC tech",
            expectedIndustry: 'hvac',
            antiKeywords: ['plumb', 'roof', 'lawn']
        },
        {
            name: 'Roofer Industry Match',
            message: "I'm a roofer",
            expectedIndustry: 'roofer',
            antiKeywords: ['plumb', 'electric', 'hvac']
        },
        {
            name: 'Landscaper Industry Match',
            message: "I'm a landscaper",
            expectedIndustry: 'landscaper',
            antiKeywords: ['plumb', 'electric', 'roof']
        }
    ];

    for (const tc of testCases) {
        TestUtils.log.info(`Testing: ${tc.name}`);

        try {
            const result = await callChatAPI(tc.message);

            if (!result.success || !result.response) {
                testResults.failed++;
                testResults.tests.push({
                    name: tc.name,
                    status: 'FAIL',
                    reason: 'No valid response from API'
                });
                TestUtils.log.fail(`${tc.name}: No valid response from API`);
                continue;
            }

            const responseText = result.response;

            // Check for expected industry keywords
            const industryCheck = containsIndustryKeywords(responseText, tc.expectedIndustry);

            // Check for anti-keywords (should NOT be present)
            const antiKeywordsFound = tc.antiKeywords.filter(kw =>
                responseText.toLowerCase().includes(kw)
            );

            // Evaluation
            let passed = true;
            let reasons = [];

            if (!industryCheck.found) {
                passed = false;
                reasons.push(`Missing ${tc.expectedIndustry} keywords`);
            }

            if (antiKeywordsFound.length > 0) {
                passed = false;
                reasons.push(`Contains wrong industry keywords: ${antiKeywordsFound.join(', ')}`);
            }

            if (passed) {
                testResults.passed++;
                testResults.tests.push({
                    name: tc.name,
                    status: 'PASS',
                    matchedKeywords: industryCheck.matches
                });
                TestUtils.log.pass(`${tc.name}: Found keywords: ${industryCheck.matches.join(', ')}`);
            } else {
                testResults.failed++;
                testResults.tests.push({
                    name: tc.name,
                    status: 'FAIL',
                    reason: reasons.join('; '),
                    response: responseText.substring(0, 200) + '...'
                });
                TestUtils.log.fail(`${tc.name}: ${reasons.join('; ')}`);
            }

            // Rate limiting
            await TestUtils.sleep(1000);

        } catch (error) {
            testResults.failed++;
            testResults.tests.push({
                name: tc.name,
                status: 'FAIL',
                reason: error.message
            });
            TestUtils.log.fail(`${tc.name}: ${error.message}`);
        }
    }
}

/**
 * Test Case: API Error Handling
 */
async function testAPIErrorHandling() {
    TestUtils.log.section('Chat API Error Handling Tests');

    // Test: Empty message
    try {
        TestUtils.log.info('Testing: Empty message handling');

        const response = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: '' })
        });

        if (response.status === 400) {
            testResults.passed++;
            testResults.tests.push({ name: 'Empty message returns 400', status: 'PASS' });
            TestUtils.log.pass('Empty message returns 400 as expected');
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: 'Empty message returns 400',
                status: 'FAIL',
                reason: `Got status ${response.status} instead of 400`
            });
            TestUtils.log.fail(`Empty message: Expected 400, got ${response.status}`);
        }
    } catch (error) {
        testResults.failed++;
        TestUtils.log.fail(`Empty message test failed: ${error.message}`);
    }

    // Test: Invalid JSON
    try {
        TestUtils.log.info('Testing: Invalid JSON handling');

        const response = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: 'not valid json'
        });

        if (response.status >= 400) {
            testResults.passed++;
            testResults.tests.push({ name: 'Invalid JSON handled', status: 'PASS' });
            TestUtils.log.pass('Invalid JSON handled correctly');
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: 'Invalid JSON handled',
                status: 'FAIL',
                reason: `Expected error status, got ${response.status}`
            });
            TestUtils.log.fail(`Invalid JSON: Expected error, got ${response.status}`);
        }
    } catch (error) {
        testResults.passed++;
        TestUtils.log.pass('Invalid JSON caused fetch error as expected');
    }

    // Test: GET method not allowed
    try {
        TestUtils.log.info('Testing: GET method not allowed');

        const response = await fetch(`${BASE_URL}/api/chat`, {
            method: 'GET'
        });

        if (response.status === 405) {
            testResults.passed++;
            testResults.tests.push({ name: 'GET method returns 405', status: 'PASS' });
            TestUtils.log.pass('GET method returns 405 as expected');
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: 'GET method returns 405',
                status: 'FAIL',
                reason: `Got status ${response.status} instead of 405`
            });
            TestUtils.log.fail(`GET method: Expected 405, got ${response.status}`);
        }
    } catch (error) {
        testResults.failed++;
        TestUtils.log.fail(`GET method test failed: ${error.message}`);
    }
}

/**
 * Test Case: Conversation History
 */
async function testConversationHistory() {
    TestUtils.log.section('Conversation History Tests');

    try {
        TestUtils.log.info('Testing: Context retention in conversation');

        // First message
        const result1 = await callChatAPI("I'm a plumber in Denver, CO");

        if (!result1.success) {
            throw new Error('First message failed');
        }

        await TestUtils.sleep(1500);

        // Second message with history
        const history = [
            { role: 'user', content: "I'm a plumber in Denver, CO" },
            { role: 'assistant', content: result1.response }
        ];

        const result2 = await callChatAPI("Create a Google Business post for me", history);

        if (!result2.success) {
            throw new Error('Second message failed');
        }

        // Check if response remembers context (Denver, plumber)
        const responseLower = result2.response.toLowerCase();
        const remembersPlumber = responseLower.includes('plumb') || responseLower.includes('pipe') || responseLower.includes('water');
        const remembersDenver = responseLower.includes('denver');

        if (remembersPlumber || remembersDenver) {
            testResults.passed++;
            testResults.tests.push({
                name: 'Conversation context retention',
                status: 'PASS',
                details: { remembersPlumber, remembersDenver }
            });
            TestUtils.log.pass(`Context retained - Plumber: ${remembersPlumber}, Denver: ${remembersDenver}`);
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: 'Conversation context retention',
                status: 'FAIL',
                reason: 'Context not retained in follow-up message'
            });
            TestUtils.log.fail('Context not retained in follow-up message');
        }

    } catch (error) {
        testResults.failed++;
        testResults.tests.push({
            name: 'Conversation context retention',
            status: 'FAIL',
            reason: error.message
        });
        TestUtils.log.fail(`Conversation history test failed: ${error.message}`);
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('  MarketingClaw Chat API Test Suite');
    console.log('  Target: ' + BASE_URL);
    console.log('  Time: ' + new Date().toISOString());
    console.log('='.repeat(60));

    const startTime = Date.now();

    // Run all test suites
    await testIndustryMatching();
    await testAPIErrorHandling();
    await testConversationHistory();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('  TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Total Tests: ${testResults.passed + testResults.failed}`);
    console.log(`  ${TestUtils.colors.green}Passed: ${testResults.passed}${TestUtils.colors.reset}`);
    console.log(`  ${TestUtils.colors.red}Failed: ${testResults.failed}${TestUtils.colors.reset}`);
    console.log(`  Duration: ${duration}s`);
    console.log('='.repeat(60) + '\n');

    // Return results for integration with test runner
    return testResults;
}

// Export for use in test-all.js
module.exports = { runTests, testResults };

// Run if executed directly
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
