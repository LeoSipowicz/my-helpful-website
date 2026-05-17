const fileInput = document.getElementById('file-input');
const section   = document.getElementById('canvas-section');
const canvas    = document.getElementById('canvas');
const ctx       = canvas.getContext('2d');
const tolInput  = document.getElementById('tolerance');
const tolVal    = document.getElementById('tolerance-val');
const replColor = document.getElementById('replace-color');

let history = [];

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    history = [];
    section.style.display = '';
  };
  img.src = URL.createObjectURL(file);
});

tolInput.addEventListener('input', () => tolVal.textContent = tolInput.value);

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top)  * scaleY);

  // Save state for undo
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data      = imageData.data;
  const idx       = (y * canvas.width + x) * 4;
  const target    = [data[idx], data[idx+1], data[idx+2], data[idx+3]];
  const tol       = parseInt(tolInput.value);
  const rep       = hexToRgb(replColor.value);

  for (let i = 0; i < data.length; i += 4) {
    if (colorMatch(data, i, target, tol)) {
      data[i]   = rep.r;
      data[i+1] = rep.g;
      data[i+2] = rep.b;
    }
  }
  ctx.putImageData(imageData, 0, 0);
});

document.getElementById('undo-btn').addEventListener('click', () => {
  if (history.length) ctx.putImageData(history.pop(), 0, 0);
});

document.getElementById('reset-btn').addEventListener('click', () => {
  if (history.length) {
    ctx.putImageData(history[0], 0, 0);
    history = [];
  }
});

document.getElementById('download-btn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = 'replaced.png';
  a.href = canvas.toDataURL();
  a.click();
});

document.addEventListener('keydown', e => {
  if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    document.getElementById('undo-btn').click();
  }
});

function colorMatch(data, i, target, tol) {
  return Math.abs(data[i]   - target[0]) <= tol &&
         Math.abs(data[i+1] - target[1]) <= tol &&
         Math.abs(data[i+2] - target[2]) <= tol;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return { r, g, b };
}
