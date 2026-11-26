'use strict';

var MAX_MATCHES = 2000;
var MAX_LIST = 200;
var MAX_DISPLAY = 300;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildRegex(pattern, flags) {
  return new RegExp(pattern, flags);
}

function collectMatches(regex, text, limit) {
  var matches = [];
  var max = limit || MAX_MATCHES;
  if (!regex.global) {
    var first = regex.exec(text);
    if (first) matches.push(first);
    return matches;
  }
  regex.lastIndex = 0;
  var match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match);
    if (match[0] === '') {
      var step = 1;
      if (regex.unicode) {
        var code = text.codePointAt(regex.lastIndex);
        if (code !== undefined && code > 0xFFFF) step = 2;
      }
      regex.lastIndex += step;
      if (regex.lastIndex > text.length) break;
    }
    if (matches.length >= max) break;
  }
  return matches;
}

function buildHighlightedHtml(text, matches) {
  if (!matches.length) return escapeHtml(text);
  var html = '';
  var last = 0;
  for (var i = 0; i < matches.length; i++) {
    var match = matches[i];
    var start = match.index;
    var end = start + match[0].length;
    if (start < last) continue;
    html += escapeHtml(text.slice(last, start));
    if (match[0] === '') {
      html += '<mark class="zero" aria-label="Zero-length match"></mark>';
      last = start;
    } else {
      html += '<mark' + (i % 2 ? ' class="alt"' : '') + '>' + escapeHtml(match[0]) + '</mark>';
      last = end;
    }
  }
  html += escapeHtml(text.slice(last));
  return html;
}

function truncateText(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max) + ' [truncated]';
}

function buildMatchRows(matches, limit) {
  var rows = [];
  var max = Math.min(matches.length, limit || MAX_LIST);
  for (var i = 0; i < max; i++) {
    var match = matches[i];
    var groups = [];
    for (var g = 1; g < match.length; g++) {
      if (match[g] !== undefined) groups.push({ label: '$' + g, value: match[g] });
    }
    if (match.groups) {
      var names = Object.keys(match.groups);
      for (var n = 0; n < names.length; n++) {
        var name = names[n];
        if (match.groups[name] !== undefined) {
          groups.push({ label: '<' + name + '>', value: match.groups[name] });
        }
      }
    }
    rows.push({
      index: i + 1,
      position: match.index,
      text: match[0],
      groups: groups
    });
  }
  return rows;
}

function runReplace(text, regex, replacement) {
  var fresh = new RegExp(regex.source, regex.flags);
  return text.replace(fresh, replacement);
}

