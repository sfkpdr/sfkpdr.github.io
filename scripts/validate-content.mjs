/**
 * 内容自检脚本 —— 在 astro build 之前运行（npm run check / npm run build）。
 *
 * 目的：让「字段缺失、slug 重复、图片路径不存在、关联内容不存在」这类问题
 * 在构建阶段就明确报错，而不是等页面渲染出一张裂图才发现。
 *
 * 输出约定：
 *   ✗ 错误：必须修复，脚本会以退出码 1 结束，构建不会继续
 *   ! 警告：不阻塞构建，但建议处理
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src', 'content');
const publicDir = join(root, 'public');

const errors = [];
const warnings = [];

const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

function readCollection(name) {
  const dir = join(contentDir, name);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((file) => file.endsWith('.md') && file.toLowerCase() !== 'readme.md')
    .map((file) => {
      const path = join(dir, file);
      const raw = readFileSync(path, 'utf8');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

      if (!match) {
        fail(`[${name}/${file}] 缺少 frontmatter（文件必须以 --- 开头和结束）`);
        return null;
      }

      let data;
      try {
        data = yaml.load(match[1]) ?? {};
      } catch (error) {
        fail(`[${name}/${file}] frontmatter YAML 解析失败：${error.message}`);
        return null;
      }

      return { file, id: file.replace(/\.md$/, ''), data, body: match[2] ?? '' };
    })
    .filter(Boolean);
}

function checkImage(where, value, { required = false } = {}) {
  if (!value) {
    if (required) fail(`${where} 缺少必填图片字段`);
    return;
  }

  if (typeof value !== 'string' || !value.startsWith('/')) {
    fail(`${where} 的图片路径必须以 / 开头（当前：${value}）`);
    return;
  }

  const filePath = join(publicDir, value.replace(/^\//, ''));
  if (!existsSync(filePath)) {
    fail(`${where} 引用的图片不存在：public${value}`);
    return;
  }

  const size = statSync(filePath).size;
  if (size > 1.5 * 1024 * 1024) {
    warn(`${where} 的图片体积偏大（${(size / 1024 / 1024).toFixed(2)}MB）：public${value}`);
  }
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function checkSlug(where, slug, index) {
  if (!slug) {
    fail(`${where} 缺少 slug`);
    return;
  }
  if (!SLUG_RE.test(slug)) {
    fail(`${where} 的 slug 不合法：${slug}（只能用小写字母、数字和连字符）`);
  }
  if (index.has(slug)) {
    fail(`${where} 的 slug 重复：${slug}（另一个文件：${index.get(slug)}）`);
  } else {
    index.set(slug, where);
  }
}

const categories = JSON.parse(readFileSync(join(root, 'src/data/categories.json'), 'utf8')).map(
  (item) => item.id
);
const articleCategories = JSON.parse(
  readFileSync(join(root, 'src/data/article-categories.json'), 'utf8')
).map((item) => item.id);

// —— 读取全部集合 ——
const models = readCollection('models');
const prompts = readCollection('prompts');
const articles = readCollection('articles');
const videos = readCollection('videos');
const projects = readCollection('projects');

const modelSlugs = new Set(models.map((m) => m.data.slug ?? m.id));
const promptIds = new Set(prompts.map((p) => p.id));
const articleIds = new Set(articles.map((a) => a.id));
const projectIds = new Set(projects.map((p) => p.id));

const usedImages = new Map();

// —— 提示词 ——
const promptSlugs = new Map();
for (const item of prompts) {
  const where = `[提示词 ${item.file}]`;
  const d = item.data;

  checkSlug(where, d.slug, promptSlugs);

  if (d.slug && d.slug !== item.id) {
    fail(`${where} slug（${d.slug}）与文件名（${item.id}.md）不一致，网址会与后台显示不符`);
  }

  if (!d.title) fail(`${where} 缺少 title`);
  if (!d.prompt || String(d.prompt).trim().length < 10) {
    fail(`${where} 的 prompt 为空或过短（必须粘贴完整提示词）`);
  }

  if (!d.model) {
    fail(`${where} 缺少 model`);
  } else if (!modelSlugs.has(d.model)) {
    fail(`${where} 引用了不存在的模型：${d.model}`);
  }

  if (!d.category) fail(`${where} 缺少 category`);
  else if (!categories.includes(d.category)) {
    fail(`${where} 的分类不在 src/data/categories.json 中：${d.category}`);
  }

  checkImage(where, d.image, { required: true });

  if (d.image) {
    if (usedImages.has(d.image)) {
      warn(`${where} 与其他提示词共用同一张图：${d.image}（${usedImages.get(d.image)}）`);
    } else {
      usedImages.set(d.image, item.file);
    }
  }

  if (!['draft', 'published'].includes(d.status ?? 'draft')) {
    fail(`${where} 的 status 只能是 draft 或 published`);
  }

  if (!d.updated) fail(`${where} 缺少 updated（更新时间）`);

  if (d.tested === true && !d.testedAt) {
    warn(`${where} 标记为已实测但没有 testedAt（实测日期）`);
  }

  for (const related of d.relatedArticles ?? []) {
    if (!articleIds.has(related)) fail(`${where} 关联的文章不存在：${related}`);
  }
  for (const related of d.relatedProjects ?? []) {
    if (!projectIds.has(related)) fail(`${where} 关联的作品不存在：${related}`);
  }

  if ((d.status ?? 'draft') === 'published' && d.tags?.includes('示例')) {
    warn(`${where} 是示例条目且已发布，上线前记得替换成真实内容`);
  }
}

// —— 模型 ——
const modelSlugIndex = new Map();
for (const item of models) {
  const where = `[模型 ${item.file}]`;
  const d = item.data;

  checkSlug(where, d.slug, modelSlugIndex);
  if (d.slug && d.slug !== item.id) {
    fail(`${where} slug（${d.slug}）与文件名（${item.id}.md）不一致`);
  }

  if (!d.name) fail(`${where} 缺少 name`);
  if (!d.developer) fail(`${where} 缺少 developer`);
  if (!d.summary) fail(`${where} 缺少 summary`);
  if (!d.license) fail(`${where} 缺少 license`);

  for (const task of d.tasks ?? []) {
    if (!categories.includes(task)) fail(`${where} 的任务分类不存在：${task}`);
  }

  for (const url of [d.modelUrl, d.codeUrl, d.docsUrl].filter(Boolean)) {
    if (!/^https?:\/\//.test(url)) fail(`${where} 的链接格式不正确：${url}`);
  }

  if (!d.modelUrl) fail(`${where} 缺少 modelUrl（官方模型仓库链接）`);

  for (const related of d.relatedArticles ?? []) {
    if (!articleIds.has(related)) fail(`${where} 关联的文章不存在：${related}`);
  }

  if (!d.updated) fail(`${where} 缺少 updated`);
}

// —— 文章 ——
const articleSlugIndex = new Map();
for (const item of articles) {
  const where = `[文章 ${item.file}]`;
  const d = item.data;

  checkSlug(where, d.slug, articleSlugIndex);
  if (d.slug && d.slug !== item.id) {
    fail(`${where} slug（${d.slug}）与文件名（${item.id}.md）不一致`);
  }

  if (!d.title) fail(`${where} 缺少 title`);
  if (!d.summary) fail(`${where} 缺少 summary`);
  if (!d.date) fail(`${where} 缺少 date`);

  if (!d.category) fail(`${where} 缺少 category`);
  else if (!articleCategories.includes(d.category)) {
    fail(`${where} 的文章分类不存在：${d.category}`);
  }

  if (d.cover) checkImage(where, d.cover);

  for (const slug of d.models ?? []) {
    if (!modelSlugs.has(slug)) fail(`${where} 关联的模型不存在：${slug}`);
  }
  for (const id of d.prompts ?? []) {
    if (!promptIds.has(id)) fail(`${where} 关联的提示词不存在：${id}`);
  }
  for (const id of d.projects ?? []) {
    if (!projectIds.has(id)) fail(`${where} 关联的作品不存在：${id}`);
  }

  if ((d.status ?? 'draft') === 'published' && (item.body ?? '').trim().length < 80) {
    warn(`${where} 已发布但正文很短（${(item.body ?? '').trim().length} 字），确认不是迁移残留的摘要`);
  }
}

// —— 视频 ——
const videoSlugIndex = new Map();
for (const item of videos) {
  const where = `[视频 ${item.file}]`;
  const d = item.data;

  checkSlug(where, d.slug, videoSlugIndex);
  if (!d.title) fail(`${where} 缺少 title`);
  if (!d.summary) fail(`${where} 缺少 summary`);
  if (!d.videoUrl) fail(`${where} 缺少 videoUrl`);
  else if (!/^https?:\/\//.test(d.videoUrl)) fail(`${where} 的 videoUrl 不是完整链接`);
  if (!d.date) fail(`${where} 缺少 date`);

  checkImage(where, d.cover, { required: true });

  for (const slug of d.models ?? []) {
    if (!modelSlugs.has(slug)) fail(`${where} 关联的模型不存在：${slug}`);
  }
}

// —— 作品与工作流 ——
const projectSlugIndex = new Map();
for (const item of projects) {
  const where = `[作品 ${item.file}]`;
  const d = item.data;

  checkSlug(where, d.slug, projectSlugIndex);
  if (!d.title) fail(`${where} 缺少 title`);
  if (!d.summary) fail(`${where} 缺少 summary`);
  if (!d.date) fail(`${where} 缺少 date`);

  if (!['image', 'video', 'workflow'].includes(d.type ?? 'image')) {
    fail(`${where} 的 type 只能是 image / video / workflow`);
  }

  checkImage(where, d.cover, { required: true });

  for (const slug of d.models ?? []) {
    if (!modelSlugs.has(slug)) fail(`${where} 关联的模型不存在：${slug}`);
  }
  for (const id of d.prompts ?? []) {
    if (!promptIds.has(id)) fail(`${where} 关联的提示词不存在：${id}`);
  }
  for (const id of d.articles ?? []) {
    if (!articleIds.has(id)) fail(`${where} 关联的文章不存在：${id}`);
  }

  if (d.workflowFile) {
    if (!d.workflowFile.startsWith('/')) {
      fail(`${where} 的 workflowFile 必须以 / 开头`);
    } else if (!existsSync(join(publicDir, d.workflowFile.replace(/^\//, '')))) {
      fail(`${where} 引用的工作流文件不存在：public${d.workflowFile}`);
    }
  }
}

// —— 汇总 ——
const counts = {
  提示词: prompts.length,
  模型: models.length,
  文章: articles.length,
  视频: videos.length,
  作品: projects.length,
};

console.log(
  '内容统计：' +
    Object.entries(counts)
      .map(([key, value]) => `${key} ${value}`)
      .join(' · ')
);

if (warnings.length > 0) {
  console.log(`\n警告 ${warnings.length} 条：`);
  warnings.forEach((msg) => console.log(`  ! ${msg}`));
}

if (errors.length > 0) {
  console.error(`\n发现 ${errors.length} 个错误，构建已中止：`);
  errors.forEach((msg) => console.error(`  ✗ ${msg}`));
  console.error('\n修复提示：字段名与取值必须和 src/content.config.ts、.pages.yml 保持一致。');
  process.exit(1);
}

console.log('\n✓ 内容校验通过');
