# MarketingClaw 场景测试用例

## 测试信息
- **产品**: MarketingClaw
- **版本**: v1.0
- **测试环境**: https://marketingclaw.vercel.app
- **创建日期**: 2026-03-01

---

## 场景 1: Google Business 帖子生成

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | Mike Johnson |
| 职业 | 水管工 (Plumber) |
| 公司 | Mike's Plumbing Services |
| 地点 | Austin, Texas 78701 |
| 从业年限 | 15年 |
| 痛点 | 不会写营销文案，想在Google上获得更多本地客户 |

### 测试输入
```
Write a Google Business post about our spring plumbing inspection special.
We're offering 20% off full home plumbing inspections this month.
Include that we're licensed, insured, and have been serving Austin for 15 years.
```

### 预期输出
生成的帖子应包含：
- ✅ 服务描述（春季水管检查）
- ✅ 优惠信息（20% off）
- ✅ 信任元素（licensed, insured, 15 years）
- ✅ 本地化（Austin）
- ✅ 行动号召（Call now / Book today）
- ✅ 长度适合 Google Business（100-300字）

### 参考帖子（真实 Google Business 帖子）
```
🔧 SPRING PLUMBING SPECIAL! 🔧

Is your home ready for spring? Now's the perfect time for a full plumbing inspection!

✅ Check for hidden leaks
✅ Inspect water heater
✅ Test water pressure
✅ Examine all fixtures

🎉 THIS MONTH ONLY: 20% OFF full home inspections!

Mike's Plumbing has served Austin families for 15 years.
Licensed • Insured • 5-Star Rated

📞 Call (512) 555-0123 or book online!
```

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 包含优惠信息 | 明确提到 20% off | ☐ |
| 包含信任元素 | licensed, insured, years | ☐ |
| 本地化 | 提到 Austin 或 Texas | ☐ |
| 有 CTA | 有明确行动号召 | ☐ |
| 长度合适 | 100-300 字 | ☐ |
| 语气专业 | 不过度推销 | ☐ |
| 可直接使用 | 无需大幅修改 | ☐ |

---

## 场景 2: Nextdoor 社区帖子

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | Sarah Chen |
| 职业 | 电工 (Electrician) |
| 公司 | Chen Electric |
| 地点 | Denver, Colorado 80202 |
| 特点 | 华裔，在社区住了8年，邻居都认识 |
| 痛点 | 想在 Nextdoor 上介绍自己，但不想太像广告 |

### 测试输入
```
Write a friendly Nextdoor post introducing myself as the neighborhood electrician.
I've lived in the Highlands neighborhood for 8 years.
I want to let neighbors know I'm available for electrical work,
but keep it casual and neighborly, not salesy.
```

### 预期输出
生成的帖子应具有：
- ✅ 邻居聊天的语气
- ✅ 提到住在社区多年
- ✅ 自然地提到服务
- ✅ 不过度推销
- ✅ 有社区感
- ✅ 可能包含一些个人元素

### 参考帖子（真实 Nextdoor 风格）
```
Hi neighbors! 👋

I've been meaning to introduce myself properly. I'm Sarah, and my family has lived here in Highlands for 8 years now (we're over on Elm Street with the big oak tree!).

I'm a licensed electrician and recently started taking on more local work. If you ever need help with anything electrical - whether it's a flickering light, outlet issues, or you're thinking about upgrades - I'd be happy to take a look.

I know how hard it is to find someone you trust for home repairs, so feel free to reach out if you have questions. No pressure at all!

Happy to be part of this wonderful community 🏡

- Sarah
```

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 语气友好 | 像邻居说话 | ☐ |
| 有社区感 | 提到住在社区 | ☐ |
| 不过度推销 | 没有价格/促销 | ☐ |
| 自然引入服务 | 不生硬 | ☐ |
| 有个人元素 | 名字/地址/故事 | ☐ |
| 适合 Nextdoor | 平台调性正确 | ☐ |

---

## 场景 3: 5星评价回复

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | Tom Williams |
| 职业 | HVAC 技师 |
| 公司 | Williams Heating & Cooling |
| 地点 | Phoenix, Arizona |
| 情况 | 刚收到一条 5 星好评，想专业回复 |

### 测试输入
```
Respond to this 5-star Google review:

"Tom and his team were amazing! Our AC broke down on the hottest day of the year and they came out within 2 hours. Fixed the problem quickly and the price was very fair. Tom even explained what went wrong so we could prevent it in the future. Highly recommend Williams Heating & Cooling!"

- Jennifer M.
```

