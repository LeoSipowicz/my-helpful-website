const fileInput = document.getElementById('file-input');
const canvasSection = document.getElementById('canvas-section');
const cropCanvas = document.getElementById('crop-canvas');
const cropCtx = cropCanvas.getContext('2d');
const cropInfo = document.getElementById('crop-info');
const cropBtn = document.getElementById('crop-btn');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');
const selectAllBtn = document.getElementById('select-all-btn');
const aspectSelect = document.getElementById('aspect-select');
const resultSection = document.getElementById('result-section');
const resultCanvas = document.getElementById('result-canvas');

const ASPECT_RATIOS = {
  free: null,
  '1:1': 1,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '3:2': 3 / 2,
  '2:3': 2 / 3
};

let originalImage = null;
let imgObjectUrl = null;

let isDragging = false;
let dragMode = 'new';
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;
let moveOffsetX = 0;
let moveOffsetY = 0;
let selection = null;

function getAspectRatio() {
  return ASPECT_RATIOS[aspectSelect.value] || null;
}

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
    selectAllBtn.disabled = false;
    selection = null;
    cropInfo.textContent = '';

    cropCanvas.width = img.naturalWidth;
    cropCanvas.height = img.naturalHeight;
    drawCanvas();

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

function isInsideSelection(x, y) {
  return !!selection && selection.w > 0 && selection.h > 0 &&
    x >= selection.x && x <= selection.x + selection.w &&
    y >= selection.y && y <= selection.y + selection.h;
}

function buildSelectionFromDrag() {
  const ratio = getAspectRatio();
  const dirX = endX >= startX ? 1 : -1;
  const dirY = endY >= startY ? 1 : -1;
  const maxW = dirX > 0 ? cropCanvas.width - startX : startX;
  const maxH = dirY > 0 ? cropCanvas.height - startY : startY;
  let w = Math.min(Math.abs(endX - startX), maxW);
  let h = Math.min(Math.abs(endY - startY), maxH);
  if (ratio && (w > 0 || h > 0)) {
    if (w <= 0) w = h * ratio;
    else if (h <= 0) h = w / ratio;
    else if (w / h > ratio) h = w / ratio;
    else w = h * ratio;
    if (w > maxW) { w = maxW; h = w / ratio; }
    if (h > maxH) { h = maxH; w = h * ratio; }
  }
  const x = dirX > 0 ? startX : startX - w;
  const y = dirY > 0 ? startY : startY - h;
  return { x, y, w, h };
}

function fitRatioAtCenter(ratio, cx, cy) {
  const maxHalfW = Math.min(cx, cropCanvas.width - cx);
  const maxHalfH = Math.min(cy, cropCanvas.height - cy);
  let w = maxHalfW * 2;
  let h = maxHalfH * 2;
  if (ratio) {
    if (w / h > ratio) w = h * ratio;
    else h = w / ratio;
  }
  return { x: cx - w / 2, y: cy - h / 2, w, h };
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

function clearResult() {
  if (resultSection.style.display !== 'none') {
    resultSection.style.display = 'none';
    downloadBtn.disabled = true;
  }
}

function updateCropInfo() {
  if (selection && selection.w > 0 && selection.h > 0) {
    const ratio = getAspectRatio();
    const ratioText = ratio ? ` at ${aspectSelect.value}` : '';
    cropInfo.textContent = `Selection: ${Math.round(selection.w)} \u00d7 ${Math.round(selection.h)} px${ratioText}`;
    cropBtn.disabled = false;
  } else {
    cropInfo.textContent = '';
    cropBtn.disabled = true;
  }
}

function startDrag(e) {
  if (!originalImage) return;
  e.preventDefault();
  const coords = getCanvasCoords(e);
  isDragging = true;

  if (isInsideSelection(coords.x, coords.y)) {
    dragMode = 'move';
    moveOffsetX = coords.x - selection.x;
    moveOffsetY = coords.y - selection.y;
  } else {
    dragMode = 'new';
    startX = coords.x;
    startY = coords.y;
    endX = coords.x;
    endY = coords.y;
    selection = buildSelectionFromDrag();
  }

  clearResult();
  drawCanvas();
  updateCropInfo();
}

function moveDrag(e) {
  if (!isDragging) return;
  e.preventDefault();
  const coords = getCanvasCoords(e);

  if (dragMode === 'move' && selection) {
    let x = coords.x - moveOffsetX;
    let y = coords.y - moveOffsetY;
    x = Math.max(0, Math.min(cropCanvas.width - selection.w, x));
    y = Math.max(0, Math.min(cropCanvas.height - selection.h, y));
    selection = { x, y, w: selection.w, h: selection.h };
  } else {
    endX = coords.x;
    endY = coords.y;
    selection = buildSelectionFromDrag();
  }

  clearResult();
  drawCanvas();
  updateCropInfo();
}

function endDrag(e) {
  if (!isDragging) return;
  isDragging = false;

  if (dragMode === 'new') {
    const hasCoords = (e.changedTouches && e.changedTouches.length) ||
                      (e.touches && e.touches.length) ||
                      typeof e.clientX === 'number';
    if (hasCoords) {
      const coords = getCanvasCoords(e);
      endX = coords.x;
      endY = coords.y;
      selection = buildSelectionFromDrag();
    }
    if (selection && (selection.w < 1 || selection.h < 1)) {
      selection = null;
    }
  }

  drawCanvas();
  updateCropInfo();
}

cropCanvas.addEventListener('mousedown', startDrag);
cropCanvas.addEventListener('touchstart', startDrag, { passive: false });

cropCanvas.addEventListener('mousemove', e => {
  if (isDragging) return;
  const coords = getCanvasCoords(e);
  cropCanvas.style.cursor = isInsideSelection(coords.x, coords.y) ? 'move' : 'crosshair';
});

window.addEventListener('mousemove', e => {
  if (isDragging) moveDrag(e);
});

window.addEventListener('touchmove', e => {
  if (isDragging) moveDrag(e);
}, { passive: false });

window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);
window.addEventListener('touchcancel', endDrag);

aspectSelect.addEventListener('change', () => {
  if (!originalImage) return;
  const ratio = getAspectRatio();
  if (!ratio) return;
  const cx = selection ? selection.x + selection.w / 2 : cropCanvas.width / 2;
  const cy = selection ? selection.y + selection.h / 2 : cropCanvas.height / 2;
  selection = fitRatioAtCenter(ratio, cx, cy);
  clearResult();
  drawCanvas();
  updateCropInfo();
});

selectAllBtn.addEventListener('click', () => {
  if (!originalImage) return;
  const ratio = getAspectRatio();
  if (ratio) {
    selection = fitRatioAtCenter(ratio, cropCanvas.width / 2, cropCanvas.height / 2);
  } else {
    selection = { x: 0, y: 0, w: cropCanvas.width, h: cropCanvas.height };
  }
  clearResult();
  drawCanvas();
  updateCropInfo();
});

resetBtn.addEventListener('click', () => {
  selection = null;
  resultSection.style.display = 'none';
  downloadBtn.disabled = true;
  drawCanvas();
  updateCropInfo();
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

  resultSection.style.display = 'block';
  downloadBtn.disabled = false;
  resultSection.scrollIntoView({ behavior: 'smooth' });
});

downloadBtn.addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = `cropped-${resultCanvas.width}x${resultCanvas.height}.png`;
  a.href = resultCanvas.toDataURL('image/png');
  a.click();
});
