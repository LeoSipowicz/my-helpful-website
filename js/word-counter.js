const inputText = document.getElementById('input-text');
const wordCountEl = document.getElementById('word-count');
const charCountEl = document.getElementById('char-count');
const charNoSpacesEl = document.getElementById('char-no-spaces');
const sentenceCountEl = document.getElementById('sentence-count');
const paragraphCountEl = document.getElementById('paragraph-count');
const readingTimeEl = document.getElementById('reading-time');
const speakingTimeEl = document.getElementById('speaking-time');
const keywordSection = document.getElementById('keyword-section');
const keywordList = document.getElementById('keyword-list');
const limitGrid = document.getElementById('limit-grid');
const copyBtn = document.getElementById('copy-btn');
const copyStatsBtn = document.getElementById('copy-stats-btn');
const clearBtn = document.getElementById('clear-btn');
const copyFeedback = document.getElementById('copy-feedback');
const copyStatsFeedback = document.getElementById('copy-stats-feedback');

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by','from','up','about','into','through','during','before','after','above','below','between','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','can','will','just','should','now','is','are','was','were','be','been','being','have','has','had','do','does','did','it','its','this','that','these','those','i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','they','them','their','theirs','themselves','what','which','who','whom','am'
]);

const READING_WPM = 200;
const SPEAKING_WPM = 130;

const PLATFORM_LIMITS = [
  { name: 'X (Twitter)', limit: 280 },
  { name: 'Bluesky', limit: 300 },
  { name: 'SMS message', limit: 160 },
  { name: 'LinkedIn post', limit: 3000 },
  { name: 'Instagram caption', limit: 2200 },
  { name: 'YouTube title', limit: 100 },
  { name: 'SEO title', limit: 60 },
  { name: 'Meta description', limit: 160 }
];

const limitCards = [];

function formatDuration(seconds) {
  if (seconds < 60) return '< 1m';
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest > 0 ? `${minutes}m ${rest}s` : `${minutes}m`;
}

function buildLimitCards() {
  if (!limitGrid) return;
  PLATFORM_LIMITS.forEach(({ name, limit }) => {
    const card = document.createElement('div');
    card.className = 'limit-card';

    const head = document.createElement('div');
    head.className = 'limit-head';
    const nameEl = document.createElement('span');
    nameEl.className = 'limit-name';
    nameEl.textContent = name;
    const countEl = document.createElement('span');
    countEl.className = 'limit-count';
    countEl.textContent = '0 / ' + limit.toLocaleString();
    head.append(nameEl, countEl);

    const bar = document.createElement('div');
    bar.className = 'limit-bar';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(limit));
    bar.setAttribute('aria-valuenow', '0');
    bar.setAttribute('aria-label', name + ' character count');
    const fill = document.createElement('span');
    fill.className = 'limit-fill';
    bar.appendChild(fill);

    const status = document.createElement('div');
    status.className = 'limit-status';
    status.textContent = limit.toLocaleString() + ' left';

    card.append(head, bar, status);
    limitGrid.appendChild(card);

    limitCards.push({ card, countEl, bar, fill, status, limit });
  });
}

function updateLimits(chars) {
  limitCards.forEach(({ card, countEl, bar, fill, status, limit }) => {
    const used = chars;
    const remaining = limit - used;
    const percent = Math.min(100, (used / limit) * 100);
    const over = used > limit;
    const warn = !over && used >= limit * 0.9;

    countEl.textContent = used.toLocaleString() + ' / ' + limit.toLocaleString();
    fill.style.width = percent + '%';
    bar.setAttribute('aria-valuenow', String(Math.min(used, limit)));
    card.classList.toggle('over', over);
    card.classList.toggle('warn', warn);
    status.textContent = over
      ? (used - limit).toLocaleString() + ' over'
      : remaining.toLocaleString() + ' left';
  });
}

function updateStats() {
  const text = inputText.value;

  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;

  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = text.trim().length === 0 ? 0 : sentences.length;

  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
  const paragraphCount = text.trim().length === 0 ? 0 : paragraphs.length;

  const readingTime = wordCount === 0
    ? '0s'
    : formatDuration(Math.max(1, Math.round(wordCount / READING_WPM * 60)));
  const speakingTime = wordCount === 0
    ? '0s'
    : formatDuration(Math.max(1, Math.round(wordCount / SPEAKING_WPM * 60)));

  wordCountEl.textContent = wordCount;
  charCountEl.textContent = chars;
  charNoSpacesEl.textContent = charsNoSpaces;
  sentenceCountEl.textContent = sentenceCount;
  paragraphCountEl.textContent = paragraphCount;
  readingTimeEl.textContent = readingTime;
  speakingTimeEl.textContent = speakingTime;

  updateLimits(chars);

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

function showFeedback(el) {
  if (!el) return;
  el.style.display = '';
  setTimeout(() => { el.style.display = 'none'; }, 2000);
}

inputText.addEventListener('input', updateStats);

copyBtn.addEventListener('click', () => {
  if (!inputText.value) return;
  navigator.clipboard.writeText(inputText.value).then(() => {
    showFeedback(copyFeedback);
  }).catch(() => {});
});

copyStatsBtn.addEventListener('click', () => {
  if (!inputText.value.trim()) return;
  const stats = [
    'Words: ' + wordCountEl.textContent,
    'Characters: ' + charCountEl.textContent,
    'Characters (no spaces): ' + charNoSpacesEl.textContent,
    'Sentences: ' + sentenceCountEl.textContent,
    'Paragraphs: ' + paragraphCountEl.textContent,
    'Reading time: ' + readingTimeEl.textContent,
    'Speaking time: ' + speakingTimeEl.textContent
  ].join('\n');
  navigator.clipboard.writeText(stats).then(() => {
    showFeedback(copyStatsFeedback);
  }).catch(() => {});
});

clearBtn.addEventListener('click', () => {
  inputText.value = '';
  updateStats();
  inputText.focus();
});

buildLimitCards();
updateStats();
