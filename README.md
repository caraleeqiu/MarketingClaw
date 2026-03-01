# MarketingClaw

AI Marketing Copilot with specialized versions for different markets.

## Versions

| Version | Language | Target Audience | Path |
|---------|----------|-----------------|------|
| **Home Pro** | English | US Local Home Service Professionals | `/public/en/` |
| **General** | Chinese | Content Creators & Marketers | `/public/zh/` |

## Home Pro Version (English)

AI Marketing Copilot for Local Home Service Professionals targeting US community-based platforms.

### Target Users
- Plumbers
- Electricians
- HVAC Technicians
- Roofers
- Landscapers
- Real Estate Agents
- General Contractors

### Target Platforms
- Google Business Profile
- Nextdoor
- Facebook Local Groups
- Thumbtack

### Features
- **Local Trend Radar**: ZIP code-based trend tracking
- **Industry AI**: Specialized agents for each trade
- **Platform-Specific Content**: Optimized for each platform's tone
- **Weather Integration**: Weather-triggered content opportunities
- **Review Management**: Professional review responses

## General Version (Chinese)

Multi-platform content creation for social media marketers.

### Target Platforms
- Xiaohongshu (RED)
- Twitter/X
- Blog
- Cross-Platform

### Features
- Trend tracking
- AI image generation
- Video creation
- Viral optimization

## Project Structure

```
MarketingClaw/
├── public/
│   ├── en/           # English Home Pro version
│   │   ├── index.html
│   │   ├── marketplace.html
│   │   └── chat.html
│   └── zh/           # Chinese General version
│       ├── index.html
│       ├── marketplace.html
│       ├── chat.html
│       └── workbench.html
├── api/              # Backend APIs
├── scripts/          # Utility scripts
└── README.md
```

## Deployment

Deploy to Vercel:
```bash
cd MarketingClaw
vercel
```

## Related Projects

- **MarketingClaw Skill**: `~/.claude/skills/marketing-claw/skill.md`
- **Marketing Skills Collection**: `~/.claude/skills/marketingskills/`
- **Original Source**: `~/.openclaw/workspace/skills/social-media-workflow/`

## License

MIT
