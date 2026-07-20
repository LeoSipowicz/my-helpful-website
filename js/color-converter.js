const hexInput = document.getElementById('hex-input');
const hexPreview = document.getElementById('hex-preview');
const rInput = document.getElementById('r-input');
const gInput = document.getElementById('g-input');
const bInput = document.getElementById('b-input');
const hInput = document.getElementById('h-input');
const sInput = document.getElementById('s-input');
const lInput = document.getElementById('l-input');
const colorPreview = document.getElementById('color-preview');
const copyFeedback = document.getElementById('copy-feedback');

function hexToRgb(hex) {
  hex = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) return null;
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length >= 6) hex = hex.slice(0, 6);
  if (hex.length < 6) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
  };
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

let updating = false;

const rgbDisplay = document.getElementById('rgb-display');
const hslDisplay = document.getElementById('hsl-display');

function updateDisplays(r, g, b, h, s, l) {
  rgbDisplay.value = `rgb(${r}, ${g}, ${b})`;
  hslDisplay.value = `hsl(${h}, ${s}%, ${l}%)`;
}

function updateFromHex() {
  if (updating) return;
  updating = true;
  const raw = hexInput.value;
  const hex = raw.startsWith('#') ? raw : '#' + raw;
  const rgb = hexToRgb(hex);
  if (rgb) {
    rInput.value = rgb.r;
    gInput.value = rgb.g;
    bInput.value = rgb.b;
    hexPreview.textContent = hex.toLowerCase();
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hInput.value = hsl.h;
    sInput.value = hsl.s;
    lInput.value = hsl.l;
    updateDisplays(rgb.r, rgb.g, rgb.b, hsl.h, hsl.s, hsl.l);
    applyColor(rgb.r, rgb.g, rgb.b);
  } else {
    hexPreview.textContent = raw ? 'Invalid' : '';
    if (!raw) {
      rInput.value = '';
      gInput.value = '';
      bInput.value = '';
      hInput.value = '';
      sInput.value = '';
      lInput.value = '';
      rgbDisplay.value = '';
      hslDisplay.value = '';
      colorPreview.style.background = 'var(--sand)';
    }
  }
  updating = false;
}

function updateFromRgb() {
  if (updating) return;
  updating = true;
  const r = clamp(parseInt(rInput.value) || 0, 0, 255);
  const g = clamp(parseInt(gInput.value) || 0, 0, 255);
  const b = clamp(parseInt(bInput.value) || 0, 0, 255);
  const hex = rgbToHex(r, g, b);
  hexInput.value = hex;
  hexPreview.textContent = hex;
  const hsl = rgbToHsl(r, g, b);
  hInput.value = hsl.h;
  sInput.value = hsl.s;
  lInput.value = hsl.l;
  updateDisplays(r, g, b, hsl.h, hsl.s, hsl.l);
  applyColor(r, g, b);
  updating = false;
}

function updateFromHsl() {
  if (updating) return;
  updating = true;
  const h = clamp(parseInt(hInput.value) || 0, 0, 360);
  const s = clamp(parseInt(sInput.value) || 0, 0, 100);
  const l = clamp(parseInt(lInput.value) || 0, 0, 100);
  const rgb = hslToRgb(h, s, l);
  rInput.value = rgb.r;
  gInput.value = rgb.g;
  bInput.value = rgb.b;
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  hexInput.value = hex;
  hexPreview.textContent = hex;
  updateDisplays(rgb.r, rgb.g, rgb.b, h, s, l);
  applyColor(rgb.r, rgb.g, rgb.b);
  updating = false;
}

function applyColor(r, g, b) {
  colorPreview.style.background = `rgb(${r}, ${g}, ${b})`;
}

hexInput.addEventListener('input', updateFromHex);
rInput.addEventListener('input', updateFromRgb);
gInput.addEventListener('input', updateFromRgb);
bInput.addEventListener('input', updateFromRgb);
hInput.addEventListener('input', updateFromHsl);
sInput.addEventListener('input', updateFromHsl);
lInput.addEventListener('input', updateFromHsl);

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    navigator.clipboard.writeText(target.value).then(() => {
      copyFeedback.textContent = 'Copied!';
      copyFeedback.style.display = '';
      setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
    }).catch(() => {});
  });
});

updateFromHex();
