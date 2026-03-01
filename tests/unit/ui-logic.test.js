/**
 * MarketingClaw UI Logic Test Suite
 * Tests for UI display logic (platform cards, expand/collapse, images)
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

// Platform card configurations
const PLATFORM_CONFIGS = {
    google: {
        name: 'Google Business',
        icon: '📍',
        headerColor: '#4285F4',
        aspectRatio: '4:3',
        maxTitleLength: 58
    },
    nextdoor: {
        name: 'Nextdoor',
        icon: '🏘️',
        headerColor: '#8DC63F',
        aspectRatio: '16:9',
        tone: 'neighborly'
    },
    facebook: {
        name: 'Facebook',
        icon: '📘',
        headerColor: '#1877F2',
        aspectRatio: '1:1',
        hasHashtags: true
    }
};

/**
 * Platform Card Simulator
 * Replicates the card rendering logic
 */
class PlatformCardSimulator {
    constructor(platform, content, imageUrl) {
        this.platform = platform;
        this.content = content;
        this.imageUrl = imageUrl;
        this.config = PLATFORM_CONFIGS[platform];
        this.isExpanded = false;
    }

    // Generate card HTML structure (simplified)
    getCardStructure() {
        return {
            header: {
                icon: this.config.icon,
                name: this.config.name,
                color: this.config.headerColor
            },
            image: {
                url: this.imageUrl,
                aspectRatio: this.config.aspectRatio
            },
            content: {
                text: this.content,
                truncated: this.content.length > 200,
                fullLength: this.content.length
            },
            actions: ['Copy', 'Download', 'Publish']
        };
    }

    // Toggle expand/collapse
    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        return this.isExpanded;
    }

    // Get display content based on expand state
    getDisplayContent() {
        if (this.isExpanded || this.content.length <= 200) {
            return this.content;
        }
        return this.content.substring(0, 200) + '...';
    }

    // Validate image URL
    validateImage() {
        if (!this.imageUrl) {
            return { valid: false, reason: 'No image URL' };
        }

        // Check for data URL
        if (this.imageUrl.startsWith('data:image/')) {
            return { valid: true, type: 'base64' };
        }

        // Check for HTTP URL
        if (this.imageUrl.startsWith('http://') || this.imageUrl.startsWith('https://')) {
            return { valid: true, type: 'url' };
        }

        return { valid: false, reason: 'Invalid URL format' };
    }

    // Get card CSS class
    getCardClass() {
        return `platform-card ${this.platform}`;
    }
}

/**
 * Content Formatter
 * Handles content display formatting
 */
