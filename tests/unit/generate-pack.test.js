/**
 * MarketingClaw Generate-Pack API Test Suite
 * Tests for content generation and image URL validation
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

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
};

// Sample business data for testing
const SAMPLE_BUSINESSES = {
    plumber: {
        name: "Quick Fix Plumbing",
        trade: "plumber",
        location: "Austin, TX",
        zip: "78704",
        phone: "512-555-1234"
    },
    electrician: {
        name: "Spark Electric Pro",
        trade: "electrician",
        location: "Denver, CO",
        zip: "80202",
        phone: "303-555-5678"
    },
    hvac: {
        name: "Cool Comfort HVAC",
        trade: "hvac",
        location: "Phoenix, AZ",
        zip: "85001",
        phone: "480-555-9012"
    }
};

/**
 * Call Generate Pack API
 */
async function callGeneratePackAPI(business, topic) {
    try {
        const response = await fetch(`${BASE_URL}/api/generate-pack`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ business, topic })
        });

        const data = await response.json();
        return {
            status: response.status,
            ok: response.ok,
            data: data
        };
    } catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
}

/**
 * Validate image URL format
 */
function validateImageURL(url, platform) {
    if (!url) return { valid: false, reason: 'URL is empty or undefined' };

    // Check for data URL (base64)
    if (url.startsWith('data:image/')) {
        return { valid: true, type: 'base64', size: url.length };
    }

    // Check for HTTP URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return { valid: true, type: 'url', url: url };
    }

    return { valid: false, reason: 'Invalid URL format' };
}

/**
 * Validate platform content structure
 */
