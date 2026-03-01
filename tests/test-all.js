#!/usr/bin/env node

/**
 * MarketingClaw Complete Test Suite
 * Main test entry point - runs all test modules
 *
 * Usage:
 *   node tests/test-all.js              # Run all tests
 *   node tests/test-all.js --api-only   # Run only API tests
 *   node tests/test-all.js --unit-only  # Run only unit tests
 *   node tests/test-all.js --verbose    # Show detailed output
 *
 * Environment Variables:
 *   TEST_BASE_URL - Override the default API URL (default: https://marketingclaw.vercel.app)
 */

const path = require('path');

// Test configuration
const CONFIG = {
    baseUrl: process.env.TEST_BASE_URL || 'https://marketingclaw.vercel.app',
    verbose: process.argv.includes('--verbose'),
    apiOnly: process.argv.includes('--api-only'),
    unitOnly: process.argv.includes('--unit-only')
};

// Colors for console output
const COLORS = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

// Test modules
const TEST_SUITES = {
    // API Tests (require network)
    api: [
        {
            name: 'Chat API Industry Matching',
            path: './unit/chat-api.test.js',
            description: 'Tests AI response for different industries'
        },
        {
            name: 'Platform Recommendations',
            path: './unit/platform-recommendation.test.js',
            description: 'Tests platform recommendation logic'
        },
        {
            name: 'Generate Pack API',
            path: './unit/generate-pack.test.js',
            description: 'Tests content generation and images'
        }
    ],
    // Unit Tests (no network needed)
    unit: [
        {
            name: 'Agent Hub Logic',
            path: './unit/agent-hub.test.js',
            description: 'Tests marketplace.html agent hiring'
        },
        {
            name: 'WorkSpace Sync',
            path: './unit/workspace-sync.test.js',
            description: 'Tests chat.html agent synchronization'
        },
        {
            name: 'UI Display Logic',
            path: './unit/ui-logic.test.js',
            description: 'Tests platform cards and formatting'
        }
    ]
};

// Aggregate results
const aggregateResults = {
    suites: [],
    totalPassed: 0,
    totalFailed: 0,
    totalSkipped: 0,
    startTime: null,
    endTime: null
};

/**
 * Print banner
 */
function printBanner() {
    console.log('\n');
    console.log(COLORS.cyan + '=' .repeat(70) + COLORS.reset);
    console.log(COLORS.bold + COLORS.cyan);
    console.log('  __  __            _        _   _              ____ _                 ');
    console.log(' |  \\/  | __ _ _ __| | _____| |_(_)_ __   __ _ / ___| | __ ___      __ ');
    console.log(' | |\\/| |/ _` | \'__| |/ / _ \\ __| | \'_ \\ / _` | |   | |/ _` \\ \\ /\\ / / ');
    console.log(' | |  | | (_| | |  |   <  __/ |_| | | | | (_| | |___| | (_| |\\ V  V /  ');
    console.log(' |_|  |_|\\__,_|_|  |_|\\_\\___|\\__|_|_| |_|\\__, |\\____|_|\\__,_| \\_/\\_/   ');
    console.log('                                        |___/                          ');
    console.log(COLORS.reset);
    console.log(COLORS.cyan + '  Complete Test Suite' + COLORS.reset);
    console.log(COLORS.cyan + '=' .repeat(70) + COLORS.reset);
    console.log();
    console.log(`  ${COLORS.dim}Target URL:${COLORS.reset} ${CONFIG.baseUrl}`);
    console.log(`  ${COLORS.dim}Timestamp:${COLORS.reset}  ${new Date().toISOString()}`);
    console.log(`  ${COLORS.dim}Node.js:${COLORS.reset}    ${process.version}`);
    console.log();
}

/**
 * Print section header
 */
function printSectionHeader(title, description) {
    console.log(COLORS.magenta + '\n' + '-'.repeat(70) + COLORS.reset);
    console.log(COLORS.bold + COLORS.magenta + `  ${title}` + COLORS.reset);
    if (description) {
        console.log(COLORS.dim + `  ${description}` + COLORS.reset);
    }
    console.log(COLORS.magenta + '-'.repeat(70) + COLORS.reset + '\n');
}

/**
 * Run a single test suite
 */
async function runTestSuite(suite) {
    const suitePath = path.join(__dirname, suite.path);

    try {
        const testModule = require(suitePath);

        if (typeof testModule.runTests !== 'function') {
            throw new Error('Test module does not export runTests function');
        }

        const results = await testModule.runTests();

        return {
            name: suite.name,
            passed: results.passed || 0,
            failed: results.failed || 0,
            skipped: results.skipped || 0,
            tests: results.tests || [],
            success: (results.failed || 0) === 0
        };
    } catch (error) {
        console.error(COLORS.red + `  Error running ${suite.name}: ${error.message}` + COLORS.reset);

        return {
            name: suite.name,
            passed: 0,
            failed: 1,
            skipped: 0,
            tests: [],
            error: error.message,
            success: false
        };
    }
}

/**
 * Run all test suites in a category
 */
async function runTestCategory(category, suites) {
    printSectionHeader(`${category.toUpperCase()} TESTS`, `Running ${suites.length} test suites`);

    const results = [];

    for (const suite of suites) {
        console.log(COLORS.blue + `\n>> Running: ${suite.name}` + COLORS.reset);
        console.log(COLORS.dim + `   ${suite.description}` + COLORS.reset);

        const result = await runTestSuite(suite);
        results.push(result);

        aggregateResults.totalPassed += result.passed;
        aggregateResults.totalFailed += result.failed;
        aggregateResults.totalSkipped += result.skipped;

        // Brief summary for this suite
        const status = result.success ? COLORS.green + 'PASSED' : COLORS.red + 'FAILED';
        console.log(`\n   ${status}${COLORS.reset} - ${result.passed} passed, ${result.failed} failed`);
    }

    return results;
}

