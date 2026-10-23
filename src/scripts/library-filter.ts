/**
 * 提示词库 / 模型库的通用筛选引擎。
 *
 * 页面结构约定：
 *   <div data-library data-groups="model,category,tag,tested" data-index="/search-index/prompts.json">
 *     <article data-item data-id="slug" data-f-model="qwen-image" data-f-tags="人像|写实" data-sort="1700000000">
 *
 * 所有筛选状态都写进 URL 查询参数，方便分享与刷新保持。
 */

type Dict = Record<string, string>;

const container = document.querySelector<HTMLElement>('[data-library]');

if (container) {
  const groups = (container.dataset.groups ?? '')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);

  const items = Array.from(container.querySelectorAll<HTMLElement>('[data-item]'));
  const grid = container.querySelector<HTMLElement>('[data-grid]');
  const searchInput = container.querySelector<HTMLInputElement>('[data-filter-search]');
  const sortSelect = container.querySelector<HTMLSelectElement>('[data-sort]');
  const countEl = container.querySelector<HTMLElement>('[data-count]');
  const summaryEl = container.querySelector<HTMLElement>('[data-summary]');
  const emptyEl = container.querySelector<HTMLElement>('[data-no-result]');
  const indexUrl = container.dataset.index;

  const state: Dict = {};
  let query = '';
  let sortMode = '';

  // 分组 key → 卡片上的 data-f-* 字段名（由 FilterPanel 的 data-field 决定）
  const fieldMap: Dict = {};
  document.querySelectorAll<HTMLElement>('[data-filter-group]').forEach((el) => {
    const key = el.dataset.filterGroup;
    if (key) fieldMap[key] = el.dataset.field ?? key;
  });

  /** 完整文本（提示词正文）只在需要时按需加载 */
  let fullText: Map<string, string> | null = null;
  let indexPromise: Promise<void> | null = null;

  function loadIndex(): Promise<void> {
    if (!indexUrl || fullText) return Promise.resolve();
    if (indexPromise) return indexPromise;

    indexPromise = fetch(indexUrl)
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: Array<{ id: string; text?: string }>) => {
        fullText = new Map(rows.map((row) => [row.id, (row.text ?? '').toLowerCase()]));
      })
      .catch(() => {
        fullText = new Map();
      });

    return indexPromise;
  }

  function fieldValue(item: HTMLElement, group: string): string {
    const field = fieldMap[group] ?? group;
    const key = `f${field.charAt(0).toUpperCase()}${field.slice(1)}`;
    return (item.dataset as Dict)[key] ?? '';
  }

  function matchesGroup(item: HTMLElement, group: string): boolean {
    const value = state[group];
    if (!value) return true;
    return fieldValue(item, group)
      .split('|')
      .map((v) => v.trim())
      .includes(value);
  }

  function matchesQuery(item: HTMLElement): boolean {
    if (!query) return true;
    const needle = query.toLowerCase();

    const base = (item.dataset.search ?? '').toLowerCase();
    if (base.includes(needle)) return true;

    const id = item.dataset.id;
    if (id && fullText) {
      const text = fullText.get(id);
      if (text && text.includes(needle)) return true;
    }
    return false;
  }

  function visibleItems(): HTMLElement[] {
    return items.filter((item) => {
      for (const group of groups) {
        if (!matchesGroup(item, group)) return false;
      }
      return matchesQuery(item);
    });
  }

  function updateCounts(): void {
    const panels = document.querySelectorAll<HTMLElement>('[data-filters]');

    for (const group of groups) {
      // 统计时忽略本组自身的条件，才能看到其它选项还能筛出多少
      const pool = items.filter((item) => {
        for (const other of groups) {
          if (other === group) continue;
          if (!matchesGroup(item, other)) return false;
        }
        return true;
      });

      const counts = new Map<string, number>();
      counts.set('__all__', pool.length);

      for (const item of pool) {
        const values = fieldValue(item, group).split('|').map((v) => v.trim());
        for (const value of new Set(values.filter(Boolean))) {
          counts.set(value, (counts.get(value) ?? 0) + 1);
        }
      }

      panels.forEach((panel) => {
        panel
          .querySelectorAll<HTMLElement>(`[data-filter-group="${group}"] [data-count-for]`)
          .forEach((el) => {
            const key = el.dataset.countFor ?? '';
            el.textContent = String(counts.get(key) ?? 0);
          });
      });
    }
  }

  function applySort(list: HTMLElement[]): HTMLElement[] {
    const sorted = [...list];
    if (sortMode === 'title') {
      sorted.sort((a, b) => (a.dataset.title ?? '').localeCompare(b.dataset.title ?? '', 'zh-Hans-CN'));
    } else if (sortMode === 'oldest') {
      sorted.sort((a, b) => Number(a.dataset.sort ?? 0) - Number(b.dataset.sort ?? 0));
    } else {
      sorted.sort((a, b) => Number(b.dataset.sort ?? 0) - Number(a.dataset.sort ?? 0));
    }
    return sorted;
  }

  function apply(): void {
    const visible = visibleItems();

    items.forEach((item) => {
      item.hidden = !visible.includes(item);
    });

    if (grid) {
      applySort(visible).forEach((item) => grid.appendChild(item));
    }

    if (countEl) countEl.textContent = String(visible.length);
    // 内容本身为空时，只显示页面的空状态，不再显示「没有匹配」
    if (emptyEl) emptyEl.hidden = items.length === 0 || visible.length > 0;

    // 同步筛选按钮状态
    document.querySelectorAll<HTMLElement>('[data-filters] [data-filter-group]').forEach((groupEl) => {
      const key = groupEl.dataset.filterGroup ?? '';
      groupEl.querySelectorAll<HTMLElement>('[data-filter-option]').forEach((option) => {
        const value = option.dataset.value ?? '';
        option.setAttribute('aria-pressed', String((state[key] ?? '') === value));
      });
    });

    renderSummary();
    updateCounts();
    syncUrl();
  }

  function renderSummary(): void {
    if (!summaryEl) return;
    summaryEl.innerHTML = '';

    const labels: string[] = [];

    groups.forEach((group) => {
      const value = state[group];
      if (!value) return;

      const option = document.querySelector<HTMLElement>(
        `[data-filter-group="${group}"] [data-value="${CSS.escape(value)}"]`
      );
      const text = option?.textContent?.replace(/\s+\d+$/, '').trim() ?? value;
      labels.push(`${groupLabel(group)}：${text}`);
    });

    if (query) labels.push(`搜索：${query}`);

    labels.forEach((label, index) => {
      const chip = document.createElement('span');
      chip.className = 'chip chip--moss';
      chip.textContent = label;
      if (index === 0) summaryEl.appendChild(chip);
      else summaryEl.appendChild(chip);
    });

    if (labels.length > 0) {
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'chip chip--outline';
      reset.textContent = '清除筛选 ×';
      reset.addEventListener('click', resetAll);
      summaryEl.appendChild(reset);
    }
  }

  function groupLabel(key: string): string {
    const el = document.querySelector<HTMLElement>(`[data-filter-group="${key}"] .filter-group__title`);
    return el?.textContent?.trim() ?? key;
  }

  function syncUrl(): void {
    const params = new URLSearchParams();
    groups.forEach((group) => {
      if (state[group]) params.set(group, state[group]);
    });
    if (query) params.set('q', query);
    if (sortMode) params.set('sort', sortMode);

    const search = params.toString();
    const next = `${location.pathname}${search ? `?${search}` : ''}`;
    history.replaceState(null, '', next);
  }

  function resetAll(): void {
    groups.forEach((group) => delete state[group]);
    query = '';
    sortMode = '';
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = '';
    apply();
  }

  // —— 初始化：从 URL 读取状态 ——
  const params = new URLSearchParams(location.search);
  groups.forEach((group) => {
    const value = params.get(group);
    if (value) state[group] = value;
  });

  const initialQuery = params.get('q');
  if (initialQuery && searchInput) {
    query = initialQuery;
    searchInput.value = initialQuery;
    loadIndex().then(apply);
  }

  const initialSort = params.get('sort');
  if (initialSort && sortSelect) {
    sortMode = initialSort;
    sortSelect.value = initialSort;
  }

  // —— 事件绑定 ——
  document.querySelectorAll<HTMLElement>('[data-filters]').forEach((panel) => {
    panel.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      if (target.closest('[data-reset]')) {
        resetAll();
        return;
      }

      const option = target.closest<HTMLElement>('[data-filter-option]');
      if (!option) return;

      const groupEl = option.closest<HTMLElement>('[data-filter-group]');
      const key = groupEl?.dataset.filterGroup ?? '';
      const value = option.dataset.value ?? '';

      if (!value || state[key] === value) delete state[key];
      else state[key] = value;

      apply();
    });
  });

  let debounce = 0;
  searchInput?.addEventListener('input', () => {
    const value = searchInput.value.trim();
    window.clearTimeout(debounce);

    if (value.length > 0 && indexUrl && !fullText) {
      loadIndex().then(() => {
        query = value;
        apply();
      });
      return;
    }

    debounce = window.setTimeout(() => {
      query = value;
      apply();
    }, 160);
  });

  sortSelect?.addEventListener('change', () => {
    sortMode = sortSelect.value;
    apply();
  });

  // 移动端抽屉
  document.querySelector('[data-drawer-open]')?.addEventListener('click', () => {
    const drawer = document.querySelector<HTMLElement>('[data-drawer]');
    if (drawer) drawer.dataset.open = 'true';
    document.body.style.overflow = 'hidden';
  });

  document.querySelectorAll('[data-drawer-close]').forEach((el) => {
    el.addEventListener('click', () => {
      const drawer = document.querySelector<HTMLElement>('[data-drawer]');
      if (drawer) drawer.dataset.open = 'false';
      document.body.style.overflow = '';
    });
  });

  apply();
}
