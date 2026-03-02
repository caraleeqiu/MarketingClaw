/**
 * MarketingClaw - Preview Renderers
 * Platform-specific preview card rendering
 */

// Google Business Preview Card
function renderGooglePreview(pack, biz) {
    const content = pack.platforms.google;
    const trade = biz.trade || 'plumber';
    const image = getReliableImage(pack, 'google', trade);
    const fallback = fallbackImages[trade] || fallbackImages.default;
    const firstPara = content.content.split('\n')[0];
    const desc = firstPara.length > 200 ? firstPara.substring(0, 200) : firstPara;
    const city = biz.location.split(',')[0];
    const cardId = 'gbp-card-' + Date.now();

    return `
        <div class="gbp-mobile" id="${cardId}">
            <div class="gbp-preview-label">📍 Google Business Profile Preview</div>
            <div class="gbp-title-section">
                <div class="gbp-biz-name">${biz.name}</div>
                <div class="gbp-rating">
                    <span class="stars">★★★★★</span>
                    <span>4.8</span>
                    <span>(128)</span>
                </div>
                <div class="gbp-category">${capitalize(biz.trade)} · $$ · ${city}</div>
                <div class="gbp-status">
                    <span class="open">Open</span> · Closes 6:00 PM
                </div>
            </div>
            <div class="gbp-actions">
                <button class="gbp-action-btn primary">◆ Directions</button>
                <button class="gbp-action-btn secondary">📞 Call</button>
                <button class="gbp-action-btn secondary">🌐 Website</button>
            </div>
            <div class="gbp-photos" style="display: flex; gap: 4px; padding: 0 16px; height: 200px;">
                <img src="${image}" alt="Photo 1" style="flex: 1; height: 100%; object-fit: cover; border-radius: 8px;" onerror="this.src='${fallback}'">
                <img src="${image}" alt="Photo 2" style="flex: 1; height: 100%; object-fit: cover; border-radius: 8px; filter: brightness(0.95);" onerror="this.src='${fallback}'">
            </div>
            <div class="gbp-tabs">
                <div class="gbp-tab active" onclick="switchGbpTab('${cardId}', 'overview', this)">OVERVIEW</div>
                <div class="gbp-tab" onclick="switchGbpTab('${cardId}', 'updates', this)">UPDATES</div>
                <div class="gbp-tab" onclick="switchGbpTab('${cardId}', 'reviews', this)">REVIEWS</div>
            </div>
            <div class="gbp-content" id="${cardId}-content">
                <div class="gbp-tab-content active" data-tab="overview">
                    <div class="gbp-desc" data-fulltext="${encodeURIComponent(content.content)}" onclick="toggleDescExpand(this)" style="cursor: pointer; white-space: pre-line;">
                        <span class="desc-text">${desc}...</span>
                        <span class="gbp-desc-arrow">›</span>
                    </div>
                    <div class="gbp-info-row">
                        <span class="icon">📍</span>
                        <span>${biz.location}</span>
                    </div>
                    <div class="gbp-info-row">
                        <span class="icon">📞</span>
                        <span>${biz.phone}</span>
                    </div>
                </div>
                <div class="gbp-tab-content" data-tab="updates" style="display:none; padding: 16px;">
                    <div style="font-weight: 600; margin-bottom: 12px;">📢 Latest Update</div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                        <div style="font-weight: 500;">${content.title || 'Spring Special'}</div>
                        <p style="font-size: 14px; margin-top: 8px; line-height: 1.5; white-space: pre-line;">${content.content}</p>
                        <button style="margin-top: 12px; padding: 8px 16px; background: #1a73e8; color: white; border: none; border-radius: 4px; font-weight: 500;">${content.cta || 'Learn More'}</button>
                    </div>
                </div>
                <div class="gbp-tab-content" data-tab="reviews" style="display:none; padding: 16px;">
                    <div style="font-weight: 600; margin-bottom: 12px;">⭐ Recent Reviews</div>
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: #fbbc04;">★★★★★</span>
                            <span style="font-weight: 500;">John D.</span>
                        </div>
                        <p style="font-size: 14px; margin-top: 6px;">Great service! Very professional and on time.</p>
                    </div>
                </div>
            </div>
            <div class="preview-actions" style="display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #dadce0;">
                <button onclick="regenerateImage('google')" style="padding: 10px; background: #fff3e0; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">🔄 换图</button>
                <button onclick="openEditModal('google')" style="flex: 1; padding: 10px; background: #f1f3f4; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">✏️ Edit</button>
                <button onclick="copyPlatformContent('google')" style="flex: 1; padding: 10px; background: #f1f3f4; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">📋 Copy</button>
                <button onclick="openPublishModal('google')" style="flex: 1; padding: 10px; background: #1a73e8; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">🚀 Publish</button>
            </div>
        </div>
    `;
}

