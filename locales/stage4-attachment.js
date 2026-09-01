/* Agro-Zia Stage 4: canonical multilingual inquiry attachment UI. */
(() => {
  const MAX_BYTES = 1024 * 1024;
  const TYPES = new Set(['application/pdf', 'image/jpeg', 'image/jpg']);
  const copy = {
    en: { label:'Attachment (optional)', help:'PDF or JPG/JPEG, max 1 MB', invalidType:'Please attach a PDF or JPG/JPEG file.', invalidSize:'Attachment must be 1 MB or smaller.' },
    ru: { label:'Вложение (необязательно)', help:'PDF или JPG/JPEG, максимум 1 МБ', invalidType:'Прикрепите файл PDF или JPG/JPEG.', invalidSize:'Размер вложения не должен превышать 1 МБ.' },
    fa: { label:'پیوست (اختیاری)', help:'PDF یا JPG/JPEG، حداکثر ۱ مگابایت', invalidType:'لطفاً فایل PDF یا JPG/JPEG انتخاب کنید.', invalidSize:'حجم فایل پیوست باید حداکثر ۱ مگابایت باشد.' },
    ar: { label:'مرفق (اختياري)', help:'PDF أو JPG/JPEG، بحد أقصى 1 ميغابايت', invalidType:'يرجى إرفاق ملف PDF أو JPG/JPEG.', invalidSize:'يجب ألا يتجاوز حجم المرفق 1 ميغابايت.' },
    uz: { label:'Ilova (ixtiyoriy)', help:'PDF yoki JPG/JPEG, maksimal 1 MB', invalidType:'PDF yoki JPG/JPEG faylini tanlang.', invalidSize:'Ilova hajmi 1 MB yoki undan kichik bo‘lishi kerak.' },
    tr: { label:'Ek (isteğe bağlı)', help:'PDF veya JPG/JPEG, en fazla 1 MB', invalidType:'Lütfen PDF veya JPG/JPEG dosyası ekleyin.', invalidSize:'Ek dosya 1 MB veya daha küçük olmalıdır.' }
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
    label.innerHTML = `<span>${t.label}</span><input id="agz-attachment" name="attachment" type="file" accept="application/pdf,.pdf,image/jpeg,image/jpg,.jpg,.jpeg"><small style="display:block;margin-top:6px;opacity:.72">${t.help}</small>`;
    grid.appendChild(label);

    const input = label.querySelector('input[type="file"]');
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!TYPES.has(file.type) && !/\.(pdf|jpe?g)$/i.test(file.name)) {
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