function validatePlatformContent(content, platform) {
    const validations = {
        google: {
            required: ['title', 'content', 'cta'],
            maxTitleLength: 58
        },
        nextdoor: {
            required: ['content'],
            shouldInclude: []
        },
        facebook: {
            required: ['hook', 'content', 'hashtags'],
            shouldHaveEmoji: true
        }
    };

    const rules = validations[platform];
    if (!rules) return { valid: false, reason: 'Unknown platform' };

    const errors = [];

    // Check required fields
    for (const field of rules.required) {
        if (!content[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Platform-specific validations
    if (platform === 'google' && content.title) {
        if (content.title.length > rules.maxTitleLength) {
            errors.push(`Title exceeds ${rules.maxTitleLength} chars (got ${content.title.length})`);
        }
    }

    if (platform === 'facebook' && content.hashtags) {
        if (!Array.isArray(content.hashtags)) {
            errors.push('Hashtags should be an array');
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        fields: Object.keys(content)
    };
}

/**
 * Test: Generate Pack API Basic Functionality
 */
async function testGeneratePackBasic() {
    TestUtils.log.section('Generate Pack API Basic Tests');

    const business = SAMPLE_BUSINESSES.plumber;
    const topic = "Spring drain cleaning special - 20% off";

    TestUtils.log.info('Testing: Generate content pack for plumber');

    try {
        const result = await callGeneratePackAPI(business, topic);

        if (!result.ok) {
            testResults.failed++;
            testResults.tests.push({
                name: 'Generate Pack - Basic Request',
                status: 'FAIL',
                reason: `API returned status ${result.status}`
            });
            TestUtils.log.fail(`Generate Pack failed: Status ${result.status}`);
            return;
        }

        if (!result.data.success || !result.data.pack) {
            testResults.failed++;
            testResults.tests.push({
                name: 'Generate Pack - Basic Request',
                status: 'FAIL',
                reason: 'Missing success flag or pack data'
            });
            TestUtils.log.fail('Generate Pack: Missing pack data');
            return;
        }

        testResults.passed++;
        testResults.tests.push({
            name: 'Generate Pack - Basic Request',
            status: 'PASS',
            details: 'Pack generated successfully'
        });
        TestUtils.log.pass('Generate Pack: Basic request successful');

    } catch (error) {
        testResults.failed++;
        testResults.tests.push({
            name: 'Generate Pack - Basic Request',
            status: 'FAIL',
            reason: error.message
        });
        TestUtils.log.fail(`Generate Pack error: ${error.message}`);
    }
}

/**
 * Test: Image URL Validation
 */
async function testImageGeneration() {
    TestUtils.log.section('Image Generation Tests');

    const business = SAMPLE_BUSINESSES.electrician;
    const topic = "Electrical panel upgrade service";

    TestUtils.log.info('Testing: Image URLs in generated pack');

    try {
        const result = await callGeneratePackAPI(business, topic);

        if (!result.ok || !result.data.pack) {
            testResults.failed++;
            testResults.tests.push({
                name: 'Image Generation - Has Images',
                status: 'FAIL',
                reason: 'API request failed'
            });
            TestUtils.log.fail('Image test: API request failed');
            return;
        }

        const pack = result.data.pack;
        const images = pack.images || {};

        // Test: Images object exists
        if (!pack.images) {
            testResults.failed++;
            testResults.tests.push({
                name: 'Image Generation - Images Object Exists',
                status: 'FAIL',
                reason: 'No images object in pack'
            });
            TestUtils.log.fail('No images object in generated pack');
        } else {
            testResults.passed++;
            testResults.tests.push({
                name: 'Image Generation - Images Object Exists',
                status: 'PASS'
            });
            TestUtils.log.pass('Images object exists in pack');
        }

        // Test each platform image
        const platforms = ['google', 'nextdoor', 'facebook'];

        for (const platform of platforms) {
            const imageUrl = images[platform];
            const validation = validateImageURL(imageUrl, platform);

            if (validation.valid) {
                testResults.passed++;
                testResults.tests.push({
                    name: `Image - ${platform}`,
                    status: 'PASS',
                    type: validation.type
                });
                TestUtils.log.pass(`${platform} image: ${validation.type} format`);
            } else {
                testResults.failed++;
                testResults.tests.push({
                    name: `Image - ${platform}`,
                    status: 'FAIL',
                    reason: validation.reason
                });
                TestUtils.log.fail(`${platform} image: ${validation.reason}`);
            }
        }

    } catch (error) {
        testResults.failed++;
        testResults.tests.push({
            name: 'Image Generation',
            status: 'FAIL',
            reason: error.message
        });
        TestUtils.log.fail(`Image test error: ${error.message}`);
    }
}

/**
 * Test: Platform Content Format
 */
async function testPlatformContentFormat() {
    TestUtils.log.section('Platform Content Format Tests');

    const business = SAMPLE_BUSINESSES.hvac;
    const topic = "AC maintenance special before summer";

    TestUtils.log.info('Testing: Content format for each platform');

    try {
        const result = await callGeneratePackAPI(business, topic);

        if (!result.ok || !result.data.pack) {
            testResults.failed++;
            testResults.tests.push({
                name: 'Platform Content Format',
                status: 'FAIL',
                reason: 'API request failed'
            });
            TestUtils.log.fail('Content format test: API failed');
            return;
        }

        const pack = result.data.pack;
        const platforms = pack.platforms || {};

        // Test Google Business format
        if (platforms.google) {
            const validation = validatePlatformContent(platforms.google, 'google');
            if (validation.valid) {
                testResults.passed++;
                testResults.tests.push({
                    name: 'Google Business Format',
                    status: 'PASS',
                    fields: validation.fields
                });
                TestUtils.log.pass(`Google Business: Valid format (${validation.fields.join(', ')})`);
            } else {
                testResults.failed++;
                testResults.tests.push({
                    name: 'Google Business Format',
                    status: 'FAIL',
                    reason: validation.errors.join('; ')
                });
                TestUtils.log.fail(`Google Business: ${validation.errors.join('; ')}`);
            }
        } else {
            testResults.failed++;
            TestUtils.log.fail('Google Business: Missing from pack');
        }

        // Test Nextdoor format
        if (platforms.nextdoor) {
            const validation = validatePlatformContent(platforms.nextdoor, 'nextdoor');
            if (validation.valid) {
                testResults.passed++;
                testResults.tests.push({
                    name: 'Nextdoor Format',
                    status: 'PASS',
                    fields: validation.fields
                });
                TestUtils.log.pass(`Nextdoor: Valid format (${validation.fields.join(', ')})`);
            } else {
                testResults.failed++;
                testResults.tests.push({
                    name: 'Nextdoor Format',
                    status: 'FAIL',
                    reason: validation.errors.join('; ')
                });
                TestUtils.log.fail(`Nextdoor: ${validation.errors.join('; ')}`);
            }
        } else {
            testResults.failed++;
            TestUtils.log.fail('Nextdoor: Missing from pack');
        }

        // Test Facebook format
        if (platforms.facebook) {
            const validation = validatePlatformContent(platforms.facebook, 'facebook');
            if (validation.valid) {
                testResults.passed++;
                testResults.tests.push({
                    name: 'Facebook Format',
                    status: 'PASS',
                    fields: validation.fields
                });
                TestUtils.log.pass(`Facebook: Valid format (${validation.fields.join(', ')})`);
            } else {
                testResults.failed++;
                testResults.tests.push({
                    name: 'Facebook Format',
                    status: 'FAIL',
                    reason: validation.errors.join('; ')
                });
                TestUtils.log.fail(`Facebook: ${validation.errors.join('; ')}`);
            }
        } else {
            testResults.failed++;
            TestUtils.log.fail('Facebook: Missing from pack');
        }

    } catch (error) {
        testResults.failed++;
        testResults.tests.push({
            name: 'Platform Content Format',
            status: 'FAIL',
            reason: error.message
        });
        TestUtils.log.fail(`Content format test error: ${error.message}`);
    }
}

/**
 * Test: Error Handling
 */
async function testErrorHandling() {
    TestUtils.log.section('Generate Pack Error Handling Tests');

    // Test: Missing business data
    TestUtils.log.info('Testing: Missing business data');
    try {
        const response = await fetch(`${BASE_URL}/api/generate-pack`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: 'test' }) // Missing business
        });

        if (response.status === 400) {
            testResults.passed++;
            testResults.tests.push({
                name: 'Error - Missing Business',
                status: 'PASS'
            });
            TestUtils.log.pass('Missing business returns 400');
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: 'Error - Missing Business',
                status: 'FAIL',
                reason: `Expected 400, got ${response.status}`
            });
            TestUtils.log.fail(`Missing business: Expected 400, got ${response.status}`);
        }
    } catch (error) {
        testResults.failed++;
        TestUtils.log.fail(`Error test failed: ${error.message}`);
    }

    // Test: Missing topic
    TestUtils.log.info('Testing: Missing topic');
    try {
        const response = await fetch(`${BASE_URL}/api/generate-pack`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ business: SAMPLE_BUSINESSES.plumber }) // Missing topic
        });

        if (response.status === 400) {
            testResults.passed++;
            testResults.tests.push({
                name: 'Error - Missing Topic',
                status: 'PASS'
            });
            TestUtils.log.pass('Missing topic returns 400');
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: 'Error - Missing Topic',
                status: 'FAIL',
                reason: `Expected 400, got ${response.status}`
            });
            TestUtils.log.fail(`Missing topic: Expected 400, got ${response.status}`);
        }
    } catch (error) {
        testResults.failed++;
        TestUtils.log.fail(`Error test failed: ${error.message}`);
    }

    // Test: GET method not allowed
    TestUtils.log.info('Testing: GET method not allowed');
    try {
        const response = await fetch(`${BASE_URL}/api/generate-pack`, {
            method: 'GET'
        });

        if (response.status === 405) {
            testResults.passed++;
            testResults.tests.push({
                name: 'Error - GET Not Allowed',
                status: 'PASS'
            });
            TestUtils.log.pass('GET method returns 405');
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: 'Error - GET Not Allowed',
                status: 'FAIL',
                reason: `Expected 405, got ${response.status}`
            });
            TestUtils.log.fail(`GET method: Expected 405, got ${response.status}`);
        }
    } catch (error) {
        testResults.failed++;
        TestUtils.log.fail(`Error test failed: ${error.message}`);
    }
}

