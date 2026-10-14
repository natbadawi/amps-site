// Mobile nav toggle + directory search/filter. Shared by all pages.
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  window.AMPS = window.AMPS || {};
  window.AMPS.wireFilter = wireFilter;
  wireFilter(document);

  // Filters any .grid[data-filterable] by the toolbar's search box, specialty and country selects.
  function wireFilter(root) {
    const grid = root.querySelector('[data-filterable]');
    const q = root.querySelector('[data-search]');
    const specialty = root.querySelector('[data-specialty]');
    const country = root.querySelector('[data-country]');
    const reset = root.querySelector('[data-reset]');
    const count = root.querySelector('[data-count]');
    if (!grid || !q) return;
    const cards = Array.from(grid.children);
    const norm = (s) => String(s || '').trim();
    function apply() {
      const term = q.value.trim().toLowerCase();
      const s = specialty ? specialty.value : '';
      const c = country ? country.value : '';
      let shown = 0;
      cards.forEach((card) => {
        const ok = (!term || card.dataset.search.includes(term))
          && (!s || norm(card.dataset.specialty) === s)
          && (!c || norm(card.dataset.country) === c);
        card.hidden = !ok;
        if (ok) shown++;
      });
      if (count) count.textContent = `${shown} ${shown === 1 ? 'member' : 'members'}` + (term || s || c ? (shown === 1 ? ' matches' : ' match') + ' your filters' : '');
      if (reset) reset.hidden = !(term || s || c);
    }
    q.addEventListener('input', apply);
    [specialty, country].forEach((el) => el && el.addEventListener('change', apply));
    if (reset) reset.addEventListener('click', () => {
      q.value = '';
      if (specialty) specialty.value = '';
      if (country) country.value = '';
      apply();
    });
    apply();
  }
})();
