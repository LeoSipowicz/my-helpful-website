(function() {
  'use strict';

  const minInput = document.getElementById('min-value');
  const maxInput = document.getElementById('max-value');
  const countInput = document.getElementById('count-value');
  const integerCheckbox = document.getElementById('integer-mode');
  const uniqueCheckbox = document.getElementById('unique-mode');
  const sortCheckbox = document.getElementById('sort-mode');
  const generateBtn = document.getElementById('generate-btn');
  const resultsContainer = document.getElementById('results');
  const copyBtn = document.getElementById('copy-btn');
  const copyFeedback = document.getElementById('copy-feedback');

  function cryptoRand() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / 4294967296;
  }

  function generateInteger(min, max) {
    const range = max - min + 1;
    if (range <= 0) return min;
    const maxValid = 4294967296 - (4294967296 % range);
    let value;
    do {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      value = array[0];
    } while (value >= maxValid);
    return min + (value % range);
  }

  function generateDecimal(min, max) {
    return min + cryptoRand() * (max - min);
  }

  function generate() {
    const min = parseFloat(minInput.value);
    const max = parseFloat(maxInput.value);
    const count = parseInt(countInput.value, 10) || 1;
    const isInteger = integerCheckbox.checked;
    const isUnique = uniqueCheckbox.checked;
    const isSort = sortCheckbox.checked;

    if (isNaN(min) || isNaN(max)) {
      resultsContainer.textContent = 'Enter valid min and max values';
      return;
    }
    if (min >= max) {
      resultsContainer.textContent = 'Max must be greater than Min';
      return;
    }
    if (count < 1 || count > 100) {
      resultsContainer.textContent = 'Count must be between 1 and 100';
      return;
    }

    if (isInteger && isUnique) {
      const range = max - min + 1;
      if (count > range) {
        resultsContainer.textContent = 'Cannot generate ' + count + ' unique integers in range [' + min + ', ' + max + ']';
        return;
      }
    }

    const results = [];
    const used = new Set();

    for (let i = 0; i < count; i++) {
      let value;
      let attempts = 0;
      do {
        if (isInteger) {
          value = generateInteger(Math.ceil(min), Math.floor(max));
        } else {
          value = generateDecimal(min, max);
        }
        attempts++;
      } while (isUnique && isInteger && used.has(value) && attempts < 10000);

      if (isUnique && isInteger) {
        used.add(value);
      }

      if (isInteger) {
        results.push(value);
      } else {
        results.push(parseFloat(value.toFixed(4)));
      }
    }

    if (isSort && isInteger) {
      results.sort(function(a, b) { return a - b; });
    }

    const separator = isInteger ? ', ' : ', ';
    resultsContainer.textContent = results.join(separator);
  }

  generateBtn.addEventListener('click', generate);

  countInput.addEventListener('input', function() {
    var val = parseInt(this.value, 10);
    if (isNaN(val) || val < 1) this.value = 1;
    if (val > 100) this.value = 100;
  });

  minInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') generate();
  });
  maxInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') generate();
  });

  integerCheckbox.addEventListener('change', function() {
    if (this.checked) {
      uniqueCheckbox.disabled = false;
    } else {
      uniqueCheckbox.checked = false;
      uniqueCheckbox.disabled = true;
    }
  });
  uniqueCheckbox.disabled = !integerCheckbox.checked;

  copyBtn.addEventListener('click', function() {
    var text = resultsContainer.textContent;
    if (!text || text === 'Click Generate to get random numbers' || text.indexOf('Enter valid') === 0 || text.indexOf('Max must be') === 0 || text.indexOf('Count must be') === 0 || text.indexOf('Cannot generate') === 0) return;
    navigator.clipboard.writeText(text).then(function() {
      copyFeedback.style.display = '';
      setTimeout(function() {
        copyFeedback.style.display = 'none';
      }, 2000);
    }).catch(function() {});
  });

  generate();
})();