class ContentFormatter {
    // Format content for display (plain text, no markdown)
    static formatForDisplay(content) {
        // Remove markdown
        let formatted = content;
        formatted = formatted.replace(/\*\*/g, '');
        formatted = formatted.replace(/##\s*/g, '');
        formatted = formatted.replace(/```/g, '');

        return formatted;
    }

    // Split content into paragraphs
    static getParagraphs(content) {
        return content.split(/\n\n+/).filter(p => p.trim());
    }

    // Check if content contains emoji
    static hasEmoji(content) {
        const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
        return emojiRegex.test(content);
    }

    // Extract hashtags
    static extractHashtags(content) {
        const hashtagRegex = /#\w+/g;
        return content.match(hashtagRegex) || [];
    }

    // Get content stats
    static getStats(content) {
        return {
            characters: content.length,
            words: content.split(/\s+/).filter(w => w).length,
            lines: content.split('\n').length,
            paragraphs: this.getParagraphs(content).length,
            hasEmoji: this.hasEmoji(content),
            hashtags: this.extractHashtags(content)
        };
    }
}

/**
 * Test: Platform Card Rendering
 */
function testPlatformCardRendering() {
    TestUtils.log.section('Platform Card Rendering Tests');

    const platforms = ['google', 'nextdoor', 'facebook'];

    for (const platform of platforms) {
        TestUtils.log.info(`Testing: ${platform} card structure`);

        const card = new PlatformCardSimulator(
            platform,
            'Sample content for testing the platform card display.',
            'https://example.com/image.jpg'
        );

        const structure = card.getCardStructure();

        // Validate structure
        let valid = true;
        const issues = [];

        if (!structure.header || !structure.header.name) {
            valid = false;
            issues.push('Missing header');
        }

        if (!structure.image) {
            valid = false;
            issues.push('Missing image section');
        }

        if (!structure.content) {
            valid = false;
            issues.push('Missing content section');
        }

        if (!structure.actions || structure.actions.length === 0) {
            valid = false;
            issues.push('Missing actions');
        }

        if (valid) {
            testResults.passed++;
            testResults.tests.push({
                name: `${platform} Card Structure`,
                status: 'PASS',
                structure: structure
            });
            TestUtils.log.pass(`${platform} card structure valid`);
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: `${platform} Card Structure`,
                status: 'FAIL',
                issues: issues
            });
            TestUtils.log.fail(`${platform} card issues: ${issues.join(', ')}`);
        }
    }
}

/**
 * Test: Card Header Colors
 */
function testCardHeaderColors() {
    TestUtils.log.section('Card Header Color Tests');

    const expectedColors = {
        google: '#4285F4',
        nextdoor: '#8DC63F',
        facebook: '#1877F2'
    };

    for (const [platform, expectedColor] of Object.entries(expectedColors)) {
        TestUtils.log.info(`Testing: ${platform} header color`);

        const card = new PlatformCardSimulator(platform, 'Test', 'https://test.com/img.jpg');
        const structure = card.getCardStructure();

        if (structure.header.color === expectedColor) {
            testResults.passed++;
            testResults.tests.push({
                name: `${platform} Header Color`,
                status: 'PASS',
                color: expectedColor
            });
            TestUtils.log.pass(`${platform}: ${expectedColor}`);
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: `${platform} Header Color`,
                status: 'FAIL',
                expected: expectedColor,
                actual: structure.header.color
            });
            TestUtils.log.fail(`${platform}: Expected ${expectedColor}, got ${structure.header.color}`);
        }
    }
}

/**
 * Test: Content Expand/Collapse
 */
function testExpandCollapse() {
    TestUtils.log.section('Content Expand/Collapse Tests');

    // Long content
    const longContent = 'A'.repeat(500);

    const card = new PlatformCardSimulator('google', longContent, 'https://test.com/img.jpg');

    // Test initial state (collapsed)
    TestUtils.log.info('Testing: Initial collapsed state');

    const collapsedContent = card.getDisplayContent();
    if (collapsedContent.endsWith('...') && collapsedContent.length < longContent.length) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Initial Collapsed State',
            status: 'PASS',
            displayLength: collapsedContent.length
        });
        TestUtils.log.pass(`Initially collapsed: ${collapsedContent.length} chars shown`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Initial Collapsed State',
            status: 'FAIL'
        });
        TestUtils.log.fail('Content not collapsed initially');
    }

    // Test expand
    TestUtils.log.info('Testing: Expand functionality');

    card.toggleExpand();
    const expandedContent = card.getDisplayContent();

    if (expandedContent === longContent) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Expand Content',
            status: 'PASS'
        });
        TestUtils.log.pass('Content expanded fully');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Expand Content',
            status: 'FAIL'
        });
        TestUtils.log.fail('Content not fully expanded');
    }

    // Test collapse again
    TestUtils.log.info('Testing: Collapse again');

    card.toggleExpand();
    const collapsedAgain = card.getDisplayContent();

    if (collapsedAgain.endsWith('...')) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Collapse Content',
            status: 'PASS'
        });
        TestUtils.log.pass('Content collapsed again');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Collapse Content',
            status: 'FAIL'
        });
        TestUtils.log.fail('Content did not collapse');
    }

    // Test short content (should not truncate)
    TestUtils.log.info('Testing: Short content not truncated');

    const shortCard = new PlatformCardSimulator('google', 'Short content', 'https://test.com/img.jpg');
    const shortDisplay = shortCard.getDisplayContent();

    if (!shortDisplay.endsWith('...')) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Short Content Not Truncated',
            status: 'PASS'
        });
        TestUtils.log.pass('Short content displayed in full');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Short Content Not Truncated',
            status: 'FAIL'
        });
        TestUtils.log.fail('Short content incorrectly truncated');
    }
}

/**
 * Test: Image Validation
 */
function testImageValidation() {
    TestUtils.log.section('Image Validation Tests');

    const testCases = [
        {
            name: 'HTTPS URL',
            url: 'https://example.com/image.jpg',
            expectedValid: true,
            expectedType: 'url'
        },
        {
            name: 'HTTP URL',
            url: 'http://example.com/image.png',
            expectedValid: true,
            expectedType: 'url'
        },
        {
            name: 'Base64 PNG',
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            expectedValid: true,
            expectedType: 'base64'
        },
        {
            name: 'Base64 JPEG',
            url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k=',
            expectedValid: true,
            expectedType: 'base64'
        },
        {
            name: 'Invalid - Relative Path',
            url: '/images/test.jpg',
            expectedValid: false
        },
        {
            name: 'Invalid - No URL',
            url: '',
            expectedValid: false
        },
        {
            name: 'Invalid - Random Text',
            url: 'not a url at all',
            expectedValid: false
        }
    ];

    for (const tc of testCases) {
        TestUtils.log.info(`Testing: ${tc.name}`);

        const card = new PlatformCardSimulator('google', 'Test', tc.url);
        const validation = card.validateImage();

        if (validation.valid === tc.expectedValid) {
            if (tc.expectedValid && validation.type === tc.expectedType) {
                testResults.passed++;
                testResults.tests.push({
                    name: `Image - ${tc.name}`,
                    status: 'PASS',
                    type: validation.type
                });
                TestUtils.log.pass(`${tc.name}: Valid (${validation.type})`);
            } else if (!tc.expectedValid) {
                testResults.passed++;
                testResults.tests.push({
                    name: `Image - ${tc.name}`,
                    status: 'PASS'
                });
                TestUtils.log.pass(`${tc.name}: Invalid as expected`);
            } else {
                testResults.failed++;
                testResults.tests.push({
                    name: `Image - ${tc.name}`,
                    status: 'FAIL',
                    reason: `Type mismatch: expected ${tc.expectedType}, got ${validation.type}`
                });
                TestUtils.log.fail(`${tc.name}: Type mismatch`);
            }
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: `Image - ${tc.name}`,
                status: 'FAIL',
                expected: tc.expectedValid,
                actual: validation.valid
            });
            TestUtils.log.fail(`${tc.name}: Expected valid=${tc.expectedValid}, got ${validation.valid}`);
        }
    }
}

/**
 * Test: Content Formatting
 */
function testContentFormatting() {
    TestUtils.log.section('Content Formatting Tests');

    // Test markdown removal
    TestUtils.log.info('Testing: Markdown removal');

    const markdownContent = '## Header\n**bold text**\n```code```';
    const formatted = ContentFormatter.formatForDisplay(markdownContent);

    if (!formatted.includes('##') && !formatted.includes('**') && !formatted.includes('```')) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Markdown Removal',
            status: 'PASS'
        });
        TestUtils.log.pass('Markdown symbols removed');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Markdown Removal',
            status: 'FAIL'
        });
        TestUtils.log.fail('Markdown symbols still present');
    }

    // Test emoji detection
    TestUtils.log.info('Testing: Emoji detection');

    const withEmoji = 'Hello! 🏠 This has emojis! 🔧';
    const withoutEmoji = 'Hello! This has no emojis.';

    if (ContentFormatter.hasEmoji(withEmoji) && !ContentFormatter.hasEmoji(withoutEmoji)) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Emoji Detection',
            status: 'PASS'
        });
        TestUtils.log.pass('Emoji detection working correctly');
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Emoji Detection',
            status: 'FAIL'
        });
        TestUtils.log.fail('Emoji detection not working');
    }

    // Test hashtag extraction
    TestUtils.log.info('Testing: Hashtag extraction');

    const contentWithTags = 'Great plumbing tips! #LocalBusiness #Austin #Plumbing';
    const hashtags = ContentFormatter.extractHashtags(contentWithTags);

    if (hashtags.length === 3 && hashtags.includes('#LocalBusiness')) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Hashtag Extraction',
            status: 'PASS',
            hashtags: hashtags
        });
        TestUtils.log.pass(`Found hashtags: ${hashtags.join(', ')}`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Hashtag Extraction',
            status: 'FAIL'
        });
        TestUtils.log.fail(`Expected 3 hashtags, found ${hashtags.length}`);
    }

    // Test content stats
    TestUtils.log.info('Testing: Content statistics');

    const testContent = 'First paragraph.\n\nSecond paragraph with more words.\n\nThird paragraph.';
    const stats = ContentFormatter.getStats(testContent);

    if (stats.paragraphs === 3 && stats.words > 0) {
        testResults.passed++;
        testResults.tests.push({
            name: 'Content Statistics',
            status: 'PASS',
            stats: stats
        });
        TestUtils.log.pass(`Stats: ${stats.words} words, ${stats.paragraphs} paragraphs`);
    } else {
        testResults.failed++;
        testResults.tests.push({
            name: 'Content Statistics',
            status: 'FAIL'
        });
        TestUtils.log.fail('Content statistics incorrect');
    }
}

