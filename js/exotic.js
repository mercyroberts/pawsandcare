/* ══════════════════════════════════════════
   exotic.js — Exotic pets page logic
   Pet quiz with result recommendation
   ══════════════════════════════════════════ */

$(document).ready(function () {
  /* ── Quiz navigation ── */
  $(".quiz-next").on("click", function () {
    var currentStep = $(this).closest(".quiz-step");
    var nextStep = parseInt($(this).data("next"));

    // Check that an option is selected before moving on
    var radioName = currentStep.find("input[type='radio']").attr("name");
    if (!$("input[name='" + radioName + "']:checked").length) {
      currentStep.find(".quiz-options").addClass("shake");
      setTimeout(function () {
        currentStep.find(".quiz-options").removeClass("shake");
      }, 500);
      return;
    }

    currentStep.removeClass("active");
    $(".quiz-step[data-step='" + nextStep + "']").addClass("active");
  });

  $(".quiz-prev").on("click", function () {
    var prevStep = parseInt($(this).data("prev"));
    $(this).closest(".quiz-step").removeClass("active");
    $(".quiz-step[data-step='" + prevStep + "']").addClass("active");
  });

  /* ── Quiz submit — calculate result ── */
  $("#quizSubmit").on("click", function () {
    var q1 = $("input[name='q1']:checked").val();
    var q2 = $("input[name='q2']:checked").val();
    var q3 = $("input[name='q3']:checked").val();

    // Make sure all questions are answered
    if (!q1 || !q2 || !q3) {
      var currentStep = $(this).closest(".quiz-step");
      currentStep.find(".quiz-options").addClass("shake");
      setTimeout(function () {
        currentStep.find(".quiz-options").removeClass("shake");
      }, 500);
      return;
    }

    var result = calculateResult(q1, q2, q3);

    // Hide quiz steps, show result
    $(".quiz-step").removeClass("active");
    $("#quizResult").html(buildResultCard(result)).fadeIn(400);
  });

  /**
   * calculateResult — matches answers to a recommended pet
   */
  function calculateResult(space, time, handling) {
    // Scoring matrix for each pet type
    var pets = {
      leopardGecko: {
        name: "Leopard Gecko",
        icon: "fa-solid fa-dragon",
        description: "Perfect for beginners! Leopard geckos are docile, easy to care for, and don't need a huge setup. They enjoy gentle handling and live 15-20 years.",
        score: 0
      },
      cornSnake: {
        name: "Corn Snake",
        icon: "fa-solid fa-worm",
        description: "Corn snakes are calm, low-maintenance, and come in beautiful colour morphs. They need minimal daily attention and are great for handling.",
        score: 0
      },
      budgerigar: {
        name: "Budgerigar (Budgie)",
        icon: "fa-solid fa-dove",
        description: "Budgies are social, intelligent, and can even learn to talk! They need daily interaction and a spacious cage with toys.",
        score: 0
      },
      guineaPig: {
        name: "Guinea Pig",
        icon: "fa-solid fa-otter",
        description: "Guinea pigs are friendly, vocal, and love cuddles. They do best in pairs and need a good-sized enclosure with fresh hay daily.",
        score: 0
      },
      tarantula: {
        name: "Tarantula",
        icon: "fa-solid fa-spider",
        description: "Tarantulas are fascinating to observe, need very little space, and are extremely low-maintenance. Perfect if you prefer a hands-off pet.",
        score: 0
      },
      rabbit: {
        name: "Rabbit",
        icon: "fa-solid fa-otter",
        description: "Rabbits are affectionate, playful, and great companions. They need space to hop, a hay-based diet, and daily interaction.",
        score: 0
      }
    };

    // Space scoring
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
      pets.rabbit.score += 3;
      pets.guineaPig.score += 2;
      pets.budgerigar.score += 2;
    }

    // Time scoring
    if (time === "low") {
      pets.tarantula.score += 3;
      pets.leopardGecko.score += 2;
      pets.cornSnake.score += 3;
    } else if (time === "medium") {
      pets.leopardGecko.score += 2;
      pets.guineaPig.score += 2;
      pets.budgerigar.score += 1;
    } else {
      pets.budgerigar.score += 3;
      pets.rabbit.score += 3;
      pets.guineaPig.score += 2;
    }

    // Handling scoring
    if (handling === "hands-off") {
      pets.tarantula.score += 3;
      pets.cornSnake.score += 1;
    } else if (handling === "occasional") {
      pets.leopardGecko.score += 3;
      pets.cornSnake.score += 2;
      pets.guineaPig.score += 1;
    } else {
      pets.rabbit.score += 3;
      pets.guineaPig.score += 3;
      pets.budgerigar.score += 2;
    }

    // Find the highest scoring pet
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

  /**
   * buildResultCard — returns HTML for the quiz result
   */
  function buildResultCard(pet) {
    return (
      '<div class="quiz-result-card">' +
        '<div class="quiz-result-icon"><i class="' + pet.icon + '"></i></div>' +
        '<h4>Your Match: ' + pet.name + '</h4>' +
        '<p>' + pet.description + '</p>' +
        '<a href="book.html?type=exotic" class="btn btn-cta mt-2">' +
          'Book a Consultation <i class="fa-solid fa-arrow-right ms-1"></i>' +
        '</a>' +
        '<button class="btn btn-outline-secondary mt-2 ms-2" id="retakeQuiz">Retake Quiz</button>' +
      '</div>'
    );
  }

  /* ── Retake quiz ── */
  $(document).on("click", "#retakeQuiz", function () {
    // Reset all radio buttons
    $("#quizContainer input[type='radio']").prop("checked", false);
    // Hide result, show first step
    $("#quizResult").fadeOut(200, function () {
      $(".quiz-step[data-step='1']").addClass("active");
    });
  });
});
