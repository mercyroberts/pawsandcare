/* ════
   main.js Shared JS for PawsAndCare
   This file runs on every page and handles:
   - Navbar colour change when the user scrolls down
   - Hero image slider that fades between pet photos (index.html only)
   - Animated stats counter that counts up when you scroll to it (index.html only)
   - Custom review carousel with auto-rotate, prev/next and dot navigation (index.html only)
   I used jQuery for DOM manipulation since it makes selecting elements and adding
   event listeners a lot cleaner than pure vanilla javascript.
   ════ */

// Wait for the page to fully load before running any of my code,
// it is not strictly necessary, since my javascript is at the end of the body and will run after the HTML is parsed,
// but it prevents errors if the JS tries to access elements that haven't loaded yet and general good practice.
$(document).ready(function () {
  /* Navbar: darken the background when the user scrolls down
     I wanted the navbar to feel more solid once you scroll past the hero section,
     so I add a .scrolled class after 50px of scrolling. My CSS picks up that class
     and changes the background to a darker teal with a subtle shadow.
     $(window).on("scroll") every time the user scrolls the page.
     $(this).scrollTop() gives me how many pixels they've scrolled from the top. */
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 50) {
      $("#mainNav").addClass("scrolled");
    } else {
      $("#mainNav").removeClass("scrolled");
    }
  });

  /* ── Hero Image Slider (index.html only) ──
     I wanted to show multiple pet photos in the hero instead of just one static image,
     so I built a simple auto-rotating slider. It works the same way as my review carousel —
     all images are stacked on top of each other in the HTML, and I just swap the .active class
     every 3 seconds. The CSS handles the fade transition with opacity.
     I check if #heroSlider exists first so this code doesn't throw errors on other pages. */
  var $heroSlider = $("#heroSlider");
  if ($heroSlider.length) {
    // Find all the slide images inside the slider container
    var $slides = $heroSlider.find(".hero-slide");
    // Keep track of which slide is currently showing (starts at 0 which is the first one)
    var currentHeroSlide = 0;
    // Total number of slides — I use this for the modulo trick to loop back to the start
    var totalHeroSlides = $slides.length;

    // setInterval runs this function every 3000ms (3 seconds)
    // It removes .active from the current slide, moves to the next one, and adds .active
    // The modulo (%) operator makes it loop back to 0 after the last slide
    // eq() is jQuery's way of selecting an element by its index in the list of slides
    setInterval(function () {
      $slides.eq(currentHeroSlide).removeClass("active");
      currentHeroSlide = (currentHeroSlide + 1) % totalHeroSlides;
      $slides.eq(currentHeroSlide).addClass("active");
    }, 3000);
  }

  /* ── Stats Counter ──
     The stats bar shows numbers like "500+ Pets Treated" that count up from 0
     when the user scrolls down to the section. I didn't want them to animate on page load
     because the user wouldn't even see it they'd just see the final numbers.
     So I used IntersectionObserver, which is a browser API that watches an element
     and tells me when it becomes visible on screen. Once 30% of the stats section
     is visible, it triggers the counting animation.
     The "counted" flag makes sure it only runs once, without it the numbers
     would restart every time you scroll past the section. */
  var statsSection = document.getElementById("stats");
  if (statsSection) {
    var counted = false;

    // Set up the observer — the callback runs whenever the stats section enters or leaves the viewport
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          // entry.isIntersecting is true when the section is visible on screen
          if (entry.isIntersecting && !counted) {
            counted = true; // Set the flag so this only fires once
            animateCounters(); // Start the count up animation
          }
        });
      },
      { threshold: 0.3 }, // 0.3 means the animation starts when 30% of the section is visible
    );

    // Tell the observer to start watching the stats section
    observer.observe(statsSection);
  }

  /*
   animateCounters  counts each .stat-number element from 0 up to its data-target value
   I used requestAnimationFrame instead of setInterval because it's smoother
   it syncs with the browser's refresh rate so the numbersndon't look choppy.
   The ease-out effect (Math.pow) makes the numbers count fast at the start and slow down as they approach the target,
   which looks way better than a linear count.
   */
  function animateCounters() {
    // Loop through every element with the .stat-number class
    $(".stat-number").each(function () {
      var $this = $(this);
      // data-target is the number we want to count up to (set in the HTML)
      var target = parseFloat($this.data("target"));
      // data-decimal is true for the Google rating (4.9) so it shows one decimal place
      var isDecimal = $this.data("decimal") === true;
      var duration = 1500; // the whole animation takes 1.5 seconds
      var startTime = null; // will be set to the timestamp of the first frame

      // step() runs on every animation frame until we reach 100% progress
      function step(timestamp) {
        // On the first call, save the start time so we can calculate progress
        if (!startTime) startTime = timestamp;
        // progress goes from 0 to 1 over the duration (1.5 seconds)
        var progress = Math.min((timestamp - startTime) / duration, 1);

        // Starts at 1 and goes to 0, cubing it makes it drop off faster
        // then 1 minus that flips it so we get a curve that starts fast and slows down
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = eased * target;

        // Format the number differently based on whether it's a decimal or whole number
        if (isDecimal) {
          // Google rating shows like "4.9★"
          $this.text(current.toFixed(1) + "★");
        } else {
          // Other stats show like "500+"
          $this.text(Math.floor(current) + "+");
        }

        // Keep calling step() on the next frame until we reach 100%
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      // Kick off the animation for this particular stat number
      requestAnimationFrame(step);
    });
  }

  /* ── Review Carousel (only runs on index.html) ──
     I built this carousel myself instead of using Bootstrap's carousel component
     because I wanted full control over the styling.
     This approach also gave me more hands-on practice with DOM manipulation,
     event handling, and timers. */

  // First I check if the #reviewWrapper element exists on the page
  // This way the code only runs on index.html and doesn't throw errors on other pages
  var $track = $("#reviewWrapper");
  if ($track.length) {
    // currentSlide keeps track of which review card is currently visible (starts at 0)
    var currentSlide = 0;
    // Grab all the review cards inside the wrapper so I can show/hide them
    var $cards = $track.find(".review-card");
    // Grab the dot indicators so I can highlight the one that matches the current card
    var $dots = $("#reviewDots .dot");
    // Total number of slides used for wrapping around.
    var totalSlides = $cards.length;
    // This will hold the setInterval timer so I can clear and restart it when the user clicks
    var autoPlayTimer;

    /**
     * showSlide — switches which review card is visible
     * The modulo (%) trick handles wrapping: if you're on card 3 and click next,
     * (3 + 3) % 3 = 0, so it loops back to the first card. Same logic going backwards.
     */
    function showSlide(index) {
      // Calculate the new index, wrapping around if it goes past the start or end
      currentSlide = (index + totalSlides) % totalSlides;

      // Remove .active from ALL cards and dots first so only one is shown at a time
      $cards.removeClass("active");
      $dots.removeClass("active");

      // Add .active to the card and dot at the current index
      // .eq() is jQuery's way of selecting an element by its position in the list
      $cards.eq(currentSlide).addClass("active");
      $dots.eq(currentSlide).addClass("active");
    }

    // When the user clicks the next arrow, show the next card and restart the auto-rotate timer
    // resetAutoPlay stops the current timer and starts a fresh 4-second countdown
    $("#nextReview").on("click", function () {
      showSlide(currentSlide + 1);
      resetAutoPlay();
    });

    // Same thing for the previous arrow but going backwards
    $("#prevReview").on("click", function () {
      showSlide(currentSlide - 1);
      resetAutoPlay();
    });

    // Clicking a dot jumps straight to that review card
    // $(this).index() gives the position of the clicked dot (0, 1, or 2)
    $dots.on("click", function () {
      var index = $(this).index();
      showSlide(index);
      resetAutoPlay();
    });

    // startAutoPlay sets up a timer that automatically moves to the next card every 4 seconds
    // I used setInterval which runs the function repeatedly at the given interval
    function startAutoPlay() {
      autoPlayTimer = setInterval(function () {
        showSlide(currentSlide + 1);
      }, 4000);
    }

    // resetAutoPlay clears the existing timer and starts a new one
    // This is called whenever the user interacts (clicks prev/next/dot) so the carousel
    // doesn't jump to the next slide while they're still reading the current one
    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }

    // Kick off the auto-rotation when the page loads
    startAutoPlay();
  }
});

/*
   REFERENCES & RESOURCES
   YouTube tutorials and docs I used while building the JS for this page
*/

// $(document).ready() and jQuery basics:
// - "jQuery Crash Course" by Traversy Media: https://www.youtube.com/watch?v=3nrLc_JOF7k

// IntersectionObserver (stats counter animation):
// - "Learn Intersection Observer In 15 Minutes" by Web Dev Simplified: https://www.youtube.com/watch?v=2IbRtjez6ag
// - MDN Docs: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver

// requestAnimationFrame (smooth counter animation):
// - "requestAnimationFrame Explained" by Steve Griffith: https://www.youtube.com/watch?v=tS6oP1NveoI

// Building a custom carousel/slider with JS:
// - "Build A Carousel With JavaScript" by Web Dev Simplified: https://www.youtube.com/watch?v=9HcxHDS2w1s
// - "Simple jQuery Carousel Tutorial" by Traversy Media: https://www.youtube.com/watch?v=KkzVFB3Ba_o

// setInterval and clearInterval (auto-rotate timer):
// - MDN Docs: https://developer.mozilla.org/en-US/docs/Web/API/setInterval