### 预期输出
回复应包含：
- ✅ 感谢客户（用名字）
- ✅ 提及具体工作内容
- ✅ 表达对服务的重视
- ✅ 邀请再次使用
- ✅ 专业但温暖的语气
- ✅ 不要过长（50-100字）

### 参考回复（真实优秀回复）
```
Thank you so much, Jennifer! We know how stressful it can be when your AC goes out in Phoenix heat - we're so glad we could get there quickly and get you cooled down.

I always believe in explaining the issue because an informed customer is a happy customer! We really appreciate you trusting us with your home comfort.

Stay cool, and don't hesitate to reach out if you need anything!

- Tom Williams
```

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 称呼客户名字 | Jennifer | ☐ |
| 提及具体服务 | AC 维修 | ☐ |
| 提及响应速度 | 2 hours | ☐ |
| 语气温暖 | 不是模板感 | ☐ |
| 长度适当 | 50-100字 | ☐ |
| 有签名 | 业主名字 | ☐ |

---

## 场景 4: 差评回复

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | David Martinez |
| 职业 | 屋顶工 (Roofer) |
| 公司 | Martinez Roofing |
| 地点 | Houston, Texas |
| 情况 | 收到一条 2 星差评，需要专业应对 |

### 测试输入
```
Respond to this 2-star review professionally:

"They took 3 weeks to finish a job they said would take 5 days. Communication was poor - I had to call multiple times to get updates. The work looks okay but the delays were frustrating."

- Robert K.
```

### 预期输出
回复应：
- ✅ 不defensive，承认问题
- ✅ 道歉延误
- ✅ 解释但不找借口
- ✅ 提供解决方案
- ✅ 邀请私下沟通
- ✅ 展现专业态度

### 参考回复（专业差评回复）
```
Robert, thank you for taking the time to share your feedback. I sincerely apologize for the delays and the lack of communication - that's not the experience we want for any customer.

You're right that the project took much longer than estimated. We had some unexpected supply issues, but that's no excuse for not keeping you better informed. I take full responsibility for this.

I'm glad the work itself meets your standards. I'd like to make this right - please reach out to me directly at (713) 555-0123 so we can discuss how we can restore your confidence in Martinez Roofing.

- David Martinez, Owner
```

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 不defensive | 承认问题 | ☐ |
| 真诚道歉 | 不敷衍 | ☐ |
| 不找借口 | 承担责任 | ☐ |
| 提供联系方式 | 私下沟通 | ☐ |
| 专业语气 | 不情绪化 | ☐ |
| 展现改进意愿 | make it right | ☐ |

---

## 场景 5: 报价单生成

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | Lisa Park |
| 职业 | 水管工 |
| 公司 | Park Plumbing |
| 地点 | Seattle, Washington |
| 情况 | 客户要求更换热水器，需要发正式报价 |

### 测试输入
```
Write a professional quote for a water heater replacement:
- Customer: John Smith, 123 Oak Street, Seattle
- Job: Replace 50-gallon gas water heater
- Old unit disposal included
- Price: $1,850 (parts + labor)
- Warranty: 6-year manufacturer warranty on tank
- Our labor warranty: 1 year
- Estimated time: 3-4 hours
```

### 预期输出
报价单应包含：
- ✅ 客户信息
- ✅ 详细工作范围
- ✅ 清晰的价格
- ✅ 保修条款
- ✅ 时间估计
- ✅ 专业格式
- ✅ 条款说明

### 参考报价单
```
ESTIMATE / QUOTE
Park Plumbing | License #PLM-12345
Seattle, WA | (206) 555-0123

DATE: March 1, 2026
QUOTE #: 2026-0301

CUSTOMER:
John Smith
123 Oak Street
Seattle, WA 98101

SCOPE OF WORK:
Water Heater Replacement

DESCRIPTION:
- Remove and dispose of existing 50-gallon gas water heater
- Supply and install new 50-gallon gas water heater
- Connect to existing gas and water lines
- Test for proper operation and safety
- Clean up work area

PRICING:
Parts (50-gal gas water heater) .......... $1,100
Labor ...................................... $650
Old unit disposal .......................... $100
                                           -------
TOTAL: .................................... $1,850

WARRANTY:
- Manufacturer tank warranty: 6 years
- Park Plumbing labor warranty: 1 year

ESTIMATED TIME: 3-4 hours

TERMS:
- Quote valid for 30 days
- 50% deposit required to schedule
- Balance due upon completion

________________________
Lisa Park, Owner
Park Plumbing
```

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 有公司信息 | 名称、执照 | ☐ |
| 有客户信息 | 名字、地址 | ☐ |
| 工作范围清晰 | 详细列出 | ☐ |
| 价格明细 | 分项列出 | ☐ |
| 保修说明 | 时间、范围 | ☐ |
| 条款说明 | 有效期、付款 | ☐ |
| 专业格式 | 整洁易读 | ☐ |

