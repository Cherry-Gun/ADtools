# 短视频脚本审核工具 - 带后台版本

## 项目简介

一个支持多项目的短视频脚本审核工具，带有管理后台，方便更新审核规则。

## 技术栈

- **前端**: Next.js 14 + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **托管**: Vercel

## 功能

- [ ] 用户登录/注册
- [ ] 项目选择（北戴河海宸府、北京山谷）
- [ ] 脚本审核（4类标注）
- [ ] 审核历史记录
- [ ] 管理后台（规则管理）
- [ ] 规则版本控制

## 配置

需要在 .env.local 中配置：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
