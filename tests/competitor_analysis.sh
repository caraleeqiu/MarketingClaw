#!/bin/bash
# MarketingClaw 竞品分析脚本
# 对比同类AI营销工具的关键指标

set -e

REPORT_FILE="./reports/competitor_analysis_$(date +%Y%m%d).md"

# 竞品列表
declare -A COMPETITORS=(
    ["MarketingClaw"]="https://marketingclaw.vercel.app"
    ["Copy.ai"]="https://www.copy.ai"
    ["Jasper"]="https://www.jasper.ai"
    ["Writesonic"]="https://writesonic.com"
    ["Rytr"]="https://rytr.me"
)

# Home Pro 专用竞品
declare -A HOME_PRO_COMPETITORS=(
    ["Housecall Pro"]="https://www.housecallpro.com"
    ["Jobber"]="https://getjobber.com"
    ["ServiceTitan"]="https://www.servicetitan.com"
)

echo "# 竞品分析报告" > $REPORT_FILE
echo "**生成时间**: $(date '+%Y-%m-%d %H:%M:%S')" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# ==================== 1. 页面性能对比 ====================
echo "## 1. 页面加载性能对比" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "| 产品 | 首页加载时间 | 页面大小 | TTFB |" >> $REPORT_FILE
echo "|------|-------------|---------|------|" >> $REPORT_FILE

for name in "${!COMPETITORS[@]}"; do
    url="${COMPETITORS[$name]}"

    # 测量加载时间
    load_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" 2>/dev/null || echo "N/A")
    ttfb=$(curl -s -o /dev/null -w "%{time_starttransfer}" "$url" 2>/dev/null || echo "N/A")

    # 获取页面大小
    size=$(curl -s "$url" 2>/dev/null | wc -c | tr -d ' ')
    size_kb=$((size / 1024))

    if [ "$load_time" != "N/A" ]; then
        load_ms=$(echo "$load_time * 1000" | bc | cut -d. -f1)
        ttfb_ms=$(echo "$ttfb * 1000" | bc | cut -d. -f1)
        echo "| $name | ${load_ms}ms | ${size_kb}KB | ${ttfb_ms}ms |" >> $REPORT_FILE
    else
        echo "| $name | 无法访问 | - | - |" >> $REPORT_FILE
    fi
done

# ==================== 2. 功能对比矩阵 ====================
echo "" >> $REPORT_FILE
echo "## 2. 功能对比矩阵" >> $REPORT_FILE
echo "" >> $REPORT_FILE

cat >> $REPORT_FILE << 'EOF'
| 功能 | MarketingClaw | Copy.ai | Jasper | Writesonic | Rytr |
|------|--------------|---------|--------|------------|------|
| **AI文案生成** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **多平台支持** | ✅ Google/Nextdoor/FB | ✅ 通用 | ✅ 通用 | ✅ 通用 | ✅ 通用 |
| **行业专属** | ✅ Home Pros | ❌ | ❌ | ❌ | ❌ |
| **本地化趋势** | ✅ ZIP Code | ❌ | ❌ | ❌ | ❌ |
| **图片生成** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **视频生成** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **评论回复** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **报价生成** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **中文支持** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **免费层** | ✅ 50积分 | ✅ 2000字 | ❌ | ✅ 试用 | ✅ 5000字 |

EOF

# ==================== 3. 定价对比 ====================
echo "" >> $REPORT_FILE
echo "## 3. 定价对比 (月付)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

cat >> $REPORT_FILE << 'EOF'
| 产品 | 免费版 | 基础版 | 专业版 | 团队版 |
|------|-------|-------|-------|-------|
| **MarketingClaw** | $0 (50积分) | - | $19 (1000积分) | $49 (5000积分) |
| **Copy.ai** | $0 (2000字) | - | $49 | $249 |
| **Jasper** | ❌ | $49 | $99 | $499 |
| **Writesonic** | ✅ 试用 | $16 | $33 | 定制 |
| **Rytr** | $0 (5000字) | $9 | $29 | - |

### 性价比分析

MarketingClaw 在 Home Pro 市场的优势：
- **专业定位**: 唯一专注于 Home Services 的AI营销工具
- **本地化**: ZIP Code 级别的趋势分析
- **平台覆盖**: Google Business + Nextdoor + Thumbtack 组合
- **价格**: $19/月 vs 竞品 $49-99/月

EOF

# ==================== 4. Home Pro 市场竞品 ====================
echo "" >> $REPORT_FILE
echo "## 4. Home Pro 市场竞品分析" >> $REPORT_FILE
echo "" >> $REPORT_FILE

cat >> $REPORT_FILE << 'EOF'
| 功能 | MarketingClaw | Housecall Pro | Jobber | ServiceTitan |
|------|--------------|---------------|--------|--------------|
| **核心功能** | AI营销 | 调度管理 | CRM | 企业管理 |
| **AI文案** | ✅ 专业 | ❌ | ❌ | ❌ |
| **社媒管理** | ✅ | 基础 | 基础 | ❌ |
| **定价** | $19/月 | $49/月 | $49/月 | $500+/月 |
| **目标用户** | 1-10人团队 | 小型公司 | 中型公司 | 大型企业 |

### 市场定位

MarketingClaw 填补了一个市场空白：
- **现有工具**: 专注调度、CRM、账单
- **缺失**: 专业的营销内容生成
- **机会**: AI驱动的营销自动化

EOF

# ==================== 5. SEO/曝光度分析 ====================
echo "" >> $REPORT_FILE
echo "## 5. 市场趋势参考" >> $REPORT_FILE
echo "" >> $REPORT_FILE

cat >> $REPORT_FILE << 'EOF'
### Google Trends 关键词 (参考数据)

| 关键词 | 搜索趋势 | 竞争度 |
|--------|---------|--------|
| "AI marketing tool" | 📈 上升 | 高 |
| "home service marketing" | 📈 上升 | 中 |
| "plumber marketing" | ➡️ 稳定 | 低 |
| "local SEO for contractors" | 📈 上升 | 中 |
| "AI content generator" | 📈 上升 | 高 |

### 目标市场规模

- **美国 Home Service 市场**: $600B+ (2024)
- **小型 Home Pro 企业数量**: 2.5M+
- **数字营销预算增长**: 15% YoY
- **AI工具采用率**: 快速增长中

EOF

# ==================== 6. 建议 ====================
echo "" >> $REPORT_FILE
echo "## 6. 优化建议" >> $REPORT_FILE
echo "" >> $REPORT_FILE

cat >> $REPORT_FILE << 'EOF'
### 短期优化 (1-2周)

1. **性能优化**
   - 添加图片懒加载
   - 启用 Vercel Edge Caching
   - 压缩 CSS/JS 文件

2. **SEO优化**
   - 添加 meta description
   - 添加 Open Graph 标签
   - 创建 sitemap.xml

3. **转化优化**
   - 添加更明显的 CTA 按钮
   - 添加客户评价/案例
   - 添加免费试用倒计时

### 中期优化 (1-2月)

1. **功能增强**
   - 添加模板库
   - 批量生成功能
   - API 开放

2. **集成**
   - Google Business Profile API
   - Nextdoor Business API
   - Thumbtack Pro API

### 长期规划

1. **移动App**
2. **Chrome 插件**
3. **Zapier/Make 集成**

EOF

echo "竞品分析报告已生成: $REPORT_FILE"
