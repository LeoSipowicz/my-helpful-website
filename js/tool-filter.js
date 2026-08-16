document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('tool-filter');
  if (!input) return;

  const sections = [];
  document.querySelectorAll('.tool-grid').forEach(grid => {
    let heading = grid.previousElementSibling;
    while (heading && heading.tagName !== 'H3') heading = heading.previousElementSibling;
    sections.push({
      heading,
      grid,
      cards: Array.from(grid.querySelectorAll('.tool-card'))
    });
  });
  if (!sections.length) return;

  const emptyMsg = document.createElement('p');
  emptyMsg.id = 'tool-filter-empty';
  emptyMsg.textContent = 'No tools match your search.';
  const hostSection = sections[0].grid.closest('section');
  if (hostSection) hostSection.appendChild(emptyMsg);

  let visibleCards = sections.reduce((acc, s) => acc.concat(s.cards), []);

  function applyFilter() {
    const q = input.value.trim().toLowerCase();
    let anyVisible = false;
    visibleCards = [];
    sections.forEach(({ heading, cards }) => {
      let visible = 0;
      cards.forEach(card => {
        const show = q === '' || card.textContent.toLowerCase().indexOf(q) !== -1;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible++;
          visibleCards.push(card);
        }
      });
      if (heading) heading.style.display = visible ? '' : 'none';
      if (visible) anyVisible = true;
    });
    emptyMsg.style.display = (q !== '' && !anyVisible) ? 'block' : 'none';
  }

  input.addEventListener('input', applyFilter);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim() !== '' && visibleCards.length) {
      e.preventDefault();
      const link = visibleCards[0].querySelector('a');
      if (link) window.location.href = link.getAttribute('href');
    }
  });
});