---

## 场景 6: 本地趋势内容

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | James Wilson |
| 职业 | HVAC 技师 |
| 公司 | Wilson HVAC |
| 地点 | Chicago, Illinois |
| 情况 | 暴风雪即将来临，想发相关内容 |

### 测试输入
```
Write a timely Facebook post about preparing for the upcoming winter storm.
Chicago is expecting a major snowstorm this weekend with temperatures dropping to -10°F.
I want to remind homeowners to check their heating systems.
Include some helpful tips and offer emergency services.
```

### 预期输出
帖子应包含：
- ✅ 紧迫性（暴风雪来临）
- ✅ 本地化（Chicago）
- ✅ 实用建议
- ✅ 服务提供
- ✅ 紧急联系方式
- ✅ 关心社区的语气

### 参考帖子
```
🌨️ CHICAGO - WINTER STORM ALERT! 🌨️

With temps dropping to -10°F this weekend, NOW is the time to make sure your heating system is ready!

Quick Homeowner Checklist:
✅ Change your furnace filter
✅ Test your thermostat
✅ Clear snow from outdoor vents
✅ Know where your emergency shutoff is
✅ Have backup heat source ready

⚠️ Signs your furnace needs attention:
- Strange noises
- Uneven heating
- Higher than normal bills
- Yellow pilot light (should be blue)

If something doesn't seem right, don't wait! A breakdown during -10° weather is dangerous.

🚨 Wilson HVAC is offering 24/7 emergency service this weekend.
📞 Call/text: (312) 555-0123

Stay warm and safe, Chicago! 🏠❄️
```

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 本地化 | Chicago, 温度 | ☐ |
| 紧迫性 | 暴风雪来临 | ☐ |
| 实用建议 | 可执行的tips | ☐ |
| 紧急服务 | 24/7 available | ☐ |
| 联系方式 | 电话号码 | ☐ |
| 关心语气 | 不只是推销 | ☐ |

---

## 场景 7: Thumbtack 个人简介

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | Maria Rodriguez |
| 职业 | 园艺师 (Landscaper) |
| 公司 | Green Thumb Landscaping |
| 地点 | San Diego, California |
| 情况 | 刚加入 Thumbtack，需要写个人简介 |

### 测试输入
```
Write a Thumbtack profile bio for my landscaping business.
- 12 years experience
- Specialize in drought-resistant landscaping (important for San Diego)
- Also do regular lawn care, hardscaping, irrigation
- Licensed and insured
- Bilingual English/Spanish
- Family-owned business
Keep it under 200 words but make it stand out.
```

### 预期输出
简介应：
- ✅ 突出独特卖点（drought-resistant）
- ✅ 本地相关性（San Diego）
- ✅ 信任元素（licensed, insured, 12 years）
- ✅ 差异化（bilingual）
- ✅ 服务范围
- ✅ 吸引人但不过度

### 参考简介
```
¡Hola! I'm Maria, owner of Green Thumb Landscaping, and I've been transforming San Diego yards for over 12 years.

What makes us different? We specialize in drought-resistant landscaping - beautiful gardens that thrive in our SoCal climate while saving you money on water bills. From native plants to modern xeriscaping, we create outdoor spaces that are both stunning and sustainable.

Our services include:
🌿 Drought-tolerant landscape design
🌿 Regular lawn maintenance
🌿 Hardscaping (patios, walkways)
🌿 Irrigation systems

Family-owned, licensed, insured, and proudly bilingual (English/Spanish). We treat every yard like it's our own.

Ready to love your outdoor space? Let's talk!
```

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 独特卖点 | drought-resistant | ☐ |
| 本地相关 | San Diego, SoCal | ☐ |
| 服务列表 | 清晰列出 | ☐ |
| 信任元素 | licensed, years | ☐ |
| 差异化 | bilingual | ☐ |
| 长度合适 | < 200字 | ☐ |
| 有个性 | 不模板化 | ☐ |

