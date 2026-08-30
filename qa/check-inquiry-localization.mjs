import fs from 'node:fs';

const source = fs.readFileSync('_worker.js', 'utf8');
const languages = ['en', 'ru', 'fa', 'ar', 'uz', 'tr'];
const required = [
  'name', 'company', 'country', 'email', 'phone', 'interest',
  'specification_label', 'quantity_label', 'timing_label', 'message',
  'submit', 'contact_title', 'contact_text', 'form_note', 'note',
  'sending', 'success', 'reference', 'date', 'received', 'email_btn',
  'copy', 'error', 'required'
];

const copyStart = source.indexOf('const copy = {');
const copyEnd = source.indexOf('};\n  const errorMap', copyStart);
if (copyStart < 0 || copyEnd < 0) throw new Error('copy object not found');
const copy = source.slice(copyStart, copyEnd);

for (const lang of languages) {
  const match = copy.match(new RegExp(`\\n    ${lang}: \\{([\\s\\S]*?)\\},?\\n`));
  if (!match) throw new Error(`missing language: ${lang}`);
  for (const key of required) {
    if (!new RegExp(`(?:^|,)${key}:`).test(match[1])) {
      throw new Error(`missing ${lang}.${key}`);
    }
  }
}

console.log('PASS: all required inquiry localization keys exist for EN/RU/FA/AR/UZ/TR');
