const inputText  = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const encodeBtn  = document.getElementById('encode-btn');
const decodeBtn  = document.getElementById('decode-btn');
const swapBtn    = document.getElementById('swap-btn');
const clearBtn   = document.getElementById('clear-btn');
const copyBtn    = document.getElementById('copy-btn');
const copyFeedback = document.getElementById('copy-feedback');
const charInfo   = document.getElementById('char-info');
const modeSelect = document.getElementById('mode-select');
const modeNote   = document.getElementById('mode-note');

// Named entity map for encoding (common chars)
const NAMED_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Reverse map for named decoding
const NAMED_DECODE = {};
for (const [k, v] of Object.entries(NAMED_ENTITIES)) {
  NAMED_DECODE[v] = k;
}

function encodeHtml(text) {
  if (modeSelect.value === 'named') {
    // Encode common chars as named entities, rest as numeric
    let result = '';
    for (const ch of text) {
      if (NAMED_ENTITIES[ch]) {
        result += NAMED_ENTITIES[ch];
      } else if (ch.charCodeAt(0) > 127) {
        result += '&#' + ch.charCodeAt(0) + ';';
      } else {
        result += ch;
      }
    }
    return result;
  }
  // numeric-all: encode everything as numeric entities
  let result = '';
  for (const ch of text) {
    result += '&#' + ch.charCodeAt(0) + ';';
  }
  return result;
}

function decodeHtml(text) {
  // Decode named entities first, then numeric
  let result = text;

  // Named entities (longest first to avoid partial matches)
  const namedKeys = Object.keys(NAMED_DECODE).sort((a, b) => b.length - a.length);
  for (const key of namedKeys) {
    result = result.split(key).join(NAMED_DECODE[key]);
  }

  // Numeric entities: &#123; or &#x7B;
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  result = result.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  return result;
}

function encodeHtmlEntities() {
  const text = inputText.value;
  if (!text) return;
  const result = encodeHtml(text);
  outputText.value = result;
  updateCharInfo(text.length, result.length);
}

function decodeHtmlEntities() {
  const text = inputText.value.trim();
  if (!text) return;
  const result = decodeHtml(text);
  outputText.value = result;
  updateCharInfo(text.length, result.length);
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

function updateModeNote() {
  if (modeSelect.value === 'named') {
    modeNote.innerHTML = '<strong>Named mode</strong> uses human-readable entity names like <code>&amp;lt;</code> and <code>&amp;gt;</code> for common symbols, and numeric codes for other characters. Best for readability.';
  } else {
    modeNote.innerHTML = '<strong>Numeric-all mode</strong> encodes every character as a numeric entity (e.g., <code>&amp;#72;</code>). Useful for obfuscation or when you need every character encoded.';
  }
}

encodeBtn.addEventListener('click', encodeHtmlEntities);
decodeBtn.addEventListener('click', decodeHtmlEntities);
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

// Auto-detect on paste: if it looks like HTML entities, decode; otherwise encode
inputText.addEventListener('paste', () => {
  setTimeout(() => {
    const text = inputText.value.trim();
    if (!text) return;
    // If it contains &amp; &lt; &gt; &#nnn; or &xHH; patterns, likely encoded
    if (/&(?:amp|lt|gt|quot|#39|#\d+|#x[0-9A-Fa-f]+);/.test(text)) {
      decodeHtmlEntities();
    } else {
      encodeHtmlEntities();
    }
  }, 10);
});

updateModeNote();