---

---

## 场景 8: Before/After 项目图片

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | Kevin Brown |
| 职业 | 水管工 |
| 公司 | Brown's Plumbing |
| 地点 | Miami, Florida |
| 情况 | 刚完成一个浴室改造，想展示对比效果 |

### 测试输入
```
用户上传:
- before.jpg: 旧的破旧浴室，瓷砖脱落，水龙头生锈
- after.jpg: 全新改造的浴室，现代风格

提示词:
Create a before/after comparison post for Instagram.
This was a complete bathroom remodel - new fixtures, tiles, vanity.
Project took 5 days, budget was $8,000.
Make it showcase our craftsmanship.
```

### 预期输出
**图片**:
- 左右对比布局 或 上下对比布局
- "BEFORE" / "AFTER" 标签
- 公司 Logo 水印
- 适合 Instagram 的尺寸 (1080x1080 或 1080x1350)

**文案**:
```
🔧 TRANSFORMATION TUESDAY 🔧

Swipe to see this incredible bathroom transformation!

Our client came to us with an outdated bathroom that had seen better days. 5 days and a lot of hard work later... WOW! 😍

✨ What we did:
• Complete tile replacement
• New modern vanity
• Updated fixtures throughout
• Fresh, clean aesthetic

Investment: $8,000
Time: 5 days

Ready to transform YOUR bathroom?
📞 DM us or call (305) 555-0123

#BathroomRemodel #BeforeAndAfter #MiamiPlumber #HomeRenovation #PlumbingLife
```

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 图片对比清晰 | Before/After 明显 | ☐ |
| 有标签 | BEFORE/AFTER 文字 | ☐ |
| 尺寸正确 | 适合 Instagram | ☐ |
| 有水印 | 公司品牌 | ☐ |
| 文案匹配 | 描述改造内容 | ☐ |
| 有 Hashtag | 相关标签 | ☐ |
| 有 CTA | 联系方式 | ☐ |

---

## 场景 9: 项目展示图集

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | Amanda Lee |
| 职业 | 屋顶工 |
| 公司 | Lee Roofing Co. |
| 地点 | Dallas, Texas |
| 情况 | 完成一个大型屋顶更换项目，想做成作品集 |

### 测试输入
```
用户上传 5 张项目照片:
- 1.jpg: 全景-新屋顶完成
- 2.jpg: 细节-瓦片铺设
- 3.jpg: 施工中-团队工作
- 4.jpg: 排水系统
- 5.jpg: 客户门口合影

提示词:
Create a project gallery for my website portfolio.
This was a 3,000 sq ft roof replacement.
Material: Architectural shingles, 30-year warranty.
We completed it in 2 days with our 5-person crew.
```

### 预期输出
**图集布局**:
- 主图 (Hero): 全景图
- 网格排列: 其他4张
- 统一滤镜/风格
- 每张图有简短说明

**项目描述**:
```
PROJECT: Complete Roof Replacement
LOCATION: Dallas, TX
SIZE: 3,000 sq ft
DURATION: 2 days
MATERIAL: Architectural Shingles (30-year warranty)
CREW: 5 professionals

This Dallas home needed a complete roof replacement after storm damage. Our team removed the old roofing and installed premium architectural shingles with a 30-year manufacturer warranty.

Gallery:
[1] Completed roof - full view
[2] Detail of shingle installation
[3] Our crew hard at work
[4] New gutter and drainage system
[5] Happy homeowner handoff
```

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 图片排版专业 | 统一风格 | ☐ |
| 有项目信息 | 尺寸、材料、时间 | ☐ |
| 图片有说明 | 每张描述 | ☐ |
| 适合网站 | 可直接用于portfolio | ☐ |
| 展示专业度 | 体现工艺 | ☐ |

---

## 场景 10: Home Tips 短视频

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | Carlos Garcia |
| 职业 | 水管工 |
| 公司 | Garcia Plumbing |
| 地点 | Los Angeles, California |
| 情况 | 想做一个教育视频，建立专家形象 |

