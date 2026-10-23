// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 站点部署在 GitHub Pages 的用户主页仓库（sfkpdr.github.io），
// 因此站点地址是根域名下的根路径，不需要设置 base。
export default defineConfig({
  site: 'https://sfkpdr.github.io',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // 搜索索引、管理入口、404 不进 sitemap
      filter: (page) =>
        !page.includes('/search-index/') &&
        !page.includes('/admin/') &&
        !page.includes('/404'),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
  devToolbar: { enabled: false },
});
