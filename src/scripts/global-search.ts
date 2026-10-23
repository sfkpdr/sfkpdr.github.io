/**
 * 全站搜索：读取构建时生成的分类型索引（/search-index/*.json），
 * 在浏览器里做子串匹配，中文不需要分词，输入一个字就能命中。
 */

type SearchEntry = {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  meta: string;
  tags: string[];
  thumb?: string;
  text: string;
  external?: boolean;
};

type Index = SearchEntry & { textLower: string; titleLower: string };

const TYPES = ['prompts', 'models', 'articles', 'videos', 'projects'] as const;
type TypeKey = (typeof TYPES)[number];

const root = document.querySelector<HTMLElement>('[data-search-page]');
const input = root?.querySelector<HTMLInputElement>('[data-search-page-input]');
const statusEl = root?.querySelector<HTMLElement>('[data-search-status]');
const resultsEl = root?.querySelector<HTMLElement>('[data-search-results]');
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-search-type]'));

const cache = new Map<TypeKey, Index[]>();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text: string, terms: string[]): string {
  let html = escapeHtml(text);
  for (const term of terms) {
    if (!term) continue;
    const re = new RegExp(`(${escapeRegExp(escapeHtml(term))})`, 'gi');
    html = html.replace(re, '<mark>$1</mark>');
  }
  return html;
}

async function load(type: TypeKey): Promise<Index[]> {
  if (cache.has(type)) return cache.get(type)!;

  try {
    const res = await fetch(`/search-index/${type}.json`);
    const rows = (await res.json()) as SearchEntry[];
    const mapped = rows.map((row) => ({
      ...row,
      textLower: `${row.title} ${row.text} ${row.tags.join(' ')} ${row.meta}`.toLowerCase(),
      titleLower: row.title.toLowerCase(),
    }));
    cache.set(type, mapped);
    return mapped;
  } catch {
    cache.set(type, []);
    return [];
  }
}

function score(row: Index, terms: string[]): number {
  let total = 0;
  for (const term of terms) {
    if (row.titleLower.includes(term)) total += 8;
    if (row.tags.some((tag) => tag.toLowerCase().includes(term))) total += 4;
    if (row.textLower.includes(term)) total += 2;
  }
  return total;
}

function renderGroup(label: string, rows: Index[], terms: string[]): string {
  if (rows.length === 0) return '';

  const items = rows
    .map(
      (row) => `
      <a class="result" href="${row.url}"${row.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
        ${
          row.thumb
            ? `<img class="result__thumb" src="${row.thumb}" alt="" loading="lazy" />`
            : ''
        }
        <div class="result__main">
          <div class="result__title">${highlight(row.title, terms)}</div>
          <div class="result__excerpt">${highlight(row.excerpt, terms)}</div>
          <div class="result__meta"><span>${escapeHtml(row.meta)}</span>${
            row.tags.length > 0 ? `<span>${escapeHtml(row.tags.slice(0, 3).join(' · '))}</span>` : ''
          }</div>
        </div>
      </a>`
    )
    .join('');

  return `
    <section class="search-group">
      <div class="search-group__head">${label} · ${rows.length}</div>
      <div class="result-list">${items}</div>
    </section>`;
}

function labels(): Record<TypeKey, string> {
  const map = {} as Record<TypeKey, string>;
  tabs.forEach((tab) => {
    const key = tab.dataset.searchType as string | undefined;
    if (key && key !== 'all' && (TYPES as readonly string[]).includes(key)) {
      map[key as TypeKey] = tab.dataset.label ?? key;
    }
  });
  return map;
}

let currentType: string = 'all';
let requestId = 0;

async function run(query: string): Promise<void> {
  if (!resultsEl || !statusEl) return;

  const q = query.trim();

  if (!q) {
    resultsEl.innerHTML = '';
    statusEl.textContent = '输入关键词开始搜索，可以搜标题、提示词正文、模型名或标签。';
    tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.searchType === currentType)));
    return;
  }

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const targetTypes = currentType === 'all' ? TYPES : ([currentType] as TypeKey[]);
  const myRequest = ++requestId;

  statusEl.textContent = '搜索中…';

  const bundles = await Promise.all(targetTypes.map(async (type) => ({ type, rows: await load(type) })));
  if (myRequest !== requestId) return;

  const limit = currentType === 'all' ? 6 : 60;
  const labelMap = labels();
  let total = 0;
  let html = '';

  for (const { type, rows } of bundles) {
    const matched = rows
      .filter((row) => terms.every((term) => row.textLower.includes(term)))
      .map((row) => ({ row, score: score(row, terms) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.row);

    total += matched.length;
    html += renderGroup(labelMap[type] ?? type, matched, terms);
  }

  resultsEl.innerHTML = html;
  statusEl.textContent =
    total > 0
      ? `找到 ${total} 条结果${currentType === 'all' ? '（每类最多显示 6 条，可切换到具体分类）' : ''}`
      : `没有找到「${q}」相关的内容，换个词试试。`;

  tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.searchType === currentType)));
  syncUrl(q);
}

function syncUrl(q: string): void {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (currentType && currentType !== 'all') params.set('type', currentType);
  const search = params.toString();
  history.replaceState(null, '', `${location.pathname}${search ? `?${search}` : ''}`);
}

// —— 初始化 ——
if (root && input && resultsEl && statusEl) {
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('q') ?? '';
  const initialType = params.get('type') ?? 'all';

  currentType = initialType;
  input.value = initialQuery;

  // 输入即搜（带极短防抖）
  let timer = 0;
  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => run(input.value), 180);
  });

  // 回车不刷新页面
  input.closest('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    run(input.value);
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      currentType = tab.dataset.searchType ?? 'all';
      run(input.value);
    });
  });

  run(initialQuery);
  if (!initialQuery) input.focus();
}