// Switch GBP tabs
function switchGbpTab(cardId, tab, clickedEl) {
    const card = document.getElementById(cardId);
    card.querySelectorAll('.gbp-tab').forEach(t => t.classList.remove('active'));
    clickedEl.classList.add('active');
    card.querySelectorAll('.gbp-tab-content').forEach(c => {
        c.style.display = c.dataset.tab === tab ? 'block' : 'none';
    });
}

// Toggle description expand
function toggleDescExpand(el) {
    const textEl = el.querySelector('.desc-text');
    const arrowEl = el.querySelector('.gbp-desc-arrow');
    const fullText = decodeURIComponent(el.dataset.fulltext || '');
    const isExpanded = el.dataset.expanded === 'true';

    if (isExpanded) {
        textEl.textContent = fullText.substring(0, 120) + '...';
        arrowEl.textContent = '›';
        el.dataset.expanded = 'false';
    } else {
        textEl.textContent = fullText;
        arrowEl.textContent = '‹';
        el.dataset.expanded = 'true';
    }
}

// Facebook Preview Card
function renderFacebookPreview(pack, biz) {
    const content = pack.platforms.facebook;
    const trade = biz.trade || 'plumber';
    const image = getReliableImage(pack, 'facebook', trade);
    const fullText = content.hook + '\n\n' + content.content;
    const shortText = fullText.substring(0, 150);

    return `
        <div class="fb-mobile" onclick="openPreviewModal('facebook')">
            <div class="fb-preview-label">📘 Facebook Post Preview</div>
            <div class="fb-header">
                <div class="fb-avatar">${biz.name.charAt(0)}</div>
                <div class="fb-header-info">
                    <div class="fb-name">${biz.name}</div>
                    <div class="fb-meta">
                        <span>Just now</span> · <span>🌐</span>
                    </div>
                </div>
                <span class="fb-menu">···</span>
            </div>
            <div class="fb-text" style="white-space: pre-line;">
                ${shortText}... <span class="see-more">See more</span>
            </div>
            <div class="fb-image-container">
                <img class="fb-image" src="${image}" alt="Post image" onerror="this.src='${fallbackImages[trade] || fallbackImages.default}'">
            </div>
            <div class="fb-engagement">
                <div class="reactions">
                    <div class="reaction-icons">
                        <span style="background:#1877F2;">👍</span>
                        <span style="background:#F33E58;">❤️</span>
                    </div>
                    <span>24</span>
                </div>
                <span>3 comments · 2 shares</span>
            </div>
            <div class="fb-actions">
                <div class="fb-action">👍 Like</div>
                <div class="fb-action">💬 Comment</div>
                <div class="fb-action">↗️ Share</div>
            </div>
            <div class="preview-actions">
                <button style="background: #fff3e0;" onclick="event.stopPropagation(); regenerateImage('facebook')">🔄 换图</button>
                <button class="btn-edit" onclick="event.stopPropagation(); openEditModal('facebook')">✏️ Edit</button>
                <button class="btn-publish-sm" onclick="event.stopPropagation(); quickPublish('facebook')">🚀 Publish</button>
            </div>
        </div>
    `;
}

// Nextdoor Preview Card
function renderNextdoorPreview(pack, biz) {
    const content = pack.platforms.nextdoor;
    const trade = biz.trade || 'plumber';
    const image = getReliableImage(pack, 'nextdoor', trade);
    const text = content.content.substring(0, 120) + '...';
    const firstName = biz.name.split(' ')[0];

    return `
        <div class="nd-preview" onclick="openPreviewModal('nextdoor')" style="width: 320px;">
            <div style="background: #8bc34a; color: white; padding: 6px 12px; font-size: 12px; font-weight: 500; text-align: center;">🏘️ Nextdoor Post Preview</div>
            <div class="nd-header">
                <div class="nd-avatar">🏠</div>
                <div>
                    <div class="nd-name">${firstName} <span class="nd-badge">Local Business</span></div>
                    <div class="nd-location">📍 ${biz.location}</div>
                </div>
            </div>
            <img class="nd-image" src="${image}" alt="Post image" style="aspect-ratio: 16/9; object-fit: cover; width: 100%;" onerror="this.src='${fallbackImages[trade] || fallbackImages.default}'">
            <div class="nd-content" style="white-space: pre-line;">${text}</div>
            <div class="preview-actions">
                <button style="background: #fff3e0;" onclick="event.stopPropagation(); regenerateImage('nextdoor')">🔄 换图</button>
                <button class="btn-edit" onclick="event.stopPropagation(); openEditModal('nextdoor')">✏️ Edit</button>
                <button class="btn-publish-sm" onclick="event.stopPropagation(); quickPublish('nextdoor')">🚀 Publish</button>
            </div>
        </div>
    `;
}

