const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const encodeBtn = document.getElementById('encode-btn');
const decodeBtn = document.getElementById('decode-btn');
const swapBtn = document.getElementById('swap-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const copyFeedback = document.getElementById('copy-feedback');
const charInfo = document.getElementById('char-info');
const urlSafeCheck = document.getElementById('url-safe');

const fileInput = document.getElementById('file-input');
const fileMeta = document.getElementById('file-meta');
const copyFileBtn = document.getElementById('copy-file-btn');
const copyFileFeedback = document.getElementById('copy-file-feedback');

let lastFileBase64 = '';

// ── UTF-8 safe Base64 helpers ────────────────────────────────────────────────

function utf8ToBytes(str) {
  return new TextEncoder().encode(str);
}

function bytesToUtf8(bytes) {
  return new TextDecoder().decode(bytes);
}

function bytesToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toUrlSafe(base64) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromUrlSafe(base64) {
  let str = base64.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4 !== 0) {
    str += '=';
  }
  return str;
}

// ── Actions ────────────────────────────────────────────────────────────────────

function encodeBase64() {
  const text = inputText.value;
  if (!text) return;

  try {
    const bytes = utf8ToBytes(text);
    let base64 = bytesToBase64(bytes);
    if (urlSafeCheck.checked) {
      base64 = toUrlSafe(base64);
    }
    outputText.value = base64;
    updateCharInfo(base64.length, text.length);
  } catch (err) {
    outputText.value = 'Error: ' + err.message;
    updateCharInfo(0, 0);
  }
}

function decodeBase64() {
  const text = inputText.value.trim();
  if (!text) return;

  try {
    let base64 = text;
    // Auto-detect URL-safe by checking for - or _
    if (base64.includes('-') || base64.includes('_')) {
      base64 = fromUrlSafe(base64);
    }
    const bytes = base64ToBytes(base64);
    const decoded = bytesToUtf8(bytes);
    outputText.value = decoded;
    updateCharInfo(text.length, decoded.length);
  } catch (err) {
    outputText.value = 'Error: Invalid Base64 input. ' + err.message;
    updateCharInfo(0, 0);
  }
}

function swapFields() {
  const temp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = temp;
  updateCharInfo(inputText.value.length, outputText.value.length);
}

function updateCharInfo(inLen, outLen) {
  if (!inputText.value && !outputText.value) {
    charInfo.textContent = '';
    return;
  }
  charInfo.textContent = `Input: ${inLen.toLocaleString()} characters · Output: ${outLen.toLocaleString()} characters`;
}

// ── Event listeners ──────────────────────────────────────────────────────────

encodeBtn.addEventListener('click', encodeBase64);
decodeBtn.addEventListener('click', decodeBase64);
swapBtn.addEventListener('click', swapFields);

clearBtn.addEventListener('click', () => {
  inputText.value = '';
  outputText.value = '';
  charInfo.textContent = '';
  inputText.focus();
});

copyBtn.addEventListener('click', () => {
  const text = outputText.value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copyFeedback.style.display = '';
    setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
  });
});

inputText.addEventListener('input', () => {
  updateCharInfo(inputText.value.length, outputText.value.length);
});

// ── File encoding ────────────────────────────────────────────────────────────

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) {
    fileMeta.textContent = '';
    copyFileBtn.style.display = 'none';
    lastFileBase64 = '';
    return;
  }

  fileMeta.textContent = `Selected: ${file.name} (${formatSize(file.size)}) — reading...`;

  const reader = new FileReader();
  reader.onload = () => {
    lastFileBase64 = reader.result;
    fileMeta.innerHTML = `Encoded <strong>${file.name}</strong> (${formatSize(file.size)}) to Base64 · ${lastFileBase64.length.toLocaleString()} characters`;
    copyFileBtn.style.display = '';
  };
  reader.onerror = () => {
    fileMeta.textContent = 'Error reading file.';
    copyFileBtn.style.display = 'none';
    lastFileBase64 = '';
  };
  reader.readAsDataURL(file);
});

copyFileBtn.addEventListener('click', () => {
  if (!lastFileBase64) return;
  navigator.clipboard.writeText(lastFileBase64).then(() => {
    copyFileFeedback.style.display = '';
    setTimeout(() => { copyFileFeedback.style.display = 'none'; }, 2000);
  });
});

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
