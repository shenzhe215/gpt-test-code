# English Learning App (React + FastAPI)

一个用于英语学习的全栈示例项目：
- 前端：React (Vite)
- 后端：Python FastAPI + SQLite（标准库 sqlite3）

功能概览：
- 中译英（当前为占位实现，便于替换为真实翻译服务）
- 英文写作评估（字数、句长、可读性、建议）
- 每日练习统计（翻译/写作/复习，含 7 日历史）
- 每日复习（内置 SM-2 间隔重复算法的卡片系统）

## 目录结构

```
backend/
  app.py               # FastAPI 应用与 API 路由
  requirements.txt     # 后端依赖（fastapi, uvicorn）
  data/                # SQLite 数据库存放目录（运行时创建 app.db）
frontend/
  index.html
  package.json
  vite.config.js       # 开发代理到后端 http://127.0.0.1:8000
  src/
    main.jsx
    App.jsx
    components/NavBar.jsx
    services/api.js
    pages/
      Translate.jsx
      Writing.jsx
      Stats.jsx
      Review.jsx
```

## 本地运行

前提：已安装 Node.js (>= 18) 与 Python (>= 3.9)。

1) 启动后端（FastAPI + Uvicorn）

```bash
# 安装依赖
pip install -r backend/requirements.txt

# 启动开发服务（默认 8000 端口）
uvicorn backend.app:app --reload --port 8000
```

可检查健康接口：`http://127.0.0.1:8000/api/health`

2) 启动前端（Vite + React）

```bash
cd frontend
npm install
npm run dev
```

打开控制台输出的本地地址（默认 `http://127.0.0.1:5173`）。

开发代理已在 `frontend/vite.config.js` 配置，`/api` 将转发到 `http://127.0.0.1:8000`。

## 生产构建

```bash
cd frontend
npm run build
npm run preview
```

或自行将 `dist/` 产物部署到静态托管服务，并在网关/反向代理层把 `/api` 指向后端。

## 使用 Docker 部署

后端镜像（暴露 8000）：

```bash
docker build -t english-backend -f backend/Dockerfile .
docker run -d --name backend -p 8000:8000 english-backend
```

前端镜像（使用 Nginx 监听 3000，避免 8080）：

```bash
docker build -t english-frontend -f frontend/Dockerfile .

# 若后端容器名为 backend（同网络下可解析），直接运行：
docker run -d --name frontend -p 3000:3000 --link backend english-frontend

# 或者显式指定后端地址（例如主机 8000 端口）：
# Linux 新版 Docker 支持 host.docker.internal，也可替换为内网 IP
docker run -d --name frontend -p 3000:3000 -e BACKEND_URL=http://host.docker.internal:8000 english-frontend
```

现在访问前端：`http://127.0.0.1:3000`。

## API 概述（节选）

- `POST /api/translate` { text, source_lang, target_lang } -> { translated_text }
  - 目前返回占位翻译（`[stub zh->en] ...`）。可替换为真实翻译逻辑或第三方 API。
- `POST /api/write/evaluate` { text } -> 写作分析指标与建议
- `POST /api/practice/log` { type, amount } -> 记录任意练习事件
- `GET /api/practice/stats?date_str=YYYY-MM-DD` -> 返回当天汇总与 7 日历史
- `POST /api/cards` { front, back } -> 新增卡片（复习）
- `GET /api/review/today` -> 返回今天到期卡片
- `POST /api/review/grade` { id, quality(0-5) } -> 按 SM-2 更新卡片并计划下次复习

## 自定义与扩展建议

- 翻译：将 `backend/app.py` 中 `naive_stub_translate` 替换为实际翻译实现（如自建模型/第三方 API）。
- 身份与多用户：为 practice/flashcards 增加 user_id 字段与鉴权（如 JWT）。
- 数据迁移：若后续模型更复杂，可改用 ORM（SQLAlchemy）与 Alembic 迁移。
- UI：可接入 UI 框架（AntD、MUI）和图表库（ECharts/Recharts）增强统计图表。

## 许可

本项目为示例脚手架，按需修改使用。
