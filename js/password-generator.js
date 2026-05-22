const passwordDisplay = document.getElementById('password-display');
const lengthSlider = document.getElementById('length-slider');
const lengthVal = document.getElementById('length-val');
const uppercaseCheck = document.getElementById('uppercase');
const lowercaseCheck = document.getElementById('lowercase');
const numbersCheck = document.getElementById('numbers');
const symbolsCheck = document.getElementById('symbols');
const excludeAmbiguousCheck = document.getElementById('exclude-ambiguous');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const copyFeedback = document.getElementById('copy-feedback');
const strengthFill = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*'
};

const AMBIGUOUS = new Set(['0', 'O', '1', 'l', 'I']);

function getPool() {
  let pool = '';
  if (uppercaseCheck.checked) pool += CHAR_SETS.uppercase;
  if (lowercaseCheck.checked) pool += CHAR_SETS.lowercase;
  if (numbersCheck.checked) pool += CHAR_SETS.numbers;
  if (symbolsCheck.checked) pool += CHAR_SETS.symbols;

  if (excludeAmbiguousCheck.checked) {
    pool = pool.split('').filter(c => !AMBIGUOUS.has(c)).join('');
  }
  return pool;
}

function generatePassword() {
  const length = parseInt(lengthSlider.value);
  const pool = getPool();

  if (!pool) {
    passwordDisplay.textContent = 'Select at least one character type';
    strengthFill.style.width = '0';
    strengthFill.style.background = 'transparent';
    strengthText.textContent = 'Strength: —';
    return;
  }

  // Ensure at least one character from each selected type is included
  let password = '';
  const selected = [];
  if (uppercaseCheck.checked) selected.push(CHAR_SETS.uppercase);
  if (lowercaseCheck.checked) selected.push(CHAR_SETS.lowercase);
  if (numbersCheck.checked) selected.push(CHAR_SETS.numbers);
  if (symbolsCheck.checked) selected.push(CHAR_SETS.symbols);

  for (const set of selected) {
    let chars = set;
    if (excludeAmbiguousCheck.checked) {
      chars = chars.split('').filter(c => !AMBIGUOUS.has(c)).join('');
    }
    if (chars) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  const remaining = length - password.length;
  for (let i = 0; i < remaining; i++) {
    password += pool[Math.floor(Math.random() * pool.length)];
  }

  // Shuffle the password so the guaranteed characters aren't always at the start
  password = password.split('').sort(() => Math.random() - 0.5).join('');

  passwordDisplay.textContent = password;
  updateStrength(password);
}

function updateStrength(password) {
  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*]/.test(password);
  const types = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  if (length >= 20) score++;
  if (types >= 2) score++;
  if (types >= 3) score++;
  if (types >= 4) score++;

  let label = '';
  let color = '';
  let width = '';

  if (score <= 3) {
    label = 'Weak';
    color = '#c0392b';
    width = '25%';
  } else if (score <= 5) {
    label = 'Fair';
    color = '#e67e22';
    width = '50%';
  } else if (score <= 6) {
    label = 'Good';
    color = '#f1c40f';
    width = '75%';
  } else {
    label = 'Strong';
    color = '#27ae60';
    width = '100%';
  }

  strengthFill.style.width = width;
  strengthFill.style.background = color;
  strengthText.textContent = `Strength: ${label}`;
  strengthText.style.color = color;
}

lengthSlider.addEventListener('input', () => {
  lengthVal.textContent = lengthSlider.value;
  generatePassword();
});

[uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck, excludeAmbiguousCheck].forEach(el => {
  el.addEventListener('change', generatePassword);
});

generateBtn.addEventListener('click', generatePassword);

copyBtn.addEventListener('click', () => {
  const text = passwordDisplay.textContent;
  if (!text || text.startsWith('Select') || text.startsWith('Click')) return;
  navigator.clipboard.writeText(text).then(() => {
    copyFeedback.style.display = '';
    setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
  });
});

// Generate on load
passwordDisplay.textContent = 'Click Generate to create a password';
strengthFill.style.width = '0';
strengthFill.style.background = 'transparent';
strengthText.textContent = 'Strength: —';
