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
let imgObjectUrl = null;

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  if (imgObjectUrl) {
    URL.revokeObjectURL(imgObjectUrl);
    imgObjectUrl = null;
  }
  const img = new Image();
  img.onload = () => {
    originalImage = img;
    drawSource();
    controlsSection.style.display = '';
    if (imgObjectUrl) {
      URL.revokeObjectURL(imgObjectUrl);
      imgObjectUrl = null;
    }
  };
  imgObjectUrl = URL.createObjectURL(file);
  img.src = imgObjectUrl;
});

function drawSource() {
  if (!originalImage) return;
  canvas.width = originalImage.naturalWidth;
  canvas.height = originalImage.naturalHeight;
  if (formatSelect.value === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(originalImage, 0, 0);
}

function updateQualityVisibility() {
  qualityGroup.style.display = formatSelect.value === 'png' ? 'none' : '';
  const note = document.getElementById('format-note');
  if (note) note.style.display = formatSelect.value === 'jpeg' ? 'block' : 'none';
}

formatSelect.addEventListener('change', () => {
  updateQualityVisibility();
  drawSource();
});
updateQualityVisibility();

qualityInput.addEventListener('input', () => {
  qualityVal.textContent = qualityInput.value;
});

downloadBtn.addEventListener('click', () => {
  if (!originalImage) return;
  const format = formatSelect.value;
  const quality = parseInt(qualityInput.value) / 100;
  const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

  canvas.toBlob(blob => {
    if (!blob) {
      alert('This output format is not supported in your browser. Please try PNG or JPEG.');
      return;
    }
    const ext = blob.type === 'image/jpeg' ? 'jpg' : blob.type === 'image/webp' ? 'webp' : 'png';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `converted.${ext}`;
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, mimeType, quality);
});
