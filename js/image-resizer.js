const fileInput = document.getElementById('file-input');
const controlsSection = document.getElementById('controls-section');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const widthInput = document.getElementById('width-input');
const heightInput = document.getElementById('height-input');
const lockAspect = document.getElementById('lock-aspect');
const downloadBtn = document.getElementById('download-btn');

let originalImage = null;

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    originalImage = img;
    widthInput.value = img.naturalWidth;
    heightInput.value = img.naturalHeight;
    renderPreview();
    controlsSection.style.display = '';
  };
  img.src = URL.createObjectURL(file);
});

function renderPreview() {
  if (!originalImage) return;
  const w = parseInt(widthInput.value) || originalImage.naturalWidth;
  const h = parseInt(heightInput.value) || originalImage.naturalHeight;
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(originalImage, 0, 0, w, h);
}

widthInput.addEventListener('input', () => {
  if (lockAspect.checked && originalImage) {
    const ratio = originalImage.naturalHeight / originalImage.naturalWidth;
    heightInput.value = Math.round(parseInt(widthInput.value) * ratio);
  }
  renderPreview();
});

heightInput.addEventListener('input', () => {
  if (lockAspect.checked && originalImage) {
    const ratio = originalImage.naturalWidth / originalImage.naturalHeight;
    widthInput.value = Math.round(parseInt(heightInput.value) * ratio);
  }
  renderPreview();
});

downloadBtn.addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = 'resized.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
});
