#!/bin/bash
# MarketingClaw 英文版功能测试
# 模拟用户: 水管工 Mike

BASE_URL="https://marketingclaw.vercel.app"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      MarketingClaw 功能测试 (英文版)                     ║${NC}"
echo -e "${BLUE}║      用户场景: 水管工 Mike 的使用流程                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

test_func() {
    local id=$1
    local desc=$2
    local result=$3
    local expected=$4

    if echo "$result" | grep -qi "$expected"; then
        echo -e "${GREEN}✓${NC} [$id] $desc"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} [$id] $desc"
        echo -e "  ${YELLOW}期望包含: '$expected'${NC}"
        FAILED=$((FAILED + 1))
    fi
}

# 预加载页面内容
echo -e "${YELLOW}加载页面...${NC}"
homepage=$(curl -s "$BASE_URL/en/index.html")
marketplace=$(curl -s "$BASE_URL/en/marketplace.html")
workbench=$(curl -s "$BASE_URL/en/chat.html")
pricing=$(curl -s "$BASE_URL/en/pricing.html")
login=$(curl -s "$BASE_URL/en/login.html")
echo -e "${GREEN}页面加载完成${NC}\n"

# ==================== FT-001: 首次访问 ====================
echo -e "${YELLOW}━━━ FT-001: 首次访问 - Mike 想了解产品 ━━━${NC}"

test_func "1.1" "显示产品名称 MarketingClaw" "$homepage" "MarketingClaw"
test_func "1.2" "说明是给 Home Pros 的" "$homepage" "Home Pro"
test_func "1.3" "提到支持 Google 平台" "$homepage" "Google"
test_func "1.4" "提到支持 Nextdoor 平台" "$homepage" "Nextdoor"
test_func "1.5" "有免费试用按钮" "$homepage" "Free"
test_func "1.6" "有开始使用的 CTA" "$homepage" "Start"
test_func "1.7" "提到 Plumber 行业" "$homepage" "Plumber"
test_func "1.8" "提到 Electrician 行业" "$homepage" "Electrician"

# ==================== FT-002: Agent 市场 ====================
echo -e "\n${YELLOW}━━━ FT-002: Agent市场 - Mike 找工具 ━━━${NC}"

test_func "2.1" "页面标题正确" "$marketplace" "Agent Hub"
test_func "2.2" "有 Plumber AI" "$marketplace" "Plumber AI"
test_func "2.3" "有 Electrician AI" "$marketplace" "Electrician AI"
test_func "2.4" "有 HVAC AI" "$marketplace" "HVAC AI"
test_func "2.5" "有 Google Business Agent" "$marketplace" "Google Business"
test_func "2.6" "有 Nextdoor Agent" "$marketplace" "Nextdoor"
test_func "2.7" "有 Review Responder" "$marketplace" "Review Responder"
test_func "2.8" "有 Local Trend Radar" "$marketplace" "Local Trend"
test_func "2.9" "Agent 有分类功能" "$marketplace" "category"
test_func "2.10" "Agent 可以添加" "$marketplace" "Add"

# ==================== FT-003: 工作台 ====================
echo -e "\n${YELLOW}━━━ FT-003: 工作台 - Mike 生成内容 ━━━${NC}"

test_func "3.1" "有输入区域" "$workbench" "input"
test_func "3.2" "有消息显示区" "$workbench" "message"
test_func "3.3" "有发送功能" "$workbench" "send"
test_func "3.4" "界面有快捷操作" "$workbench" "quick"
test_func "3.5" "显示已添加的 Agent" "$workbench" "agent"

# ==================== FT-004: 定价 ====================
echo -e "\n${YELLOW}━━━ FT-004: 定价 - Mike 看价格 ━━━${NC}"

test_func "4.1" "有 Free 套餐" "$pricing" "Free"
test_func "4.2" "有 Pro 套餐" "$pricing" "Pro"
test_func "4.3" "有 Team 套餐" "$pricing" "Team"
test_func "4.4" "Pro 价格 \$19" "$pricing" "19"
test_func "4.5" "Team 价格 \$49" "$pricing" "49"
test_func "4.6" "显示积分 credits" "$pricing" "credit"
test_func "4.7" "有升级按钮" "$pricing" "Upgrade"

# ==================== FT-005: 登录 ====================
echo -e "\n${YELLOW}━━━ FT-005: 登录 - Mike 注册 ━━━${NC}"

test_func "5.1" "有 Google 登录" "$login" "Google"
test_func "5.2" "有 GitHub 登录" "$login" "GitHub"
test_func "5.3" "有 Email 登录" "$login" "email"
test_func "5.4" "有 Magic Link" "$login" "Magic Link"
test_func "5.5" "品牌正确" "$login" "MarketingClaw"

# ==================== FT-006: 核心用户流程 ====================
echo -e "\n${YELLOW}━━━ FT-006: 核心流程检查 ━━━${NC}"

# 检查导航是否完整
test_func "6.1" "首页有导航到 Agent Hub" "$homepage" "Agent Hub"
test_func "6.2" "首页有导航到 Workbench" "$homepage" "Workbench"
test_func "6.3" "首页有导航到 Pricing" "$homepage" "Pricing"
test_func "6.4" "首页有导航到 Login" "$homepage" "Login"

# 检查侧边栏导航
test_func "6.5" "市场页有侧边栏导航" "$marketplace" "sidebar"
test_func "6.6" "工作台有侧边栏导航" "$workbench" "sidebar"

# ==================== 汇总 ====================
TOTAL=$((PASSED + FAILED))

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    功能测试汇总                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✓ 通过:${NC} $PASSED"
echo -e "  ${RED}✗ 失败:${NC} $FAILED"
echo -e "  总计: $TOTAL"
echo ""

PASS_RATE=$((PASSED * 100 / TOTAL))

if [ $PASS_RATE -ge 90 ]; then
    echo -e "  通过率: ${GREEN}${PASS_RATE}%${NC} ✓"
    echo -e "\n  ${GREEN}功能完整，可以进行用户测试${NC}"
elif [ $PASS_RATE -ge 70 ]; then
    echo -e "  通过率: ${YELLOW}${PASS_RATE}%${NC}"
    echo -e "\n  ${YELLOW}部分功能需要完善${NC}"
else
    echo -e "  通过率: ${RED}${PASS_RATE}%${NC}"
    echo -e "\n  ${RED}核心功能缺失，需要开发${NC}"
fi

echo ""
echo -e "${BLUE}━━━ 待开发功能 ━━━${NC}"
echo "⚠️  AI 内容生成 - 需接入 Claude/OpenAI API"
echo "⚠️  用户认证 - 需配置 Supabase OAuth"
echo "⚠️  积分系统 - 需创建数据库"
echo "⚠️  内容历史 - 需后端存储"
echo ""
echo -e "${BLUE}━━━ 注意 ━━━${NC}"
echo "中文版 Indie Hacker Claw 是独立项目，不在此测试范围"
echo ""
