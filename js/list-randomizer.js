const inputList = document.getElementById('input-list');
const resultDisplay = document.getElementById('result-display');
const resultList = document.getElementById('result-list');
const pickBtn = document.getElementById('pick-btn');
const pickMultipleBtn = document.getElementById('pick-multiple-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const copyFeedback = document.getElementById('copy-feedback');
const pickCountInput = document.getElementById('pick-count-input');
const itemCount = document.getElementById('item-count');

function getItems() {
  return inputList.value.split('\n').map(s => s.trim()).filter(s => s !== '');
}

function updateItemCount() {
  const items = getItems();
  itemCount.textContent = items.length + ' item' + (items.length !== 1 ? 's' : '');
}

function randInt(min, max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return min + (array[0] % (max - min + 1));
}

function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom() {
  const items = getItems();
  if (items.length === 0) {
    resultDisplay.textContent = 'Enter some items first';
    return;
  }
  const picked = items[randInt(0, items.length - 1)];
  resultDisplay.textContent = picked;
  resultList.value = picked;
}

function pickMultiple() {
  const items = getItems();
  if (items.length === 0) {
    resultDisplay.textContent = 'Enter some items first';
    return;
  }
  let count = parseInt(pickCountInput.value, 10) || 1;
  if (count < 1) count = 1;
  if (count > items.length) count = items.length;
  const shuffled = fisherYatesShuffle([...items]);
  const picked = shuffled.slice(0, count);
  resultDisplay.textContent = picked.length === 1 ? picked[0] : picked.join(', ');
  resultList.value = picked.join('\n');
}

function shuffleList() {
  const items = getItems();
  if (items.length === 0) {
    resultDisplay.textContent = 'Enter some items first';
    return;
  }
  const shuffled = fisherYatesShuffle([...items]);
  resultDisplay.textContent = 'List shuffled - ' + shuffled.length + ' items';
  resultList.value = shuffled.join('\n');
}

function clearAll() {
  inputList.value = '';
  resultDisplay.textContent = 'Click Pick Random to choose an item';
  resultList.value = '';
  updateItemCount();
}

inputList.addEventListener('input', updateItemCount);

pickBtn.addEventListener('click', pickRandom);

pickMultipleBtn.addEventListener('click', pickMultiple);

shuffleBtn.addEventListener('click', shuffleList);

clearBtn.addEventListener('click', clearAll);

copyBtn.addEventListener('click', () => {
  if (!resultList.value) return;
  navigator.clipboard.writeText(resultList.value).then(() => {
    copyFeedback.style.display = '';
    copyFeedback.textContent = 'Copied!';
    setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
  }).catch(() => {});
});

updateItemCount();
