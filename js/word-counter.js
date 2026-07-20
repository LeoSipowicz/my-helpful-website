const inputText = document.getElementById('input-text');
const wordCountEl = document.getElementById('word-count');
const charCountEl = document.getElementById('char-count');
const charNoSpacesEl = document.getElementById('char-no-spaces');
const sentenceCountEl = document.getElementById('sentence-count');
const paragraphCountEl = document.getElementById('paragraph-count');
const readingTimeEl = document.getElementById('reading-time');
const keywordSection = document.getElementById('keyword-section');
const keywordList = document.getElementById('keyword-list');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const copyFeedback = document.getElementById('copy-feedback');

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by','from','up','about','into','through','during','before','after','above','below','between','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','can','will','just','should','now','is','are','was','were','be','been','being','have','has','had','do','does','did','it','its','this','that','these','those','i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','they','them','their','theirs','themselves','what','which','who','whom','am'
]);

function updateStats() {
  const text = inputText.value;

  // Character counts
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;

  // Word count
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Sentence count (approximate by punctuation)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = text.trim().length === 0 ? 0 : sentences.length;

  // Paragraph count
  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
  const paragraphCount = text.trim().length === 0 ? 0 : paragraphs.length;

  // Reading time (200 wpm average)
  const minutes = Math.floor(wordCount / 200);
  const seconds = Math.round((wordCount % 200) / 200 * 60);
  let readingTime;
  if (minutes > 0) {
    readingTime = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  } else {
    readingTime = wordCount > 0 ? '< 1m' : '0s';
  }

  wordCountEl.textContent = wordCount;
  charCountEl.textContent = chars;
  charNoSpacesEl.textContent = charsNoSpaces;
  sentenceCountEl.textContent = sentenceCount;
  paragraphCountEl.textContent = paragraphCount;
  readingTimeEl.textContent = readingTime;

  // Keyword density
  if (wordCount > 0) {
    const freq = {};
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.length > 2 && !STOP_WORDS.has(clean)) {
        freq[clean] = (freq[clean] || 0) + 1;
      }
    });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (sorted.length > 0) {
      keywordSection.style.display = '';
      keywordList.innerHTML = sorted.map(([word, count]) => {
        const pct = ((count / wordCount) * 100).toFixed(1);
        const barWidth = Math.min(100, (count / sorted[0][1]) * 100);
        return `<li><span>${word}</span><span><span class="density-bar" style="width:${barWidth}px"></span>${count} (${pct}%)</span></li>`;
      }).join('');
    } else {
      keywordSection.style.display = 'none';
    }
  } else {
    keywordSection.style.display = 'none';
  }
}

inputText.addEventListener('input', updateStats);

copyBtn.addEventListener('click', () => {
  if (!inputText.value) return;
  navigator.clipboard.writeText(inputText.value).then(() => {
    copyFeedback.style.display = '';
    setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
  }).catch(() => {});
});

clearBtn.addEventListener('click', () => {
  inputText.value = '';
  updateStats();
  inputText.focus();
});

updateStats();
