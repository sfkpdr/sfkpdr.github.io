import {
  getPrompts,
  getModels,
  getArticles,
  getVideos,
  getProjects,
  categoryName,
  articleCategoryName,
  formatDate,
} from './content';

export type SearchEntry = {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  meta: string;
  tags: string[];
  thumb?: string;
  /** 参与匹配的全部文本（小写化在前端做） */
  text: string;
  external?: boolean;
};

/** 把 Markdown 正文压成纯文本，供搜索匹配使用 */
function plain(markdown: string, limit = 4000): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}

function flat(text: string, limit = 120): string {
  const value = text.replace(/\s+/g, ' ').trim();
  return value.length > limit ? `${value.slice(0, limit)}…` : value;
}

export async function buildPromptIndex(): Promise<SearchEntry[]> {
  const [prompts, models] = await Promise.all([getPrompts(), getModels()]);
  const modelIndex = new Map(models.map((m) => [m.data.slug, m]));

  return prompts.map((prompt) => {
    const d = prompt.data;
    const modelName = modelIndex.get(d.model)?.data.name ?? d.model;
    return {
      id: prompt.id,
      title: d.title,
      url: `/prompts/${prompt.id}/`,
      excerpt: flat(d.prompt, 150),
      meta: `${modelName} · ${categoryName(d.category)}`,
      tags: d.tags,
      thumb: d.image,
      text: [d.title, d.prompt, d.negative ?? '', modelName, categoryName(d.category), d.tags.join(' ')].join(' '),
    };
  });
}

export async function buildModelIndex(): Promise<SearchEntry[]> {
  const models = await getModels();
  return models.map((model) => {
    const d = model.data;
    return {
      id: d.slug,
      title: d.name,
      url: `/models/${d.slug}/`,
      excerpt: flat(d.summary, 150),
      meta: `${d.developer} · ${d.license}`,
      tags: d.tags,
      text: [d.name, d.developer, d.summary, d.license, d.tasks.map(categoryName).join(' '), plain(model.body ?? '', 2000), d.tags.join(' ')].join(' '),
    };
  });
}

export async function buildArticleIndex(): Promise<SearchEntry[]> {
  const articles = await getArticles();
  return articles.map((article) => {
    const d = article.data;
    return {
      id: article.id,
      title: d.title,
      url: `/articles/${article.id}/`,
      excerpt: flat(d.summary, 150),
      meta: `${articleCategoryName(d.category)} · ${formatDate(d.date)}`,
      tags: d.tags,
      thumb: d.cover,
      text: [d.title, d.summary, d.tags.join(' '), plain(article.body ?? '')].join(' '),
    };
  });
}

export async function buildVideoIndex(): Promise<SearchEntry[]> {
  const videos = await getVideos();
  return videos.map((video) => {
    const d = video.data;
    return {
      id: video.id,
      title: d.title,
      url: d.videoUrl,
      excerpt: flat(d.summary, 150),
      meta: `${d.platform} · ${formatDate(d.date)}`,
      tags: d.tags,
      thumb: d.cover,
      text: [d.title, d.summary, d.platform, d.tags.join(' ')].join(' '),
      external: true,
    };
  });
}

export async function buildProjectIndex(): Promise<SearchEntry[]> {
  const projects = await getProjects();
  const typeLabels: Record<string, string> = { image: '图像作品', video: '视频作品', workflow: '工作流' };
  return projects.map((project) => {
    const d = project.data;
    return {
      id: project.id,
      title: d.title,
      url: `/projects/${project.id}/`,
      excerpt: flat(d.summary, 150),
      meta: `${typeLabels[d.type] ?? d.type} · ${formatDate(d.date)}`,
      tags: d.tags,
      thumb: d.cover,
      text: [d.title, d.summary, d.tags.join(' '), plain(project.body ?? '', 2000)].join(' '),
    };
  });
}

export const builders = {
  prompts: buildPromptIndex,
  models: buildModelIndex,
  articles: buildArticleIndex,
  videos: buildVideoIndex,
  projects: buildProjectIndex,
};
