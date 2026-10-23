import { getCollection, type CollectionEntry } from 'astro:content';
import categoriesData from '../data/categories.json';
import articleCategoriesData from '../data/article-categories.json';
import siteData from '../data/site.json';

export const site = siteData;

export type TaskCategory = { id: string; name: string; description: string; icon: string; order: number };
export type ArticleCategory = { id: string; name: string; description: string; order: number };

export const taskCategories = categoriesData as TaskCategory[];
export const articleCategories = articleCategoriesData as ArticleCategory[];

export type Prompt = CollectionEntry<'prompts'>;
export type Model = CollectionEntry<'models'>;
export type Article = CollectionEntry<'articles'>;
export type Video = CollectionEntry<'videos'>;
export type Project = CollectionEntry<'projects'>;

export const categoryName = (id: string) =>
  taskCategories.find((c) => c.id === id)?.name ?? id;

export const categoryIcon = (id: string) =>
  taskCategories.find((c) => c.id === id)?.icon ?? 'box';

export const articleCategoryName = (id: string) =>
  articleCategories.find((c) => c.id === id)?.name ?? id;

export const byDateDesc = <T extends { data: { date: Date } }>(a: T, b: T) =>
  b.data.date.valueOf() - a.data.date.valueOf();

/** 只取已发布内容：草稿永远不进列表、搜索索引和详情页 */
export async function getPrompts(): Promise<Prompt[]> {
  const items = await getCollection('prompts', ({ data }) => data.status === 'published');
  return items.sort((a, b) => b.data.updated.valueOf() - a.data.updated.valueOf());
}

export async function getModels(): Promise<Model[]> {
  const items = await getCollection('models', ({ data }) => data.status === 'published');
  return items.sort((a, b) => a.data.name.localeCompare(b.data.name, 'zh-Hans-CN'));
}

export async function getArticles(): Promise<Article[]> {
  const items = await getCollection('articles', ({ data }) => data.status === 'published');
  return items.sort(byDateDesc);
}

export async function getVideos(): Promise<Video[]> {
  const items = await getCollection('videos', ({ data }) => data.status === 'published');
  return items.sort(byDateDesc);
}

export async function getProjects(): Promise<Project[]> {
  const items = await getCollection('projects', ({ data }) => data.status === 'published');
  return items.sort(byDateDesc);
}

/** slug -> 展示名，用于把 model id 换成模型名 */
export async function getModelIndex(): Promise<Map<string, Model>> {
  const models = await getModels();
  return new Map(models.map((m) => [m.data.slug, m]));
}

/** 把 model slug 列表转成模型条目，自动跳过找不到的 */
export function pickModels(slugs: string[], index: Map<string, Model>): Model[] {
  return slugs
    .map((slug) => index.get(slug))
    .filter((model): model is Model => Boolean(model));
}

export function formatDate(date?: Date): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.valueOf())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 卡片上的提示词预览：压掉多余空白，截断到指定长度 */
export function excerpt(text: string, max = 90): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

/** 「键: 值」逐行解析生成参数，用于详情页的表格展示 */
export function parseParams(raw?: string): Array<{ key: string; value: string }> {
  if (!raw) return [];
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const idx = line.search(/[:：=]/);
      if (idx === -1) return { key: line, value: '' };
      return {
        key: line.slice(0, idx).trim(),
        value: line.slice(idx + 1).trim(),
      };
    })
    .filter((p) => p.key);
}

export const promptUrl = (p: Prompt) => `/prompts/${p.id}/`;
export const modelUrl = (m: Model) => `/models/${m.data.slug}/`;
export const articleUrl = (a: Article) => `/articles/${a.id}/`;
export const projectUrl = (p: Project) => `/projects/${p.id}/`;

export const runtimeOptions = [
  'ComfyUI',
  'Diffusers',
  'Transformers',
  'llama.cpp',
  'Ollama',
  '其他',
];
