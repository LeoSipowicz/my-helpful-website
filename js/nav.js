document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

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
          other.closest('.has-dropdown').classList.remove('open');
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
});
