/* ══════════════════════════════════════════
   team.js — Team page functionality
   Features: Live search by name / role
   ══════════════════════════════════════════ */

/* ─────────────────────────────────────
   LIVE SEARCH
   Listens for keyup on #teamSearch and
   filters .team-item cards by matching
   the query against data-name / data-role.
───────────────────────────────────── */

const teamSearch = document.getElementById('teamSearch');
const teamItems  = document.querySelectorAll('#teamGrid .team-item');

/**
 * filterTeam — shows/hides team cards based on query string.
 * @param {string} query - lowercased search term
 */
function filterTeam(query) {
  teamItems.forEach(function (item) {
    const name  = item.getAttribute('data-name');
    const role  = item.getAttribute('data-role');
    const match = name.includes(query) || role.includes(query);
    item.style.display = match ? '' : 'none';
  });
}

// Attach keyup listener to search input
teamSearch.addEventListener('keyup', function () {
  filterTeam(teamSearch.value.trim().toLowerCase());
});

// Initialise — show all cards on page load
filterTeam('');