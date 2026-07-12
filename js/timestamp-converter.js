const tsInput = document.getElementById('ts-input');
const tsDateOutput = document.getElementById('ts-date-output');
const tsDateLocal = document.getElementById('ts-date-local');
const tsDateUtc = document.getElementById('ts-date-utc');
const yearInput = document.getElementById('year-input');
const monthInput = document.getElementById('month-input');
const dayInput = document.getElementById('day-input');
const hourInput = document.getElementById('hour-input');
const minuteInput = document.getElementById('minute-input');
const secondInput = document.getElementById('second-input');
const dateTsOutputSeconds = document.getElementById('date-ts-output-seconds');
const dateTsOutputMs = document.getElementById('date-ts-output-ms');
const copyUtcBtn = document.getElementById('copy-utc-btn');
const copyLocalBtn = document.getElementById('copy-local-btn');
const copyTsOutputBtn = document.getElementById('copy-ts-output-btn');
const setNowBtn = document.getElementById('set-now-btn');
const setTodayBtn = document.getElementById('set-today-btn');
const utcFeedback = document.getElementById('utc-feedback');
const localFeedback = document.getElementById('local-feedback');
const tsOutputFeedback = document.getElementById('ts-output-feedback');

function pad(n) {
  return String(n).padStart(2, '0');
}

function updateNow() {
  const now = new Date();
  const seconds = Math.floor(now.getTime() / 1000);
  const ms = now.getTime();
  const iso = now.toISOString().replace('T', ' ').replace('Z', '');
  const local = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
  document.getElementById('now-seconds').textContent = seconds;
  document.getElementById('now-ms').textContent = ms;
  document.getElementById('now-utc').textContent = iso;
  document.getElementById('now-local').textContent = local;
}

function timestampToDate() {
  const val = tsInput.value.trim();
  if (val === '') {
    tsDateLocal.textContent = '';
    tsDateUtc.textContent = '';
    tsDateOutput.style.display = 'none';
    return;
  }
  const num = Number(val);
  if (isNaN(num)) {
    tsDateLocal.textContent = 'Invalid number';
    tsDateUtc.textContent = '';
    tsDateOutput.style.display = 'block';
    return;
  }
  const d = num > 1e11 ? new Date(num) : new Date(num * 1000);
  if (isNaN(d.getTime())) {
    tsDateLocal.textContent = 'Invalid date';
    tsDateUtc.textContent = '';
    tsDateOutput.style.display = 'block';
    return;
  }
  const local = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  const utc = d.toISOString().replace('T', ' ').replace('Z', '');
  tsDateLocal.textContent = local + ' (local)';
  tsDateUtc.textContent = utc + ' (UTC)';
  tsDateOutput.style.display = 'block';
}

function dateToTimestamp() {
  const y = parseInt(yearInput.value, 10);
  const m = parseInt(monthInput.value, 10) - 1;
  const d = parseInt(dayInput.value, 10);
  const h = parseInt(hourInput.value, 10) || 0;
  const min = parseInt(minuteInput.value, 10) || 0;
  const s = parseInt(secondInput.value, 10) || 0;
  if (isNaN(y) || isNaN(m + 1) || isNaN(d)) {
    dateTsOutputSeconds.textContent = '';
    dateTsOutputMs.textContent = '';
    return;
  }
  const date = new Date(y, m, d, h, min, s);
  if (isNaN(date.getTime())) {
    dateTsOutputSeconds.textContent = 'Invalid date';
    dateTsOutputMs.textContent = '';
    return;
  }
  dateTsOutputSeconds.textContent = Math.floor(date.getTime() / 1000) + ' (seconds)';
  dateTsOutputMs.textContent = date.getTime() + ' (milliseconds)';
}

function setNow() {
  const now = new Date();
  yearInput.value = now.getFullYear();
  monthInput.value = now.getMonth() + 1;
  dayInput.value = now.getDate();
  hourInput.value = now.getHours();
  minuteInput.value = now.getMinutes();
  secondInput.value = now.getSeconds();
  dateToTimestamp();
}

function setToday() {
  const now = new Date();
  yearInput.value = now.getFullYear();
  monthInput.value = now.getMonth() + 1;
  dayInput.value = now.getDate();
  hourInput.value = 0;
  minuteInput.value = 0;
  secondInput.value = 0;
  dateToTimestamp();
}

function showFeedback(el) {
  el.style.display = '';
  setTimeout(function() { el.style.display = 'none'; }, 2000);
}

updateNow();
setInterval(updateNow, 1000);
setNow();

tsInput.addEventListener('input', timestampToDate);

yearInput.addEventListener('input', dateToTimestamp);
monthInput.addEventListener('input', dateToTimestamp);
dayInput.addEventListener('input', dateToTimestamp);
hourInput.addEventListener('input', dateToTimestamp);
minuteInput.addEventListener('input', dateToTimestamp);
secondInput.addEventListener('input', dateToTimestamp);

copyUtcBtn.addEventListener('click', function() {
  const text = tsDateUtc.textContent.replace(' (UTC)', '').trim();
  if (text) {
    navigator.clipboard.writeText(text).then(function() { showFeedback(utcFeedback); });
  }
});

copyLocalBtn.addEventListener('click', function() {
  const text = tsDateLocal.textContent.replace(' (local)', '').trim();
  if (text) {
    navigator.clipboard.writeText(text).then(function() { showFeedback(localFeedback); });
  }
});

copyTsOutputBtn.addEventListener('click', function() {
  const text = dateTsOutputSeconds.textContent.replace(' (seconds)', '').trim();
  if (text && text !== 'Invalid date') {
    navigator.clipboard.writeText(text).then(function() { showFeedback(tsOutputFeedback); });
  }
});

setNowBtn.addEventListener('click', setNow);
setTodayBtn.addEventListener('click', setToday);
