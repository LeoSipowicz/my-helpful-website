const inputA = document.getElementById('input-a');
const inputB = document.getElementById('input-b');
const compareBtn = document.getElementById('compare-btn');
const swapBtn = document.getElementById('swap-btn');
const clearBtn = document.getElementById('clear-btn');
const diffResult = document.getElementById('diff-result');
const diffMeta = document.getElementById('diff-meta');
const diffWarning = document.getElementById('diff-warning');
const ignoreCase = document.getElementById('ignore-case');
const ignoreWhitespace = document.getElementById('ignore-whitespace');
const viewButtons = document.querySelectorAll('.view-btn');

const MAX_GRID_CELLS = 10000000;
const MAX_TOKEN_CELLS = 250000;

let currentView = 'unified';
let lastOps = null;
let lastUsedFallback = false;

function readOptions() {
  return {
    ignoreCase: ignoreCase ? ignoreCase.checked : false,
    ignoreWhitespace: ignoreWhitespace ? ignoreWhitespace.checked : false
  };
}

function normalizeLine(line, opts) {
  let value = line;
  if (opts.ignoreWhitespace) {
    value = value.replace(/\s+/g, ' ').trim();
  }
  if (opts.ignoreCase) {
    value = value.toLowerCase();
  }
  return value;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function splitLines(text) {
  if (text === '') return [];
  return text.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n');
}

function computeLcsDiff(linesA, linesB, normA, normB) {
  const m = linesA.length;
  const n = linesB.length;

  if (m * n > MAX_GRID_CELLS) {
    return null;
  }

  const dp = new Array(m + 1);
  for (let i = 0; i <= m; i++) {
    dp[i] = new Uint32Array(n + 1);
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normA[i - 1] === normB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
      }
    }
  }

  const result = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normA[i - 1] === normB[j - 1]) {
      result.unshift({ type: 'same', line: linesA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'add', line: linesB[j - 1] });
      j--;
    } else {
      result.unshift({ type: 'remove', line: linesA[i - 1] });
      i--;
    }
  }

  return result;
}

function simpleDiff(linesA, linesB, normA, normB) {
  const maxLen = Math.max(linesA.length, linesB.length);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    if (i < linesA.length && i < linesB.length && normA[i] === normB[i]) {
      result.push({ type: 'same', line: linesA[i] });
    } else {
      if (i < linesA.length) {
        result.push({ type: 'remove', line: linesA[i] });
      }
      if (i < linesB.length) {
        result.push({ type: 'add', line: linesB[i] });
      }
    }
  }
  return result;
}

function tokenize(line) {
  return line.split(/(\s+)/).filter((token) => token.length > 0);
}

function normalizeToken(token, opts) {
  let value = token;
  if (opts.ignoreWhitespace) {
    value = value.replace(/\s+/g, ' ');
  }
  if (opts.ignoreCase) {
    value = value.toLowerCase();
  }
  return value;
}

function diffTokens(tokensA, tokensB, opts) {
  const m = tokensA.length;
  const n = tokensB.length;

  if (m * n > MAX_TOKEN_CELLS) {
    return null;
  }

  const normA = tokensA.map((token) => normalizeToken(token, opts));
  const normB = tokensB.map((token) => normalizeToken(token, opts));

  const dp = new Array(m + 1);
  for (let i = 0; i <= m; i++) {
    dp[i] = new Uint32Array(n + 1);
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normA[i - 1] === normB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
      }
    }
  }

  const result = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normA[i - 1] === normB[j - 1]) {
      result.unshift({ type: 'same', token: tokensA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'add', token: tokensB[j - 1] });
      j--;
    } else {
      result.unshift({ type: 'remove', token: tokensA[i - 1] });
      i--;
    }
  }

  return result;
}

function buildWordDiff(oldLine, newLine, opts) {
  const tokensA = tokenize(oldLine);
  const tokensB = tokenize(newLine);
  const ops = diffTokens(tokensA, tokensB, opts);

  if (!ops) {
    return { old: escapeHtml(oldLine), new: escapeHtml(newLine) };
  }

  let oldHtml = '';
  let newHtml = '';
  ops.forEach((op) => {
    const token = escapeHtml(op.token);
    if (op.type === 'same') {
      oldHtml += token;
      newHtml += token;
    } else if (op.type === 'remove') {
      oldHtml += '<span class="word-remove">' + token + '</span>';
    } else {
      newHtml += '<span class="word-add">' + token + '</span>';
    }
  });

  return { old: oldHtml, new: newHtml };
}

function assignLineNumbers(ops) {
  let oldNumber = 0;
  let newNumber = 0;
  ops.forEach((op) => {
    if (op.type === 'same') {
      oldNumber++;
      newNumber++;
      op.oldNumber = oldNumber;
      op.newNumber = newNumber;
    } else if (op.type === 'remove') {
      oldNumber++;
      op.oldNumber = oldNumber;
    } else {
      newNumber++;
      op.newNumber = newNumber;
    }
  });
}

function groupOps(ops) {
  const chunks = [];
  let i = 0;
  while (i < ops.length) {
    if (ops[i].type === 'same') {
      chunks.push({ type: 'same', op: ops[i] });
      i++;
    } else {
      const removes = [];
      const adds = [];
      while (i < ops.length && ops[i].type !== 'same') {
        if (ops[i].type === 'remove') {
          removes.push(ops[i]);
        } else {
          adds.push(ops[i]);
        }
        i++;
      }
      chunks.push({ type: 'change', removes: removes, adds: adds });
    }
  }
  return chunks;
}

