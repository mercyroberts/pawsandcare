  //  Name: Joao Lucas Bugati | Student Number: x25163116  
  //  services.js — Services page functionality
  //  Features: Category filter + Pricing estimator

   
  //  1. CATEGORY FILTER
  //  Selects pills by #filterPills container
  //  and cards by #servicesGrid container.
  

  const filterPills  = document.querySelectorAll('#filterPills .filter');
  const serviceItems = document.querySelectorAll('#servicesGrid .service-item');

  // This function has category as a parameter. 
  // serviceItems is an array of items and we are going to use a forEach
  // With the forEach we are going to compare each item and depending what is their category we will apply a display none to hide that card. 

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
  // This one is just changing the class when the button is clicked 
  // To active their class and show a selected button effect 
  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      // Remove active from all pills, set on clicked one
      filterPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');

      // Show/hide cards based on selected category
      filterServices(pill.getAttribute('data-filter'));
    });
  });



  //  2. PRICING ESTIMATOR
  //  Price object with checkbox id 

  // Create an object checkbox id to its price in euros
  const priceMap = {
    'consultation': 55,
    'vaccination':  75,
    'grooming':     45,
    'dental':      120,
    'emergency':   150,
    'wellness':     35
  };

  const estimatorTotal = document.getElementById('estimatorTotal');

  
  //  UpdateEstimator: sums all checked services and updates the total display
  // Object.keys used to allow us to use the for each to interate each key[value]
  // And accumulating the value with the total variable and priceMap values. 
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

  // Add change listener to each checkbox by ID
  // Every time we change the checkbox we call the method updateEstimator to accumulate values 
  Object.keys(priceMap).forEach(function (id) {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.addEventListener('change', updateEstimator);
    }
  });

  filterServices('all');
  updateEstimator();

