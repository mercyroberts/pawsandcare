/* ══════════════════════════════════════════
   book.js — Booking page logic
   Form validation, dynamic time slots, localStorage
   ══════════════════════════════════════════ */

$(document).ready(function () {
  var $form = $("#bookingForm");
  var $dateInput = $("#appointmentDate");
  var $timeSlotsContainer = $("#timeSlots");
  var $selectedTime = $("#selectedTime");
  var $timeError = $("#timeError");

  /* ── Set minimum date to today ── */
  var today = new Date().toISOString().split("T")[0];
  $dateInput.attr("min", today);

  /* ── If coming from exotic page, pre-select exotic ── */
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("type") === "exotic") {
    $("#petType").val("exotic");
  }

  /* ── Generate time slots when a date is selected ── */
  $dateInput.on("change", function () {
    generateTimeSlots($(this).val());
  });

  /**
   * generateTimeSlots — creates clickable slot buttons for a given date
   * Randomly marks some slots as "taken" for realism
   */
  function generateTimeSlots(date) {
    var slots = [
      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
      "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"
    ];

    $timeSlotsContainer.empty();
    $selectedTime.val("");

    // Use the date string as a seed for consistent "taken" slots
    var seed = date.split("-").join("");
    slots.forEach(function (slot, i) {
      var isTaken = (parseInt(seed) + i * 7) % 5 === 0;
      var $btn = $("<button>")
        .attr("type", "button")
        .addClass("time-slot-btn")
        .text(slot);

      if (isTaken) {
        $btn.addClass("taken").attr("disabled", true).attr("title", "Slot taken");
      } else {
        $btn.on("click", function () {
          $(".time-slot-btn").removeClass("selected");
          $(this).addClass("selected");
          $selectedTime.val(slot);
          $timeError.hide();
        });
      }

      $timeSlotsContainer.append($btn);
    });
  }

  /* ── Form validation ── */
  var validationRules = {
    petName: {
      test: function (val) { return val.trim().length >= 2; },
      message: "Pet name must be at least 2 characters."
    },
    ownerName: {
      test: function (val) { return val.trim().length >= 2; },
      message: "Please enter your full name."
    },
    ownerEmail: {
      test: function (val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); },
      message: "Please enter a valid email address."
    },
    ownerPhone: {
      test: function (val) { return /^[\+]?[\d\s\-]{7,15}$/.test(val); },
      message: "Please enter a valid phone number (e.g. +353 87 123 4567)."
    }
  };

  // Real-time validation on blur
  Object.keys(validationRules).forEach(function (fieldId) {
    $("#" + fieldId).on("blur input", function () {
      validateField($(this), validationRules[fieldId]);
    });
  });

  /**
   * validateField — checks a single field and shows/hides error
   */
  function validateField($field, rule) {
    if (rule.test($field.val())) {
      $field.removeClass("is-invalid").addClass("is-valid");
      return true;
    } else {
      $field.removeClass("is-valid").addClass("is-invalid");
      $field.next(".invalid-feedback").text(rule.message);
      return false;
    }
  }

  /* ── Form submission ── */
  $form.on("submit", function (e) {
    e.preventDefault();
    var isValid = true;

    // Validate text fields
    Object.keys(validationRules).forEach(function (fieldId) {
      var $field = $("#" + fieldId);
      if (!validateField($field, validationRules[fieldId])) {
        isValid = false;
      }
    });

    // Validate selects
    ["petType", "service"].forEach(function (id) {
      var $select = $("#" + id);
      if (!$select.val()) {
        $select.addClass("is-invalid");
        isValid = false;
      } else {
        $select.removeClass("is-invalid").addClass("is-valid");
      }
    });

    // Validate date
    if (!$dateInput.val()) {
      $dateInput.addClass("is-invalid");
      isValid = false;
    } else {
      $dateInput.removeClass("is-invalid").addClass("is-valid");
    }

    // Validate time slot
    if (!$selectedTime.val()) {
      $timeError.css("display", "block !important").show();
      isValid = false;
    }

    if (!isValid) return;

    // Build booking data
    var booking = {
      petName: $("#petName").val().trim(),
      petType: $("#petType").val(),
      service: $("#service option:selected").text(),
      ownerName: $("#ownerName").val().trim(),
      email: $("#ownerEmail").val().trim(),
      phone: $("#ownerPhone").val().trim(),
      date: $dateInput.val(),
      time: $selectedTime.val(),
      bookedAt: new Date().toISOString()
    };

    // Save to localStorage
    var bookings = JSON.parse(localStorage.getItem("pawsBookings") || "[]");
    bookings.push(booking);
    localStorage.setItem("pawsBookings", JSON.stringify(bookings));

    // Format the date nicely
    var dateObj = new Date(booking.date + "T00:00:00");
    var formattedDate = dateObj.toLocaleDateString("en-IE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    // Show confirmation
    $("#confirmationDetails").html(
      "<strong>" + booking.petName + "</strong> (" + booking.petType + ") — " +
      booking.service + "<br>" +
      booking.time + " on " + formattedDate
    );
    $form.slideUp(300);
    $("#bookingConfirmation").slideDown(300);
  });
});
