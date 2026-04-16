/* jshint esversion: 8 */
/* global $ */
/*
   exotic.js Exotic pets page logic
   This file handles the "Which Exotic Pet Suits You?" quiz:
   - Step-by-step navigation through 3 questions
   - Shake animation if the user tries to skip without answering
   - Scoring algorithm that matches the 3 answers to a recommended pet
   - Building and fading in the result card with a booking link
*/

$(document).ready(function () {
  /* Quiz navigation
    Find every element with the class quiz-next, and when it's clicked, run this code*/
  $(".quiz-next").on("click", function () {
    var currentStep = $(this).closest(".quiz-step"); // grab the current question container
    var nextStep = parseInt($(this).data("next")); // read which step to go to from the HTML attribute

    // I am making sure the user picked an option before moving on
    // .attr("name") gets the radio group name for this step (q1, q2, or q3)
    var radioName = currentStep.find("input[type='radio']").attr("name");
    if (!$("input[name='" + radioName + "']:checked").length) {
      // If nothing is checked, shake the options container to nudge the user
      // The shake animation is defined in exotic.css using @keyframes
      currentStep.find(".quiz-options").addClass("shake");
      // Remove the shake class after a while so it can trigger again if they click Next again
      setTimeout(function () {
        currentStep.find(".quiz-options").removeClass("shake");
      }, 500);
      return;
    }

    // Hide current step and show the next one by swapping the active class
    currentStep.removeClass("active");
    $(".quiz-step[data-step='" + nextStep + "']").addClass("active");
  });

  // Back button, just swap the active class
  $(".quiz-prev").on("click", function () {
    var prevStep = parseInt($(this).data("prev")); // read which step to go back to
    $(this).closest(".quiz-step").removeClass("active");
    $(".quiz-step[data-step='" + prevStep + "']").addClass("active");
  });

  /* Quiz submit collect answers and calculate the result      
     This fires when the user clicks "See My Match" on step 3
     I grab all 3 radio values then pass them to calculateResult() */
  $("#quizSubmit").on("click", function () {
    var q1 = $("input[name='q1']:checked").val(); // space answer
    var q2 = $("input[name='q2']:checked").val(); // time answer
    var q3 = $("input[name='q3']:checked").val(); // handling answer

    // Same shake validation as the Next buttons
    if (!q1 || !q2 || !q3) {
      var currentStep = $(this).closest(".quiz-step");
      currentStep.find(".quiz-options").addClass("shake");
      setTimeout(function () {
        currentStep.find(".quiz-options").removeClass("shake");
      }, 500);
      return;
    }

    // Calculate the best match and build the result card
    var result = calculateResult(q1, q2, q3);

    // Hide all quiz steps and smoothly fade in the result
    $(".quiz-step").removeClass("active");
    $("#quizResult").html(buildResultCard(result)).fadeIn(400);
  });

  /* calculateResult this is the scoring function that decides which pet to recommend
     I set up 6 possible pets and give each one a score based on the 3 answers.
     Space, time, and handling each add different points to different pets.
     Whichever pet has the highest total score at the end gets recommended.
     This approach means I can add new pets or adjust the scoring easily later */
  function calculateResult(space, time, handling) {
    // Each pet has a name, Font Awesome icon, a description, and a score starting at 0
    var pets = {
      leopardGecko: {
        name: "Leopard Gecko",
        icon: "fa-solid fa-dragon",
        description:
          "So you want a tiny dinosaur that just sits there and blinks at you? Fair enough. I see you, low maintenance, chill, and live 15-20 years. That's a longer commitment than most Dublin leases, just saying.",
        score: 0,
      },
      cornSnake: {
        name: "Corn Snake",
        icon: "fa-solid fa-worm",
        description:
          "A snake. In Ireland. St. Patrick is rolling in his grave right now. Basically the perfect pet for someone who wants to say 'I have a snake' at parties. I don't know if dublinese would find you cool tho.",
        score: 0,
      },
      budgerigar: {
        name: "Budgerigar (Budgie)",
        icon: "fa-solid fa-dove",
        description:
          "You picked the pet that will literally never stop talking. Says alot about you.On the bright side, at least someone in the house will always have something to say.",
        score: 0,
      },
      guineaPig: {
        name: "Guinea Pig",
        icon: "fa-solid fa-otter",
        description:
          "Ah, the guinea pig basically a potato that squeaks every time you open the fridge. Worth it.",
        score: 0,
      },
      tarantula: {
        name: "Tarantula",
        icon: "fa-solid fa-spider",
        description:
          "You don't want to touch your pet. You don't have much space. You barely have time. And your answer is... a giant spider? Bold choice. Zero maintenance, zero cuddles, and guaranteed to terrify every visitor you ever have. Do you even really want a pet?",
        score: 0,
      },
      rabbit: {
        name: "Rabbit",
        icon: "fa-solid fa-otter",
        description:
          "A rabbit! The pet that looks innocent but will chew through every cable you own. Give them space to hop and daily attention, or prepare for the guilt trip of a lifetime.",
        score: 0,
      },
    };

    // Space scoring small space favours small pets, large space opens up more options
    if (space === "small") {
      pets.leopardGecko.score += 3;
      pets.tarantula.score += 3;
      pets.cornSnake.score += 2;
      pets.budgerigar.score += 2;
    } else if (space === "medium") {
      pets.guineaPig.score += 3;
      pets.budgerigar.score += 2;
      pets.rabbit.score += 2;
      pets.cornSnake.score += 2;
    } else {
      // large space
      pets.rabbit.score += 3;
      pets.guineaPig.score += 2;
      pets.budgerigar.score += 2;
    }

    // Time scoring, low time available means a low maintenance pet like a tarantula or snake
    if (time === "low") {
      pets.tarantula.score += 3;
      pets.leopardGecko.score += 2;
      pets.cornSnake.score += 3;
    } else if (time === "medium") {
      pets.leopardGecko.score += 2;
      pets.guineaPig.score += 2;
      pets.budgerigar.score += 1;
    } else {
      // high time available suits social pets that need daily attention
      pets.budgerigar.score += 3;
      pets.rabbit.score += 3;
      pets.guineaPig.score += 2;
    }

    // Handling scoring, hands-off means tarantula orsnake, hands-on means cuddly pets
    if (handling === "hands-off") {
      pets.tarantula.score += 3;
      pets.cornSnake.score += 1;
    } else if (handling === "occasional") {
      pets.leopardGecko.score += 3;
      pets.cornSnake.score += 2;
      pets.guineaPig.score += 1;
    } else {
      // hands-on
      pets.rabbit.score += 3;
      pets.guineaPig.score += 3;
      pets.budgerigar.score += 2;
    }

    // Loop through all pets to find the one with the highest score
    // I used Object.keys() to iterate over the pets object like an array
    var best = null;
    var bestScore = -1;
    Object.keys(pets).forEach(function (key) {
      if (pets[key].score > bestScore) {
        bestScore = pets[key].score;
        best = pets[key];
      }
    });

    return best;
  }

  /* buildResultCard — builds and returns the HTML string for the result card
     I built this as a string changes depending on which pet wins.
     The "Book a Consultation" link passes ?type=exotic to book.js so it selects
     exotic in the pet type dropdown on the booking page */
  function buildResultCard(pet) {
    return (
      '<div class="quiz-result-card">' +
      '<div class="quiz-result-icon"><i class="' +
      pet.icon +
      '"></i></div>' +
      "<h4>Your Match: " +
      pet.name +
      "</h4>" +
      "<p>" +
      pet.description +
      "</p>" +
      '<a href="book.html?type=exotic" class="btn btn-cta mt-2">' +
      'Book a Consultation <i class="fa-solid fa-arrow-right ms-1"></i>' +
      "</a>" +
      '<button class="btn btn-outline-secondary mt-2 ms-2" id="retakeQuiz">Retake Quiz</button>' +
      "</div>"
    );
  }

  /* Retake quiz
  I used $(document).on() here instead of $("#retakeQuiz").on() because the retake button
     doesn't exist in the DOM when the page loads, it's created by buildResultCard */
  $(document).on("click", "#retakeQuiz", function () {
    // Clear all radio selections so the quiz starts fresh
    $("#quizContainer input[type='radio']").prop("checked", false);
    $("#quizResult").fadeOut(200, function () {
      $(".quiz-step[data-step='1']").addClass("active");
    });
  });
});

/*
   REFERENCES & RESOURCES
*/
// "jQuery Tutorial: Creating HTML Elements Dynamically" by Dcode:
//   https://www.youtube.com/watch?v=EO6OkltgudE

// jQuery event delegation (why I used $(document).on for the retake button):
// - jQuery docs: https://api.jquery.com/on/#direct-and-delegated-events

// Object.keys() used to loop through the pets object:
// - MDN Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
