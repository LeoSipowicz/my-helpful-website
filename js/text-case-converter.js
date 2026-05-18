const inputText  = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const charCount  = document.getElementById('char-count');
const copyBtn    = document.getElementById('copy-btn');
const clearBtn   = document.getElementById('clear-btn');
const copyFeedback = document.getElementById('copy-feedback');

// ── Conversion functions ──────────────────────────────────────────────────────

function toUpper(str) {
  return str.toUpperCase();
}

function toLower(str) {
  return str.toLowerCase();
}

function toTitleCase(str) {
  return str.replace(/\S+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function toSentenceCase(str) {
  // Capitalise after start of string, or after . ! ? followed by whitespace
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
}

// Split text into words by whitespace, hyphens, underscores, and camelCase boundaries
function splitWords(str) {
  // Insert space before uppercase letters following lowercase letters (camelCase/PascalCase splitter)
  const spaced = str.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Split on whitespace, hyphens, underscores
  return spaced.split(/[\s\-_]+/).filter(w => w.length > 0);
}

function toCamelCase(str) {
  const words = splitWords(str);
  return words
    .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function toPascalCase(str) {
  return splitWords(str)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function toSnakeCase(str) {
  return splitWords(str).map(w => w.toLowerCase()).join('_');
}

function toKebabCase(str) {
  return splitWords(str).map(w => w.toLowerCase()).join('-');
}

function toConstantCase(str) {
  return splitWords(str).map(w => w.toUpperCase()).join('_');
}

function toAlternatingCase(str) {
  let toggle = false;
  return str.replace(/[a-zA-Z]/g, ch => {
    const result = toggle ? ch.toUpperCase() : ch.toLowerCase();
    toggle = !toggle;
    return result;
  });
}

function toInverseCase(str) {
  return str.replace(/[a-zA-Z]/g, ch =>
    ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()
  );
}

// ── Action map ───────────────────────────────────────────────────────────────

const actions = {
  upper:      toUpper,
  lower:      toLower,
  title:      toTitleCase,
  sentence:   toSentenceCase,
  camel:      toCamelCase,
  pascal:     toPascalCase,
  snake:      toSnakeCase,
  kebab:      toKebabCase,
  constant:   toConstantCase,
  alternating: toAlternatingCase,
  inverse:    toInverseCase,
};

// ── Event listeners ───────────────────────────────────────────────────────────

document.querySelectorAll('.case-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (!actions[action]) return;
    const input = inputText.value;
    const result = actions[action](input);
    outputText.value = result;
    updateCharCount(result);
  });
});

function updateCharCount(text) {
  const chars = text.length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  charCount.textContent = `${chars.toLocaleString()} character${chars !== 1 ? 's' : ''} · ${words.toLocaleString()} word${words !== 1 ? 's' : ''}`;
}

copyBtn.addEventListener('click', () => {
  const text = outputText.value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copyFeedback.style.display = '';
    setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
  });
});

clearBtn.addEventListener('click', () => {
  inputText.value = '';
  outputText.value = '';
  charCount.textContent = '';
});

// Live char count on input
inputText.addEventListener('input', () => {
  // If the output already has content, re-run the last active action
  // For simplicity, just update count on raw input
  const text = inputText.value;
  const chars = text.length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  charCount.textContent = `${chars.toLocaleString()} character${chars !== 1 ? 's' : ''} · ${words.toLocaleString()} word${words !== 1 ? 's' : ''}`;
});
