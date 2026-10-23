import { copyText, showToast } from './clipboard';

function revealFallback(btn: HTMLElement, text: string) {
  const host = btn.closest('[data-copy-wrap]') ?? btn.parentElement;
  if (!host) return;

  let box = host.querySelector<HTMLElement>('[data-copy-fallback]');
  if (!box) {
    box = document.createElement('div');
    box.className = 'manual-copy';
    box.setAttribute('data-copy-fallback', '');
    box.innerHTML = `
      <p class="copy-hint" data-show="true">浏览器拒绝了自动复制，请长按选择下面的文本手动复制：</p>
      <textarea readonly></textarea>
    `;
    host.appendChild(box);
  }

  const textarea = box.querySelector('textarea');
  if (textarea) {
    textarea.value = text;
    textarea.focus();
    textarea.select();
  }
  box.hidden = false;
}

document.addEventListener('click', async (event) => {
  const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-copy]');
  if (!btn) return;

  event.preventDefault();
  // 阻止卡片上的链接跳转
  event.stopPropagation();

  const text = btn.dataset.copy ?? '';
  if (!text.trim()) {
    btn.dataset.state = 'error';
    showToast('这条内容没有可复制的文本');
    return;
  }

  const labelEl = btn.querySelector('[data-copy-label]');
  const originalLabel = labelEl?.textContent ?? '';

  const ok = await copyText(text);

  if (ok) {
    btn.dataset.state = 'copied';
    if (labelEl) labelEl.textContent = btn.dataset.copiedLabel ?? '已复制';
    showToast(btn.dataset.copiedLabel ? `${btn.dataset.copiedLabel} ✓` : '已复制到剪贴板 ✓');
    window.setTimeout(() => {
      btn.dataset.state = '';
      if (labelEl) labelEl.textContent = originalLabel;
    }, 1800);
  } else {
    btn.dataset.state = 'error';
    showToast('自动复制失败，已为你展开可手动复制的文本');
    revealFallback(btn, text);
    window.setTimeout(() => {
      btn.dataset.state = '';
    }, 2400);
  }
});
