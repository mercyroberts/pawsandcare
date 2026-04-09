// team.js
// Team page functionality
// Features: Search by name / role using keyup event


// 1. DOM SELECTION
// Store the search input, all team cards inside #teamGrid,
// and the empty state block + the span that shows the search query back to the user.

const teamSearch     = document.getElementById('teamSearch');
const teamItems      = document.querySelectorAll('#teamGrid .team-item');
const teamEmpty      = document.getElementById('teamEmpty');
const teamEmptyQuery = document.getElementById('teamEmptyQuery');


// 2. FILTER FUNCTION
// filterTeam takes a string (already lowercased by the caller).
// It iterates through every .team-item card and reads data-name and data-role.
// Both attributes are stored in lowercase in the HTML, so .includes() works
// as a simple case-insensitive partial match no extra conversion needed here.
// visibleCount tracks how many cards passed the check so we know when to show the empty state.

function filterTeam(query) {
  let visibleCount = 0;

  teamItems.forEach(function (item) {
    // Read the name and role set on each card in team.html
    const name  = item.getAttribute('data-name');
    const role  = item.getAttribute('data-role');

    // Show the card if the query matches any part of the name or role
    const match = name.includes(query) || role.includes(query);
    item.style.display = match ? '' : 'none';
    if (match) visibleCount++;
  });

  // Show the empty state only when no cards matched AND the user typed something.
  // The query !== '' check the empty state showing on page load.
  if (visibleCount === 0 && query !== '') {
    teamEmptyQuery.textContent = query;
    teamEmpty.style.display = '';
  } else {
    teamEmpty.style.display = 'none';
  }
}


// 3. KEYUP LISTENER
// Fires every time the user types or deletes a character.
// .trim() removes spaces; .toLowerCase() makes the match case-insensitive
// before the string is passed to filterTeam.

teamSearch.addEventListener('keyup', function () {
  filterTeam(teamSearch.value.trim().toLowerCase());
});


// 4. INIT
// Run filterTeam with an empty string so all cards start visible.

filterTeam('');
