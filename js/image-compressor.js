const fileInput = document.getElementById('file-input');
const controlsSection = document.getElementById('controls-section');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const qualityInput = document.getElementById('quality');
const qualityVal = document.getElementById('quality-val');
const originalSizeEl = document.getElementById('original-size');
const compressedSizeEl = document.getElementById('compressed-size');
const downloadBtn = document.getElementById('download-btn');

let originalImage = null;
let originalFileSize = 0;
let currentBlob = null;

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  originalFileSize = file.size;
  const img = new Image();
  img.onload = () => {
    originalImage = img;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    originalSizeEl.textContent = formatSize(originalFileSize);
    controlsSection.style.display = '';
    compressImage();
  };
  img.src = URL.createObjectURL(file);
});

qualityInput.addEventListener('input', () => {
  qualityVal.textContent = qualityInput.value;
  compressImage();
});

function compressImage() {
  if (!originalImage) return;
  const quality = parseInt(qualityInput.value) / 100;
  const mimeType = 'image/jpeg';
  canvas.toBlob(blob => {
    currentBlob = blob;
    compressedSizeEl.textContent = formatSize(blob.size);
  }, mimeType, quality);
}

downloadBtn.addEventListener('click', () => {
  if (!currentBlob) return;
  const a = document.createElement('a');
  a.download = 'compressed.jpg';
  a.href = URL.createObjectURL(currentBlob);
  a.click();
});

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
