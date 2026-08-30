(() => {
  const form = document.getElementById('rfq');
  if (!form) return;

  const submit = document.getElementById('submit-btn');
  const result = document.getElementById('result');
  if (!submit || !result) return;

  const fileField = document.createElement('div');
  fileField.className = 'field full inquiry-attachment';
  fileField.innerHTML = `
    <label for="inquiry-file">Attachment <span class="required-mark">*</span> <span class="attachment-hint">PDF or JPG, max 1 MB</span></label>
    <input id="inquiry-file" type="file" accept="application/pdf,image/jpeg" aria-describedby="inquiry-file-note">
    <p id="inquiry-file-note" class="note">Attach specifications, certificates, drawings or product images when useful.</p>
  `;
  const grid = form.querySelector('.grid2');
  if (grid) grid.appendChild(fileField);

  const style = document.createElement('style');
  style.textContent = `
    .inquiry-attachment{margin-top:4px}
    .required-mark{font-weight:900;color:#b42318}
    .attachment-hint{font-weight:500;color:#60766b;font-size:12px}
    #inquiry-file{padding:10px;background:#f8fbf9;border:1px dashed #8eab9c;border-radius:10px}
    #inquiry-file:focus{outline:3px solid rgba(20,91,59,.18);border-color:#145b3b}
    #submit-btn{font-size:15px;padding:14px 24px;border-radius:11px;box-shadow:0 6px 18px rgba(20,91,59,.22);letter-spacing:.1px}
    #submit-btn:hover{transform:translateY(-1px);box-shadow:0 9px 22px rgba(20,91,59,.28)}
    label[for="product"]::after,label[for="email"]::after,label[for="phone"]::after{content:""}
  `;
  document.head.appendChild(style);

  const productLabel = document.querySelector('label[for="product"]');
  if (productLabel && !productLabel.textContent.includes('*')) productLabel.insertAdjacentHTML('beforeend', ' <span class="required-mark">*</span>');
  const contactNote = document.createElement('p');
  contactNote.className = 'note';
  contactNote.textContent = 'At least one contact method is required: Email or Phone / WhatsApp.';
  const phoneField = document.getElementById('phone')?.closest('.field');
  if (phoneField) phoneField.appendChild(contactNote);

  const copyFile = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (submit.dataset.busy === '1') return;

    const value = id => document.getElementById(id)?.value.trim() || '';
    const product = value('product');
    const email = value('email');
    const phone = value('phone');
    const file = document.getElementById('inquiry-file')?.files?.[0] || null;

    if (!product) {
      result.className = 'result error show';
      result.textContent = 'Please complete the required Product / category field.';
      document.getElementById('product')?.focus();
      return;
    }
    if (!email && !phone) {
      result.className = 'result error show';
      result.textContent = 'Please provide at least one contact method: Email or Phone / WhatsApp.';
      document.getElementById('email')?.focus();
      return;
    }
    if (file && file.size > 1024 * 1024) {
      result.className = 'result error show';
      result.textContent = 'The attachment must be 1 MB or smaller.';
      return;
    }

    submit.dataset.busy = '1';
    submit.disabled = true;
    result.className = 'result show';
    result.textContent = 'Submitting inquiry...';

    try {
      const attachment = file ? {
        name: file.name.slice(0, 180),
        type: file.type,
        size: file.size,
        data_base64: await copyFile(file)
      } : null;

      const data = {
        language: new URLSearchParams(location.search).get('lang') || 'en',
        product,
        company: value('company'),
        specification: value('spec'),
        quantity: value('quantity'),
        destination: value('destination'),
        timing: value('timing'),
        email,
        phone,
        message: value('message'),
        attachment
      };

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {'Content-Type':'application/json','Accept':'application/json'},
        cache: 'no-store',
        body: JSON.stringify(data)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok !== true) throw new Error(payload.error || 'request_failed');

      result.className = 'result show';
      result.innerHTML = `<strong>Inquiry submitted successfully</strong><p>Request Reference: <span class="ref"><strong>${String(payload.request_number || '')}</strong></span></p><p>Your inquiry has been received. Please keep this reference number.</p>${attachment ? '<p>Attachment received: <strong>'+String(attachment.name).replace(/[<>]/g,'')+'</strong></p>' : ''}`;
      form.querySelectorAll('input,textarea,button').forEach(el => { if (el !== submit) el.disabled = true; });
      submit.style.display = 'none';
      result.scrollIntoView({behavior:'smooth',block:'center'});
    } catch (error) {
      result.className = 'result error show';
      result.textContent = 'Unable to submit: ' + (error.message || 'request_failed');
      submit.dataset.busy = '0';
      submit.disabled = false;
    }
  }, true);
})();
