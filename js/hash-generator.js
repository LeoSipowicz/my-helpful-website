function md5(input) {
  const msg = (typeof input === 'string') ? new TextEncoder().encode(input) : new Uint8Array(input);
  const len = msg.length;
  const totalLen = Math.ceil((len + 9) / 64) * 64;
  const padded = new Uint8Array(totalLen);
  padded.set(msg);
  padded[len] = 0x80;

  const view = new DataView(padded.buffer);
  const bitLen = BigInt(len) * 8n;
  view.setUint32(totalLen - 8, Number(bitLen & 0xffffffffn), true);
  view.setUint32(totalLen - 4, Number(bitLen >> 32n), true);

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const S = [
    7,12,17,22, 7,12,17,22, 7,12,17,22, 7,12,17,22,
    5, 9,14,20, 5, 9,14,20, 5, 9,14,20, 5, 9,14,20,
    4,11,16,23, 4,11,16,23, 4,11,16,23, 4,11,16,23,
    6,10,15,21, 6,10,15,21, 6,10,15,21, 6,10,15,21
  ];

  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
  }

  for (let offset = 0; offset < totalLen; offset += 64) {
    const M = new Uint32Array(16);
    for (let i = 0; i < 16; i++) {
      M[i] = view.getUint32(offset + i * 4, true);
    }

    let A = a, B = b, C = c, D = d;

    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) {
        f = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        f = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        f = C ^ (B | ~D);
        g = (7 * i) % 16;
      }

      const temp = D;
      D = C;
      C = B;
      B = (B + rotateLeft((A + f + K[i] + M[g]) >>> 0, S[i])) >>> 0;
      A = temp;
    }

    a = (a + A) >>> 0;
    b = (b + B) >>> 0;
    c = (c + C) >>> 0;
    d = (d + D) >>> 0;
  }

  function toHex(v) {
    const bytes = new Uint8Array(4);
    new DataView(bytes.buffer).setUint32(0, v, true);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

function rotateLeft(x, n) {
  return (x << n) | (x >>> (32 - n));
}

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha1(input) {
  const data = (typeof input === 'string') ? new TextEncoder().encode(input) : input;
  const hash = await crypto.subtle.digest('SHA-1', data);
  return bufferToHex(hash);
}

async function sha256(input) {
  const data = (typeof input === 'string') ? new TextEncoder().encode(input) : input;
  const hash = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hash);
}

async function sha512(input) {
  const data = (typeof input === 'string') ? new TextEncoder().encode(input) : input;
  const hash = await crypto.subtle.digest('SHA-512', data);
  return bufferToHex(hash);
}

const inputText = document.getElementById('input-text');
const computeBtn = document.getElementById('compute-btn');
const resultsSection = document.getElementById('results-section');
const charInfo = document.getElementById('char-info');

const md5Check = document.getElementById('md5-check');
const sha1Check = document.getElementById('sha1-check');
const sha256Check = document.getElementById('sha256-check');
const sha512Check = document.getElementById('sha512-check');

const fileInput = document.getElementById('file-input');
const computeFileBtn = document.getElementById('compute-file-btn');
const fileMeta = document.getElementById('file-meta');
const fileResultsSection = document.getElementById('file-results-section');

function updateCharInfo() {
  const len = inputText.value.length;
  charInfo.textContent = len > 0 ? `Input: ${len.toLocaleString()} characters` : '';
}

