import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * 内容集合 = 网站里可以被独立维护的每一种资料。
 * 这里定义的字段必须与仓库根目录 `.pages.yml` 中的表单字段保持一致，
 * 否则手机端后台保存的内容会在构建时校验失败。
 *
 * 约定：
 * - status 缺省为 draft（草稿），草稿不会出现在任何列表、搜索和详情页里。
 * - slug 必须与文件名一致（Pages CMS 用 slug 生成文件名），且全站唯一。
 * - image / cover 存的是 public 目录对应的公开路径，例如 /images/prompts/xxx.webp
 */

const status = z.enum(['draft', 'published']).default('draft');

const prompts = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/README.md'], base: './src/content/prompts' }),
  schema: z.object({
    title: z.string().min(1, '标题不能为空'),
    slug: z.string().min(1, 'slug 不能为空'),
    model: z.string().min(1, '必须选择适用模型'),
    category: z.string().min(1, '必须选择任务分类'),
    image: z.string().min(1, '必须上传一张效果图'),
    prompt: z.string().min(1, '提示词正文不能为空'),
    status,
    tested: z.boolean().default(false),
    testedAt: z.coerce.date().optional(),
    version: z.string().optional(),
    tags: z.array(z.string()).default([]),
    style: z.string().optional(),
    negative: z.string().optional(),
    params: z.string().optional(),
    relatedArticles: z.array(z.string()).default([]),
    relatedProjects: z.array(z.string()).default([]),
    updated: z.coerce.date(),
  }),
});

const models = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/README.md'], base: './src/content/models' }),
  schema: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    developer: z.string().min(1),
    summary: z.string().min(1),
    tasks: z.array(z.string()).default([]),
    runtimes: z.array(z.string()).default([]),
    license: z.string().min(1),
    licenseName: z.string().optional(),
    licenseNote: z.string().optional(),
    params: z.string().optional(),
    hardware: z.string().optional(),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    modelUrl: z.string().url(),
    codeUrl: z.string().url().optional(),
    docsUrl: z.string().url().optional(),
    status,
    tags: z.array(z.string()).default([]),
    relatedArticles: z.array(z.string()).default([]),
    updated: z.coerce.date(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/README.md'], base: './src/content/articles' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    summary: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    cover: z.string().optional(),
    models: z.array(z.string()).default([]),
    prompts: z.array(z.string()).default([]),
    projects: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    status,
  }),
});

const videos = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/README.md'], base: './src/content/videos' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    summary: z.string().min(1),
    cover: z.string().min(1),
    videoUrl: z.string().url(),
    platform: z.string().default('其他'),
    duration: z.string().optional(),
    models: z.array(z.string()).default([]),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date(),
    status,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/README.md'], base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    summary: z.string().min(1),
    cover: z.string().min(1),
    type: z.enum(['image', 'video', 'workflow']).default('image'),
    models: z.array(z.string()).default([]),
    prompts: z.array(z.string()).default([]),
    articles: z.array(z.string()).default([]),
    videoUrl: z.string().url().optional(),
    workflowFile: z.string().optional(),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date(),
    status,
  }),
});

export const collections = { prompts, models, articles, videos, projects };
