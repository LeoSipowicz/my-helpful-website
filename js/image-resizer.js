const fileInput = document.getElementById('file-input');
const controlsSection = document.getElementById('controls-section');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const widthInput = document.getElementById('width-input');
const heightInput = document.getElementById('height-input');
const lockAspect = document.getElementById('lock-aspect');
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
    widthInput.value = img.naturalWidth;
    heightInput.value = img.naturalHeight;
    renderPreview();
    controlsSection.style.display = '';
    if (imgObjectUrl) {
      URL.revokeObjectURL(imgObjectUrl);
      imgObjectUrl = null;
    }
  };
  imgObjectUrl = URL.createObjectURL(file);
  img.src = imgObjectUrl;
});

function renderPreview() {
  if (!originalImage) return;
  const w = parseInt(widthInput.value);
  const h = parseInt(heightInput.value);
  canvas.width = !isNaN(w) && w > 0 ? w : originalImage.naturalWidth;
  canvas.height = !isNaN(h) && h > 0 ? h : originalImage.naturalHeight;
  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
}

widthInput.addEventListener('input', () => {
  if (lockAspect.checked && originalImage) {
    const widthVal = parseInt(widthInput.value);
    if (!isNaN(widthVal) && widthVal > 0) {
      const ratio = originalImage.naturalHeight / originalImage.naturalWidth;
      heightInput.value = Math.round(widthVal * ratio);
    }
  }
  renderPreview();
});

heightInput.addEventListener('input', () => {
  if (lockAspect.checked && originalImage) {
    const heightVal = parseInt(heightInput.value);
    if (!isNaN(heightVal) && heightVal > 0) {
      const ratio = originalImage.naturalWidth / originalImage.naturalHeight;
      widthInput.value = Math.round(heightVal * ratio);
    }
  }
  renderPreview();
});

downloadBtn.addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = 'resized.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
});
