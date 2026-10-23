import { copyText, showToast } from './clipboard';

/** 1) 给正文里的每个代码块加上「复制」按钮 */
const codeBlocks = document.querySelectorAll<HTMLPreElement>('.prose pre');

codeBlocks.forEach((pre) => {
  if (pre.querySelector('.code-copy')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy';
  button.textContent = '复制';

  button.addEventListener('click', async (event) => {
    event.preventDefault();
    const code = pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
    const ok = await copyText(code);

    if (ok) {
      button.dataset.state = 'copied';
      button.textContent = '已复制';
      showToast('代码已复制 ✓');
      window.setTimeout(() => {
        button.dataset.state = '';
        button.textContent = '复制';
      }, 1600);
    } else {
      showToast('复制失败，请长按选择代码手动复制');
    }
  });

  pre.appendChild(button);
});

/** 2) 目录滚动高亮 */
const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.doc__toc a'));
const headings = tocLinks
  .map((link) => {
    const id = decodeURIComponent(link.hash.replace('#', ''));
    const el = id ? document.getElementById(id) : null;
    return el ? { el, link } : null;
  })
  .filter(Boolean) as Array<{ el: HTMLElement; link: HTMLAnchorElement }>;

if (headings.length > 0) {
  const setActive = (target: HTMLElement) => {
    headings.forEach(({ el, link }) => {
      link.classList.toggle('is-active', el === target);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible[0]) {
        const match = headings.find(({ el }) => el === visible[0].target);
        if (match) setActive(match.el);
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  );

  headings.forEach(({ el }) => observer.observe(el));
}
