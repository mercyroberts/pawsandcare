/*
   book.js, Booking page logic
   This file handles everything on the booking form
   - Setting the minimum date to today so nobody books in the past
   - Pre selecting "Exotic" if the user came from the exotic pets page
   - Generating time slot buttons when a date is picked
   - Real-time form validation
   - Saving the booking to localStorage on successful submission
   - Showing a confirmation card with the booking details

   I used novalidate on the form in the HTML so the browser doesn't show
   its own validation popups
*/

$(document).ready(function () {
  /* Cache all the jQuery selectors i use more than once
   so i don't have to keep querying the DOM every time */
  var $form = $("#bookingForm");
  var $dateInput = $("#appointmentDate");
  var $timeSlotsContainer = $("#timeSlots");
  var $selectedTime = $("#selectedTime"); // hidden input that stores the chosen time
  var $timeError = $("#timeError"); // error message for when no time slot is selected

  /* Set the minimum selectable date to today
     toISOString() gives something like "2026-04-09T12:00:00.000Z"
     split("T")[0] takez off the time part so i just get "2026-04-09"
     which is the format the date input needs for its min attribute */
  var today = new Date().toISOString().split("T")[0];
  $dateInput.attr("min", today);

  /* If the user clicked Book Exotic Appointment on the exotic page,
     the URL will have ?type=exotic at the end
     URLSearchParams reads that query string and i pre select exotic in the dropdown
     so they don't have to pick it again*/
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("type") === "exotic") {
    $("#petType").val("exotic");
  }

  /* When the user picks a date, generate the available time slot buttons
     I listen for the change event on the date input */
  $dateInput.on("change", function () {
    generateTimeSlots($(this).val());
  });

  /* generateTimeSlots creates clickable time slot buttons for the selected date
     Some slots are randomly marked as taken */
  function generateTimeSlots(date) {
    // harrdcoded 12 slots from 9:00 AM to 2:30 PM (half-hour intervals)
    var slots = [
      "9:00 AM",
      "9:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "1:00 PM",
      "1:30 PM",
      "2:00 PM",
      "2:30 PM",
    ];

    // Clear old slots and reset the hidden time input
    $timeSlotsContainer.empty();
    $selectedTime.val("");

    slots.forEach(function (slot) {
      // Math.random() gives a number between 0 and 1
      // anything under 0.25 means the slot is taken, so roughly 1 in 4 slots will be unavailable
      var isTaken = Math.random() < 0.25;
      var $btn = $("<button>")
        .attr("type", "button")
        .addClass("time-slot-btn")
        .text(slot);

      if (isTaken) {
        // Taken slots get greyed out styling and can't be clicked
        $btn
          .addClass("taken")
          .attr("disabled", true)
          .attr("title", "Slot taken");
      } else {
        // Available slots, clicking one selects it and deselects any other
        $btn.on("click", function () {
          $(".time-slot-btn").removeClass("selected"); // clear previous selection
          $(this).addClass("selected"); // highlight this one
          $selectedTime.val(slot); // store the value in the hidden input
          $timeError.hide(); // hide the error if it was showing
        });
      }

      $timeSlotsContainer.append($btn);
    });
  }

  /* Validation rules object
     Each field has a test function (returns true/false) and a custom error message
     I set this up as an object so i can loop through them instead of writing
     the same validation code over and over for each field */
  var validationRules = {
    petName: {
      test: function (val) {
        return val.trim().length >= 5;
      },
      message: "Pet name must be at least 5 characters.",
    },
    ownerName: {
      test: function (val) {
        return val.trim().length >= 5;
      },
      message: "Please enter your full name.",
    },
    ownerEmail: {
      // Regex checks for something@something.something format
      // not perfect but catches the obvious mistakes
      test: function (val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      },
      message: "Please enter a valid email address.",
    },
    ownerPhone: {
      // Accepts optional + at the start, then 7-15 digits with spaces or dashes
      // covers Irish numbers like +353 87 123 4567
      test: function (val) {
        return /^[\+]?[\d\s\-]{7,15}$/.test(val);
      },
      message: "Please enter a valid phone number (e.g. +353 87 123 4567).",
    },
  };

  /* 
  Instead of writing the same blur/input listener four times for each field,
  i loop through the keys of validationRules and attach the handler to each one
  */
  Object.keys(validationRules).forEach(function (fieldId) {
    $("#" + fieldId).on("blur input", function () {
      validateField($(this), validationRules[fieldId]);
    });
  });

  /* validateField checks a single field against its rule
     Adds .is-valid (green border) if it passes, .is-invalid (red border) if it fails
     Also updates the error message text from the rule object
     Returns true/false so i can use it during form submission too */
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

  /* Form submission handler
     e.preventDefault() stops the form from actually submitting to a server
     I validate every field, then save to localStorage if everything passes */
  $form.on("submit", function (e) {
    e.preventDefault();
    var isValid = true;

    // Validate all fields using the rules object
    Object.keys(validationRules).forEach(function (fieldId) {
      var $field = $("#" + fieldId);
      if (!validateField($field, validationRules[fieldId])) {
        isValid = false;
      }
    });

    // Validate the two select dropdowns separately since they just need a value selected
    // not a regex test like the text fields
    ["petType", "service"].forEach(function (id) {
      var $select = $("#" + id);
      if (!$select.val()) {
        $select.addClass("is-invalid");
        isValid = false;
      } else {
        $select.removeClass("is-invalid").addClass("is-valid");
      }
    });

    // Validate the date input
    if (!$dateInput.val()) {
      $dateInput.addClass("is-invalid");
      isValid = false;
    } else {
      $dateInput.removeClass("is-invalid").addClass("is-valid");
    }

    // Validate that a time slot was actually clicked
    // the hidden #selectedTime input will be empty if nothing was picked
    if (!$selectedTime.val()) {
      $timeError.css("display", "block !important").show();
      isValid = false;
    }

    // If any validation failed, stop here and don't proceed
    if (!isValid) return;

    // Build the booking object with all the form data
    var booking = {
      petName: $("#petName").val().trim(),
      petType: $("#petType").val(),
      service: $("#service option:selected").text(), // gets the visible text not the value
      ownerName: $("#ownerName").val().trim(),
      email: $("#ownerEmail").val().trim(),
      phone: $("#ownerPhone").val().trim(),
      date: $dateInput.val(),
      time: $selectedTime.val(),
      bookedAt: new Date().toISOString(), // timestamp of when the booking was made
    };

    // Save to localStorage so the booking persists even if the page is refreshed
    var bookings = JSON.parse(localStorage.getItem("pawsBookings") || "[]");
    bookings.push(booking);
    localStorage.setItem("pawsBookings", JSON.stringify(bookings));

    // Format the date nicely for the confirmation message
    // toLocaleDateString with en-IE gives something like "Wednesday, 9 April 2026"
    var dateObj = new Date(booking.date + "T00:00:00");
    var formattedDate = dateObj.toLocaleDateString("en-IE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Show the confirmation card with all the booking details
    // .html() sets the inner HTML of the confirmation text
    $("#confirmationDetails").html(
      "<strong>" +
        booking.petName +
        "</strong> (" +
        booking.petType +
        ") — " +
        booking.service +
        "<br>" +
        booking.time +
        " on " +
        formattedDate,
    );

    // Slide the form up and the confirmation down for a smooth transition
    // 300ms matches a natural animation feel, not too fast not too slow
    $form.slideUp(300);
    $("#bookingConfirmation").slideDown(300, function () {
      $("html, body").animate(
        { scrollTop: $("#bookingConfirmation").offset().top - 100 },
        300,
      );
    });
  });
});

/*
   REFERENCES & RESOURCES
*/

// jQuery .slideUp() and .slideDown() used for form/confirmation transitions:
//   https://api.jquery.com/slideUp/ | https://api.jquery.com/slideDown/

// localStorage — how i save bookings on the client side:
//   https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

// URLSearchParams — how i read the ?type=exotic from the URL:
//   https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

// Date.toLocaleDateString() — formatting the date in Irish English locale:
//   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
