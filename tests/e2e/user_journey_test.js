/**
 * MarketingClaw E2E 用户旅程测试
 * 使用 Puppeteer 模拟完整用户流程
 */

const BASE_URL = 'https://marketingclaw.vercel.app';

// 测试配置
const config = {
    timeout: 30000,
    viewport: { width: 1920, height: 1080 },
    mobileViewport: { width: 375, height: 812 },
};

// 测试用例定义
const testCases = {
    // ========== 用户旅程 1: 新用户探索 ==========
    newUserExploration: {
        name: '新用户探索流程',
        steps: [
            { action: 'navigate', url: '/', expect: 'redirect to /en/' },
            { action: 'click', selector: 'a[href*="marketplace"]', expect: 'Agent市场页面' },
            { action: 'scroll', direction: 'down', expect: '查看更多Agent' },
            { action: 'click', selector: '.agent-card', expect: 'Agent详情弹窗' },
            { action: 'click', selector: 'a[href*="pricing"]', expect: '定价页面' },
            { action: 'click', selector: 'a[href*="login"]', expect: '登录页面' },
        ],
        expectedDuration: 60000, // 1分钟内完成
    },

    // ========== 用户旅程 2: 登录用户工作流 ==========
    authenticatedWorkflow: {
        name: '登录用户工作流程',
        steps: [
            { action: 'navigate', url: '/en/login.html' },
            { action: 'click', selector: '.auth-btn.google', expect: 'Google OAuth跳转' },
            // OAuth 完成后
            { action: 'navigate', url: '/en/marketplace.html' },
            { action: 'click', selector: '[data-agent="google-business"]', expect: '选择Google Business Agent' },
            { action: 'navigate', url: '/en/chat.html' },
            { action: 'type', selector: '#chatInput', text: 'Generate a post about plumbing tips' },
            { action: 'click', selector: '#sendBtn', expect: 'AI响应' },
            { action: 'wait', duration: 5000, expect: '等待AI生成' },
        ],
        expectedDuration: 120000, // 2分钟内完成
    },

    // ========== 用户旅程 3: 中文用户流程 ==========
    chineseUserFlow: {
        name: '中文用户流程',
        steps: [
            { action: 'navigate', url: '/zh/index.html' },
            { action: 'verify', selector: 'h1', contains: 'Indie Hacker', expect: '品牌名称正确' },
            { action: 'click', selector: 'a[href*="marketplace"]', expect: 'Agent集市' },
            { action: 'click', selector: 'a[href*="chat"]', expect: '工作台' },
            { action: 'click', selector: 'a[href*="/en/"]', expect: '切换到英文版' },
        ],
        expectedDuration: 30000,
    },

    // ========== 用户旅程 4: 移动端体验 ==========
    mobileExperience: {
        name: '移动端用户体验',
        viewport: config.mobileViewport,
        steps: [
            { action: 'navigate', url: '/en/index.html' },
            { action: 'verify', selector: 'meta[name="viewport"]', expect: '响应式meta标签' },
            { action: 'screenshot', name: 'mobile_home' },
            { action: 'navigate', url: '/en/marketplace.html' },
            { action: 'screenshot', name: 'mobile_marketplace' },
            { action: 'scroll', direction: 'down' },
            { action: 'tap', selector: '.agent-card:first-child' },
        ],
        expectedDuration: 45000,
    },
};

// 性能指标收集
const performanceMetrics = {
    collectMetrics: async (page) => {
        const metrics = await page.evaluate(() => {
            const timing = performance.timing;
            const paint = performance.getEntriesByType('paint');

            return {
                // 页面加载时间
                pageLoad: timing.loadEventEnd - timing.navigationStart,
                // DOM 解析时间
                domParsing: timing.domInteractive - timing.domLoading,
                // 首次内容绘制
                fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                // 资源加载
                resourceLoad: timing.loadEventEnd - timing.responseEnd,
                // DNS 查询
                dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                // TCP 连接
                tcpConnect: timing.connectEnd - timing.connectStart,
                // TTFB
                ttfb: timing.responseStart - timing.requestStart,
            };
        });
        return metrics;
    },

    // 性能阈值
    thresholds: {
        pageLoad: 3000,      // 3秒
        fcp: 1800,           // 1.8秒 (Google推荐)
        ttfb: 600,           // 600ms
        domParsing: 1000,    // 1秒
    },

    evaluate: (metrics) => {
        const results = [];
        for (const [key, threshold] of Object.entries(performanceMetrics.thresholds)) {
            const actual = metrics[key];
            const passed = actual <= threshold;
            results.push({
                metric: key,
                actual: `${actual}ms`,
                threshold: `${threshold}ms`,
                status: passed ? 'PASS' : 'FAIL',
            });
        }
        return results;
    },
};

// 可访问性检查
const accessibilityChecks = {
    checks: [
        { name: 'Alt属性', selector: 'img:not([alt])', shouldBeEmpty: true },
        { name: 'ARIA标签', selector: '[role]', shouldExist: true },
        { name: '表单标签', selector: 'input:not([aria-label]):not([id])', shouldBeEmpty: true },
        { name: '标题层级', check: 'headingHierarchy' },
        { name: '颜色对比度', check: 'colorContrast' },
        { name: '键盘导航', check: 'keyboardNav' },
    ],

    run: async (page) => {
        const results = [];

        // 检查图片alt属性
        const imagesWithoutAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
        results.push({
            name: '图片Alt属性',
            status: imagesWithoutAlt === 0 ? 'PASS' : 'WARN',
            details: `${imagesWithoutAlt} 张图片缺少alt属性`,
        });

        // 检查链接可点击区域
        const smallLinks = await page.$$eval('a', links => {
            return links.filter(link => {
                const rect = link.getBoundingClientRect();
                return rect.width < 44 || rect.height < 44;
            }).length;
        });
        results.push({
            name: '触摸目标大小',
            status: smallLinks === 0 ? 'PASS' : 'WARN',
            details: `${smallLinks} 个链接小于44px`,
        });

        // 检查语义化HTML
        const hasMain = await page.$('main');
        const hasNav = await page.$('nav');
        const hasHeader = await page.$('header');
        results.push({
            name: '语义化HTML',
            status: (hasMain || hasNav || hasHeader) ? 'PASS' : 'WARN',
            details: `main:${!!hasMain} nav:${!!hasNav} header:${!!hasHeader}`,
        });

        return results;
    },
};

// 测试报告生成器
const reportGenerator = {
    results: [],

    add: (category, testName, status, details) => {
        reportGenerator.results.push({
            timestamp: new Date().toISOString(),
            category,
            testName,
            status,
            details,
        });
    },

    generate: () => {
        const summary = {
            total: reportGenerator.results.length,
            passed: reportGenerator.results.filter(r => r.status === 'PASS').length,
            failed: reportGenerator.results.filter(r => r.status === 'FAIL').length,
            warnings: reportGenerator.results.filter(r => r.status === 'WARN').length,
        };

        return {
            generatedAt: new Date().toISOString(),
            summary,
            passRate: ((summary.passed / summary.total) * 100).toFixed(2) + '%',
            results: reportGenerator.results,
        };
    },
};

// 导出测试配置
module.exports = {
    config,
    testCases,
    performanceMetrics,
    accessibilityChecks,
    reportGenerator,
    BASE_URL,
};

// 如果直接运行此文件
if (require.main === module) {
    console.log('MarketingClaw E2E 测试配置已加载');
    console.log('测试用例数量:', Object.keys(testCases).length);
    console.log('测试用例:', Object.keys(testCases).join(', '));
}