### 测试输入
```
Create a short video script about "5 Signs Your Water Heater Needs Replacement".
Target: Homeowners who don't know much about plumbing.
Tone: Helpful expert, not salesy.
Length: 60-90 seconds (good for TikTok/Reels).
Include what visuals to show for each point.
```

### 预期输出

**视频脚本**:
```
[HOOK - 0:00-0:05]
🎬 VISUAL: Carlos in front of water heater
🎤 AUDIO: "Is your water heater trying to tell you something? Here are 5 signs it's time for a new one."

[POINT 1 - 0:05-0:15]
🎬 VISUAL: Close-up of water heater age label
🎤 AUDIO: "Number 1: It's over 10 years old. Check the label - if it's past 10, start planning."
📝 TEXT ON SCREEN: "Check the age label!"

[POINT 2 - 0:15-0:25]
🎬 VISUAL: Rusty water coming from faucet
🎤 AUDIO: "Number 2: Rusty or discolored water. If your hot water looks brown or rusty, that's corrosion inside the tank."
📝 TEXT ON SCREEN: "Rusty water = tank corrosion"

[POINT 3 - 0:25-0:35]
🎬 VISUAL: Person touching lukewarm water, looking disappointed
🎤 AUDIO: "Number 3: Not enough hot water. If showers are getting shorter, your heater is losing efficiency."
📝 TEXT ON SCREEN: "Cold showers? 🥶"

[POINT 4 - 0:35-0:45]
🎬 VISUAL: Water heater making rumbling noise (add sound effect)
🎤 AUDIO: "Number 4: Strange noises. Rumbling, popping, or banging means sediment buildup."
📝 TEXT ON SCREEN: "Listen for weird sounds"

[POINT 5 - 0:45-0:55]
🎬 VISUAL: Water puddle around base of heater
🎤 AUDIO: "Number 5: Leaks around the base. This is urgent - it means the tank is failing."
📝 TEXT ON SCREEN: "Leaks = Act NOW! ⚠️"

[CTA - 0:55-1:05]
🎬 VISUAL: Carlos smiling, company logo
🎤 AUDIO: "See any of these signs? Don't wait for a flood. Give us a call - link in bio!"
📝 TEXT ON SCREEN: "Garcia Plumbing - LA's trusted experts"

[END CARD]
📝 TEXT: Follow for more home tips! 🏠
```

**视频参数**:
- 时长: 65 秒
- 格式: 9:16 (竖屏)
- 字幕: 自动生成
- 背景音乐: 轻快节奏

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 有 Hook | 前5秒抓注意力 | ☐ |
| 内容实用 | 真正有帮助 | ☐ |
| 时长合适 | 60-90秒 | ☐ |
| 有视觉指导 | 每段该拍什么 | ☐ |
| 有文字叠加 | 关键点强调 | ☐ |
| 有 CTA | 引导行动 | ☐ |
| 语气友好 | 专家但不高冷 | ☐ |
| 竖屏格式 | 9:16 | ☐ |

---

## 场景 11: 季节性促销海报

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | Rachel Kim |
| 职业 | HVAC 技师 |
| 公司 | Kim's Heating & Air |
| 地点 | Minneapolis, Minnesota |
| 情况 | 秋季来了，想推广供暖系统检查 |

### 测试输入
```
Create a promotional image/flyer for our fall furnace tune-up special.
- Special price: $79 (regular $129)
- Includes: 21-point inspection, filter replacement, efficiency check
- Valid: October 1 - November 30
- Style: Professional but warm (pun intended!)
- Use fall colors
```

### 预期输出

**海报设计**:
- 尺寸: 1080x1080 (Instagram) + 8.5x11 (打印)
- 配色: 秋季色调 (橙、红、棕)
- 主视觉: 温暖的家庭/壁炉场景

**海报内容**:
```
┌─────────────────────────────────────┐
│  🍂 FALL FURNACE TUNE-UP 🍂        │
│                                     │
│        [温暖家庭图片]               │
│                                     │
│    ████████████████████            │
│    █   NOW ONLY $79   █            │
│    █   (Reg. $129)    █            │
│    ████████████████████            │
│                                     │
│  ✓ 21-Point Safety Inspection      │
│  ✓ Filter Replacement Included     │
│  ✓ Efficiency Performance Check    │
│                                     │
│  Don't wait for the first freeze!  │
│                                     │
│  📅 Valid: Oct 1 - Nov 30          │
│  📞 (612) 555-0123                 │
│                                     │
│  [Kim's Heating & Air Logo]        │
│  "Keeping Minneapolis Warm"         │
└─────────────────────────────────────┘
```

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 价格突出 | $79 醒目 | ☐ |
| 服务列出 | 21-point等 | ☐ |
| 有效期清晰 | 日期明确 | ☐ |
| 联系方式 | 电话号码 | ☐ |
| 季节感 | 秋季配色 | ☐ |
| 品牌一致 | Logo、公司名 | ☐ |
| 多尺寸 | Instagram + 打印 | ☐ |

