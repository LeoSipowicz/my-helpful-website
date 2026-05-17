const fileInput = document.getElementById('file-input');
const palette = document.getElementById('palette');
const resultsSection = document.getElementById('results-section');
const copyFeedback = document.getElementById('copy-feedback');

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    const colors = extractPalette(img, 8);
    renderPalette(colors);
    resultsSection.style.display = '';
  };
  img.src = URL.createObjectURL(file);
});

function extractPalette(img, count) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const maxSize = 200;
  const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight, 1);
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const colorMap = {};

  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }

  const sorted = Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);

  return sorted.map(([key]) => {
    const [r, g, b] = key.split(',').map(Number);
    return { r, g, b, hex: '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('') };
  });
}

function renderPalette(colors) {
  palette.innerHTML = '';
  colors.forEach(c => {
    const swatch = document.createElement('div');
    swatch.className = 'palette-swatch';
    swatch.style.background = c.hex;
    swatch.innerHTML = `<span class="palette-hex">${c.hex}</span>`;
    swatch.addEventListener('click', () => {
      navigator.clipboard.writeText(c.hex).then(() => {
        copyFeedback.style.display = '';
        setTimeout(() => copyFeedback.style.display = 'none', 2000);
      });
    });
    palette.appendChild(swatch);
  });
}
