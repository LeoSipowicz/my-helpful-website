document.addEventListener('DOMContentLoaded', () => {
  const modeButtons = document.querySelectorAll('.mode-btn');
  const inputALabel = document.getElementById('input-a-label');
  const inputBLabel = document.getElementById('input-b-label');
  const inputA = document.getElementById('input-a');
  const inputB = document.getElementById('input-b');
  const resultBlock = document.getElementById('result-block');
  const resultValue = document.getElementById('result-value');
  const resultSentence = document.getElementById('result-sentence');
  const copyBtn = document.getElementById('copy-btn');
  const copyFeedback = document.getElementById('copy-feedback');

  const MODES = {
    'percent-of': {
      aLabel: 'Percentage',
      bLabel: 'Value',
      aPlaceholder: '15',
      bPlaceholder: '200'
    },
    'is-what-percent': {
      aLabel: 'Value',
      bLabel: 'Total',
      aPlaceholder: '30',
      bPlaceholder: '150'
    },
    'change': {
      aLabel: 'Original value',
      bLabel: 'New value',
      aPlaceholder: '80',
      bPlaceholder: '100'
    }
  };

  let mode = 'percent-of';

  function formatNumber(n) {
    if (!isFinite(n)) return '...';
    return String(parseFloat(n.toPrecision(12)));
  }

  function switchMode(newMode) {
    mode = newMode;
    modeButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === newMode);
    });
    inputALabel.textContent = MODES[newMode].aLabel;
    inputBLabel.textContent = MODES[newMode].bLabel;
    inputA.placeholder = MODES[newMode].aPlaceholder;
    inputB.placeholder = MODES[newMode].bPlaceholder;
    inputA.value = '';
    inputB.value = '';
    resultBlock.style.display = 'none';
    inputA.focus();
  }

  function calculate() {
    const aEmpty = inputA.value.trim() === '';
    const bEmpty = inputB.value.trim() === '';
    if (aEmpty || bEmpty) {
      resultBlock.style.display = 'none';
      return;
    }

    const a = parseFloat(inputA.value);
    const b = parseFloat(inputB.value);
    if (isNaN(a) || isNaN(b)) {
      resultBlock.style.display = 'none';
      return;
    }

    let value;
    let unit = '';
    let sentence;

    if (mode === 'percent-of') {
      value = a / 100 * b;
      sentence = formatNumber(a) + '% of ' + formatNumber(b) + ' is ' + formatNumber(value) + '.';
    } else if (mode === 'is-what-percent') {
      if (b === 0) {
        resultValue.textContent = 'Undefined';
        resultSentence.textContent = 'Cannot divide by zero.';
        resultBlock.style.display = 'block';
        return;
      }
      value = a / b * 100;
      unit = '%';
      sentence = formatNumber(a) + ' is ' + formatNumber(value) + '% of ' + formatNumber(b) + '.';
    } else {
      if (a === 0) {
        resultValue.textContent = 'Undefined';
        resultSentence.textContent = 'Cannot calculate a percent change from zero.';
        resultBlock.style.display = 'block';
        return;
      }
      value = (b - a) / a * 100;
      unit = '%';
      const dir = value >= 0 ? 'increase' : 'decrease';
      sentence = 'The change from ' + formatNumber(a) + ' to ' + formatNumber(b) + ' is a ' + formatNumber(Math.abs(value)) + '% ' + dir + '.';
    }

    resultValue.textContent = formatNumber(value) + unit;
    resultSentence.textContent = sentence;
    resultBlock.style.display = 'block';
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  inputA.addEventListener('input', calculate);
  inputB.addEventListener('input', calculate);

  copyBtn.addEventListener('click', () => {
    const text = resultValue.textContent;
    if (!text || text === 'Undefined') return;
    navigator.clipboard.writeText(text).then(() => {
      copyFeedback.style.display = '';
      setTimeout(() => {
        copyFeedback.style.display = 'none';
      }, 2000);
    }).catch(() => {});
  });

  inputA.value = '15';
  inputB.value = '200';
  calculate();
});
