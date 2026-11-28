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

// Characters that get a readable named entity in Named mode.
const NAMED_ENCODE = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '\u00A0': '&nbsp;',
  '\u00A1': '&iexcl;',
  '\u00A2': '&cent;',
  '\u00A3': '&pound;',
  '\u00A4': '&curren;',
  '\u00A5': '&yen;',
  '\u00A6': '&brvbar;',
  '\u00A7': '&sect;',
  '\u00A8': '&uml;',
  '\u00A9': '&copy;',
  '\u00AA': '&ordf;',
  '\u00AB': '&laquo;',
  '\u00AC': '&not;',
  '\u00AD': '&shy;',
  '\u00AE': '&reg;',
  '\u00AF': '&macr;',
  '\u00B0': '&deg;',
  '\u00B1': '&plusmn;',
  '\u00B2': '&sup2;',
  '\u00B3': '&sup3;',
  '\u00B4': '&acute;',
  '\u00B5': '&micro;',
  '\u00B6': '&para;',
  '\u00B7': '&middot;',
  '\u00B8': '&cedil;',
  '\u00B9': '&sup1;',
  '\u00BA': '&ordm;',
  '\u00BB': '&raquo;',
  '\u00BC': '&frac14;',
  '\u00BD': '&frac12;',
  '\u00BE': '&frac34;',
  '\u00BF': '&iquest;',
  '\u00D7': '&times;',
  '\u00F7': '&divide;',
  '\u2013': '&ndash;',
  '\u2014': '&mdash;',
  '\u2018': '&lsquo;',
  '\u2019': '&rsquo;',
  '\u201A': '&sbquo;',
  '\u201C': '&ldquo;',
  '\u201D': '&rdquo;',
  '\u201E': '&bdquo;',
  '\u2020': '&dagger;',
  '\u2021': '&Dagger;',
  '\u2022': '&bull;',
  '\u2026': '&hellip;',
  '\u2030': '&permil;',
  '\u2032': '&prime;',
  '\u2033': '&Prime;',
  '\u2039': '&lsaquo;',
  '\u203A': '&rsaquo;',
  '\u20AC': '&euro;',
  '\u2122': '&trade;',
  '\u2190': '&larr;',
  '\u2191': '&uarr;',
  '\u2192': '&rarr;',
  '\u2193': '&darr;',
  '\u2194': '&harr;',
  '\u2212': '&minus;',
  '\u221E': '&infin;',
  '\u2260': '&ne;',
  '\u2264': '&le;',
  '\u2265': '&ge;',
  '\u221A': '&radic;',
};

// Reverse map for decoding, plus a few aliases that are decode-only.
const NAMED_DECODE = {};
for (const [ch, entity] of Object.entries(NAMED_ENCODE)) {
  NAMED_DECODE[entity] = ch;
}
NAMED_DECODE['&apos;'] = "'";
NAMED_DECODE['&ensp;'] = '\u2002';
NAMED_DECODE['&emsp;'] = '\u2003';
NAMED_DECODE['&thinsp;'] = '\u2009';
NAMED_DECODE['&lowast;'] = '\u2217';

const KNOWN_ENTITIES = Object.keys(NAMED_DECODE);

function encodeHtml(text) {
  if (modeSelect.value === 'named') {
    // Encode common characters as named entities, other non-ASCII as numeric
    let result = '';
    for (const ch of text) {
      if (NAMED_ENCODE[ch]) {
        result += NAMED_ENCODE[ch];
      } else if (ch.codePointAt(0) > 127) {
        result += '&#' + ch.codePointAt(0) + ';';
      } else {
        result += ch;
      }
    }
    return result;
  }
  // numeric-all: encode every code point as a numeric entity
  let result = '';
  for (const ch of text) {
    result += '&#' + ch.codePointAt(0) + ';';
  }
  return result;
}

function decodeHtml(text) {
  // Single pass so an entity that decodes to another entity string is not
  // decoded twice, and so code points above the BMP decode correctly.
  return text.replace(/&(?:#(\d+)|#[xX]([0-9A-Fa-f]+)|([a-zA-Z][a-zA-Z0-9]+));/g, (match, dec, hex, name) => {
    if (dec !== undefined) {
      const code = parseInt(dec, 10);
      return code <= 0x10FFFF ? String.fromCodePoint(code) : match;
    }
    if (hex !== undefined) {
      const code = parseInt(hex, 16);
      return code <= 0x10FFFF ? String.fromCodePoint(code) : match;
    }
    const entity = '&' + name + ';';
    return Object.prototype.hasOwnProperty.call(NAMED_DECODE, entity) ? NAMED_DECODE[entity] : match;
  });
}

function encodeHtmlEntities() {
  const text = inputText.value;
  if (!text) return;
  const result = encodeHtml(text);
  outputText.value = result;
  updateCharInfo(text.length, result.length);
}

function decodeHtmlEntities() {
  const text = inputText.value;
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
    modeNote.innerHTML = '<strong>Named mode</strong> uses human-readable entity names like <code>&amp;lt;</code>, <code>&amp;copy;</code>, and <code>&amp;mdash;</code> for common symbols, and numeric codes for other characters. Best for readability.';
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
  }).catch(() => {});
});

inputText.addEventListener('input', () => {
  updateCharInfo(inputText.value.length, outputText.value.length);
});

// Auto-detect on paste: if it looks like HTML entities, decode; otherwise encode
inputText.addEventListener('paste', () => {
  setTimeout(() => {
    const text = inputText.value.trim();
    if (!text) return;
    // If it contains a known named entity or a numeric entity, likely encoded
    const looksEncoded = /&#(?:\d+|[xX][0-9A-Fa-f]+);/.test(text) ||
      KNOWN_ENTITIES.some(entity => text.indexOf(entity) !== -1);
    if (looksEncoded) {
      decodeHtmlEntities();
    } else {
      encodeHtmlEntities();
    }
  }, 10);
});

updateModeNote();
