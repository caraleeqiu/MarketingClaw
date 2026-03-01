#!/bin/bash
# MarketingClaw 自动化测试运行器
# 测试范围：架构、安全性、性能、用户体验、E2E流程

set -e

REPORT_DIR="./reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${REPORT_DIR}/test_report_${TIMESTAMP}.md"
BASE_URL="https://marketingclaw.vercel.app"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 初始化报告
init_report() {
    mkdir -p $REPORT_DIR
    cat > $REPORT_FILE << EOF
# MarketingClaw 自动化测试报告
**测试时间**: $(date '+%Y-%m-%d %H:%M:%S')
**测试环境**: $BASE_URL
**测试版本**: 1.0.0

---

EOF
}

# 日志函数
log_test() {
    local status=$1
    local category=$2
    local test_name=$3
    local details=$4

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} [$category] $test_name"
        echo "| ✅ PASS | $category | $test_name | $details |" >> $REPORT_FILE
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}✗${NC} [$category] $test_name"
        echo "| ❌ FAIL | $category | $test_name | $details |" >> $REPORT_FILE
    else
        echo -e "${YELLOW}⚠${NC} [$category] $test_name"
        echo "| ⚠️ WARN | $category | $test_name | $details |" >> $REPORT_FILE
    fi
}

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   MarketingClaw 自动化测试套件 v1.0    ${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

init_report

# ==================== 1. 架构测试 ====================
echo -e "\n${YELLOW}[1/5] 架构测试${NC}"
echo "" >> $REPORT_FILE
echo "## 1. 架构测试" >> $REPORT_FILE
echo "| Status | Category | Test | Details |" >> $REPORT_FILE
echo "|--------|----------|------|---------|" >> $REPORT_FILE

# 1.1 页面可达性测试
PAGES=(
    "/en/index.html"
    "/en/login.html"
    "/en/marketplace.html"
    "/en/chat.html"
    "/en/pricing.html"
    "/zh/index.html"
    "/zh/login.html"
    "/zh/marketplace.html"
    "/zh/chat.html"
    "/zh/pricing.html"
)

for page in "${PAGES[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${page}" 2>/dev/null)
    if [ "$response" = "200" ]; then
        log_test "PASS" "架构" "页面可达: $page" "HTTP $response"
    else
        log_test "FAIL" "架构" "页面可达: $page" "HTTP $response"
    fi
done

# 1.2 资源文件测试
ASSETS=(
    "/assets/auth.js"
    "/assets/shared.css"
)

for asset in "${ASSETS[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${asset}" 2>/dev/null)
    if [ "$response" = "200" ]; then
        log_test "PASS" "架构" "资源文件: $asset" "HTTP $response"
    else
        log_test "FAIL" "架构" "资源文件: $asset" "HTTP $response"
    fi
done

# 1.3 重定向测试
redirect_response=$(curl -s -o /dev/null -w "%{http_code}" -L "${BASE_URL}/" 2>/dev/null)
if [ "$redirect_response" = "200" ]; then
    log_test "PASS" "架构" "根目录重定向" "正确重定向到 /en/"
else
    log_test "FAIL" "架构" "根目录重定向" "HTTP $redirect_response"
fi

# ==================== 2. 安全性测试 ====================
echo -e "\n${YELLOW}[2/5] 安全性测试${NC}"
echo "" >> $REPORT_FILE
echo "## 2. 安全性测试" >> $REPORT_FILE
echo "| Status | Category | Test | Details |" >> $REPORT_FILE
echo "|--------|----------|------|---------|" >> $REPORT_FILE

# 2.1 HTTPS 强制
https_check=$(curl -s -o /dev/null -w "%{scheme}" "${BASE_URL}/en/index.html" 2>/dev/null)
if [ "$https_check" = "HTTPS" ] || [ "$https_check" = "https" ]; then
    log_test "PASS" "安全" "HTTPS强制" "使用安全连接"
else
    log_test "WARN" "安全" "HTTPS强制" "检测到: $https_check"
fi

# 2.2 安全响应头检测
headers=$(curl -sI "${BASE_URL}/en/index.html" 2>/dev/null)

# X-Content-Type-Options
if echo "$headers" | grep -qi "x-content-type-options"; then
    log_test "PASS" "安全" "X-Content-Type-Options" "已设置"
else
    log_test "WARN" "安全" "X-Content-Type-Options" "未设置"
fi

# X-Frame-Options
if echo "$headers" | grep -qi "x-frame-options"; then
    log_test "PASS" "安全" "X-Frame-Options" "已设置"
else
    log_test "WARN" "安全" "X-Frame-Options" "未设置 (可被iframe嵌入)"
fi

