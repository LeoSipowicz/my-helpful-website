document.addEventListener('DOMContentLoaded', () => {
  const WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing',
    'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
    'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam',
    'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
    'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor',
    'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'eu',
    'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
    'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'fusce',
    'aliquet', 'lectus', 'sapien', 'egestas', 'bibendum', 'laoreet',
    'tristique', 'pharetra', 'viverra', 'rutrum', 'cursus', 'dictum',
    'lobortis', 'ornare', 'iaculis', 'pretium', 'porttitor', 'mattis',
    'posuere', 'ultricies', 'congue', 'hendrerit', 'faucibus', 'odio',
    'tempus', 'fermentum', 'sagittis', 'interdum', 'malesuada', 'dapibus',
    'varius', 'nunc', 'neque', 'gravida', 'semper', 'metus', 'massa',
    'suscipit', 'scelerisque', 'pulvinar', 'nisl', 'purus', 'donec',
    'sollicitudin', 'lectus', 'habitant', 'platea', 'dictumst', 'mauris',
    'vulputate', 'vitae', 'justo', 'tellus', 'feugiat', 'sociis', 'natoque',
    'penatibus', 'magnis', 'dis', 'parturient', 'montes', 'ridiculus', 'mus'
  ];

  const WORD_COUNT = WORDS.length;
  const START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

  const countInput = document.getElementById('count');
  const countVal = document.getElementById('count-val');
  const unitRadios = document.querySelectorAll('input[name="unit"]');
  const startLoremCheck = document.getElementById('start-lorem');
  const generateBtn = document.getElementById('generate-btn');
  const outputText = document.getElementById('output-text');
  const copyBtn = document.getElementById('copy-btn');
  const copyFeedback = document.getElementById('copy-feedback');
  const clearBtn = document.getElementById('clear-btn');

  function randInt(min, max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return min + (array[0] % (max - min + 1));
  }

  function pickWord() {
    return WORDS[randInt(0, WORD_COUNT - 1)];
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function makeSentence(minWords, maxWords) {
    const len = randInt(minWords, maxWords);
    const words = [];
    for (let i = 0; i < len; i++) {
      let word = pickWord();
      if (i === 0) word = capitalize(word);
      words.push(word);
    }
    return words.join(' ') + '.';
  }

  function makeParagraph(sentences, minWordsPerSentence, maxWordsPerSentence) {
    const sents = [];
    for (let i = 0; i < sentences; i++) {
      sents.push(makeSentence(minWordsPerSentence, maxWordsPerSentence));
    }
    return sents.join(' ');
  }

  function generateLorem(count, unit, startLorem) {
    if (count < 1) count = 1;
    if (count > 100) count = 100;

    let result = '';

    if (unit === 'words') {
      const words = [];
      for (let i = 0; i < count; i++) {
        let word = pickWord();
        if (i === 0 && startLorem) {
          words.push('Lorem');
        } else if (i === 0) {
          words.push(capitalize(word));
        } else {
          words.push(word);
        }
      }
      if (count > 0) {
        result = words.join(' ') + '.';
      }
    } else if (unit === 'sentences') {
      const sents = [];
      for (let i = 0; i < count; i++) {
        sents.push(makeSentence(5, 15));
      }
      result = sents.join(' ');
    } else {
      const sentsPerPara = randInt(3, 7);
      for (let i = 0; i < count; i++) {
        let para = '';
        if (i === 0 && startLorem) {
          para = START + ' ';
          const extraSentences = sentsPerPara - 1;
          for (let j = 0; j < extraSentences; j++) {
            para += makeSentence(6, 16) + ' ';
          }
          para = para.trim();
        } else {
          para = makeParagraph(sentsPerPara, 6, 16);
        }
        result += para + '\n\n';
      }
      result = result.trim();
    }

    return result;
  }

  function getUnit() {
    for (const radio of unitRadios) {
      if (radio.checked) return radio.value;
    }
    return 'paragraphs';
  }

  function update() {
    const count = parseInt(countInput.value, 10) || 1;
    const unit = getUnit();
    const startLorem = startLoremCheck.checked;
    outputText.value = generateLorem(count, unit, startLorem);
  }

  countInput.addEventListener('input', () => {
    countVal.textContent = countInput.value;
  });

  generateBtn.addEventListener('click', update);

  copyBtn.addEventListener('click', () => {
    if (!outputText.value) return;
    navigator.clipboard.writeText(outputText.value).then(() => {
      copyFeedback.style.display = '';
      copyFeedback.textContent = 'Copied!';
      setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
    }).catch(() => {});
  });

  clearBtn.addEventListener('click', () => {
    outputText.value = '';
  });
});
