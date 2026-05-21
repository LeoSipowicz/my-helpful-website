const inputJson = document.getElementById('input-json');
const outputJson = document.getElementById('output-json');
const indentSelect = document.getElementById('indent-select');
const sortKeysCheck = document.getElementById('sort-keys');
const formatBtn = document.getElementById('format-btn');
const minifyBtn = document.getElementById('minify-btn');
const validateBtn = document.getElementById('validate-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const copyFeedback = document.getElementById('copy-feedback');
const errorBox = document.getElementById('error-box');
const errorMessage = document.getElementById('error-message');
const statusOk = document.getElementById('status-ok');

function getIndent() {
  const val = indentSelect.value;
  if (val === 'tab') return '\t';
  return parseInt(val);
}

function getReplacer() {
  if (sortKeysCheck.checked) {
    return (key, value) => {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return value;
      }
      return Object.keys(value)
        .sort()
        .reduce((sorted, k) => {
          sorted[k] = value[k];
          return sorted;
        }, {});
    };
  }
  return null;
}

function showError(msg) {
  errorBox.style.display = '';
  errorMessage.textContent = msg;
  statusOk.style.display = 'none';
}

function hideError() {
  errorBox.style.display = 'none';
}

function showOk() {
  statusOk.style.display = '';
}

function hideOk() {
  statusOk.style.display = 'none';
}

function parseJson(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new SyntaxError('Input is empty. Please paste some JSON to format.');
  }
  return JSON.parse(trimmed);
}

function formatJson() {
  hideError();
  hideOk();
  outputJson.value = '';

  const text = inputJson.value;
  if (!text.trim()) return;

  try {
    const obj = parseJson(text);
    const indent = getIndent();
    const replacer = getReplacer();
    const formatted = JSON.stringify(obj, replacer, indent);
    outputJson.value = formatted;
  } catch (err) {
    showError(err.message);
  }
}

function minifyJson() {
  hideError();
  hideOk();
  outputJson.value = '';

  const text = inputJson.value;
  if (!text.trim()) return;

  try {
    const obj = parseJson(text);
    const replacer = getReplacer();
    const minified = JSON.stringify(obj, replacer);
    outputJson.value = minified;
  } catch (err) {
    showError(err.message);
  }
}

function validateJson() {
  hideError();
  hideOk();
  outputJson.value = '';

  const text = inputJson.value;
  if (!text.trim()) {
    showError('Input is empty. Please paste some JSON to validate.');
    return;
  }

  try {
    parseJson(text);
    showOk();
  } catch (err) {
    showError(err.message);
  }
}

formatBtn.addEventListener('click', formatJson);
minifyBtn.addEventListener('click', minifyJson);
validateBtn.addEventListener('click', validateJson);

clearBtn.addEventListener('click', () => {
  inputJson.value = '';
  outputJson.value = '';
  hideError();
  hideOk();
  inputJson.focus();
});

copyBtn.addEventListener('click', () => {
  const text = outputJson.value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copyFeedback.style.display = '';
    setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
  });
});

// Auto-format on paste if the pasted content looks like JSON
inputJson.addEventListener('paste', () => {
  // Delay to let the paste complete
  setTimeout(() => {
    const text = inputJson.value.trim();
    if (text && (text.startsWith('{') || text.startsWith('['))) {
      formatJson();
    }
  }, 10);
});

// Update output when indent or sort-keys changes if output already exists
indentSelect.addEventListener('change', () => {
  if (outputJson.value && inputJson.value.trim()) {
    formatJson();
  }
});

sortKeysCheck.addEventListener('change', () => {
  if (outputJson.value && inputJson.value.trim()) {
    formatJson();
  }
});
