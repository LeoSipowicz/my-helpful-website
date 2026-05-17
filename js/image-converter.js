const fileInput = document.getElementById('file-input');
const controlsSection = document.getElementById('controls-section');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const formatSelect = document.getElementById('format-select');
const qualityInput = document.getElementById('quality');
const qualityVal = document.getElementById('quality-val');
const qualityGroup = document.getElementById('quality-group');
const downloadBtn = document.getElementById('download-btn');

let originalImage = null;

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    originalImage = img;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    controlsSection.style.display = '';
  };
  img.src = URL.createObjectURL(file);
});

formatSelect.addEventListener('change', () => {
  qualityGroup.style.display = formatSelect.value === 'png' ? 'none' : '';
});

qualityInput.addEventListener('input', () => {
  qualityVal.textContent = qualityInput.value;
});

downloadBtn.addEventListener('click', () => {
  if (!originalImage) return;
  const format = formatSelect.value;
  const quality = parseInt(qualityInput.value) / 100;
  const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  const ext = format === 'jpeg' ? 'jpg' : format;
  const a = document.createElement('a');
  a.download = `converted.${ext}`;
  a.href = canvas.toDataURL(mimeType, quality);
  a.click();
});
