const generateBtn = document.getElementById('generate-btn');
const uuidDisplay = document.getElementById('uuid-display');
const countSlider = document.getElementById('count-slider');
const countVal = document.getElementById('count-val');
const copyBtn = document.getElementById('copy-btn');
const copyAllBtn = document.getElementById('copy-all-btn');
const copyFeedback = document.getElementById('copy-feedback');
const copyAllFeedback = document.getElementById('copy-all-feedback');
const uppercaseCheck = document.getElementById('uppercase');
const hyphensCheck = document.getElementById('hyphens');
const uuidList = document.getElementById('uuid-list');
const uuidCount = document.getElementById('uuid-count');

function generateUuidV4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
}

function formatUuid(uuid) {
  let result = uuid;
  if (!hyphensCheck.checked) {
    result = result.replace(/-/g, '');
  }
  if (uppercaseCheck.checked) {
    result = result.toUpperCase();
  }
  return result;
}

function generate() {
  const count = parseInt(countSlider.value, 10);
  const uuids = [];
  for (let i = 0; i < count; i++) {
    uuids.push(formatUuid(generateUuidV4()));
  }
  uuidList.innerHTML = uuids.map(u => `<li><code>${u}</code></li>`).join('');
  uuidDisplay.textContent = uuids[0];
  uuidCount.textContent = `${count} UUID${count > 1 ? 's' : ''}`;
}

countSlider.addEventListener('input', () => {
  countVal.textContent = countSlider.value;
});

generateBtn.addEventListener('click', generate);

copyBtn.addEventListener('click', () => {
  const text = uuidDisplay.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copyFeedback.style.display = '';
    setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
  }).catch(() => {});
});

copyAllBtn.addEventListener('click', () => {
  const items = uuidList.querySelectorAll('li code');
  if (!items.length) return;
  const text = Array.from(items).map(el => el.textContent).join('\n');
  navigator.clipboard.writeText(text).then(() => {
    copyAllFeedback.style.display = '';
    setTimeout(() => { copyAllFeedback.style.display = 'none'; }, 2000);
  }).catch(() => {});
});

uppercaseCheck.addEventListener('change', generate);
hyphensCheck.addEventListener('change', generate);

generate();