/**
 * Test: Business Info in Generated Content
 */
async function testBusinessInfoInContent() {
    TestUtils.log.section('Business Info Inclusion Tests');

    const business = SAMPLE_BUSINESSES.plumber;
    const topic = "Emergency plumbing service available 24/7";

    TestUtils.log.info('Testing: Business info appears in generated content');

    try {
        const result = await callGeneratePackAPI(business, topic);

        if (!result.ok || !result.data.pack) {
            testResults.failed++;
            testResults.tests.push({
                name: 'Business Info in Content',
                status: 'FAIL',
                reason: 'API request failed'
            });
            return;
        }

        const pack = result.data.pack;
        let allContent = '';

        // Collect all text content
        if (pack.platforms) {
            for (const platform of Object.values(pack.platforms)) {
                if (typeof platform === 'object') {
                    allContent += JSON.stringify(platform);
                }
            }
        }

        const contentLower = allContent.toLowerCase();

        // Check for phone number
        const hasPhone = contentLower.includes('512-555-1234') ||
                         contentLower.includes('512') ||
                         contentLower.includes('phone');

        // Check for location
        const hasLocation = contentLower.includes('austin') ||
                           contentLower.includes('texas') ||
                           contentLower.includes('tx');

        // Check for business name
        const hasBusinessName = contentLower.includes('quick fix') ||
                               contentLower.includes('plumbing');

        if (hasPhone && hasLocation) {
            testResults.passed++;
            testResults.tests.push({
                name: 'Business Info in Content',
                status: 'PASS',
                details: { hasPhone, hasLocation, hasBusinessName }
            });
            TestUtils.log.pass(`Business info included: Phone=${hasPhone}, Location=${hasLocation}, Name=${hasBusinessName}`);
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: 'Business Info in Content',
                status: 'FAIL',
                reason: `Missing info: Phone=${hasPhone}, Location=${hasLocation}`
            });
            TestUtils.log.fail(`Business info missing: Phone=${hasPhone}, Location=${hasLocation}`);
        }

    } catch (error) {
        testResults.failed++;
        testResults.tests.push({
            name: 'Business Info in Content',
            status: 'FAIL',
            reason: error.message
        });
        TestUtils.log.fail(`Business info test error: ${error.message}`);
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('  Generate Pack API Test Suite');
    console.log('  Target: ' + BASE_URL);
    console.log('  Time: ' + new Date().toISOString());
    console.log('='.repeat(60));

    const startTime = Date.now();

    await testGeneratePackBasic();
    await TestUtils.sleep(2000); // Rate limiting between API calls

    await testImageGeneration();
    await TestUtils.sleep(2000);

    await testPlatformContentFormat();
    await TestUtils.sleep(2000);

    await testErrorHandling();
    await testBusinessInfoInContent();

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

module.exports = { runTests, testResults };

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