document.addEventListener('DOMContentLoaded', function () {
  var patternInput = document.getElementById('pattern');
  var testText = document.getElementById('test-text');
  var replacementInput = document.getElementById('replacement');
  var replaceOutput = document.getElementById('replace-output');
  var preview = document.getElementById('match-preview');
  var matchList = document.getElementById('match-list');
  var meta = document.getElementById('regex-meta');
  var error = document.getElementById('regex-error');
  var copyBtn = document.getElementById('copy-replace');
  var copyFeedback = document.getElementById('copy-feedback');
  var clearBtn = document.getElementById('clear-btn');
  var flagInputs = {
    g: document.getElementById('flag-g'),
    i: document.getElementById('flag-i'),
    m: document.getElementById('flag-m'),
    s: document.getElementById('flag-s'),
    u: document.getElementById('flag-u')
  };
  var patternButtons = document.querySelectorAll('.pattern-library button');
  if (!patternInput || !testText) return;

  function readFlags() {
    var flags = '';
    if (flagInputs.g.checked) flags += 'g';
    if (flagInputs.i.checked) flags += 'i';
    if (flagInputs.m.checked) flags += 'm';
    if (flagInputs.s.checked) flags += 's';
    if (flagInputs.u.checked) flags += 'u';
    return flags;
  }

  function setFlags(flags) {
    Object.keys(flagInputs).forEach(function (key) {
      flagInputs[key].checked = flags.indexOf(key) !== -1;
    });
  }

  function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
  }

  function clearError() {
    error.textContent = '';
    error.style.display = 'none';
  }

  function renderMatches(matches, text) {
    preview.innerHTML = buildHighlightedHtml(text, matches);
    matchList.innerHTML = '';
    var rows = buildMatchRows(matches, MAX_LIST);
    rows.forEach(function (row) {
      var li = document.createElement('li');
      li.className = 'match-item';
      var head = document.createElement('div');
      head.className = 'match-head';
      var index = document.createElement('span');
      index.className = 'match-index';
      index.textContent = 'Match ' + row.index;
      head.appendChild(index);
      if (row.text === '') {
        var empty = document.createElement('span');
        empty.textContent = '(empty match) at position ' + row.position;
        head.appendChild(empty);
      } else {
        var code = document.createElement('span');
        code.textContent = truncateText(row.text, MAX_DISPLAY);
        head.appendChild(code);
      }
      li.appendChild(head);
      if (row.groups.length) {
        var groupWrap = document.createElement('div');
        groupWrap.className = 'match-groups';
        row.groups.forEach(function (group) {
          var line = document.createElement('span');
          line.textContent = group.label + ' ' + truncateText(group.value, MAX_DISPLAY);
          groupWrap.appendChild(line);
        });
        li.appendChild(groupWrap);
      }
      matchList.appendChild(li);
    });
    if (matches.length > MAX_LIST) {
      var more = document.createElement('li');
      more.className = 'match-empty';
      more.textContent = 'Showing the first ' + MAX_LIST + ' of ' + matches.length + ' matches.';
      matchList.appendChild(more);
    }
    if (!matches.length) {
      var none = document.createElement('li');
      none.className = 'match-empty';
      none.textContent = 'No matches found.';
      matchList.appendChild(none);
    }
  }

  function update() {
    var pattern = patternInput.value;
    var text = testText.value;
    var replacement = replacementInput.value;
    var flags = readFlags();

    if (!pattern) {
      clearError();
      meta.textContent = 'Enter a pattern to see matches.';
      preview.innerHTML = escapeHtml(text);
      matchList.innerHTML = '';
      replaceOutput.value = text;
      return;
    }

    var regex;
    try {
      regex = buildRegex(pattern, flags);
    } catch (err) {
      showError(err && err.message ? err.message : 'Invalid regular expression.');
      meta.textContent = '';
      preview.innerHTML = escapeHtml(text);
      matchList.innerHTML = '';
      replaceOutput.value = text;
      return;
    }

    clearError();
    var matches = collectMatches(regex, text, MAX_MATCHES);
    var label = matches.length === 1 ? '1 match' : matches.length + ' matches';
    if (matches.length >= MAX_MATCHES) label += ' (first ' + MAX_MATCHES + ' shown)';
    meta.textContent = label;
    renderMatches(matches, text);

    try {
      replaceOutput.value = runReplace(text, regex, replacement);
    } catch (err) {
      replaceOutput.value = text;
    }
  }

  patternInput.addEventListener('input', update);
  testText.addEventListener('input', update);
  replacementInput.addEventListener('input', update);
  Object.keys(flagInputs).forEach(function (key) {
    flagInputs[key].addEventListener('change', update);
  });

  patternButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      patternInput.value = button.getAttribute('data-pattern');
      setFlags(button.getAttribute('data-flags') || '');
      update();
      patternInput.focus();
    });
  });

  clearBtn.addEventListener('click', function () {
    patternInput.value = '';
    testText.value = '';
    replacementInput.value = '';
    setFlags('g');
    update();
    patternInput.focus();
  });

  copyBtn.addEventListener('click', function () {
    var value = replaceOutput.value;
    if (!value) return;
    navigator.clipboard.writeText(value).then(function () {
      copyFeedback.style.display = '';
      setTimeout(function () {
        copyFeedback.style.display = 'none';
      }, 2000);
    }).catch(function () {});
  });

  update();
});
