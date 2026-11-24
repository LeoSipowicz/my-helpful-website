const fileInput = document.getElementById('file-input');
const controlsSection = document.getElementById('controls-section');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const formatSelect = document.getElementById('format-select');
const qualityInput = document.getElementById('quality');
const qualityVal = document.getElementById('quality-val');
const qualityGroup = document.getElementById('quality-group');
const originalFormatEl = document.getElementById('original-format');
const originalSizeEl = document.getElementById('original-size');
const compressedSizeEl = document.getElementById('compressed-size');
const downloadBtn = document.getElementById('download-btn');

let originalImage = null;
let originalFileSize = 0;
let originalMimeType = 'image/jpeg';
let currentBlob = null;
let currentExtension = 'jpg';
let compressRequest = 0;
let imgObjectUrl = null;

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  if (imgObjectUrl) {
    URL.revokeObjectURL(imgObjectUrl);
    imgObjectUrl = null;
  }
  originalFileSize = file.size;
  originalMimeType = file.type || 'image/jpeg';
  const img = new Image();
  img.onload = () => {
    originalImage = img;
    originalFormatEl.textContent = formatLabel(originalMimeType);
    originalSizeEl.textContent = formatSize(originalFileSize);
    controlsSection.style.display = '';
    formatSelect.value = 'auto';
    updateQualityVisibility();
    drawSource();
    compressImage();
    if (imgObjectUrl) {
      URL.revokeObjectURL(imgObjectUrl);
      imgObjectUrl = null;
    }
  };
  imgObjectUrl = URL.createObjectURL(file);
  img.src = imgObjectUrl;
});

formatSelect.addEventListener('change', () => {
  updateQualityVisibility();
  drawSource();
  compressImage();
});

function drawSource() {
  if (!originalImage) return;
  canvas.width = originalImage.naturalWidth;
  canvas.height = originalImage.naturalHeight;
  if (resolveFormat() === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(originalImage, 0, 0);
}

qualityInput.addEventListener('input', () => {
  qualityVal.textContent = qualityInput.value;
  compressImage();
});

function updateQualityVisibility() {
  const fmt = resolveFormat();
  qualityGroup.style.display = fmt === 'png' ? 'none' : '';
  const note = document.getElementById('format-note');
  if (note) note.style.display = fmt === 'jpeg' ? 'block' : 'none';
}

function resolveFormat() {
  const sel = formatSelect.value;
  if (sel !== 'auto') return sel;
  // Auto: preserve original if it's a known type, otherwise fall back to jpeg
  if (originalMimeType === 'image/png') return 'png';
  if (originalMimeType === 'image/webp') return 'webp';
  return 'jpeg';
}

function compressImage() {
  if (!originalImage) return;
  const fmt = resolveFormat();
  const quality = parseInt(qualityInput.value) / 100;
  const mimeType = fmt === 'jpeg' ? 'image/jpeg' : fmt === 'webp' ? 'image/webp' : 'image/png';
  const request = ++compressRequest;

  canvas.toBlob(blob => {
    if (request !== compressRequest) return;
    if (!blob) {
      // Browser doesn't support the chosen format (e.g., WebP on older Safari)
      compressedSizeEl.textContent = 'Format not supported in this browser';
      currentBlob = null;
      return;
    }
    currentBlob = blob;
    currentExtension = blob.type === 'image/jpeg' ? 'jpg'
      : blob.type === 'image/webp' ? 'webp'
      : blob.type === 'image/png' ? 'png'
      : (fmt === 'jpeg' ? 'jpg' : fmt);
    compressedSizeEl.textContent = formatSize(blob.size);
  }, mimeType, quality);
}

downloadBtn.addEventListener('click', () => {
  if (!currentBlob) return;
  const url = URL.createObjectURL(currentBlob);
  const a = document.createElement('a');
  a.download = `compressed.${currentExtension}`;
  a.href = url;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
});

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatLabel(mime) {
  if (mime === 'image/png') return 'PNG';
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'JPEG';
  if (mime === 'image/webp') return 'WebP';
  if (mime === 'image/gif') return 'GIF';
  return mime.replace('image/', '').toUpperCase();
}