/**
 * Print final summary
 */
function printSummary() {
    const duration = ((aggregateResults.endTime - aggregateResults.startTime) / 1000).toFixed(2);
    const total = aggregateResults.totalPassed + aggregateResults.totalFailed;
    const passRate = total > 0 ? ((aggregateResults.totalPassed / total) * 100).toFixed(1) : 0;

    console.log('\n');
    console.log(COLORS.cyan + '=' .repeat(70) + COLORS.reset);
    console.log(COLORS.bold + '  FINAL TEST SUMMARY' + COLORS.reset);
    console.log(COLORS.cyan + '=' .repeat(70) + COLORS.reset);
    console.log();

    // Summary by suite
    console.log(COLORS.bold + '  Test Suites:' + COLORS.reset);
    for (const suite of aggregateResults.suites) {
        const status = suite.success
            ? COLORS.green + 'PASS' + COLORS.reset
            : COLORS.red + 'FAIL' + COLORS.reset;
        console.log(`    ${status}  ${suite.name} (${suite.passed}/${suite.passed + suite.failed})`);
    }

    console.log();
    console.log(COLORS.bold + '  Overall Results:' + COLORS.reset);
    console.log(`    Total Tests:  ${total}`);
    console.log(`    ${COLORS.green}Passed:${COLORS.reset}       ${aggregateResults.totalPassed}`);
    console.log(`    ${COLORS.red}Failed:${COLORS.reset}       ${aggregateResults.totalFailed}`);
    if (aggregateResults.totalSkipped > 0) {
        console.log(`    ${COLORS.yellow}Skipped:${COLORS.reset}      ${aggregateResults.totalSkipped}`);
    }
    console.log(`    Pass Rate:    ${passRate}%`);
    console.log(`    Duration:     ${duration}s`);
    console.log();

    // Final status
    if (aggregateResults.totalFailed === 0) {
        console.log(COLORS.green + COLORS.bold + '  ============================================' + COLORS.reset);
        console.log(COLORS.green + COLORS.bold + '  ALL TESTS PASSED!' + COLORS.reset);
        console.log(COLORS.green + COLORS.bold + '  ============================================' + COLORS.reset);
    } else {
        console.log(COLORS.red + COLORS.bold + '  ============================================' + COLORS.reset);
        console.log(COLORS.red + COLORS.bold + `  ${aggregateResults.totalFailed} TEST(S) FAILED` + COLORS.reset);
        console.log(COLORS.red + COLORS.bold + '  ============================================' + COLORS.reset);
    }

    console.log();
}

/**
 * Print help message
 */
function printHelp() {
    console.log(`
${COLORS.bold}MarketingClaw Test Suite${COLORS.reset}

${COLORS.bold}Usage:${COLORS.reset}
  node tests/test-all.js [options]

${COLORS.bold}Options:${COLORS.reset}
  --api-only    Run only API tests (requires network)
  --unit-only   Run only unit tests (no network needed)
  --verbose     Show detailed test output
  --help        Show this help message

${COLORS.bold}Environment Variables:${COLORS.reset}
  TEST_BASE_URL   Override API URL (default: https://marketingclaw.vercel.app)

${COLORS.bold}Examples:${COLORS.reset}
  node tests/test-all.js                           # Run all tests
  node tests/test-all.js --unit-only               # Run unit tests only
  TEST_BASE_URL=http://localhost:3000 node tests/test-all.js  # Test local server

${COLORS.bold}Test Categories:${COLORS.reset}
  API Tests:
    - Chat API Industry Matching
    - Platform Recommendations
    - Generate Pack API

  Unit Tests:
    - Agent Hub Logic
    - WorkSpace Sync
    - UI Display Logic
`);
}

/**
 * Main entry point
 */
async function main() {
    // Show help if requested
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        printHelp();
        process.exit(0);
    }

    printBanner();

    aggregateResults.startTime = Date.now();

    // Determine which test categories to run
    let suitesToRun = [];

    if (CONFIG.apiOnly) {
        suitesToRun = [{ name: 'api', suites: TEST_SUITES.api }];
        console.log(COLORS.yellow + '  Running API tests only (--api-only)' + COLORS.reset);
    } else if (CONFIG.unitOnly) {
        suitesToRun = [{ name: 'unit', suites: TEST_SUITES.unit }];
        console.log(COLORS.yellow + '  Running unit tests only (--unit-only)' + COLORS.reset);
    } else {
        // Run unit tests first (fast, no network), then API tests
        suitesToRun = [
            { name: 'unit', suites: TEST_SUITES.unit },
            { name: 'api', suites: TEST_SUITES.api }
        ];
    }

    // Run each category
    for (const category of suitesToRun) {
        const results = await runTestCategory(category.name, category.suites);
        aggregateResults.suites.push(...results);
    }

    aggregateResults.endTime = Date.now();

    // Print final summary
    printSummary();

    // Exit with appropriate code
    process.exit(aggregateResults.totalFailed > 0 ? 1 : 0);
}

// Run main
main().catch(error => {
    console.error(COLORS.red + 'Fatal error:' + COLORS.reset, error);
    process.exit(1);
});
