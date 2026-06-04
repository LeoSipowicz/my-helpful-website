const fileInput = document.getElementById('file-input');
const canvasSection = document.getElementById('canvas-section');
const cropCanvas = document.getElementById('crop-canvas');
const cropCtx = cropCanvas.getContext('2d');
const cropInfo = document.getElementById('crop-info');
const cropBtn = document.getElementById('crop-btn');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');
const resultSection = document.getElementById('result-section');
const resultCanvas = document.getElementById('result-canvas');

let originalImage = null;
let imgObjectUrl = null;

let isDragging = false;
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;
let selection = null;

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
    canvasSection.style.display = '';
    resultSection.style.display = 'none';
    cropBtn.disabled = true;
    downloadBtn.disabled = true;
    selection = null;
    cropInfo.textContent = '';

    cropCanvas.width = img.naturalWidth;
    cropCanvas.height = img.naturalHeight;
    cropCtx.drawImage(img, 0, 0);

    if (imgObjectUrl) {
      URL.revokeObjectURL(imgObjectUrl);
      imgObjectUrl = null;
    }
  };
  imgObjectUrl = URL.createObjectURL(file);
  img.src = imgObjectUrl;
});

function getCanvasCoords(e) {
  const rect = cropCanvas.getBoundingClientRect();
  const touch = e.changedTouches && e.changedTouches.length ? e.changedTouches[0]
              : e.touches && e.touches.length ? e.touches[0]
              : null;
  const clientX = touch ? touch.clientX : e.clientX;
  const clientY = touch ? touch.clientY : e.clientY;
  const scaleX = cropCanvas.width / rect.width;
  const scaleY = cropCanvas.height / rect.height;
  let x = (clientX - rect.left) * scaleX;
  let y = (clientY - rect.top) * scaleY;
  x = Math.max(0, Math.min(cropCanvas.width, x));
  y = Math.max(0, Math.min(cropCanvas.height, y));
  return { x, y };
}

function normalizeSelection() {
  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const w = Math.abs(endX - startX);
  const h = Math.abs(endY - startY);
  return { x, y, w, h };
}

function drawCanvas() {
  if (!originalImage) return;
  cropCtx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
  cropCtx.drawImage(originalImage, 0, 0);

  if (selection && selection.w > 0 && selection.h > 0) {
    cropCtx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    cropCtx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);

    cropCtx.drawImage(
      originalImage,
      selection.x, selection.y, selection.w, selection.h,
      selection.x, selection.y, selection.w, selection.h
    );

    cropCtx.strokeStyle = '#6D72C3';
    cropCtx.lineWidth = Math.max(2, Math.round(cropCanvas.width / 300));
    cropCtx.strokeRect(selection.x, selection.y, selection.w, selection.h);
  }
}

function updateCropInfo() {
  if (selection && selection.w > 0 && selection.h > 0) {
    cropInfo.textContent = `Selection: ${Math.round(selection.w)} \u00d7 ${Math.round(selection.h)} px`;
    cropBtn.disabled = false;
  } else {
    cropInfo.textContent = '';
    cropBtn.disabled = true;
  }
}

cropCanvas.addEventListener('mousedown', e => {
  if (!originalImage) return;
  e.preventDefault();
  isDragging = true;
  const coords = getCanvasCoords(e);
  startX = coords.x;
  startY = coords.y;
  endX = coords.x;
  endY = coords.y;
  selection = normalizeSelection();
  drawCanvas();
  updateCropInfo();
});

window.addEventListener('mousemove', e => {
  if (!isDragging || !originalImage) return;
  const coords = getCanvasCoords(e);
  endX = coords.x;
  endY = coords.y;
  selection = normalizeSelection();
  drawCanvas();
  updateCropInfo();
});

window.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  selection = normalizeSelection();
  drawCanvas();
  updateCropInfo();
});

cropCanvas.addEventListener('touchstart', e => {
  if (!originalImage) return;
  e.preventDefault();
  isDragging = true;
  const coords = getCanvasCoords(e);
  startX = coords.x;
  startY = coords.y;
  endX = coords.x;
  endY = coords.y;
  selection = normalizeSelection();
  drawCanvas();
  updateCropInfo();
}, { passive: false });

window.addEventListener('touchmove', e => {
  if (!isDragging || !originalImage) return;
  e.preventDefault();
  const coords = getCanvasCoords(e);
  endX = coords.x;
  endY = coords.y;
  selection = normalizeSelection();
  drawCanvas();
  updateCropInfo();
}, { passive: false });

window.addEventListener('touchend', e => {
  if (!isDragging) return;
  isDragging = false;
  selection = normalizeSelection();
  drawCanvas();
  updateCropInfo();
});

window.addEventListener('touchcancel', () => {
  if (!isDragging) return;
  isDragging = false;
  selection = normalizeSelection();
  drawCanvas();
  updateCropInfo();
});

resetBtn.addEventListener('click', () => {
  selection = null;
  drawCanvas();
  updateCropInfo();
  resultSection.style.display = 'none';
  downloadBtn.disabled = true;
});

cropBtn.addEventListener('click', () => {
  if (!selection || selection.w <= 0 || selection.h <= 0 || !originalImage) return;

  resultCanvas.width = Math.round(selection.w);
  resultCanvas.height = Math.round(selection.h);
  const rctx = resultCanvas.getContext('2d');
  rctx.drawImage(
    originalImage,
    selection.x, selection.y, selection.w, selection.h,
    0, 0, resultCanvas.width, resultCanvas.height
  );

  resultSection.style.display = '';
  downloadBtn.disabled = false;
  resultSection.scrollIntoView({ behavior: 'smooth' });
});

downloadBtn.addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = 'cropped.png';
  a.href = resultCanvas.toDataURL('image/png');
  a.click();
});
