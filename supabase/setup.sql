-- ============================================
-- MarketingClaw Supabase 数据库初始化脚本
-- ============================================

-- 1. 用户积分表
create table if not exists user_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  credits int default 50,
  plan text default 'free' check (plan in ('free', 'pro', 'team')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- 2. 积分使用记录
create table if not exists credit_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  credits_used int not null,
  agent_id text,
  created_at timestamptz default now()
);

-- 3. 用户添加的 Agent
create table if not exists user_agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  agent_id text not null,
  added_at timestamptz default now(),
  unique(user_id, agent_id)
);

-- 4. 生成内容历史
create table if not exists content_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  agent_id text not null,
  prompt text not null,
  response text,
  platform text,
  credits_used int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- RLS 策略 (Row Level Security)
-- ============================================

-- 启用 RLS
alter table user_credits enable row level security;
alter table credit_history enable row level security;
alter table user_agents enable row level security;
alter table content_history enable row level security;

-- user_credits 策略
create policy "Users can view own credits"
  on user_credits for select
  using (auth.uid() = user_id);

create policy "Users can update own credits"
  on user_credits for update
  using (auth.uid() = user_id);

-- credit_history 策略
create policy "Users can view own history"
  on credit_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own history"
  on credit_history for insert
  with check (auth.uid() = user_id);

-- user_agents 策略
create policy "Users can manage own agents"
  on user_agents for all
  using (auth.uid() = user_id);

-- content_history 策略
create policy "Users can manage own content"
  on content_history for all
  using (auth.uid() = user_id);

-- ============================================
-- 触发器: 新用户自动初始化积分
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_credits (user_id, credits, plan)
  values (new.id, 50, 'free');
  return new;
end;
$$ language plpgsql security definer;

-- 创建触发器
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 索引优化
-- ============================================

create index if not exists idx_credit_history_user on credit_history(user_id);
create index if not exists idx_content_history_user on content_history(user_id);
create index if not exists idx_user_agents_user on user_agents(user_id);