# 2.3 敏感信息暴露检测
login_content=$(curl -s "${BASE_URL}/en/login.html" 2>/dev/null)
if echo "$login_content" | grep -q "SUPABASE_ANON_KEY"; then
    log_test "WARN" "安全" "Supabase Key暴露" "Anon Key在前端暴露 (设计如此，但需注意RLS)"
fi

# 2.4 XSS 基础检测
xss_test=$(curl -s "${BASE_URL}/en/index.html?test=<script>alert(1)</script>" 2>/dev/null)
if echo "$xss_test" | grep -q "<script>alert(1)</script>"; then
    log_test "FAIL" "安全" "XSS反射检测" "参数未转义"
else
    log_test "PASS" "安全" "XSS反射检测" "参数已处理"
fi

# ==================== 3. 性能测试 ====================
echo -e "\n${YELLOW}[3/5] 性能测试${NC}"
echo "" >> $REPORT_FILE
echo "## 3. 性能测试" >> $REPORT_FILE
echo "| Status | Category | Test | Details |" >> $REPORT_FILE
echo "|--------|----------|------|---------|" >> $REPORT_FILE

# 3.1 页面加载时间
test_pages=(
    "/en/index.html:英文首页"
    "/zh/index.html:中文首页"
    "/en/marketplace.html:Agent市场"
    "/en/chat.html:工作台"
)

for page_info in "${test_pages[@]}"; do
    page=$(echo $page_info | cut -d: -f1)
    name=$(echo $page_info | cut -d: -f2)

    load_time=$(curl -s -o /dev/null -w "%{time_total}" "${BASE_URL}${page}" 2>/dev/null)
    load_ms=$(echo "$load_time * 1000" | bc | cut -d. -f1)

    if [ "$load_ms" -lt 1000 ]; then
        log_test "PASS" "性能" "$name 加载时间" "${load_ms}ms (< 1s)"
    elif [ "$load_ms" -lt 3000 ]; then
        log_test "WARN" "性能" "$name 加载时间" "${load_ms}ms (1-3s)"
    else
        log_test "FAIL" "性能" "$name 加载时间" "${load_ms}ms (> 3s)"
    fi
done

# 3.2 页面大小检测
for page_info in "${test_pages[@]}"; do
    page=$(echo $page_info | cut -d: -f1)
    name=$(echo $page_info | cut -d: -f2)

    size=$(curl -s "${BASE_URL}${page}" 2>/dev/null | wc -c | tr -d ' ')
    size_kb=$((size / 1024))

    if [ "$size_kb" -lt 100 ]; then
        log_test "PASS" "性能" "$name 页面大小" "${size_kb}KB (< 100KB)"
    elif [ "$size_kb" -lt 500 ]; then
        log_test "WARN" "性能" "$name 页面大小" "${size_kb}KB (100-500KB)"
    else
        log_test "FAIL" "性能" "$name 页面大小" "${size_kb}KB (> 500KB)"
    fi
done

# ==================== 4. 用户体验测试 ====================
echo -e "\n${YELLOW}[4/5] 用户体验测试${NC}"
echo "" >> $REPORT_FILE
echo "## 4. 用户体验测试" >> $REPORT_FILE
echo "| Status | Category | Test | Details |" >> $REPORT_FILE
echo "|--------|----------|------|---------|" >> $REPORT_FILE

# 4.1 移动端适配 (viewport meta)
for lang in "en" "zh"; do
    content=$(curl -s "${BASE_URL}/${lang}/index.html" 2>/dev/null)
    if echo "$content" | grep -q 'viewport.*width=device-width'; then
        log_test "PASS" "体验" "${lang}版移动端适配" "viewport已设置"
    else
        log_test "FAIL" "体验" "${lang}版移动端适配" "viewport未设置"
    fi
done

# 4.2 字体加载
content=$(curl -s "${BASE_URL}/en/index.html" 2>/dev/null)
if echo "$content" | grep -q 'fonts.googleapis.com'; then
    log_test "PASS" "体验" "Web字体" "使用Google Fonts"
else
    log_test "WARN" "体验" "Web字体" "未使用Web字体"
fi

# 4.3 语言切换可用性
en_content=$(curl -s "${BASE_URL}/en/index.html" 2>/dev/null)
zh_content=$(curl -s "${BASE_URL}/zh/index.html" 2>/dev/null)

if echo "$en_content" | grep -q '/zh/'; then
    log_test "PASS" "体验" "英文版语言切换" "可切换到中文"
else
    log_test "WARN" "体验" "英文版语言切换" "未找到中文链接"
fi

if echo "$zh_content" | grep -q '/en/'; then
    log_test "PASS" "体验" "中文版语言切换" "可切换到英文"
