/** 复制文本到剪贴板：优先用异步剪贴板 API，失败时回退到 execCommand */
export async function copyText(text: string): Promise<boolean> {
  // 1) 现代浏览器 API（需要 HTTPS 或 localhost）
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 继续尝试回退方案
    }
  }

  // 2) 兼容手机浏览器与旧版内核
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-2000px';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    const selection = document.getSelection();
    const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.select();
    textarea.setSelectionRange(0, text.length);

    const ok = document.execCommand('copy');
    textarea.remove();

    if (previous && selection) {
      selection.removeAllRanges();
      selection.addRange(previous);
    }
    return ok;
  } catch {
    return false;
  }
}

/** 轻量提示条，全站共用同一个元素 */
export function showToast(message: string, duration = 2000): void {
  let toast = document.querySelector<HTMLElement>('[data-toast]');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('data-toast', '');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.dataset.show = 'true';

  window.clearTimeout(Number(toast.dataset.timer ?? 0));
  const timer = window.setTimeout(() => {
    if (toast) toast.dataset.show = 'false';
  }, duration);
  toast.dataset.timer = String(timer);
}
