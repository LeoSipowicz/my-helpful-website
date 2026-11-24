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

const basePrefixes = {
  2: '0b',
  8: '0o',
  10: '',
  16: '0x'
};

function parseBigInt(raw, base) {
  let value = raw.trim().replace(/[\s_]/g, '');
  if (value === '') return { empty: true };

  let negative = false;
  if (value[0] === '-' || value[0] === '+') {
    negative = value[0] === '-';
    value = value.slice(1);
  }

  const prefix = basePrefixes[base];
  if (prefix && value.toLowerCase().startsWith(prefix)) {
    value = value.slice(prefix.length);
  }

  if (!value || !validDigits[base].test(value)) {
    return { invalid: true };
  }

  return { value: BigInt((negative ? '-' : '') + prefix + value) };
}

function showInvalid() {
  binaryValue.textContent = 'Invalid';
  octalValue.textContent = 'Invalid';
  decimalValue.textContent = 'Invalid';
  hexValue.textContent = 'Invalid';
}

function convert() {
  const base = parseInt(inputBase.value, 10);
  const parsed = parseBigInt(inputValue.value, base);

  if (parsed.empty) {
    binaryValue.textContent = '-';
    octalValue.textContent = '-';
    decimalValue.textContent = '-';
    hexValue.textContent = '-';
    return;
  }

  if (parsed.invalid) {
    showInvalid();
    return;
  }

  const value = parsed.value;
  binaryValue.textContent = value.toString(2);
  octalValue.textContent = value.toString(8);
  decimalValue.textContent = value.toString(10);
  hexValue.textContent = value.toString(16);
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
        feedback.style.display = '';
        setTimeout(() => { feedback.style.display = 'none'; }, 2000);
      }
    }).catch(() => {});
  });
});

convert();
