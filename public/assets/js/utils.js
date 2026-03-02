/**
 * MarketingClaw - Utility Functions
 * Common helper functions used across the app
 */

import { fallbackImages, topicsByTrade } from './config.js';
import { state } from './state.js';

// Show toast notification
export function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: #1d1d1f; color: white; padding: 12px 24px;
        border-radius: 8px; font-weight: 500; z-index: 9999;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Delay helper
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Capitalize first letter
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get platform icon
export function getPlatformIcon(p) {
    return { google: '📍', nextdoor: '🏘️', facebook: '📘', instagram: '📸', yelp: '⭐', thumbtack: '📌' }[p] || '📱';
}

// Get platform name
export function getPlatformName(p) {
    return { google: 'Google Business', nextdoor: 'Nextdoor', facebook: 'Facebook', instagram: 'Instagram', yelp: 'Yelp', thumbtack: 'Thumbtack' }[p] || p;
}

// Get trade icon
export function getTradeIcon(trade) {
    return { plumber: '🔧', electrician: '⚡', hvac: '❄️', roofer: '🏠', landscaper: '🌿', realtor: '🏡' }[trade] || '🔧';
}

// Get reliable image with fallback
export function getReliableImage(pack, platform, trade) {
    const img = pack?.images?.[platform];
    if (img && !img.includes('undefined') && !img.includes('null')) {
        return img;
    }
    return fallbackImages[trade] || fallbackImages.default;
}

// Simple markdown to HTML converter
export function formatMarkdown(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\n/g, '<br>');
}

// Get selected platforms from checkboxes
export function getSelectedPlatforms() {
    const platforms = [];
    ['google', 'nextdoor', 'facebook', 'instagram', 'yelp', 'thumbtack'].forEach(p => {
        const el = document.getElementById(`check-${p}`);
        if (el && el.checked) platforms.push(p);
    });
    return platforms.length ? platforms : ['google', 'nextdoor', 'facebook'];
}

// Get topics for trade
export function getTopicsForTrade(trade) {
    return topicsByTrade[trade] || topicsByTrade.plumber;
}

// Copy content to clipboard
export function copyContent(platform) {
    const content = document.getElementById(`content-${platform}`).textContent;
    navigator.clipboard.writeText(content).then(() => {
        showToast('Content copied!');
    });
}

// Copy platform content (from modal)
export function copyPlatformContent(platform) {
    const pack = state.generatedContent?.pack;
    if (!pack) return;

    const content = pack.platforms[platform];
    let text = '';

    if (platform === 'google') {
        text = `${content.title}\n\n${content.content}\n\n${content.cta}`;
    } else if (platform === 'facebook') {
        text = `${content.hook}\n\n${content.content}\n\n${(content.hashtags || []).join(' ')}`;
    } else if (platform === 'nextdoor') {
        text = content.content;
    } else if (platform === 'instagram') {
        text = `${content.caption || content.content}\n\n${(content.hashtags || []).join(' ')}`;
    }

    navigator.clipboard.writeText(text);
    showToast('Content copied!');
}

// Download image
export function downloadImage(platform, imageUrl) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `marketingclaw-${platform}.png`;
    link.click();
}

// Copy Instagram caption
export function copyInstagram() {
    const content = document.querySelector('#platform-instagram .card-content')?.textContent;
    if (content) {
        navigator.clipboard.writeText(content);
        showToast('Instagram caption copied!');
    }
}

// Copy Yelp description
export function copyYelpDesc() {
    const content = document.querySelector('#platform-yelp .card-content')?.textContent;
    if (content) {
        navigator.clipboard.writeText(content);
        showToast('Yelp description copied!');
    }
}

// Copy services list
export function copyServices() {
    const services = state.generatedContent?.gbp?.services;
    if (!services) return;
    let text = '';
    services.forEach(cat => {
        text += cat.cat + '\n';
        cat.items.forEach(s => {
            text += `• ${s.name} - ${s.price}\n  ${s.desc}\n`;
        });
        text += '\n';
    });
    navigator.clipboard.writeText(text);
    showToast('Services copied!');
}

// Copy products list
export function copyProducts() {
    const products = state.generatedContent?.gbp?.products;
    if (!products) return;
    let text = products.map(p => `${p.name}\n${p.desc}\nPrice: ${p.price}`).join('\n\n');
    navigator.clipboard.writeText(text);
    showToast('Products copied!');
}

// Copy Q&A
export function copyQA() {
    const qa = state.generatedContent?.gbp?.qaItems;
    if (!qa) return;
    let text = qa.map(q => `Q: ${q.q}\nA: ${q.a}`).join('\n\n');
    navigator.clipboard.writeText(text);
    showToast('Q&A copied!');
}

// Copy review template
export function copyReviewTemplate(type) {
    const templates = {
        positive: document.querySelector('.review-card.positive .template')?.textContent,
        negative: document.querySelector('.review-card.negative .template')?.textContent
    };
    if (templates[type]) {
        navigator.clipboard.writeText(templates[type]);
        showToast('Template copied!');
    }
}

// Copy modal content
export function copyModalContent() {
    const content = document.getElementById('editContent')?.value;
    if (content) {
        navigator.clipboard.writeText(content);
        showToast('Content copied!');
    }
}
