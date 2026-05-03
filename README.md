# 考试审批与毕业达成度系统 · 前端

本仓库为「考试审批与毕业达成度系统」的 Web 前端，基于 Vue 2 与 Element UI 构建，与后端 API 联调使用。

## 许可证

本项目以 [**Apache License 2.0**](LICENSE) 开源。

## 环境与配置说明

- 根目录下的 `.env.development`、`.env.production`、`.env.staging` 可按环境维护变量；**可参考示例** [`.env.example`](.env.example) 新建本地覆盖文件（勿把内部部署地址提交到公开仓库）。
- **顶部导航「源码 / 文档」**：通过环境变量 `VUE_APP_PROJECT_REPO`、`VUE_APP_PROJECT_DOC` 配置；不设或留空则不显示图标（见 `src/settings.js`）。
- **登录加密**：`src/utils/jsencrypt.js` 内的 RSA 密钥需与后端一致；仓库中为演示用密钥，**生产环境务必自行生成并替换**，切勿沿用默认值部署线上。

## 环境要求

- **Node.js**：建议 **14.x～16.x**；若使用 **17 及以上**，在部分环境下构建或本地开发可能需 OpenSSL 兼容配置（见下文「本地开发」）。
- **npm**：**≥ 3.0.0**（建议使用与 Node 配套的 npm）。提交公开仓库时建议保留 **`package-lock.json`**，便于依赖版本可复现。

## 安装依赖

在项目根目录执行：

```bash
npm install
```

若下载较慢，可使用国内镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

首次安装后可生成锁文件：

```bash
npm install --package-lock-only
```

## 本地开发

```bash
npm run dev
```

默认开发服务器端口见 `vue.config.js`（一般为 **80**）。浏览器访问：**http://localhost:80**（若端口被占用，请按控制台提示或修改配置中的端口）。

在 **Windows** 上，若遇 OpenSSL / webpack 相关报错，可使用：

```bash
npm run windows-dev
```

该命令会为当前进程设置 `NODE_OPTIONS=--openssl-legacy-provider` 后再启动开发服务。

## 构建与预览

```bash
# 测试 / 预发布环境构建
npm run build:stage

# 生产环境构建
npm run build:prod
```

构建完成后，可使用预览脚本（具体行为见 `build` 目录下脚本）：

```bash
npm run preview
```

## 代码规范

```bash
npm run lint
```

提交前可通过 husky + lint-staged 对变更文件执行 ESLint（以项目实际配置为准）。

## 开源发布前检查清单（摘要）

| 项 | 说明 |
| --- | --- |
| `package.json` | 已使用本项目包名；公开托管后请补充 `repository`、`bugs`、`homepage` 等字段（当前未绑定第三方模板仓库）。 |
| 版权声明 | 页面页脚已改为 Apache 2.0 说明；若版权主体变更，请同步修改登录/注册页与文档。 |
| 演示账号 | 登录页默认账号密码已清空，避免误导或撞库风险。 |
| 第三方上游 | 代码源自 RuoYi-Vue 生态，业务接口路径、权限标识等仍可能包含 `ruoyi` 前缀，**需与后端一并约定**，勿在未同步后端的情况下批量改名。 |

## 项目信息

- **说明**：考试审批与毕业达成度系统（前端）
- **版本**：见 `package.json` 中 `version`
- **许可**：Apache License 2.0