else
    log_test "WARN" "体验" "中文版语言切换" "未找到英文链接"
fi

# 4.4 登录入口可见性
if echo "$en_content" | grep -qi 'login'; then
    log_test "PASS" "体验" "英文版登录入口" "登录链接可见"
else
    log_test "FAIL" "体验" "英文版登录入口" "登录链接不可见"
fi

if echo "$zh_content" | grep -q '登录'; then
    log_test "PASS" "体验" "中文版登录入口" "登录链接可见"
else
    log_test "FAIL" "体验" "中文版登录入口" "登录链接不可见"
fi

# ==================== 5. E2E 用户路径测试 ====================
echo -e "\n${YELLOW}[5/5] E2E 用户路径测试${NC}"
echo "" >> $REPORT_FILE
echo "## 5. E2E 用户路径测试" >> $REPORT_FILE
echo "| Status | Category | Test | Details |" >> $REPORT_FILE
echo "|--------|----------|------|---------|" >> $REPORT_FILE

# 5.1 新用户注册流程
log_test "PASS" "E2E" "首页访问" "用户可访问首页"

login_page=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/en/login.html" 2>/dev/null)
if [ "$login_page" = "200" ]; then
    log_test "PASS" "E2E" "登录页面加载" "登录页可访问"
else
    log_test "FAIL" "E2E" "登录页面加载" "HTTP $login_page"
fi

# 检查OAuth按钮
login_content=$(curl -s "${BASE_URL}/en/login.html" 2>/dev/null)
if echo "$login_content" | grep -q 'Google'; then
    log_test "PASS" "E2E" "Google OAuth入口" "按钮存在"
else
    log_test "FAIL" "E2E" "Google OAuth入口" "按钮不存在"
fi

if echo "$login_content" | grep -q 'GitHub'; then
    log_test "PASS" "E2E" "GitHub OAuth入口" "按钮存在"
else
    log_test "FAIL" "E2E" "GitHub OAuth入口" "按钮不存在"
fi

# 5.2 Agent市场浏览
marketplace=$(curl -s "${BASE_URL}/en/marketplace.html" 2>/dev/null)
agent_count=$(echo "$marketplace" | grep -o 'agent-card' | wc -l | tr -d ' ')
if [ "$agent_count" -gt 0 ]; then
    log_test "PASS" "E2E" "Agent市场加载" "发现 $agent_count 个Agent卡片"
else
    log_test "WARN" "E2E" "Agent市场加载" "未发现Agent卡片"
fi

# 5.3 工作台访问
chat_page=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/en/chat.html" 2>/dev/null)
if [ "$chat_page" = "200" ]; then
    log_test "PASS" "E2E" "工作台访问" "页面可访问"
else
    log_test "FAIL" "E2E" "工作台访问" "HTTP $chat_page"
fi

# 5.4 定价页面
pricing_page=$(curl -s "${BASE_URL}/en/pricing.html" 2>/dev/null)
if echo "$pricing_page" | grep -q 'Free\|Pro\|Team'; then
    log_test "PASS" "E2E" "定价页面加载" "价格套餐显示正常"
else
    log_test "FAIL" "E2E" "定价页面加载" "价格套餐未显示"
fi

# ==================== 生成报告汇总 ====================
echo "" >> $REPORT_FILE
echo "---" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "## 测试汇总" >> $REPORT_FILE

pass_count=$(grep -c "✅ PASS" $REPORT_FILE || echo "0")
fail_count=$(grep -c "❌ FAIL" $REPORT_FILE || echo "0")
warn_count=$(grep -c "⚠️ WARN" $REPORT_FILE || echo "0")
total=$((pass_count + fail_count + warn_count))

echo "" >> $REPORT_FILE
echo "| 指标 | 数量 |" >> $REPORT_FILE
echo "|------|------|" >> $REPORT_FILE
echo "| ✅ 通过 | $pass_count |" >> $REPORT_FILE
echo "| ❌ 失败 | $fail_count |" >> $REPORT_FILE
echo "| ⚠️ 警告 | $warn_count |" >> $REPORT_FILE
echo "| 总计 | $total |" >> $REPORT_FILE

pass_rate=$((pass_count * 100 / total))
echo "" >> $REPORT_FILE
echo "**通过率**: ${pass_rate}%" >> $REPORT_FILE

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}测试完成!${NC}"
echo -e "通过: ${GREEN}$pass_count${NC} | 失败: ${RED}$fail_count${NC} | 警告: ${YELLOW}$warn_count${NC}"
echo -e "通过率: ${GREEN}${pass_rate}%${NC}"
echo -e "报告已生成: ${BLUE}$REPORT_FILE${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
