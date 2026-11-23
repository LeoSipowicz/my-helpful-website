document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  // Mark active nav link with aria-current
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-list a.nav-item').forEach(link => {
    const linkPath = link.getAttribute('href');
    const isHomepage = currentPath === '/' || currentPath === '/index.html';
    const isHomeLink = linkPath === 'index.html' || linkPath === './index.html' || linkPath === '/index.html' || linkPath === '../index.html';
    if (linkPath === currentPath || 
        (currentPath.endsWith('.html') && linkPath === currentPath.substring(currentPath.lastIndexOf('/') + 1)) ||
        (isHomepage && isHomeLink)) {
      link.setAttribute('aria-current', 'page');
    }
  });

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  dropdownToggles.forEach(toggle => {
    toggle.setAttribute('aria-haspopup', 'true');
    toggle.addEventListener('click', (e) => {
      const parent = toggle.closest('.has-dropdown');
      const isOpen = parent.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);

      dropdownToggles.forEach(other => {
        if (other !== toggle) {
          const otherParent = other.closest('.has-dropdown');
          if (otherParent) otherParent.classList.remove('open');
          other.setAttribute('aria-expanded', 'false');
        }
      });

      e.stopPropagation();
    });
  });

  document.addEventListener('click', () => {
    dropdownToggles.forEach(toggle => {
      const parent = toggle.closest('.has-dropdown');
      if (parent) parent.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownToggles.forEach(toggle => {
        const parent = toggle.closest('.has-dropdown');
        if (parent) parent.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
      if (mainNav) {
        mainNav.classList.remove('open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  setupToolSearch();

  function setupToolSearch() {
    // The homepage, about page, and 404 page have their own grid filter.
    if (document.getElementById('tool-filter')) return;

    const nav = document.querySelector('.main-nav');
    const header = nav ? nav.closest('header') : null;
    if (!nav || !header) return;

    const KEYWORDS = {
      'image-resizer': 'resize scale dimensions pixels',
      'image-converter': 'png jpg jpeg webp format convert',
      'image-compressor': 'compress reduce file size quality',
      'color-palette': 'extract colors colours palette hex from image',
      'color-replacer': 'replace recolor swap color in image',
      'image-cropper': 'crop trim cut image',
      'text-case-converter': 'uppercase lowercase title sentence camel snake kebab',
      'word-counter': 'words characters reading time keyword density',
      'text-diff': 'compare difference diff two texts',
      'lorem-ipsum': 'placeholder dummy text generator',
      'list-randomizer': 'random picker name shuffle draw',
      'json-formatter': 'beautify validate minify pretty print',
      'base64-encoder': 'encode decode data uri file',
      'url-encoder': 'percent encode decode link',
      'html-entity-encoder': 'escape entities special characters',
      'uuid-generator': 'guid unique id bulk',
      'color-converter': 'hex rgb hsl colour',
      'markdown-editor': 'markdown preview html',
      'timestamp-converter': 'unix epoch time date',
      'number-base-converter': 'binary octal decimal hex',
      'random-number-generator': 'random number dice range',
      'date-calculator': 'days between dates duration',
      'age-calculator': 'birthday how old age',
      'qr-code-generator': 'qr code link url barcode',
      'unit-converter': 'units length weight temperature metric imperial kg lbs celsius fahrenheit cm inches km miles liters gallons',
      'percentage-calculator': 'percent discount tip change increase decrease',
      'timer': 'stopwatch countdown alarm minutes seconds',
      'compound-interest': 'savings investment interest growth',
      'loan-calculator': 'mortgage loan payment amortization interest car auto home',
      'time-zone-converter': 'time zone timezone world clock meeting planner utc gmt est pst ist convert',
      'password-generator': 'random secure password',
      'hash-generator': 'md5 sha checksum digest'
    };

    const tools = [];
    nav.querySelectorAll('.has-dropdown').forEach(group => {
      const toggle = group.querySelector('.dropdown-toggle');
      const category = toggle ? toggle.textContent.trim() : '';
      group.querySelectorAll('.dropdown a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const file = href.split('/').pop().replace('.html', '');
        tools.push({
          name: link.textContent.trim(),
          href,
          category,
          key: file
        });
      });
    });
    if (!tools.length) return;

    const wrap = document.createElement('div');
    wrap.className = 'site-tool-search';

    const label = document.createElement('label');
    label.setAttribute('for', 'site-tool-search-input');
    label.textContent = 'Find a tool';

    const input = document.createElement('input');
    input.type = 'search';
    input.id = 'site-tool-search-input';
    input.placeholder = 'Search ' + tools.length + ' tools';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', 'site-tool-search-results');

    const list = document.createElement('ul');
    list.id = 'site-tool-search-results';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Matching tools');
    list.hidden = true;

    wrap.append(label, input, list);
    header.insertBefore(wrap, nav);

    let matches = [];
    let active = -1;

    function normalize(value) {
      return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }

    function findMatches(query) {
      const terms = normalize(query).split(' ').filter(Boolean);
      if (!terms.length) return [];
      const scored = [];
      tools.forEach(tool => {
        const name = normalize(tool.name);
        const haystack = name + ' ' + normalize(tool.category) + ' ' + (KEYWORDS[tool.key] || '');
        let score = 0;
        for (const term of terms) {
          if (!haystack.includes(term)) return;
          if (name.split(' ').includes(term)) score += 3;
          else if (name.includes(term)) score += 2;
          else score += 1;
        }
        scored.push({ tool, score });
      });
      scored.sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));
      return scored.slice(0, 8).map(item => item.tool);
    }

    function render() {
      list.innerHTML = '';
      matches.forEach((tool, index) => {
        const item = document.createElement('li');
        item.id = 'site-tool-result-' + index;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', index === active ? 'true' : 'false');
        item.className = 'site-tool-result' + (index === active ? ' active' : '');

        const link = document.createElement('a');
        link.href = tool.href;

        const name = document.createElement('span');
        name.className = 'site-tool-result-name';
        name.textContent = tool.name;

        const category = document.createElement('span');
        category.className = 'site-tool-result-cat';
        category.textContent = tool.category.replace(' Tools', '');

        link.append(name, category);
        item.append(link);
        list.append(item);
      });

      const open = matches.length > 0;
      list.hidden = !open;
      input.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && active >= 0) {
        input.setAttribute('aria-activedescendant', 'site-tool-result-' + active);
        const selected = list.children[active];
        if (selected) selected.scrollIntoView({ block: 'nearest' });
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }

    function update() {
      matches = findMatches(input.value);
      active = matches.length ? 0 : -1;
      render();
    }

    function close() {
      matches = [];
      active = -1;
      render();
    }

    input.addEventListener('input', update);
    input.addEventListener('focus', () => {
      if (input.value.trim()) update();
    });
    // Keep focus on the input so the results stay open until the click lands.
    list.addEventListener('mousedown', (e) => e.preventDefault());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        if (!matches.length) return;
        e.preventDefault();
        active = (active + 1) % matches.length;
        render();
      } else if (e.key === 'ArrowUp') {
        if (!matches.length) return;
        e.preventDefault();
        active = (active - 1 + matches.length) % matches.length;
        render();
      } else if (e.key === 'Enter') {
        if (active >= 0 && matches[active]) {
          e.preventDefault();
          window.location.href = matches[active].href;
        }
      } else if (e.key === 'Escape') {
        input.value = '';
        close();
        input.blur();
      }
    });
    input.addEventListener('blur', () => {
      window.setTimeout(() => {
        if (!wrap.contains(document.activeElement)) close();
      }, 120);
    });
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) close();
    });
  }
});