/**
 * Test: Image Aspect Ratios
 */
function testImageAspectRatios() {
    TestUtils.log.section('Image Aspect Ratio Tests');

    const expectedRatios = {
        google: '4:3',
        nextdoor: '16:9',
        facebook: '1:1'
    };

    for (const [platform, expectedRatio] of Object.entries(expectedRatios)) {
        TestUtils.log.info(`Testing: ${platform} aspect ratio`);

        const card = new PlatformCardSimulator(platform, 'Test', 'https://test.com/img.jpg');
        const structure = card.getCardStructure();

        if (structure.image.aspectRatio === expectedRatio) {
            testResults.passed++;
            testResults.tests.push({
                name: `${platform} Aspect Ratio`,
                status: 'PASS',
                ratio: expectedRatio
            });
            TestUtils.log.pass(`${platform}: ${expectedRatio}`);
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: `${platform} Aspect Ratio`,
                status: 'FAIL',
                expected: expectedRatio,
                actual: structure.image.aspectRatio
            });
            TestUtils.log.fail(`${platform}: Expected ${expectedRatio}, got ${structure.image.aspectRatio}`);
        }
    }
}

/**
 * Test: CSS Class Generation
 */
function testCSSClassGeneration() {
    TestUtils.log.section('CSS Class Generation Tests');

    const platforms = ['google', 'nextdoor', 'facebook'];

    for (const platform of platforms) {
        TestUtils.log.info(`Testing: ${platform} CSS class`);

        const card = new PlatformCardSimulator(platform, 'Test', 'https://test.com/img.jpg');
        const cssClass = card.getCardClass();

        const expectedClass = `platform-card ${platform}`;

        if (cssClass === expectedClass) {
            testResults.passed++;
            testResults.tests.push({
                name: `${platform} CSS Class`,
                status: 'PASS',
                class: cssClass
            });
            TestUtils.log.pass(`${platform}: "${cssClass}"`);
        } else {
            testResults.failed++;
            testResults.tests.push({
                name: `${platform} CSS Class`,
                status: 'FAIL',
                expected: expectedClass,
                actual: cssClass
            });
            TestUtils.log.fail(`${platform}: Expected "${expectedClass}", got "${cssClass}"`);
        }
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('  UI Logic Test Suite');
    console.log('  Testing: Platform cards, expand/collapse, images');
    console.log('  Time: ' + new Date().toISOString());
    console.log('='.repeat(60));

    const startTime = Date.now();

    testPlatformCardRendering();
    testCardHeaderColors();
    testExpandCollapse();
    testImageValidation();
    testContentFormatting();
    testImageAspectRatios();
    testCSSClassGeneration();

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

module.exports = { runTests, testResults, PlatformCardSimulator, ContentFormatter };

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
