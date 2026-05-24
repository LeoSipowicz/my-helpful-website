const inputText  = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const modeSelect = document.getElementById('mode-select');
const modeNote   = document.getElementById('mode-note');
const encodeBtn  = document.getElementById('encode-btn');
const decodeBtn  = document.getElementById('decode-btn');
const swapBtn    = document.getElementById('swap-btn');
const clearBtn   = document.getElementById('clear-btn');
const copyBtn    = document.getElementById('copy-btn');
const copyFeedback = document.getElementById('copy-feedback');
const charInfo   = document.getElementById('char-info');

function getEncoder() {
  return modeSelect.value === 'full' ? encodeURI : encodeURIComponent;
}

function getDecoder() {
  return modeSelect.value === 'full' ? decodeURI : decodeURIComponent;
}

function updateModeNote() {
  if (modeSelect.value === 'full') {
    modeNote.innerHTML = '<strong>Full URL mode</strong> preserves URL structure characters like <code>/</code>, <code>?</code>, and <code>:</code>. Use this when encoding an entire URL that contains special characters in its path or fragment.';
  } else {
    modeNote.innerHTML = '<strong>Component mode</strong> encodes almost all special characters, making it safe for use inside query parameters and form fields.';
  }
}

function encodeUrl() {
  const text = inputText.value;
  if (!text) return;
  try {
    const encoder = getEncoder();
    const result = encoder(text);
    outputText.value = result;
    updateCharInfo(text.length, result.length);
  } catch (err) {
    outputText.value = 'Error: ' + err.message;
    updateCharInfo(text.length, 0);
  }
}

function decodeUrl() {
  const text = inputText.value.trim();
  if (!text) return;
  try {
    const decoder = getDecoder();
    const result = decoder(text);
    outputText.value = result;
    updateCharInfo(text.length, result.length);
  } catch (err) {
    outputText.value = 'Error: Invalid percent-encoded input. ' + err.message;
    updateCharInfo(text.length, 0);
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
  charInfo.textContent = `Input: ${inLen.toLocaleString()} characters \u00b7 Output: ${outLen.toLocaleString()} characters`;
}

encodeBtn.addEventListener('click', encodeUrl);
decodeBtn.addEventListener('click', decodeUrl);
swapBtn.addEventListener('click', swapFields);

modeSelect.addEventListener('change', updateModeNote);

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

// Auto-detect on paste: if it looks encoded, decode; otherwise encode
inputText.addEventListener('paste', () => {
  setTimeout(() => {
    const text = inputText.value.trim();
    if (!text) return;
    // If it contains %XX sequences, likely encoded; decode it
    if (/^(%[0-9A-Fa-f]{2})+/.test(text) || text.includes('%20') || text.includes('%3A') || text.includes('%2F')) {
      decodeUrl();
    } else {
      encodeUrl();
    }
  }, 10);
});

updateModeNote();