// Instagram Preview Card
function renderInstagramPreview(pack, biz) {
    const image = pack.images.facebook;
    const content = pack.platforms.facebook?.content || '';
    const text = content.substring(0, 80) + '...';
    const handle = biz.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');

    return `
        <div class="ig-preview" onclick="openPreviewModal('instagram')" style="width: 320px;">
            <div style="background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; padding: 6px 12px; font-size: 12px; font-weight: 500; text-align: center;">📸 Instagram Post Preview</div>
            <div class="ig-header">
                <div class="ig-avatar">${biz.name.charAt(0)}</div>
                <div class="ig-name">${handle}</div>
                <span style="margin-left: auto; color: #262626;">···</span>
            </div>
            <img class="ig-image" src="${image}" alt="Post image" style="aspect-ratio: 1/1;">
            <div class="ig-actions">
                <span>🤍</span><span>💬</span><span>↗️</span>
                <span style="margin-left: auto;">🔖</span>
            </div>
            <div style="padding: 0 12px; font-size: 14px; font-weight: 600;">128 likes</div>
            <div class="ig-caption" style="white-space: pre-line;"><strong>${handle}</strong> ${text}</div>
            <div class="preview-actions">
                <button class="btn-edit" onclick="event.stopPropagation(); openPreviewModal('instagram')">✏️ Edit</button>
                <button class="btn-publish-sm" onclick="event.stopPropagation(); quickPublish('instagram')">🚀 Publish</button>
            </div>
        </div>
    `;
}

// Display content pack
function displayContentPack(pack) {
    const chatArea = document.getElementById('chatArea');
    const biz = window.businessInfo;

    const gbpContent = generateGoogleBusinessContent(biz, pack);
    const selectedPlatforms = getSelectedPlatforms();

    window.generatedContent = { pack, gbp: gbpContent, biz };
    saveToHistory(pack, biz, window.selectedTopicTitle || 'Marketing Content');

    chatArea.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <div>
                    <h2 style="margin-bottom: 4px;">✅ Content Ready</h2>
                    <p style="color: var(--text-secondary);">${biz.name} • ${window.selectedTopicTitle || 'Marketing Content'}</p>
                </div>
                <button class="generate-pack-btn" onclick="publishAll()" style="margin: 0;">
                    🚀 Publish All
                </button>
            </div>

            <p style="margin-bottom: 16px; color: var(--text-secondary);">Click any card to preview, edit, or publish</p>

            <div class="preview-grid">
                ${selectedPlatforms.includes('google') ? renderGooglePreview(pack, biz) : ''}
                ${selectedPlatforms.includes('facebook') ? renderFacebookPreview(pack, biz) : ''}
                ${selectedPlatforms.includes('nextdoor') ? renderNextdoorPreview(pack, biz) : ''}
                ${selectedPlatforms.includes('instagram') ? renderInstagramPreview(pack, biz) : ''}
            </div>
        </div>
    `;

    chatArea.scrollTop = 0;
}

// Generate Google Business Content (services, products, Q&A)
function generateGoogleBusinessContent(biz, pack) {
    const trade = biz.trade || 'plumber';
    const name = biz.name;
    const phone = biz.phone;
    const location = biz.location;

    const servicesByTrade = {
        plumber: [
            { cat: '📋 Plumbing Services', items: [
                { name: 'Drain Cleaning', desc: 'Professional drain clearing', price: 'From $99' },
                { name: 'Water Heater Repair', desc: 'All brands', price: 'From $150' },
                { name: 'Leak Detection', desc: 'Thermal imaging', price: 'From $75' },
                { name: 'Emergency Plumbing', desc: '24/7 service', price: '$99 call-out' }
            ]}
        ],
        electrician: [
            { cat: '⚡ Electrical Services', items: [
                { name: 'Panel Upgrade', desc: '200A service', price: 'From $1,500' },
                { name: 'EV Charger', desc: 'Level 2 install', price: 'From $800' },
                { name: 'Outlet Install', desc: 'GFCI included', price: 'From $150' }
            ]}
        ],
        hvac: [
            { cat: '❄️ HVAC Services', items: [
                { name: 'AC Repair', desc: 'All brands', price: 'From $150' },
                { name: 'AC Tune-Up', desc: 'Seasonal', price: 'From $89' },
                { name: 'Duct Cleaning', desc: 'Professional', price: 'From $300' }
            ]}
        ],
        roofer: [
            { cat: '🏠 Roofing Services', items: [
                { name: 'Roof Inspection', desc: 'Complete assessment', price: 'FREE' },
                { name: 'Roof Repair', desc: 'Leaks, shingles', price: 'From $250' },
                { name: 'Gutter Install', desc: 'Seamless', price: 'From $1,000' }
            ]}
        ]
    };

    const services = servicesByTrade[trade] || servicesByTrade.plumber;

    const qaItems = [
        { q: 'Do you offer free estimates?', a: `Yes! Call ${phone} for your free consultation.` },
        { q: 'What areas do you serve?', a: `We serve ${location} and surrounding areas.` },
        { q: 'Are you available 24/7?', a: 'Yes! We offer 24/7 emergency service.' }
    ];

    return { services, qaItems };
}
