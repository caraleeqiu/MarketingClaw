#!/bin/bash
# TC-001 自动化测试执行脚本

BASE_URL="https://marketingclaw.vercel.app"
PASSED=0
FAILED=0
TOTAL=0

# 从代码提取 Supabase 配置
SUPABASE_URL=$(curl -s "$BASE_URL/en/login.html" | grep -o "https://[a-z]*\.supabase\.co" | head -1)
SUPABASE_KEY=$(curl -s "$BASE_URL/en/login.html" | grep -o "eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*" | head -1)

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     TC-001: 新用户完整流程自动化测试            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

test_step() {
    local step_id=$1
    local description=$2
    local command=$3
    local expected=$4

    TOTAL=$((TOTAL + 1))
    result=$(eval "$command" 2>/dev/null)

    if [[ "$result" == *"$expected"* ]] || [[ "$result" == "$expected" ]]; then
        echo -e "${GREEN}✓${NC} [$step_id] $description"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗${NC} [$step_id] $description"
        echo -e "  ${YELLOW}预期:${NC} $expected"
        echo -e "  ${YELLOW}实际:${NC} $result"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# ==================== 阶段 1: 首页访问 ====================
echo -e "\n${YELLOW}═══ 阶段 1: 首页访问 ═══${NC}"

test_step "1.1" "根目录重定向" \
    "curl -sI '$BASE_URL/' | grep -i 'location' | head -1" \
    "/en/"

test_step "1.2" "首页加载时间 < 1秒" \
    "curl -s -o /dev/null -w '%{time_total}' '$BASE_URL/en/index.html' | awk '{if(\$1<1) print \"FAST\"; else print \"SLOW\"}'" \
    "FAST"

test_step "1.3" "品牌名称正确" \
    "curl -s '$BASE_URL/en/index.html' | grep -o 'MarketingClaw' | head -1" \
    "MarketingClaw"

test_step "1.4" "副标题正确" \
    "curl -s '$BASE_URL/en/index.html' | grep -o 'Home Pros' | head -1" \
    "Home Pros"

test_step "1.5" "导航栏包含 Login" \
    "curl -s '$BASE_URL/en/index.html' | grep -o 'Login' | head -1" \
    "Login"

# ==================== 阶段 2: Agent 市场 ====================
echo -e "\n${YELLOW}═══ 阶段 2: Agent 市场 ═══${NC}"

test_step "2.1" "Agent市场页面可访问" \
    "curl -s -o /dev/null -w '%{http_code}' '$BASE_URL/en/marketplace.html'" \
    "200"

test_step "2.2" "页面标题正确" \
    "curl -s '$BASE_URL/en/marketplace.html' | grep -o 'Home Pro Agent Hub' | head -1" \
    "Home Pro Agent Hub"

test_step "2.3" "包含 Local Intel 分类" \
    "curl -s '$BASE_URL/en/marketplace.html' | grep -o 'Local Intel' | head -1" \
    "Local Intel"

test_step "2.4" "包含 Industry AI 分类" \
    "curl -s '$BASE_URL/en/marketplace.html' | grep -o 'Industry AI' | head -1" \
    "Industry AI"

test_step "2.5" "包含 Plumber AI" \
    "curl -s '$BASE_URL/en/marketplace.html' | grep -o 'Plumber AI' | head -1" \
    "Plumber AI"

test_step "2.6" "包含 Google Business Agent" \
    "curl -s '$BASE_URL/en/marketplace.html' | grep -o 'Google Business Profile' | head -1" \
    "Google Business Profile"

# ==================== 阶段 3: 登录页面 ====================
echo -e "\n${YELLOW}═══ 阶段 3: 登录页面 ═══${NC}"

test_step "3.1" "登录页面可访问" \
    "curl -s -o /dev/null -w '%{http_code}' '$BASE_URL/en/login.html'" \
    "200"

test_step "3.2" "包含 Google 登录按钮" \
    "curl -s '$BASE_URL/en/login.html' | grep -o 'Google' | head -1" \
    "Google"

test_step "3.3" "包含 GitHub 登录按钮" \
    "curl -s '$BASE_URL/en/login.html' | grep -o 'GitHub' | head -1" \
    "GitHub"

test_step "3.4" "包含 Email 表单" \
    "curl -s '$BASE_URL/en/login.html' | grep -o 'Magic Link' | head -1" \
    "Magic Link"

test_step "3.5" "Supabase SDK 已加载" \
    "curl -s '$BASE_URL/en/login.html' | grep -o 'supabase' | head -1" \
    "supabase"

# ==================== 阶段 4: 工作台 ====================
echo -e "\n${YELLOW}═══ 阶段 4: 工作台 ═══${NC}"

test_step "4.1" "工作台页面可访问" \
    "curl -s -o /dev/null -w '%{http_code}' '$BASE_URL/en/chat.html'" \
    "200"

test_step "4.2" "包含输入框" \
    "curl -s '$BASE_URL/en/chat.html' | grep -o 'input\|textarea' | head -1" \
    "input"

test_step "4.3" "包含快捷操作" \
    "curl -s '$BASE_URL/en/chat.html' | grep -o 'Quick Actions\|quick' | head -1" \
    "Quick"

# ==================== 阶段 5: 定价页面 ====================
echo -e "\n${YELLOW}═══ 阶段 5: 定价页面 ═══${NC}"

test_step "5.1" "定价页面可访问" \
    "curl -s -o /dev/null -w '%{http_code}' '$BASE_URL/en/pricing.html'" \
    "200"

test_step "5.2" "包含 Free 套餐" \
    "curl -s '$BASE_URL/en/pricing.html' | grep -o 'Free' | head -1" \
    "Free"

test_step "5.3" "包含 Pro 套餐 \$19" \
    "curl -s '$BASE_URL/en/pricing.html' | grep -o '\$19' | head -1" \
    "\$19"

test_step "5.4" "包含 Team 套餐 \$49" \
    "curl -s '$BASE_URL/en/pricing.html' | grep -o '\$49' | head -1" \
    "\$49"

# ==================== 阶段 6: 中文版 ====================
echo -e "\n${YELLOW}═══ 阶段 6: 中文版 ═══${NC}"

test_step "6.1" "中文首页可访问" \
    "curl -s -o /dev/null -w '%{http_code}' '$BASE_URL/zh/index.html'" \
    "200"

test_step "6.2" "中文品牌名称" \
    "curl -s '$BASE_URL/zh/index.html' | grep -o 'Indie Hacker Claw' | head -1" \
    "Indie Hacker Claw"

test_step "6.3" "中文登录页可访问" \
    "curl -s -o /dev/null -w '%{http_code}' '$BASE_URL/zh/login.html'" \
    "200"

test_step "6.4" "中文市场可访问" \
    "curl -s -o /dev/null -w '%{http_code}' '$BASE_URL/zh/marketplace.html'" \
    "200"

# ==================== 阶段 7: 安全检查 ====================
echo -e "\n${YELLOW}═══ 阶段 7: 安全检查 ═══${NC}"

test_step "7.1" "X-Content-Type-Options" \
    "curl -sI '$BASE_URL/en/index.html' | grep -i 'x-content-type-options' | grep -o 'nosniff'" \
    "nosniff"

test_step "7.2" "X-Frame-Options" \
    "curl -sI '$BASE_URL/en/index.html' | grep -i 'x-frame-options' | grep -o 'DENY'" \
    "DENY"

test_step "7.3" "X-XSS-Protection" \
    "curl -sI '$BASE_URL/en/index.html' | grep -i 'x-xss-protection' | head -1" \
    "1"

# ==================== 阶段 8: Supabase 后端检查 ====================
echo -e "\n${YELLOW}═══ 阶段 8: Supabase 后端 ═══${NC}"

test_step "8.1" "Supabase URL 已配置" \
    "echo '$SUPABASE_URL'" \
    "supabase.co"

test_step "8.2" "Supabase Key 已配置" \
    "echo '${SUPABASE_KEY:0:10}'" \
    "eyJ"

test_step "8.3" "Supabase REST API 可连接" \
    "curl -s -o /dev/null -w '%{http_code}' '$SUPABASE_URL/rest/v1/' -H 'apikey: $SUPABASE_KEY'" \
    "200"

test_step "8.4" "Supabase Auth API 可连接" \
    "curl -s -o /dev/null -w '%{http_code}' '$SUPABASE_URL/auth/v1/settings' -H 'apikey: $SUPABASE_KEY'" \
    "200"

# 检查 OAuth 配置
auth_settings=$(curl -s "$SUPABASE_URL/auth/v1/settings" -H "apikey: $SUPABASE_KEY" 2>/dev/null)

google_enabled=$(echo "$auth_settings" | grep -o '"google"[^}]*' | grep -o '"enabled":\s*true' | head -1)
test_step "8.5" "Google OAuth 已启用" \
    "echo '$google_enabled'" \
    "true"

github_enabled=$(echo "$auth_settings" | grep -o '"github"[^}]*' | grep -o '"enabled":\s*true' | head -1)
test_step "8.6" "GitHub OAuth 已启用" \
    "echo '$github_enabled'" \
    "true"

# 检查数据库表
test_step "8.7" "user_credits 表存在" \
    "curl -s '$SUPABASE_URL/rest/v1/user_credits?limit=0' -H 'apikey: $SUPABASE_KEY' -H 'Authorization: Bearer $SUPABASE_KEY' | grep -o 'relation\|^\[\]' | head -1" \
    "[]"

# ==================== 测试汇总 ====================
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   测试汇总                       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✓ 通过:${NC} $PASSED"
echo -e "  ${RED}✗ 失败:${NC} $FAILED"
echo -e "  总计: $TOTAL"
echo ""

PASS_RATE=$((PASSED * 100 / TOTAL))
if [ $PASS_RATE -ge 90 ]; then
    echo -e "  通过率: ${GREEN}${PASS_RATE}%${NC} ✓"
    echo -e "\n  ${GREEN}测试通过！可以上线。${NC}"
elif [ $PASS_RATE -ge 70 ]; then
    echo -e "  通过率: ${YELLOW}${PASS_RATE}%${NC}"
    echo -e "\n  ${YELLOW}部分测试未通过，建议修复后上线。${NC}"
else
    echo -e "  通过率: ${RED}${PASS_RATE}%${NC}"
    echo -e "\n  ${RED}测试未通过，请修复问题后重新测试。${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
