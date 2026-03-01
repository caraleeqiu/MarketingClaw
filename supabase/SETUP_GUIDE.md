# MarketingClaw Supabase 配置指南

## 步骤 1: 创建新项目

1. 打开 https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写:
   - **Name**: `marketingclaw`
   - **Database Password**: (记下来)
   - **Region**: 选择离用户最近的

## 步骤 2: 获取 API 密钥

项目创建后，进入 Settings → API:

```
Project URL: https://xxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 步骤 3: 执行数据库脚本

1. 进入 SQL Editor
2. 复制 `setup.sql` 内容
3. 点击 Run 执行

## 步骤 4: 配置 OAuth

### Google OAuth

1. 去 https://console.cloud.google.com/
2. 创建 OAuth 2.0 Client ID
3. 添加授权重定向 URI:
   ```
   https://xxxxxxxx.supabase.co/auth/v1/callback
   ```
4. 复制 Client ID 和 Client Secret
5. 在 Supabase → Authentication → Providers → Google 填入

### GitHub OAuth

1. 去 https://github.com/settings/developers
2. 创建 New OAuth App
3. Authorization callback URL:
   ```
   https://xxxxxxxx.supabase.co/auth/v1/callback
   ```
4. 复制 Client ID 和 Client Secret
5. 在 Supabase → Authentication → Providers → GitHub 填入

## 步骤 5: 配置 Redirect URLs

在 Authentication → URL Configuration:

```
Site URL: https://marketingclaw.vercel.app

Redirect URLs:
- https://marketingclaw.vercel.app/en/marketplace.html
- https://marketingclaw.vercel.app/zh/marketplace.html
- http://localhost:8080/en/marketplace.html (开发用)
```

## 步骤 6: 更新前端代码

拿到新的 URL 和 Key 后，更新以下文件:

```bash
# 需要更新的文件
public/en/login.html
public/zh/login.html
public/assets/auth.js
```

替换:
```javascript
const SUPABASE_URL = 'https://你的新项目.supabase.co';
const SUPABASE_ANON_KEY = '你的新anon_key';
```

## 步骤 7: 验证配置

运行测试:
```bash
cd tests
./test_supabase.sh
```

## 数据库表结构

| 表名 | 用途 |
|------|------|
| user_credits | 用户积分余额 |
| credit_history | 积分消费记录 |
| user_agents | 用户添加的Agent |
| content_history | 生成内容历史 |

## 常见问题

### OAuth 登录后跳转失败
- 检查 Redirect URLs 配置
- 确保 Site URL 正确

### 积分不显示
- 检查 RLS 策略是否启用
- 确认触发器已创建

### 新用户没有积分
- 运行触发器创建语句
- 检查 handle_new_user 函数
