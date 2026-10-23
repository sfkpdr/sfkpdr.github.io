# 杨生的 AI 实践库

一个以开源 AI 模型为核心的个人实践资源库：**提示词 + 效果图 + 模型资料 + 技术文章 + 视频教程 + ComfyUI 工作流**。

线上地址：<https://sfkpdr.github.io>
仓库：<https://github.com/sfkpdr/sfkpdr.github.io>

---

## 1. 技术方案（为什么是 Astro）

原站是 4 个手写 HTML + 1 个 CSS，内容全部写死在页面里，加一条提示词要改 3 个文件。
现在迁移到 **Astro 5 静态站点**，核心变化是**数据和页面分离**：

| 需求 | 做法 |
| --- | --- |
| 加一条提示词不改页面代码 | 内容存在 `src/content/prompts/*.md`，列表、详情、筛选、搜索索引全部在构建时自动生成 |
| 手机随时上传 | 仓库根目录 `.pages.yml` 接入 [Pages CMS](https://pagescms.org/)，直接管理 GitHub 仓库里的内容文件 |
| 零后端、零数据库 | 纯静态构建，GitHub Pages 托管，推送即部署 |
| 内容填错能立刻发现 | `scripts/validate-content.mjs` 在构建前校验字段、slug、图片路径、关联关系 |
| 长期可维护 | 字段定义集中（`src/content.config.ts` + `.pages.yml`），换 CMS 或换框架都不必重写内容 |

技术栈：Astro 5 · TypeScript · Content Collections（glob loader + zod 校验）· Lucide 图标 · 原生 CSS 变量 · GitHub Actions。

> **搜索没有用 Pagefind**：Pagefind 的默认二进制不带中文分词（需要扩展版二进制），
> 而本站内容几乎全是中文。改为构建时生成 JSON 索引 + 浏览器端子串匹配，中文输入一个字即可命中，
> 且不依赖任何外部服务与二进制，部署在 GitHub Pages 上体积和速度都更可控。详见第 9 节。

---

## 2. 本地运行

需要 Node.js 18+（推荐 20/22）。

```bash
npm install          # 安装依赖
npm run dev          # 本地预览 http://localhost:4321
npm run check        # 只做内容校验
npm run build        # 内容校验 + 构建到 dist/
npm run preview      # 预览构建结果
```

> 国内网络安装依赖慢时：`npm install --registry=https://registry.npmmirror.com`

---

## 3. 目录结构

```text
.
├── .pages.yml                    # 手机端后台（Pages CMS）配置：字段、目录、图片路径
├── astro.config.mjs              # 站点地址、sitemap、代码高亮
├── package.json
├── src/
│   ├── content.config.ts         # 内容集合与字段校验规则（唯一权威定义）
│   ├── content/
│   │   ├── prompts/              # 提示词（一条一个 .md）
│   │   ├── models/               # 模型资料
│   │   ├── articles/             # 技术文章
│   │   ├── videos/               # 视频教程
│   │   └── projects/             # 工作流与作品
│   ├── data/
│   │   ├── categories.json       # 任务分类（AI 生图 / 人像摄影 / …）
│   │   ├── article-categories.json
│   │   └── site.json             # 站点名称、作者、仓库地址、后台地址
│   ├── lib/
│   │   ├── content.ts            # 取数、排序、格式化
│   │   └── search-index.ts       # 构建搜索索引
│   ├── components/                # Header / Footer / 各类卡片 / 筛选面板 / 复制按钮
│   ├── layouts/BaseLayout.astro   # HTML 头、OG、导航、页脚
│   ├── pages/                     # 路由（见下表）
│   ├── scripts/                   # 浏览器端：筛选、搜索、复制、TOC
│   └── styles/global.css          # 原木风格设计系统（颜色变量都在这里）
├── public/
│   ├── images/{prompts,models,articles,videos,projects}/
│   ├── downloads/                 # 工作流文件（json / zip）
│   └── {blog,portfolio,resume}.html  # 旧链接 301 式跳转页
├── scripts/
│   ├── validate-content.mjs       # 内容校验
│   └── gen-placeholders.mjs       # 生成示例占位图（仅首次使用）
├── templates/                     # 手工建内容时的 Markdown 模板
└── archive/legacy-site/           # 迁移前的老站文件（只作留档，不参与构建）
```

路由一览：

| 路径 | 说明 |
| --- | --- |
| `/` | 首页 |
| `/prompts/` | 提示词库（筛选 + 排序 + 库内搜索） |
| `/prompts/<slug>/` | 提示词详情（大图、完整提示词、复制、参数、相关模型/文章/工作流） |
| `/models/` `/models/<slug>/` | 模型库与模型详情 |
| `/articles/` `/articles/<slug>/` | 文章列表与文档型详情（左侧分类、右侧目录、代码复制） |
| `/videos/` | 视频教程 |
| `/projects/` `/projects/<slug>/` | 工作流与作品 |
| `/about/` | 关于我（整合了原简历内容，可打印成 PDF） |
| `/search/` | 全站搜索 |
| `/admin/` | 手机端管理入口（只是跳转，不含任何凭据） |
| `/license-notes/` | 资源来源与许可证说明 |
| `/rss.xml` `/sitemap-index.xml` | 订阅与站点地图 |

---

## 4. 手机端上传与管理网站内容

**日常维护只需要手机。** 内容保存在 GitHub 仓库，保存后 GitHub Actions 自动重新构建并发布，不需要电脑，也不需要手动跑命令。

### 4.1 首次授权（只做一次）

1. 手机浏览器打开 <https://app.pagescms.org/>
2. 选择 **Sign in with GitHub**，用拥有 `sfkpdr/sfkpdr.github.io` 权限的账号登录
3. 首次会跳转 GitHub 授权页，安装 **Pages CMS** 的 GitHub App，并**只勾选这一个仓库**
   （授权范围仅限仓库内容读写，可随时在 GitHub → Settings → Applications 里撤销）
4. 回到 Pages CMS，选择仓库 `sfkpdr/sfkpdr.github.io`、分支 `main`
5. 左侧出现六个栏目：**站点设置** / 提示词库 / 模型库 / 技术文章 / 视频教程 / 工作流与作品
   （如果只看到五个，刷新一次页面，后台是按 `.pages.yml` 实时生成的）

### 4.2 加到手机桌面（推荐）

- **iPhone**：Safari 打开 → 分享 → 添加到主屏幕
- **Android**：Chrome 打开 → 右上角菜单 → 添加到主屏幕

以后点图标直接进后台，不用再输网址。

### 4.3 新增一条提示词（七步）

| 步骤 | 操作 |
| --- | --- |
| 1 | 左侧点「提示词库」→ 右上角「新增」 |
| 2 | 填**提示词标题** |
| 3 | 点「生成效果图」→ 从相册选图上传（必填） |
| 4 | **适用模型**从下拉里选（读的是模型库，不要手打）；**任务分类**选一个；标签按需添加 |
| 5 | 在「完整提示词」里粘贴正文 |
| 6 | 需要就继续填负向提示词、模型版本、生成参数、实测状态、使用说明 |
| 7 | **发布状态**选「已发布」→ 保存。等待 1–3 分钟，网站上就出现了 |

保存后 Pages CMS 会直接向仓库提交一次 commit，GitHub Actions 自动构建部署。

> **归类是自动的**：第 4 步选定的分类、模型与标签，保存后这一条就会自动出现在提示词库的对应筛选结果
> （`/prompts/?category=portrait`、`/prompts/?model=flux1-dev`、`/prompts/?tag=人像`）、
> 模型详情页的「这个模型的提示词」、首页计数与全站搜索索引里——**不需要再去别的地方登记分类**。
> 标签是自由文本，写一个新的就会自动出现在筛选栏；某个分类下没有内容时，筛选栏会自动隐藏它。

### 4.4 草稿与发布

- 每条内容都有「发布状态」字段：**草稿** / **已发布**。
- 草稿不会出现在任何列表、详情页、搜索索引和 sitemap 里，只有你自己在后台能看到。
- 想先写一半、明天再发：存成草稿即可。**保存 ≠ 公开**，公开只取决于这个字段。
- 上线前建议：先用草稿补齐字段 → 自己念一遍提示词 → 再改成已发布。

### 4.5 图片规则

- 上传的图片自动保存到 `public/images/prompts/`，公开路径 `/images/prompts/文件名` 会自动写进内容字段，不需要手填。
- 文件名由系统随机生成（避免同名覆盖和中文文件名问题），不用管。
- 支持 JPG / PNG / WebP。**建议宽度 1200–1600px，单张 ≤ 300KB**（手机直出图先用微信/相册压一下再传）。
- 一条提示词对应一张图：`image` 字段是唯一关联方式，不会靠文件名或标题去猜。

### 4.6 修改与删除

- **修改**：列表里点开条目 → 改字段 → 保存。旧图片不会被自动删除，确认没被其它条目引用后可手动在仓库里删掉（见 4.5 图片规则）。
- **删除**：条目页右上角菜单 → Delete，会二次确认。删除后请顺手检查 `public/images/prompts/` 里对应图片是否还有别处引用，没有就可以一起删。
- 任何删除都是 Git 提交，**删错了可以在 GitHub 的 commit 历史里恢复**。

### 4.7 后台表单字段结构

五个栏目与字段一一对应 `src/content.config.ts`。必填项汇总：

| 栏目 | 必填字段 |
| --- | --- |
| 站点设置 | 站点名称、顶栏品牌名、作者全名（其余可留空） |
| 提示词库 | 标题、slug、效果图、适用模型、任务分类、完整提示词、发布状态、更新时间 |
| 模型库 | 名称、slug、开发者、一句话介绍、许可证、官方模型链接、发布状态、更新时间 |
| 技术文章 | 标题、slug、摘要、分类、发布日期、发布状态 |
| 视频教程 | 标题、slug、简介、封面图、视频地址、发布日期、发布状态 |
| 工作流与作品 | 标题、slug、一句话说明、预览图、类型、发布日期、发布状态 |

字段在后台都有中文标签与填写说明；不确定时**留空比乱填好**，缺失的可选字段不会让页面报错，整块内容会自动隐藏。

---

## 5. 内容在哪里改（速查表）

先记住两条路径：

- **手机**：打开 `app.pagescms.org`（或站内 `/admin/` 入口）→ 改完保存 → 1–3 分钟自动上线
- **电脑**：改文件 → `npm run dev` 本地看（`http://localhost:4321`，保存即刷新）→ 提交推送 → 自动上线

### 5.1 常见修改对照表

| 想改什么 | 去哪儿改 | 手机上能改吗 |
| --- | --- | --- |
| 网站名字（左上角品牌名） | 后台「站点设置」→ 顶栏品牌名 | ✅ |
| 作者姓名（页脚版权、关于页） | 后台「站点设置」→ 作者全名 / 作者简称 | ✅ |
| 站点描述、城市、邮箱、GitHub 用户名 | 后台「站点设置」 | ✅ |
| 提示词 / 模型 / 文章 / 视频 / 作品 | 后台对应栏目 | ✅ |
| 首页大标题「让 AI 真正用起来」 | `src/pages/index.astro` 的 `<h1>` | ❌ 需电脑 |
| 首页那段介绍文字 | `src/pages/index.astro` 的 `.hero__lead` | ❌ |
| 导航菜单文字与顺序 | `src/components/Header.astro` 里的 `navItems` 数组 | ❌ |
| 页脚各栏文字 | `src/components/Footer.astro` | ❌ |
| 关于我的经历、技能、自我介绍 | `src/pages/about.astro` | ❌ |
| 任务分类名称（AI 生图 / 人像摄影…） | `src/data/categories.json` 的 `name` ＋ `.pages.yml` 里对应的 `label` | ❌ |
| 文章分类名称 | `src/data/article-categories.json` ＋ `.pages.yml` 对应 `label` | ❌ |
| 颜色、圆角、字体、间距 | `src/styles/global.css` 顶部的 `:root` | ❌ |
| 站点域名 | `src/data/site.json` 的 `url` ＋ `astro.config.mjs` 的 `site` | ❌ |

### 5.2 改站名 / 改姓名：只需要改一个地方

站名和作者名现在统一来自 `src/data/site.json`（已接入后台「站点设置」）：

1. 打开后台 → 左侧 **站点设置**
2. **顶栏品牌名**：`杨生 · AI 实践库` —— 网站左上角、浏览器标签标题、分享卡片
3. **作者简称**：`杨生` —— 首页「我是杨生」、关于页标题
4. **作者全名**：`杨生（杨孔穗）` —— 页脚版权、关于页侧栏
5. 保存 → 全站 20 个页面同时生效，不用逐页改

> 已实测：把这几个值改掉后重新构建，品牌名出现在全部 20 个页面、作者名同步到页脚与关于页，没有残留的旧名字。

### 5.3 改完在哪里看到

| 场景 | 看哪里 |
| --- | --- |
| 本机调试 | `npm run dev` 打开 `http://localhost:4321`，保存文件即热更新 |
| 线上生效 | GitHub → **Actions** 最近一次运行变绿 → 刷新 `https://sfkpdr.github.io/`（手机建议下拉刷新或清缓存） |
| 改了什么、谁改的 | GitHub → **Commits**，每次保存都是一条记录，可查看差异、可回滚 |

### 5.4 三个注意事项

- `name` / `brand` / `author` 随便改，安全。
- `url` / `repo` / `cmsUrl` 只在换域名、换仓库时才改——它们影响全站链接与分享地址。
- 内容的 `slug` 不要改（等于换网址，旧链接会失效）；分类的 `id` 不要改（已有内容按 id 关联），改 `name` 只影响显示。

## 6. 电脑端手工添加内容（可选的第二条路）

不习惯后台时，也可以直接加文件，效果完全一样。复制 `templates/` 里的模板：

```bash
cp templates/prompt-template.md src/content/prompts/my-new-prompt.md
```

需要改的地方只有三处：

1. `slug` 与**文件名保持一致**（`my-new-prompt.md` → `slug: my-new-prompt`）
2. `image` 指向 `public/images/prompts/` 下的真实文件
3. `model` 写模型库里的 `slug`（例如 `flux1-dev`），不是显示名

然后 `npm run dev` 本地看效果，`npm run build` 确认通过，再提交。

> 新增分类/标签：分类在 `src/data/categories.json`（任务）与 `src/data/article-categories.json`（文章）里加一项即可；
> 标签不需要注册，直接写在内容里，筛选项会自动出现。

---

## 7. 部署（GitHub Pages + GitHub Actions）

### 6.1 必须做的一次设置 ⚠️

原站是「分支直出」模式。改成 Astro 之后**必须把 Pages 的来源切到 GitHub Actions**，否则会看到一个没有样式的源码目录：

1. 仓库 → **Settings → Pages**
2. **Build and deployment → Source** 选 **GitHub Actions**（不要选 Deploy from a branch）
3. 保存。之后每次推送 `main` 都会自动构建部署

自定义域名 / 仓库名说明：仓库是 `sfkpdr.github.io`（用户主页仓库），站点在根路径 `/`，
所以 `astro.config.mjs` 里的 `site` 设为 `https://sfkpdr.github.io`，**不需要 `base`**。
以后若改成项目仓库（`/repo-name/` 形式），要同时设置 `site` 与 `base`。

### 6.2 流程

`.github/workflows/deploy.yml`：

```text
push 到 main
  → npm ci
  → npm run build（先内容校验，再 astro build）
  → 上传 dist 作为 Pages 产物
  → 部署到 GitHub Pages
```

- 构建失败不会影响线上已发布的版本。
- 失败日志在 **Actions** 页签里，红色 ✗ 的步骤点开就能看到具体文件与行号。
- 深链、刷新、404：`build.format: 'directory'` 会为每个页面生成 `路径/index.html`，刷新任意深层链接都正常；
  未匹配路径落到 `404.html`。

### 6.3 常见构建失败

| 报错关键字 | 原因 | 修复 |
| --- | --- | --- |
| `引用的图片不存在：public/images/...` | 内容里的图片路径不对，或图片没提交 | 重新上传图片，或改正路径 |
| `slug 不合法` / `slug 重复` | slug 用了中文/大写，或与已有条目撞车 | 改成小写英文 + 连字符，保持唯一 |
| `引用了不存在的模型` | 提示词指向了模型库里没有的 slug | 先去模型库建这个模型，或改选现有模型 |
| `prompt 为空或过短` | 完整提示词没填 | 补齐提示词正文 |
| `YAML 解析失败` | frontmatter 少了引号/缩进错 | 用后台表单改，或对照模板修 |

---

## 8. 内容校验规则

`npm run check`（`build` 会自动先跑）会检查：

- slug 是否合法、是否重复、是否与文件名一致
- 必填字段是否缺失（标题、图片、提示词正文、模型、分类、日期、状态等）
- 图片/工作流文件在 `public/` 下是否真实存在（**路径不猜、不模糊匹配**）
- 引用的模型、文章、作品、提示词是否存在
- 分类 id 是否在 `src/data/*.json` 中
- 图片是否过大（>1.5MB 给警告）、多条提示词是否共用同一张图（警告）
- 示例条目是否还处于已发布状态（警告）

**有错误会直接中止构建**，GitHub Actions 里同样生效——坏数据进不了线上。

---

## 9. 搜索与筛选

- **筛选**：全站统一的 `src/scripts/library-filter.ts`，状态写进 URL 查询参数
  （`/prompts/?model=flux1-dev&category=product&tag=写实&tested=1&sort=title`），
  可分享、可刷新保持、可组合；桌面端左侧栏，手机端底部抽屉。
- **库内搜索**：输入时按需加载 `search-index/prompts.json`，匹配标题、标签、模型名与**提示词正文**。
- **全站搜索**：`/search/` 一次加载五类索引（`/search-index/{prompts,models,articles,videos,projects}.json`），
  支持分类切换、结果高亮、分组展示。索引在构建时由 `src/lib/search-index.ts` 生成，不需要额外服务。
- 内容量到几千条时，索引仍是按类型拆分的静态 JSON，单次只会加载需要的部分。

---

## 10. 设计与主题

所有颜色、圆角、阴影、间距都在 `src/styles/global.css` 顶部的 `:root` 里：

```css
--linen: #f5f0e6;    /* 页面主背景：亚麻米白 */
--wood-light: #e5d5be;
--wood: #c39b70;     /* 木纹装饰色 */
--walnut: #604630;   /* 胡桃木主色：标题、按钮 */
--ink: #36312b;      /* 正文 */
--moss: #78836a;     /* 辅助苔绿：已实测、提示条 */
--card: #fffdf8;     /* 卡片暖白 */
```

木纹只做局部点缀（首页主视觉的细线、页脚的暖色渐层），不铺满整页；图标统一用 Lucide 线性图标，
笔画 1.7–1.8，尺寸 14–20。改主题只需要改这些变量，不需要动组件。

---

## 11. 迁移与遗留内容说明

- 旧站的 4 个页面已归档到 `archive/legacy-site/`（保留原始 HTML/CSS/背景图，只作留档）。
- `public/{blog,portfolio,resume}.html` 是跳转页，把旧链接导向 `/articles/`、`/projects/`、`/about/`。
- 旧博客的 6 条摘要已迁移为文章条目，其中 4 条是**草稿**（正文待补全，标题下方有说明），
  补齐后把「发布状态」改为已发布即可。
- 原简历内容整合进 `/about/`，页面上有「打印 / 存为 PDF」按钮。
- 旧的 `css/style.css`、`images/background.jpg` 未删除，随归档一起保留在 `archive/`。

### 示例内容需要替换 ⚠️

首次上线带了少量示例数据，用来演示结构：

- 3 条提示词（标签含「示例」，图片是带 `SAMPLE` 水印的占位图，**不是真实生成结果**，参数未经实测）
- 1 条视频模板（草稿状态，不会显示）
- 模型库 3 条、文章 2 篇、作品 1 条为真实资料整理

**建议第一件事：把 3 条示例提示词替换成你自己的图与提示词，或直接删掉。**

---

## 12. 需要你亲自完成的清单

- [ ] 把 `Settings → Pages → Source` 改成 **GitHub Actions**
- [ ] 首次登录 <https://app.pagescms.org/>，授权 GitHub App（只勾这一个仓库）
- [ ] 手机上试传一条提示词，确认 Actions 构建通过、网站出现新条目
- [ ] 替换 3 条示例提示词（图片 + 提示词 + 状态）
- [ ] 4 篇草稿文章补齐正文后发布
- [ ] 在 `src/data/site.json` 里补上邮箱（如果希望页脚显示）

> 以上步骤需要你的 GitHub 账号权限，我无法代做，也不会假装已完成。
> 站内不存放任何令牌：CMS 的权限完全由 GitHub App 授权控制。

---

## 13. 常见问题

**Q：保存后网站没更新？**
先在 Actions 里看最新一次运行：还在跑就等；失败了按 6.3 的表排错；成功但页面没变，清一下手机浏览器缓存。

**Q：能不能直接传视频文件？**
不要。视频放 B 站/YouTube，站内只存封面和链接——仓库体积一旦上去，克隆和构建都会变慢。

**Q：图片想统一转成 WebP？**
用系统自带工具或 [squoosh.app](https://squoosh.app/) 转好再上传，宽度 1200–1600px 足够。

**Q：想加新的大栏目？**
复制一个 `src/content/<name>/` 集合 + `src/pages/<name>/` 页面 + `.pages.yml` 里加一段配置，
复用现成的 `FilterPanel` 与 `library-filter.ts` 即可。

**Q：数据以后想搬到别的框架？**
内容全是标准 Markdown + frontmatter，图片是普通静态文件，`src/content/*` 直接可搬。
