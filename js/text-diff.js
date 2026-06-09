const inputA = document.getElementById('input-a');
const inputB = document.getElementById('input-b');
const compareBtn = document.getElementById('compare-btn');
const swapBtn = document.getElementById('swap-btn');
const clearBtn = document.getElementById('clear-btn');
const diffResult = document.getElementById('diff-result');
const diffMeta = document.getElementById('diff-meta');
const diffWarning = document.getElementById('diff-warning');

function computeLcsDiff(linesA, linesB) {
  const m = linesA.length;
  const n = linesB.length;

  // Safety limit: if the grid is too large, use simple diff
  if (m * n > 10000000) {
    return null;
  }

  const dp = new Array(m + 1);
  for (let i = 0; i <= m; i++) {
    dp[i] = new Uint32Array(n + 1);
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
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
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
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

function simpleDiff(linesA, linesB) {
  const maxLen = Math.max(linesA.length, linesB.length);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    if (i < linesA.length && i < linesB.length && linesA[i] === linesB[i]) {
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

function compareTexts() {
  const textA = inputA.value;
  const textB = inputB.value;

  if (!textA && !textB) {
    diffResult.style.display = 'none';
    diffMeta.style.display = 'none';
    diffWarning.style.display = 'none';
    return;
  }

  const linesA = textA.split('\n');
  const linesB = textB.split('\n');

  let diff = computeLcsDiff(linesA, linesB);
  let usedFallback = false;

  if (diff === null) {
    diff = simpleDiff(linesA, linesB);
    usedFallback = true;
  }

  const added = diff.filter(d => d.type === 'add').length;
  const removed = diff.filter(d => d.type === 'remove').length;
  const unchanged = diff.filter(d => d.type === 'same').length;

  diffMeta.textContent = `${added} added, ${removed} removed, ${unchanged} unchanged`;
  diffMeta.style.display = '';

  if (usedFallback) {
    diffWarning.textContent = 'The texts are very large, so a simplified comparison was used. Break the text into smaller chunks for a more precise diff.';
    diffWarning.style.display = '';
  } else {
    diffWarning.style.display = 'none';
  }

  diffResult.innerHTML = diff.map(d => {
    const escaped = d.line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre class="diff-${d.type}">${escaped}</pre>`;
  }).join('');

  diffResult.style.display = '';
}

compareBtn.addEventListener('click', compareTexts);

swapBtn.addEventListener('click', () => {
  const temp = inputA.value;
  inputA.value = inputB.value;
  inputB.value = temp;
  if (diffResult.style.display !== 'none') {
    compareTexts();
  }
});

clearBtn.addEventListener('click', () => {
  inputA.value = '';
  inputB.value = '';
  diffResult.style.display = 'none';
  diffMeta.style.display = 'none';
  diffWarning.style.display = 'none';
  inputA.focus();
});
