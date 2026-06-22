const mdInput = document.getElementById('md-input');
const mdPreview = document.getElementById('md-preview');
const copyBtn = document.getElementById('copy-btn');
const copyFeedback = document.getElementById('copy-feedback');
const clearBtn = document.getElementById('clear-btn');
const wordCount = document.getElementById('word-count');
const charCount = document.getElementById('char-count');

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderMarkdown(text) {
  if (!text.trim()) return '';

  const lines = text.split('\n');
  let html = '';
  let inList = false;
  let listType = null;

  function closeList() {
    if (inList) {
      html += '</' + listType + '>\n';
      inList = false;
      listType = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      closeList();
      html += '<hr>\n';
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      closeList();
      const level = hMatch[1].length;
      const content = processInline(hMatch[2]);
      html += '<h' + level + '>' + content + '</h' + level + '>\n';
      continue;
    }

    // Blockquote
    const bqMatch = line.match(/^>\s?(.*)$/);
    if (bqMatch) {
      closeList();
      html += '<blockquote>' + processInline(bqMatch[1]) + '</blockquote>\n';
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[\*\-\+]\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        html += '<ul>\n';
        inList = true;
        listType = 'ul';
      }
      html += '<li>' + processInline(ulMatch[1]) + '</li>\n';
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        html += '<ol>\n';
        inList = true;
        listType = 'ol';
      }
      html += '<li>' + processInline(olMatch[1]) + '</li>\n';
      continue;
    }

    // Fenced code block
    if (/^```/.test(line)) {
      closeList();
      const lang = line.slice(3).trim();
      let code = '';
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        code += lines[i] + '\n';
        i++;
      }
      const langAttr = lang ? ' class="lang-' + escapeHtml(lang) + '"' : '';
      html += '<pre><code' + langAttr + '>' + escapeHtml(code.trimEnd()) + '</code></pre>\n';
      continue;
    }

    // Inline code
    const icMatch = line.match(/^`(.+)`$/);
    if (icMatch) {
      closeList();
      html += '<p><code>' + escapeHtml(icMatch[1]) + '</code></p>\n';
      continue;
    }

    // Empty line
    if (line === '') {
      closeList();
      continue;
    }

    // Regular paragraph
    closeList();
    html += '<p>' + processInline(line) + '</p>\n';
  }

  closeList();
  return html;
}

function processInline(text) {
  let result = escapeHtml(text);

  // Extract inline code spans first so markdown syntax inside them is preserved
  const codeSpans = [];
  result = result.replace(/`([^`]+)`/g, function(match, content) {
    const placeholder = '%%%CODE' + codeSpans.length + '%%%';
    codeSpans.push(placeholder, '<code>' + content + '</code>');
    return placeholder;
  });

  // Images: ![alt](src)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold: **text** or __text__
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  result = result.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Restore code spans
  for (let i = 0; i < codeSpans.length; i += 2) {
    result = result.split(codeSpans[i]).join(codeSpans[i + 1]);
  }

  return result;
}

function updatePreview() {
  const text = mdInput.value;
  const rendered = renderMarkdown(text);
  mdPreview.innerHTML = rendered || '<p class="preview-placeholder">Rendered preview will appear here...</p>';

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  wordCount.textContent = words;
  charCount.textContent = chars;
}

mdInput.addEventListener('input', updatePreview);

clearBtn.addEventListener('click', () => {
  mdInput.value = '';
  mdPreview.innerHTML = '<p class="preview-placeholder">Rendered preview will appear here...</p>';
  wordCount.textContent = '0';
  charCount.textContent = '0';
  mdInput.focus();
});

copyBtn.addEventListener('click', () => {
  const html = mdPreview.innerHTML;
  if (!html || html.includes('preview-placeholder')) {
    copyFeedback.textContent = 'Nothing to copy';
    copyFeedback.style.display = 'inline';
    setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
    return;
  }
  navigator.clipboard.writeText(html).then(() => {
    copyFeedback.textContent = 'Copied!';
    copyFeedback.style.display = 'inline';
    setTimeout(() => { copyFeedback.style.display = 'none'; }, 2000);
  });
});

updatePreview();
