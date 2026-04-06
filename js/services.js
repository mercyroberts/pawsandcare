/* ══════════════════════════════════════════
   services.js — Services page functionality
   Features: Category filter + Pricing estimator
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ─────────────────────────────────────
     1. CATEGORY FILTER
     Selects pills by #filterPills container
     and cards by #servicesGrid container.
  ───────────────────────────────────── */

  const filterPills  = document.querySelectorAll('#filterPills .filter-pill');
  const serviceItems = document.querySelectorAll('#servicesGrid .service-item');

  /**
   * filterServices — shows/hides service cards by category
   * @param {string} category — 'all', 'dogs', 'cats', or 'exotic'
   */
  function filterServices(category) {
    serviceItems.forEach(function (item) {
      if (category === 'all') {
        item.style.display = '';
      } else {
        const cats = item.getAttribute('data-category'); // e.g. "dogs,cats,exotic"
        item.style.display = cats.includes(category) ? '' : 'none';
      }
    });
  }

  // Attach click listener to each filter pill
  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      // Remove active from all pills, set on clicked one
      filterPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');

      // Show/hide cards based on selected category
      filterServices(pill.getAttribute('data-filter'));
    });
  });


  /* ─────────────────────────────────────
     2. PRICING ESTIMATOR
     Price map keyed by checkbox id —
     no data-price attribute reading needed.
  ───────────────────────────────────── */

  // Maps each checkbox id to its price in euros
  const priceMap = {
    'est-consultation': 55,
    'est-vaccination':  75,
    'est-grooming':     45,
    'est-dental':      120,
    'est-emergency':   150,
    'est-wellness':     35
  };

  const estimatorTotal = document.getElementById('estimatorTotal');

  /**
   * updateEstimator — sums all checked services and updates the total display
   */
  function updateEstimator() {
    let total = 0;

    Object.keys(priceMap).forEach(function (id) {
      const checkbox = document.getElementById(id);
      if (checkbox && checkbox.checked) {
        total += priceMap[id];
      }
    });

    estimatorTotal.textContent = '€' + total;
  }

  // Attach change listener to each estimator checkbox by ID
  Object.keys(priceMap).forEach(function (id) {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.addEventListener('change', updateEstimator);
    }
  });

});