async function computeTextHashes() {
  const text = inputText.value;
  if (!text) return;

  if (!crypto || !crypto.subtle) {
    resultsSection.innerHTML = '<p style="color:#c0392b;">SHA hashing requires a secure context (HTTPS). Please access this page over HTTPS.</p>';
    resultsSection.style.display = '';
    return;
  }

  resultsSection.style.display = '';
  resultsSection.innerHTML = '<p>Computing</p>';

  const promises = [];
  if (md5Check.checked) promises.push({ name: 'MD5', fn: () => md5(text) });
  if (sha1Check.checked) promises.push({ name: 'SHA-1', fn: () => sha1(text) });
  if (sha256Check.checked) promises.push({ name: 'SHA-256', fn: () => sha256(text) });
  if (sha512Check.checked) promises.push({ name: 'SHA-512', fn: () => sha512(text) });

  if (promises.length === 0) {
    resultsSection.innerHTML = '<p>Please select at least one hash algorithm.</p>';
    return;
  }

  try {
    const results = await Promise.all(promises.map(async p => {
      const value = await p.fn();
      return { name: p.name, value };
    }));

    resultsSection.innerHTML = results.map(r => `
      <div class="hash-result">
        <div class="hash-header">
          <span class="hash-name">${r.name}</span>
          <button class="hash-copy-btn" data-hash="${r.value}">Copy</button>
        </div>
        <code class="hash-value">${r.value}</code>
      </div>
    `).join('');

    resultsSection.querySelectorAll('.hash-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.hash).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        });
      });
    });
  } catch (err) {
    resultsSection.innerHTML = '<p style="color:#c0392b;">Error: ' + err.message + '</p>';
  }
}

computeBtn.addEventListener('click', computeTextHashes);
inputText.addEventListener('input', updateCharInfo);
inputText.addEventListener('paste', () => {
  setTimeout(() => {
    updateCharInfo();
    computeTextHashes();
  }, 10);
});

[md5Check, sha1Check, sha256Check, sha512Check].forEach(el => {
  el.addEventListener('change', () => {
    if (inputText.value.trim()) computeTextHashes();
  });
});

// File hashing
let currentFile = null;

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) {
    currentFile = null;
    fileMeta.textContent = '';
    fileResultsSection.style.display = 'none';
    computeFileBtn.style.display = 'none';
    return;
  }
  currentFile = file;
  fileMeta.textContent = `Selected: ${file.name} (${formatSize(file.size)})`;
  computeFileBtn.style.display = 'inline-block';
  fileResultsSection.style.display = 'none';
});

computeFileBtn.addEventListener('click', async () => {
  if (!currentFile) return;
  if (!crypto || !crypto.subtle) {
    fileResultsSection.innerHTML = '<p style="color:#c0392b;">SHA hashing requires a secure context (HTTPS). Please access this page over HTTPS.</p>';
    fileResultsSection.style.display = '';
    return;
  }

  computeFileBtn.disabled = true;
  computeFileBtn.textContent = 'Computing';
  fileResultsSection.style.display = '';
  fileResultsSection.innerHTML = '<p>Reading file</p>';

  try {
    const arrayBuffer = await currentFile.arrayBuffer();
    fileResultsSection.innerHTML = '<p>Hashing</p>';

    const promises = [];
    if (md5Check.checked) promises.push({ name: 'MD5', fn: () => md5(arrayBuffer) });
    if (sha1Check.checked) promises.push({ name: 'SHA-1', fn: () => sha1(arrayBuffer) });
    if (sha256Check.checked) promises.push({ name: 'SHA-256', fn: () => sha256(arrayBuffer) });
    if (sha512Check.checked) promises.push({ name: 'SHA-512', fn: () => sha512(arrayBuffer) });

    if (promises.length === 0) {
      fileResultsSection.innerHTML = '<p>Please select at least one hash algorithm above.</p>';
      computeFileBtn.disabled = false;
      computeFileBtn.textContent = 'Compute File Hashes';
      return;
    }

    const results = await Promise.all(promises.map(async p => {
      const value = await p.fn();
      return { name: p.name, value };
    }));

    fileResultsSection.innerHTML = results.map(r => `
      <div class="hash-result">
        <div class="hash-header">
          <span class="hash-name">${r.name}</span>
          <button class="hash-copy-btn" data-hash="${r.value}">Copy</button>
        </div>
        <code class="hash-value">${r.value}</code>
      </div>
    `).join('');

    fileResultsSection.querySelectorAll('.hash-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.hash).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        });
      });
    });
  } catch (err) {
    fileResultsSection.innerHTML = '<p style="color:#c0392b;">Error: ' + err.message + '</p>';
  }

  computeFileBtn.disabled = false;
  computeFileBtn.textContent = 'Compute File Hashes';
});

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

updateCharInfo();