---

## 场景 12: 实时天气营销视频

### 用户画像
| 字段 | 内容 |
|------|------|
| 姓名 | Tony Martinez |
| 职业 | 水管工 |
| 公司 | Martinez Plumbing |
| 地点 | Chicago, Illinois |
| 情况 | 极寒警报，紧急推送防冻内容 |

### 测试输入
```
URGENT: Create a quick video for the extreme cold warning.
Chicago is expecting -15°F tonight.
Need to warn homeowners about frozen pipes.
This should feel urgent but helpful, not scary.
30-45 seconds, can be filmed on phone.
```

### 预期输出

**快速视频脚本**:
```
[0:00-0:05]
🎬 Tony 对着镜头，穿工作服
🎤 "Chicago, we've got -15 degrees coming tonight. Here's how to protect your pipes."

[0:05-0:15]
🎬 手指示水龙头
🎤 "First - let your faucets drip. Just a tiny stream keeps water moving."
📝 字幕: "Let faucets DRIP 💧"

[0:15-0:25]
🎬 展示橱柜门打开
🎤 "Second - open cabinet doors under sinks. Let the warm air in."
📝 字幕: "Open cabinet doors"

[0:25-0:35]
🎬 指向恒温器
🎤 "Third - keep your heat at least 55 degrees, even if you leave town."
📝 字幕: "Heat: minimum 55°F"

[0:35-0:45]
🎬 Tony 看着镜头，真诚表情
🎤 "If you do get a frozen pipe, don't panic. Call us - we're on call 24/7 this weekend. Stay warm, Chicago!"
📝 字幕: "24/7 Emergency: (312) 555-0123"
```

### 验收标准
| 检查项 | 要求 | 通过? |
|--------|------|-------|
| 紧迫感 | 体现紧急性 | ☐ |
| 实用建议 | 可立即执行 | ☐ |
| 时长短 | 30-45秒 | ☐ |
| 手机可拍 | 不需专业设备 | ☐ |
| 本地化 | Chicago、温度 | ☐ |
| 有联系方式 | 24/7 电话 | ☐ |
| 不吓人 | 帮助而非恐吓 | ☐ |

---

## 内容类型汇总

| 类型 | 场景 | 输出格式 |
|------|------|---------|
| **文字** | 1-7 | 纯文本帖子 |
| **图片** | 8, 9, 11 | Before/After、Gallery、海报 |
| **视频** | 10, 12 | 短视频脚本+分镜 |

---

## 测试执行记录

| 场景 | 执行日期 | 测试人 | 结果 | 备注 |
|------|---------|--------|------|------|
| 场景1 Google帖子 | | | ☐通过 ☐失败 | |
| 场景2 Nextdoor帖子 | | | ☐通过 ☐失败 | |
| 场景3 5星评价回复 | | | ☐通过 ☐失败 | |
| 场景4 差评回复 | | | ☐通过 ☐失败 | |
| 场景5 报价单 | | | ☐通过 ☐失败 | |
| 场景6 本地趋势 | | | ☐通过 ☐失败 | |
| 场景7 Thumbtack简介 | | | ☐通过 ☐失败 | |

---

## AI 输出质量评分标准

| 维度 | 1分 | 3分 | 5分 |
|------|-----|-----|-----|
| **相关性** | 跑题 | 基本相关 | 完全匹配需求 |
| **专业度** | 业余 | 一般 | 专业水准 |
| **本地化** | 无 | 提及地点 | 深度本地化 |
| **可用性** | 需大改 | 需小改 | 可直接使用 |
| **语气** | 不合适 | 基本ok | 完美匹配平台 |

**总分 = 各维度分数之和 / 25 × 100%**

| 评级 | 分数 |
|------|------|
| A 优秀 | 90-100% |
| B 良好 | 75-89% |
| C 及格 | 60-74% |
| D 需改进 | < 60% |
