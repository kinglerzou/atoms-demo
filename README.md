# Atoms Studio Demo

参考 Atoms 中文官网与 AI 应用生成流程实现的可运行原型：从自然语言需求出发，经过产品规划、代码生成，在隔离预览中运行应用，并通过对话继续迭代。

项目包含完整滚动首页、六套交互案例，以及支持项目管理、代码编辑、版本历史和本地数据持久化的工作台。无需注册即可体验。

- **在线体验**：[Cloudflare 部署](https://atoms-demo.zoujian283827940.workers.dev)
- **工作台**：[进入 Studio](https://atoms-demo.zoujian283827940.workers.dev/studio)
- **源码仓库**：[kinglerzou/atoms-demo](https://github.com/kinglerzou/atoms-demo)（私有仓库，需访问权限）
- **参考产品**：[Atoms](https://atoms.dev/zh)

> 本项目是独立学习 Demo，非 Atoms 官方服务。官网中的商业套餐、账号系统、广告投放与云产品没有在本项目中完整实现；具体范围见下文。

## 目录

- [快速开始](#快速开始)
- [模型配置](#模型配置)
- [使用流程](#使用流程)
- [功能清单](#功能清单)
- [技术架构与目录](#技术架构与目录)
- [数据保存与预览隔离](#数据保存与预览隔离)
- [部署到 Cloudflare Workers](#部署到-cloudflare-workers)
- [验证与验收](#验证与验收)
- [常见问题](#常见问题)
- [已知边界与素材说明](#已知边界与素材说明)

## 快速开始

需要 **Node.js >= 22.13**，推荐 Node.js 24，以及 npm。访问私有仓库需要 GitHub 授权。

```bash
git clone https://github.com/kinglerzou/atoms-demo.git
cd atoms-demo
npm ci
```

首次运行时，将 `.env.example` 复制为 `.dev.vars`。如果已有 `.dev.vars`，请直接编辑它，避免覆盖现有参数。

```bash
cp .env.example .dev.vars
npm run dev
```

打开终端输出的地址，默认是 `http://localhost:5173`。修改环境变量后需要重启开发服务。

| 路径 | 用途 |
| --- | --- |
| `/`、`/zh` | 完整滚动首页、案例和功能展示 |
| `/studio` | AI 创作、项目、代码和版本管理 |
| `/api/config` | 返回是否配置密钥及当前模型名称，不返回密钥 |
| `/api/generate` | POST 请求，返回 NDJSON 格式的生成阶段事件 |

**未配置 Key 也可以使用**案例、内置模板、项目管理、代码编辑、版本回退和导入导出；AI 生成会明确提示未配置。

## 模型配置

本地使用项目根目录中的 `.dev.vars`；线上使用 Cloudflare Secrets。二者独立，修改本地文件不会自动更新线上。

```dotenv
OPENAI_API_KEY="填写你自己的密钥"
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="填写服务商支持的准确模型名称"
```

| 参数 | 说明 |
| --- | --- |
| `OPENAI_API_KEY` | 服务商签发的 API Key，仅在服务端使用 |
| `OPENAI_BASE_URL` | API 基地址，应用在末尾添加 `/responses`；不要填写完整的 `/responses` 路径 |
| `OPENAI_MODEL` | 与该 Key、基地址匹配的模型标识，以服务商提供的名称为准 |

应用调用 **Responses API**：发送 `model`、`instructions`、`input`、`max_output_tokens`、`store: false`，读取 `output[].content[]` 中的 `output_text`。仅支持 `/chat/completions` 的服务不能直接使用，需要另写适配层。示例中的 OpenAI 基地址不能与其他服务商的 Key 随意混用。

模板默认模型为 `gpt-5.5`，不代表所有账号都有该模型权限。2026-11-09 部署验证使用的是用户配置的 `deepseek-flash` 模型及其配套服务地址；模型名称相同并不保证不同服务商的 API 协议相同。

`.dev.vars` 已被 Git 忽略，不应提交或截图分享。不要将密钥写进前端代码、`NEXT_PUBLIC_*`、README 或 Wrangler 配置文件。编辑器不显示隐藏文件时，可使用“打开文件”直接打开项目根目录下的 `.dev.vars`。

## 使用流程

1. 在首页输入需求，例如“做一个可新增、完成和筛选任务的待办应用”，点击开始进入工作台；也可以打开案例并克隆。
2. 在工作台提交需求，观察产品规划、工程构建、HTML 检查三个阶段。
3. 生成成功后，在预览区操作应用，切换桌面或手机尺寸。
4. 继续输入修改需求，或进入代码页直接编辑 HTML/CSS/JavaScript，保存为新版本。
5. 在历史中恢复旧代码，或导出独立 HTML；需要迁移所有项目时，使用设置中的 JSON 备份与恢复。

首页“开始”会把需求带入工作台；真实生成在工作台中提交。首屏与底部输入同步，支持 Cmd/Ctrl+Enter。参考文件支持 TXT、Markdown 和 HTML，大小需小于 180 KB；完整 HTML 可直接导入项目。

## 功能清单

### 首页

| 区域 | 可用交互 |
| --- | --- |
| 导航 | 资源下拉、提示词填入、定价定位、移动端菜单、工作台入口 |
| 创作输入 | 草稿保存、快捷键、文件选择与拖放、底部同步输入 |
| 案例 | 六套可运行示例、弹窗预览、前后切换、预览尺寸切换、克隆 |
| 团队 | 横向滚动、角色详情、角色提示词 |
| 工作流程 | 五项切换、自动演示与暂停、打开交互示例 |
| 功能展示 | 七项滚动联动、高亮跟随、点击定位、功能详情 |
| 故事 | 前后切换、分页圆点、克隆对应案例 |
| 定价 | 年/月切换、积分档位选择、金额计算、套餐明细弹窗；不会扣款 |
| FAQ 与页脚 | 九项手风琴、资源链接、回到顶部、浅色/深色/系统主题 |
| 语言与可访问性 | 主要标题和导航中英文切换、Escape 关闭弹窗、焦点约束、案例左右键 |

六套首页案例分别演示任务管理、商品分类与购物车、作品搜索与收藏、推荐筛选、动画控制、计时射击游戏。首页预览是临时体验，克隆进工作台后才能持久保存业务数据。

### 工作台

| 能力 | 实现范围 |
| --- | --- |
| 项目管理 | 创建、最近项目、搜索、重命名、复制、确认删除 |
| AI 生成 | 产品规划与代码生成两次模型调用、实时阶段消息、取消、错误提示 |
| 对话迭代 | 携带当前完整 HTML 和新需求生成新版本，失败保留旧版本 |
| 预览 | sandbox iframe、桌面/手机尺寸、刷新、运行时错误提示 |
| 代码编辑 | 单文件 HTML/CSS/JS 编辑、保存、复制、HTML 导入导出 |
| 历史版本 | 时间与操作记录，恢复旧版本时新增版本，不覆盖历史 |
| 数据 | 项目、对话、版本和应用数据保存在浏览器中，支持 JSON 备份与非覆盖恢复 |
| 内置模板 | Focus 任务管理、Forma 作品集、Ledger 收支管理 |

## 技术架构与目录

使用 React 19、TypeScript、Vinext/Vite 和 Cloudflare Workers。页面使用 Next.js App Router 风格目录，实际构建及服务端运行由 Vinext 提供。

```text
app/
  page.tsx                 首页
  landing.css              首页样式
  zh/page.tsx              中文首页入口
  studio/page.tsx          工作台、项目、版本、预览存储桥
  globals.css              工作台样式
  api/config/route.ts      配置状态接口
  api/generate/route.ts    读取服务端环境并调用生成逻辑
lib/
  generation.ts           Responses API 调用与 NDJSON 阶段流
  showcases.ts            六套首页交互案例
  templates.ts            三套工作台模板
  landing-data.ts         团队、功能、套餐、FAQ 文案
  atoms-assets.json       参考素材映射
public/atoms/             首页图片与图标
worker/index.ts           Workers 请求入口
scripts/cloudflare-secrets.mjs  本地配置到线上 Secret 的同步脚本
wrangler.cloudflare.json       独立 Cloudflare 部署配置
.env.example                  环境变量模板，不含密钥
tests/                        生成流程与首页数据测试
```

生成接口依次发送 `plan`、`build`、`check`、`done` 事件；失败发送 `error`。规划和构建分别调用模型，最后检查返回内容是否包含完整 HTML 文档。**HTML 完整性检查不等于自动功能测试或安全审计。**

仓库保留了初始脚手架的组件、数据库和连接器辅助文件；当前核心应用不依赖已部署的 D1、R2 或外部连接器。`.openai/hosting.json` 用于原 Sites 托管，独立 Cloudflare 部署使用 `wrangler.cloudflare.json`。

## 数据保存与预览隔离

- 项目数据保存在当前浏览器、当前站点的 `localStorage`，不跨设备自动同步。
- 更换浏览器、清除站点数据或切换域名后，不会自动看到原项目；请先备份 JSON，再到新地址恢复。
- 从旧 `chatgpt.site` 地址迁移到 `workers.dev` 地址同样需要手动备份恢复。
- 版本回退恢复的是代码，不回退业务数据。
- 预览 iframe 不授予 `allow-same-origin`；CSP 限制网络请求、外部脚本和表单提交。
- 应用通过受限 `postMessage` 桥调用 `window.demoStore` 保存数据；父页面校验消息来源、数据类型与大小。
- 导出的独立 HTML 在浏览器允许的情况下使用本地存储；本地文件的存储行为可能因浏览器而异。

## 部署到 Cloudflare Workers

### 首次部署

需要自己的 Cloudflare 账号，先在控制台确认 **Workers Free** 为当前套餐。以下操作不要求购买域名或升级套餐。

```bash
npx wrangler login
npx wrangler whoami
npm run build
npx wrangler deploy --config wrangler.cloudflare.json
node scripts/cloudflare-secrets.mjs
```

首次部署如果提示未注册 `workers.dev` 子域名，按提示完成注册，再执行部署。`wrangler.cloudflare.json` 中的 `name` 默认为 `atoms-demo`；在已有同名 Worker 的账号中部署会更新该 Worker，应先确认目标。

`cloudflare-secrets.mjs` 仅读取本机 `.dev.vars` 中的三个模型参数，通过标准输入直接传给官方 Wrangler，并全部保存为 Secrets。它不打印参数值，也不会修改 GitHub 仓库。Wrangler `secret bulk` 会创建并部署带有新密钥配置的版本。

### 更新代码

```bash
npm test
npm run typecheck
npm run build
npx wrangler deploy --config wrangler.cloudflare.json
```

**GitHub 推送和网站部署是两件事。** 当前没有配置 GitHub 自动部署流水线；只执行 `git push` 不会更新线上网站。

### 更新模型参数

编辑本地 `.dev.vars`，然后运行：

```bash
node scripts/cloudflare-secrets.mjs
npx wrangler secret list --config wrangler.cloudflare.json
```

`secret list` 只列出密钥名称，不显示值。也可以在 Cloudflare 控制台进入 **Workers & Pages → atoms-demo → Settings → Variables and Secrets** 编辑，并按界面提示部署变更。仓库中的 `.env.example` 只是模板，不会替代线上 Secrets。

### 部署后检查

```bash
curl -I https://atoms-demo.zoujian283827940.workers.dev
curl https://atoms-demo.zoujian283827940.workers.dev/api/config
```

配置接口应返回 `configured: true` 和模型名称；这只证明 Key 已配置，不能证明模型认证或额度正常。进入工作台提交一次小需求，确认生成完成，才能验证真实调用链。

2026-11-09 已确认当前部署使用 Workers Free（$0），首页 HTTPS 返回 200，线上生成接口完成 `plan → build → check → done`。Cloudflare 托管额度与模型 API 费用独立；请以账号控制台和[官方定价](https://developers.cloudflare.com/workers/platform/pricing/)为准。

**当前网站公开可访问，生成接口没有用户级登录、配额或速率限制，访客调用会使用站点所有者的模型额度。** 面向更多用户开放前，需要补充访问控制、限流和费用监控。

## 验证与验收

```bash
npm test
npm run typecheck
npm run build
```

现有 10 项自动测试覆盖凭据缺失、输入校验、跨源请求、模拟规划/构建流程、现有应用传递、上游失败、不完整 HTML、模板与案例脚本语法、套餐计算和 FAQ/链接结构。自动测试使用模拟上游，不消耗真实模型额度。

已完成的验证包括桌面与 390px 手机布局、案例操作与克隆、套餐计算、FAQ、主题保存，以及一次线上真实生成。它们不保证任意模型输出都没有错误。

建议手动验收：

1. 打开首页案例，操作筛选、购物车或收藏，再克隆到工作台。
2. 使用 Focus 模板新增并完成任务，刷新后确认数据保留。
3. 切换手机预览，编辑代码并保存，检查版本历史与恢复功能。
4. 重命名、搜索、复制项目，导出 HTML 与完整 JSON 备份。
5. 配置模型后生成一个计数器，再提交修改需求；失败或取消时确认旧版本仍在。
6. 在另一个浏览器或新域名恢复备份，确认原有项目不会被覆盖。

## 常见问题

| 问题 | 排查方式 |
| --- | --- |
| 克隆后找不到 `.dev.vars` | 它是被忽略的本地文件；首次从 `.env.example` 复制创建 |
| 本地修改参数但线上未变化 | 执行 `node scripts/cloudflare-secrets.mjs`；本地配置不会自动上传 |
| 提示“尚未配置模型” | 本地重启服务；线上检查三个 Secrets 是否存在及 `/api/config` 状态 |
| 模型认证失败 / 401 | 检查 Key 是否有效，以及 Key 与服务地址是否属于同一服务商 |
| 上游返回 404 或模型不可用 | 检查基地址、模型名称，以及服务商是否支持 `/responses` |
| 上游返回 429 | 检查服务商额度或频率限制；稍后重试 |
| 模型未返回完整 HTML | 尝试更明确的网页需求，或检查服务商的 Responses 输出格式与输出长度限制 |
| 预览中的外部请求失败 | 预览 CSP 有意限制联网；当前生成目标是无需外部资源的单文件应用 |
| 原有项目突然不见 | 检查是否换了浏览器或域名、是否清除了站点数据；使用 JSON 备份恢复 |
| Wrangler 未登录 / 授权超时 | 重新执行 `npx wrangler login`，及时完成浏览器授权，随后用 `whoami` 确认 |
| Secret 同步失败 | 脚本有意不回显上游输出；先检查登录、账户权限、Worker 名称和三个本地参数是否齐全 |
| 新域名出现 TLS 错误 | 确认部署路由已启用，等待生效后重试，并比较不同浏览器和网络；不要关闭证书验证 |
| 免费资源限制触发 | 检查 Cloudflare 指标并优化请求；本项目不会自动开通付费套餐 |

## 已知边界与素材说明

- 生成产物是单文件网页应用，不是任意多文件工程构建平台；支付、邮件、远程数据库等能力需另配后端。
- 实际 AI 流程为规划和构建两次调用；其他团队角色展示协作方向，不代表已实现独立运行的多智能体系统。
- 套餐弹窗只演示交互，不收费；登录与注册入口说明 Demo 无需账号，并提供官网链接。
- 语言切换覆盖导航和主要标题，并未完整翻译全部内容或覆盖官网全部语言。
- 参考图片、商标与公开展示数据归原权利方所有；示例不代表本项目拥有官网中的经营数据或背书。
- 仓库未附开源许可证；公开使用、分发代码或素材前，请确认相应授权。
