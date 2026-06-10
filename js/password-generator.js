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

/* Secure randomness using Web Crypto API */
function secureRandomInt(max) {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function secureShuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
    strengthText.textContent = 'Strength: -';
    return;
  }

  // Determine selected sets
  const selected = [];
  if (uppercaseCheck.checked) selected.push(filterAmbiguous(CHAR_SETS.uppercase));
  if (lowercaseCheck.checked) selected.push(filterAmbiguous(CHAR_SETS.lowercase));
  if (numbersCheck.checked) selected.push(filterAmbiguous(CHAR_SETS.numbers));
  if (symbolsCheck.checked) selected.push(filterAmbiguous(CHAR_SETS.symbols));

  // Filter out empty sets (can happen if exclude-ambiguous removes every char)
  const validSets = selected.filter(s => s.length > 0);

  const passwordChars = [];

  // Ensure at least one character from each selected type, but never exceed requested length
  for (const set of validSets) {
    if (passwordChars.length < length) {
      passwordChars.push(set[secureRandomInt(set.length)]);
    }
  }

  // Fill remaining length with characters from the full pool
  while (passwordChars.length < length) {
    passwordChars.push(pool[secureRandomInt(pool.length)]);
  }

  // Shuffle so guaranteed characters aren't always at the start
  const shuffled = secureShuffle(passwordChars);
  const password = shuffled.join('');

  passwordDisplay.textContent = password;
  updateStrength(password);
}

function filterAmbiguous(set) {
  if (!excludeAmbiguousCheck.checked) return set;
  return set.split('').filter(c => !AMBIGUOUS.has(c)).join('');
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
strengthText.textContent = 'Strength: -';