function pairWordDiffs(chunk, opts) {
  return chunk.removes.map((removed, index) => {
    const added = chunk.adds[index];
    return added ? buildWordDiff(removed.line, added.line, opts) : null;
  });
}

function unifiedLine(type, sign, contentHtml) {
  return '<div class="diff-line diff-' + type + '">'
    + '<span class="diff-sign" aria-hidden="true">' + sign + '</span>'
    + '<span class="diff-text">' + contentHtml + '</span>'
    + '</div>';
}

function renderUnified(chunks, opts) {
  let html = '';
  chunks.forEach((chunk) => {
    if (chunk.type === 'same') {
      html += unifiedLine('same', ' ', escapeHtml(chunk.op.line));
      return;
    }
    const pairs = pairWordDiffs(chunk, opts);
    chunk.removes.forEach((removed, index) => {
      html += unifiedLine('remove', '-', pairs[index] ? pairs[index].old : escapeHtml(removed.line));
    });
    chunk.adds.forEach((added, index) => {
      html += unifiedLine('add', '+', pairs[index] ? pairs[index].new : escapeHtml(added.line));
    });
  });
  return html;
}

function sideRow(oldNumber, newNumber, leftClass, leftHtml, rightClass, rightHtml) {
  return '<div class="diff-row">'
    + '<div class="diff-line-no">' + oldNumber + '</div>'
    + '<div class="diff-side ' + leftClass + '">' + leftHtml + '</div>'
    + '<div class="diff-line-no">' + newNumber + '</div>'
    + '<div class="diff-side ' + rightClass + '">' + rightHtml + '</div>'
    + '</div>';
}

function renderSideBySide(chunks, opts) {
  let html = '';
  chunks.forEach((chunk) => {
    if (chunk.type === 'same') {
      const line = escapeHtml(chunk.op.line);
      html += sideRow(chunk.op.oldNumber, chunk.op.newNumber, 'diff-same', line, 'diff-same', line);
      return;
    }
    const pairs = pairWordDiffs(chunk, opts);
    const rowCount = Math.max(chunk.removes.length, chunk.adds.length);
    for (let index = 0; index < rowCount; index++) {
      const removed = chunk.removes[index];
      const added = chunk.adds[index];
      const pair = pairs[index];
      const leftHtml = removed ? (pair ? pair.old : escapeHtml(removed.line)) : '';
      const rightHtml = added ? (pair ? pair.new : escapeHtml(added.line)) : '';
      html += sideRow(
        removed ? removed.oldNumber : '',
        added ? added.newNumber : '',
        removed ? 'diff-remove' : 'diff-empty',
        leftHtml,
        added ? 'diff-add' : 'diff-empty',
        rightHtml
      );
    }
  });
  return html;
}

function hideResults() {
  diffResult.style.display = 'none';
  diffMeta.style.display = 'none';
  diffWarning.style.display = 'none';
  diffResult.innerHTML = '';
  lastOps = null;
}

function renderDiff() {
  if (!lastOps) return;

  const opts = readOptions();
  const chunks = groupOps(lastOps);
  const added = lastOps.filter((op) => op.type === 'add').length;
  const removed = lastOps.filter((op) => op.type === 'remove').length;
  const unchanged = lastOps.filter((op) => op.type === 'same').length;

  diffMeta.textContent = added + ' added, ' + removed + ' removed, ' + unchanged + ' unchanged';
  diffMeta.style.display = '';

  if (lastUsedFallback) {
    diffWarning.textContent = 'The texts are very large, so a simplified comparison was used. Break the text into smaller chunks for a more precise diff.';
    diffWarning.style.display = '';
  } else {
    diffWarning.style.display = 'none';
  }

  if (added === 0 && removed === 0) {
    diffResult.classList.remove('diff-side-by-side');
    diffResult.innerHTML = '<p class="diff-identical">The two texts are identical.</p>';
  } else if (currentView === 'side') {
    diffResult.classList.add('diff-side-by-side');
    diffResult.innerHTML = renderSideBySide(chunks, opts);
  } else {
    diffResult.classList.remove('diff-side-by-side');
    diffResult.innerHTML = renderUnified(chunks, opts);
  }

  diffResult.style.display = '';
}

function compareTexts() {
  const textA = inputA.value;
  const textB = inputB.value;

  if (!textA && !textB) {
    hideResults();
    return;
  }

  const opts = readOptions();
  const linesA = splitLines(textA);
  const linesB = splitLines(textB);
  const normA = linesA.map((line) => normalizeLine(line, opts));
  const normB = linesB.map((line) => normalizeLine(line, opts));

  let diff = computeLcsDiff(linesA, linesB, normA, normB);
  let usedFallback = false;

  if (diff === null) {
    diff = simpleDiff(linesA, linesB, normA, normB);
    usedFallback = true;
  }

  assignLineNumbers(diff);
  lastOps = diff;
  lastUsedFallback = usedFallback;
  renderDiff();
}

compareBtn.addEventListener('click', compareTexts);

swapBtn.addEventListener('click', () => {
  const temp = inputA.value;
  inputA.value = inputB.value;
  inputB.value = temp;
  if (lastOps) {
    compareTexts();
  }
});

clearBtn.addEventListener('click', () => {
  inputA.value = '';
  inputB.value = '';
  hideResults();
  inputA.focus();
});

if (ignoreCase) {
  ignoreCase.addEventListener('change', () => {
    if (lastOps) compareTexts();
  });
}

if (ignoreWhitespace) {
  ignoreWhitespace.addEventListener('change', () => {
    if (lastOps) compareTexts();
  });
}

viewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentView = button.dataset.view;
    viewButtons.forEach((other) => {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (lastOps) compareTexts();
  });
});
