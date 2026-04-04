/* ══════════════════════════════════════════
   main.js — Shared JS for PawsAndCare
   Navbar behaviour, stats counter, testimonial carousel
   ══════════════════════════════════════════ */

$(document).ready(function () {
  /* ── Navbar: change background on scroll ── */
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 50) {
      $("#mainNav").addClass("scrolled");
    } else {
      $("#mainNav").removeClass("scrolled");
    }
  });

  /* ── Stats Counter (index.html only) ── */
  var statsSection = document.getElementById("stats");
  if (statsSection) {
    var counted = false;

    // IntersectionObserver triggers the count-up when section is visible
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !counted) {
            counted = true;
            animateCounters();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(statsSection);
  }

  /**
   * animateCounters — counts each .stat-number from 0 to its data-target
   */
  function animateCounters() {
    $(".stat-number").each(function () {
      var $this = $(this);
      var target = parseFloat($this.data("target"));
      var isDecimal = $this.data("decimal") === true;
      var duration = 1500;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);

        // Ease-out effect
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = eased * target;

        if (isDecimal) {
          $this.text(current.toFixed(1) + "★");
        } else {
          $this.text(Math.floor(current) + "+");
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    });
  }

  /* ── Testimonial Carousel (index.html only) ── */
  var $track = $("#testimonialTrack");
  if ($track.length) {
    var currentSlide = 0;
    var $cards = $track.find(".testimonial-card");
    var $dots = $("#testimonialDots .dot");
    var totalSlides = $cards.length;
    var autoPlayTimer;

    function showSlide(index) {
      currentSlide = (index + totalSlides) % totalSlides;

      $cards.removeClass("active");
      $dots.removeClass("active");

      $cards.eq(currentSlide).addClass("active");
      $dots.eq(currentSlide).addClass("active");
    }

    // Next / Prev buttons
    $("#nextTestimonial").on("click", function () {
      showSlide(currentSlide + 1);
      resetAutoPlay();
    });

    $("#prevTestimonial").on("click", function () {
      showSlide(currentSlide - 1);
      resetAutoPlay();
    });

    // Dots click
    $dots.on("click", function () {
      var index = $(this).index();
      showSlide(index);
      resetAutoPlay();
    });

    // Auto-rotate every 4 seconds
    function startAutoPlay() {
      autoPlayTimer = setInterval(function () {
        showSlide(currentSlide + 1);
      }, 4000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }

    startAutoPlay();
  }
});
