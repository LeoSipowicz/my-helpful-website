document.addEventListener('DOMContentLoaded', () => {
  const modeButtons = document.querySelectorAll('.mode-btn');
  const stopwatchPanel = document.getElementById('stopwatch-panel');
  const timerPanel = document.getElementById('timer-panel');

  const swDisplay = document.getElementById('sw-display');
  const swStartBtn = document.getElementById('sw-start');
  const swLapBtn = document.getElementById('sw-lap');
  const swResetBtn = document.getElementById('sw-reset');
  const lapsWrap = document.getElementById('laps-wrap');
  const lapsList = document.getElementById('laps-list');
  const lapsHeader = lapsList ? lapsList.querySelector('.laps-header') : null;

  const hoursInput = document.getElementById('tm-h');
  const minutesInput = document.getElementById('tm-m');
  const secondsInput = document.getElementById('tm-s');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const tmDisplay = document.getElementById('tm-display');
  const tmStartBtn = document.getElementById('tm-start');
  const tmResetBtn = document.getElementById('tm-reset');
  const timerDone = document.getElementById('timer-done');

  let swRunning = false;
  let swStartedAt = 0;
  let swAccumulated = 0;
  let lastLapTotal = 0;
  let swRaf = null;

  let tmRunning = false;
  let tmStartedAt = 0;
  let tmAccumulated = 0;
  let tmTarget = 0;
  let tmRaf = null;
  let tmFinished = false;
  let audioCtx = null;

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function formatClock(msTotal, withHundredths) {
    msTotal = Math.max(0, msTotal);
    const totalHundredths = Math.floor(msTotal / 10);
    const hundredths = totalHundredths % 100;
    const totalSeconds = Math.floor(totalHundredths / 100);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    return pad2(hours) + ':' + pad2(minutes) + ':' + pad2(seconds)
      + (withHundredths ? '.' + pad2(hundredths) : '');
  }

  function swElapsed() {
    return swRunning ? performance.now() - swStartedAt + swAccumulated : swAccumulated;
  }

  function renderStopwatch() {
    swDisplay.textContent = formatClock(swElapsed(), true);
  }

  function swLoop() {
    renderStopwatch();
    swRaf = requestAnimationFrame(swLoop);
  }

  function startStopwatch() {
    swRunning = true;
    swStartedAt = performance.now();
    swStartBtn.textContent = 'Pause';
    swLapBtn.disabled = false;
    swResetBtn.disabled = false;
    swLoop();
  }

  function pauseStopwatch() {
    if (!swRunning) return;
    swAccumulated += performance.now() - swStartedAt;
    swRunning = false;
    if (swRaf) cancelAnimationFrame(swRaf);
    swRaf = null;
    renderStopwatch();
    swStartBtn.textContent = 'Resume';
    swLapBtn.disabled = true;
  }

  function resetStopwatch() {
    pauseStopwatch();
    swAccumulated = 0;
    lastLapTotal = 0;
    swStartBtn.textContent = 'Start';
    swLapBtn.disabled = true;
    swResetBtn.disabled = true;
    lapsWrap.style.display = 'none';
    if (lapsList) {
      lapsList.querySelectorAll('.laps-header ~ li').forEach((li) => li.remove());
    }
    renderStopwatch();
  }

  swStartBtn.addEventListener('click', () => {
    if (swRunning) pauseStopwatch();
    else startStopwatch();
  });

  swLapBtn.addEventListener('click', () => {
    if (!swRunning) return;
    const total = swElapsed();
    if (total <= lastLapTotal) return;
    const lapMs = total - lastLapTotal;
    lastLapTotal = total;
    const count = lapsList ? lapsList.querySelectorAll('.laps-header ~ li').length + 1 : 1;
    const li = document.createElement('li');
    const lapSpan = document.createElement('span');
    const lapTimeSpan = document.createElement('span');
    const totalSpan = document.createElement('span');
    lapSpan.textContent = 'Lap ' + count;
    lapTimeSpan.textContent = formatClock(lapMs, true);
    totalSpan.textContent = formatClock(total, true);
    li.appendChild(lapSpan);
    li.appendChild(lapTimeSpan);
    li.appendChild(totalSpan);
    if (lapsHeader && lapsHeader.nextElementSibling) {
      lapsList.insertBefore(li, lapsHeader.nextElementSibling);
    } else if (lapsList) {
      lapsList.appendChild(li);
    }
    lapsWrap.style.display = '';
  });

  swResetBtn.addEventListener('click', resetStopwatch);

  function readTarget() {
    const h = Math.max(0, parseInt(hoursInput.value, 10) || 0);
    const m = Math.max(0, parseInt(minutesInput.value, 10) || 0);
    const s = Math.max(0, parseInt(secondsInput.value, 10) || 0);
    return (h * 3600 + m * 60 + s) * 1000;
  }

  function tmRemaining() {
    const elapsed = tmRunning ? performance.now() - tmStartedAt + tmAccumulated : tmAccumulated;
    return Math.max(0, tmTarget - elapsed);
  }

  function renderTimer() {
    tmDisplay.textContent = formatClock(tmRemaining(), false);
  }

  function tmLoop() {
    renderTimer();
    if (tmRemaining() <= 0) {
      finishTimer();
      return;
    }
    tmRaf = requestAnimationFrame(tmLoop);
  }

  function ensureAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        audioCtx = null;
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function beepAlarm() {
    if (!audioCtx) return;
    const ctx = audioCtx;
    const start = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.12, start + i * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, start + i * 0.4 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start + i * 0.4);
      osc.stop(start + i * 0.4 + 0.3);
    }
  }

  function finishTimer() {
    tmRunning = false;
    tmAccumulated = 0;
    if (tmRaf) cancelAnimationFrame(tmRaf);
    tmRaf = null;
    tmFinished = true;
    tmDisplay.classList.add('done-flash');
    timerDone.textContent = "Time's up!";
    timerDone.style.display = 'block';
    tmStartBtn.textContent = 'Start';
    tmStartBtn.disabled = true;
    beepAlarm();
  }

  function startTimer() {
    ensureAudio();
    if (tmFinished) return;
    if (tmRunning) {
      tmAccumulated += performance.now() - tmStartedAt;
      tmRunning = false;
      if (tmRaf) cancelAnimationFrame(tmRaf);
      tmRaf = null;
      renderTimer();
      tmStartBtn.textContent = 'Resume';
      return;
    }
    const target = readTarget();
    if (target <= 0) return;
    tmTarget = target;
    if (tmAccumulated === 0) {
      renderTimer();
    }
    tmRunning = true;
    tmStartedAt = performance.now();
    tmStartBtn.textContent = 'Pause';
    tmResetBtn.disabled = false;
    tmLoop();
  }

  function resetTimer() {
    tmRunning = false;
    if (tmRaf) cancelAnimationFrame(tmRaf);
    tmRaf = null;
    tmAccumulated = 0;
    tmTarget = 0;
    tmFinished = false;
    tmDisplay.classList.remove('done-flash');
    timerDone.style.display = 'none';
    tmStartBtn.textContent = 'Start';
    tmStartBtn.disabled = false;
    tmResetBtn.disabled = true;
    renderTimer();
  }

  function rearmFromInputs() {
    if (tmRunning || tmFinished) return;
    tmTarget = readTarget();
    tmAccumulated = 0;
    renderTimer();
  }

  tmStartBtn.addEventListener('click', startTimer);
  tmResetBtn.addEventListener('click', resetTimer);

  hoursInput.addEventListener('input', rearmFromInputs);
  minutesInput.addEventListener('input', rearmFromInputs);
  secondsInput.addEventListener('input', rearmFromInputs);

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.dataset.minutes, 10) || 0;
      const hours = parseInt(btn.dataset.hours, 10) || 0;
      hoursInput.value = hours ? String(hours) : '';
      minutesInput.value = hours ? '' : String(minutes);
      secondsInput.value = hours ? '' : '0';
      rearmFromInputs();
    });
  });

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isStopwatch = btn.dataset.mode === 'stopwatch';
      modeButtons.forEach((b) => b.classList.toggle('active', b.dataset.mode === btn.dataset.mode));
      stopwatchPanel.style.display = isStopwatch ? '' : 'none';
      timerPanel.style.display = isStopwatch ? 'none' : '';
      if (isStopwatch) {
        if (tmRunning) {
          tmAccumulated += performance.now() - tmStartedAt;
          tmRunning = false;
          if (tmRaf) cancelAnimationFrame(tmRaf);
          tmRaf = null;
          renderTimer();
          tmStartBtn.textContent = 'Resume';
        }
      } else if (swRunning) {
        pauseStopwatch();
      }
    });
  });
});