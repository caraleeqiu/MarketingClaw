#!/bin/bash
# Supabase 配置验证测试

# 从代码中提取配置
SUPABASE_URL=$(grep -o "https://[a-z]*\.supabase\.co" /Users/gd-npc-848/Desktop/FeishuClaw/MarketingClaw/public/en/login.html | head -1)
SUPABASE_KEY=$(grep -o "eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*" /Users/gd-npc-848/Desktop/FeishuClaw/MarketingClaw/public/en/login.html | head -1)

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "╔══════════════════════════════════════════════════╗"
echo "║         Supabase 配置验证测试                    ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "配置信息:"
echo "  URL: $SUPABASE_URL"
echo "  Key: ${SUPABASE_KEY:0:20}..."
echo ""

PASSED=0
FAILED=0

test_check() {
    local name=$1
    local result=$2
    local expected=$3

    if [[ "$result" == *"$expected"* ]]; then
        echo -e "${GREEN}✓${NC} $name"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $name"
        echo -e "  ${YELLOW}结果:${NC} $result"
        FAILED=$((FAILED + 1))
    fi
}

echo "═══ 1. 连接测试 ═══"

# 测试 REST API
rest_result=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_KEY")
test_check "REST API 连接" "$rest_result" "200"

# 测试 Auth API
auth_result=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/auth/v1/settings" -H "apikey: $SUPABASE_KEY")
test_check "Auth API 连接" "$auth_result" "200"

echo ""
echo "═══ 2. 数据库表检查 ═══"

# 检查 user_credits 表
credits_table=$(curl -s "$SUPABASE_URL/rest/v1/user_credits?limit=0" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" 2>&1)

if [[ "$credits_table" == "[]" ]] || [[ "$credits_table" == *"user_credits"* ]]; then
    echo -e "${GREEN}✓${NC} user_credits 表存在"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗${NC} user_credits 表不存在"
    echo -e "  ${YELLOW}错误:${NC} $credits_table"
    FAILED=$((FAILED + 1))
fi

# 检查 content_history 表
history_table=$(curl -s "$SUPABASE_URL/rest/v1/content_history?limit=0" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" 2>&1)

if [[ "$history_table" == "[]" ]] || [[ "$history_table" == *"content_history"* ]]; then
    echo -e "${GREEN}✓${NC} content_history 表存在"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗${NC} content_history 表不存在"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "═══ 3. OAuth 配置检查 ═══"

# 获取 Auth 设置
auth_settings=$(curl -s "$SUPABASE_URL/auth/v1/settings" -H "apikey: $SUPABASE_KEY")

# 检查 Google OAuth
if echo "$auth_settings" | grep -q '"google"'; then
    google_enabled=$(echo "$auth_settings" | grep -o '"google"[^}]*"enabled":\s*[a-z]*' | grep -o 'true\|false')
    if [[ "$google_enabled" == "true" ]]; then
        echo -e "${GREEN}✓${NC} Google OAuth 已启用"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} Google OAuth 未启用"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${RED}✗${NC} Google OAuth 未配置"
    FAILED=$((FAILED + 1))
fi

# 检查 GitHub OAuth
if echo "$auth_settings" | grep -q '"github"'; then
    github_enabled=$(echo "$auth_settings" | grep -o '"github"[^}]*"enabled":\s*[a-z]*' | grep -o 'true\|false')
    if [[ "$github_enabled" == "true" ]]; then
        echo -e "${GREEN}✓${NC} GitHub OAuth 已启用"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} GitHub OAuth 未启用"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${RED}✗${NC} GitHub OAuth 未配置"
    FAILED=$((FAILED + 1))
fi

# 检查 Email 登录
if echo "$auth_settings" | grep -q '"email"'; then
    echo -e "${GREEN}✓${NC} Email 登录已启用"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} Email 登录状态未知"
fi

echo ""
echo "═══ 4. 安全检查 ═══"

# 检查 RLS 是否启用 (通过尝试未授权访问)
rls_test=$(curl -s "$SUPABASE_URL/rest/v1/user_credits" \
    -H "apikey: $SUPABASE_KEY" 2>&1)

if [[ "$rls_test" == "[]" ]] || [[ "$rls_test" == *"RLS"* ]] || [[ "$rls_test" == *"policy"* ]]; then
    echo -e "${GREEN}✓${NC} RLS 策略已启用 (匿名访问被限制)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠${NC} RLS 状态需要验证"
fi

# 汇总
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║                   测试汇总                       ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo -e "  ${GREEN}✓ 通过:${NC} $PASSED"
echo -e "  ${RED}✗ 失败:${NC} $FAILED"

if [ $FAILED -eq 0 ]; then
    echo -e "\n  ${GREEN}Supabase 配置正确！${NC}"
else
    echo -e "\n  ${RED}需要修复配置问题，请查看 supabase/SETUP_GUIDE.md${NC}"
fi
