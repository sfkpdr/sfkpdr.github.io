import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getArticles, site } from '../lib/content';

export const GET: APIRoute = async (context) => {
  const articles = await getArticles();

  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? site.url,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.summary,
      pubDate: article.data.date,
      link: `/articles/${article.id}/`,
      categories: [article.data.category, ...article.data.tags],
    })),
    customData: '<language>zh-cn</language>',
  });
};
