/* Agro-Zia Stage 11: canonical multilingual inquiry attachment UI and validation. */
(() => {
  const MAX_BYTES = 1024 * 1024;
  const TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]);
  const EXTENSIONS = /\.(pdf|doc|docx|txt|jpe?g|png|webp)$/i;
  const copy = {
    en: { label:'Attachment (optional)', help:'PDF, DOC, DOCX, TXT, JPG/JPEG, PNG or WEBP, max 1 MB', invalidType:'Please attach a PDF, DOC, DOCX, TXT, JPG/JPEG, PNG or WEBP file.', invalidSize:'Attachment must be 1 MB or smaller.' },
    ru: { label:'Вложение (необязательно)', help:'PDF, DOC, DOCX, TXT, JPG/JPEG, PNG или WEBP, максимум 1 МБ', invalidType:'Прикрепите файл PDF, DOC, DOCX, TXT, JPG/JPEG, PNG или WEBP.', invalidSize:'Размер вложения не должен превышать 1 МБ.' },
    fa: { label:'پیوست (اختیاری)', help:'PDF، DOC، DOCX، TXT، JPG/JPEG، PNG یا WEBP، حداکثر ۱ مگابایت', invalidType:'لطفاً فایل PDF، DOC، DOCX، TXT، JPG/JPEG، PNG یا WEBP انتخاب کنید.', invalidSize:'حجم فایل پیوست باید حداکثر ۱ مگابایت باشد.' },
    ar: { label:'مرفق (اختياري)', help:'PDF أو DOC أو DOCX أو TXT أو JPG/JPEG أو PNG أو WEBP، بحد أقصى 1 ميغابايت', invalidType:'يرجى إرفاق ملف PDF أو DOC أو DOCX أو TXT أو JPG/JPEG أو PNG أو WEBP.', invalidSize:'يجب ألا يتجاوز حجم المرفق 1 ميغابايت.' },
    uz: { label:'Ilova (ixtiyoriy)', help:'PDF, DOC, DOCX, TXT, JPG/JPEG, PNG yoki WEBP, maksimal 1 MB', invalidType:'PDF, DOC, DOCX, TXT, JPG/JPEG, PNG yoki WEBP faylini tanlang.', invalidSize:'Ilova hajmi 1 MB yoki undan kichik bo‘lishi kerak.' },
    tr: { label:'Ek (isteğe bağlı)', help:'PDF, DOC, DOCX, TXT, JPG/JPEG, PNG veya WEBP, en fazla 1 MB', invalidType:'Lütfen PDF, DOC, DOCX, TXT, JPG/JPEG, PNG veya WEBP dosyası ekleyin.', invalidSize:'Ek dosya 1 MB veya daha küçük olmalıdır.' }
  };

  const active = window.AgroZiaActiveLanguage || new URLSearchParams(location.search).get('lang') || 'en';
  const t = copy[active] || copy.en;

  function install() {
    const form = document.getElementById('canonical-inquiry-form');
    if (!form || form.dataset.stage4Attachment === 'true') return Boolean(form);

    const grid = form.querySelector('.form-grid');
    if (!grid) return false;

    form.dataset.stage4Attachment = 'true';
    const label = document.createElement('label');
    label.className = 'full';
    label.innerHTML = `<span>${t.label}</span><input id="agz-attachment" name="attachment" type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/jpeg,image/png,image/webp,.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"><small style="display:block;margin-top:6px;opacity:.72">${t.help}</small>`;
    grid.appendChild(label);

    const input = label.querySelector('input[type="file"]');
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      if ((!TYPES.has(file.type) && file.type) || !EXTENSIONS.test(file.name || '')) {
        input.value = '';
        window.alert(t.invalidType);
        return;
      }
      if (file.size > MAX_BYTES) {
        input.value = '';
        window.alert(t.invalidSize);
      }
    });

    return true;
  }

  function wait() {
    if (install()) return;
    const observer = new MutationObserver(() => { if (install()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList:true, subtree:true });
    setTimeout(() => observer.disconnect(), 10000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
