const inputValue = document.getElementById('input-value');
const inputBase = document.getElementById('input-base');
const binaryValue = document.getElementById('binary-value');
const octalValue = document.getElementById('octal-value');
const decimalValue = document.getElementById('decimal-value');
const hexValue = document.getElementById('hex-value');

const validDigits = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/
};

function convert() {
  const val = inputValue.value.trim();
  const base = parseInt(inputBase.value, 10);

  if (val === '') {
    binaryValue.textContent = '-';
    octalValue.textContent = '-';
    decimalValue.textContent = '-';
    hexValue.textContent = '-';
    return;
  }

  const digitCheck = validDigits[base];
  if (!digitCheck.test(val)) {
    binaryValue.textContent = 'Invalid';
    octalValue.textContent = 'Invalid';
    decimalValue.textContent = 'Invalid';
    hexValue.textContent = 'Invalid';
    return;
  }

  const dec = parseInt(val, base);
  if (isNaN(dec)) {
    binaryValue.textContent = 'Invalid';
    octalValue.textContent = 'Invalid';
    decimalValue.textContent = 'Invalid';
    hexValue.textContent = 'Invalid';
    return;
  }

  binaryValue.textContent = dec.toString(2);
  octalValue.textContent = dec.toString(8);
  decimalValue.textContent = dec.toString(10);
  hexValue.textContent = dec.toString(16);
}

inputValue.addEventListener('input', convert);
inputBase.addEventListener('change', convert);

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const target = document.getElementById(targetId);
    if (!target) return;
    const text = target.textContent;
    if (text === '-' || text === 'Invalid') return;
    navigator.clipboard.writeText(text).then(() => {
      const feedback = document.getElementById('bf-' + targetId);
      if (feedback) {
        feedback.style.display = 'inline';
        setTimeout(() => { feedback.style.display = 'none'; }, 2000);
      }
    }).catch(() => {});
  });
});

convert();
