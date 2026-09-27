// ================================
// PRONOUNCETECH
// B.Tech Speaking Coach
// ================================

const $ = (id) => document.getElementById(id);

let recognition = null;
let listening = false;
let timerId = null;
let remaining = 0;

let finalText = "";
let interimText = "";
let startTime = 0;


// ================================
// DARK MODE
// ================================

$("themeBtn").onclick = () => {

  document.body.classList.toggle("dark");

  $("themeBtn").textContent =
    document.body.classList.contains("dark")
      ? "🌙"
      : "☀️";
};


// ================================
// TOPIC SUGGESTIONS
// ================================

document.querySelectorAll(".suggestion").forEach((button) => {

  button.onclick = () => {

    $("topic").value = button.textContent.trim();

  };

});


// ================================
// SPEECH RECOGNITION
// ================================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;


if (!SpeechRecognition) {

  $("supportText").textContent =
    "Speech recognition is not available in this browser. Please use Google Chrome.";

}


// ================================
// CREATE SPEECH RECOGNITION
// ================================

function setupRecognition() {

  if (!SpeechRecognition) {
    return false;
  }

  recognition = new SpeechRecognition();

  recognition.lang = "en-IN";

  recognition.continuous = true;

  recognition.interimResults = true;


  recognition.onstart = () => {

    listening = true;

    $("micStatus").textContent =
      "🎙️ Listening... Speak naturally.";

    $("practiceCard").classList.add("recording");

  };


  recognition.onresult = (event) => {

    interimText = "";

    for (
      let i = event.resultIndex;
      i < event.results.length;
      i++
    ) {

      const speech =
        event.results[i][0].transcript;

      if (event.results[i].isFinal) {

        finalText += speech + " ";

      } else {

        interimText += speech;

      }

    }

    updateTranscript();

  };


  recognition.onerror = (event) => {

    console.log("Speech error:", event.error);

    if (event.error === "not-allowed") {

      $("micStatus").textContent =
        "❌ Microphone permission denied. Please allow microphone access.";

    } else {

      $("micStatus").textContent =
        "⚠️ Speech recognition error. Try again.";

    }

  };


  recognition.onend = () => {

    if (listening) {

      try {

        recognition.start();

      } catch (error) {

        console.log(error);

      }

    }

  };


  return true;
}


// ================================
// UPDATE LIVE TRANSCRIPT
// ================================

function updateTranscript() {

  const text =
    (finalText + interimText).trim();


  $("transcript").textContent =
    text || "Your speech will appear here...";


  const words =
    text
      ? text.split(/\s+/).length
      : 0;


  $("wordCount").textContent =
    words +
    (words === 1 ? " word" : " words");

}


// ================================
// TIMER
// ================================

function startTimer() {

  remaining =
    Number($("duration").value);


  updateTimer();


  timerId =
    setInterval(() => {

      remaining--;

      updateTimer();


      if (remaining <= 0) {

        stopAndReview();

      }

    }, 1000);

}


function updateTimer() {

  const minutes =
    Math.floor(remaining / 60)
      .toString()
      .padStart(2, "0");


  const seconds =
    (remaining % 60)
      .toString()
      .padStart(2, "0");


  $("timer").textContent =
    `${minutes}:${seconds}`;

}


// ================================
// START SPEAKING
// ================================

$("startBtn").onclick = () => {

  const userTopic =
    $("topic").value.trim();


  if (!userTopic) {

    $("topic").focus();

    $("topic").placeholder =
      "Please enter your topic first";

    return;

  }


  $("topicDisplay").textContent =
    userTopic;


  $("setupCard").classList.add("hidden");

  $("resultCard").classList.add("hidden");

  $("practiceCard").classList.remove("hidden");


  finalText = "";

  interimText = "";

  startTime = Date.now();


  updateTranscript();


  if (setupRecognition()) {

    try {

      recognition.start();

    } catch (error) {

      console.log(error);

    }

  } else {

    $("micStatus").textContent =
      "Speech recognition is unavailable in this browser.";

  }


  startTimer();

};


// ================================
// MICROPHONE BUTTON
// ================================

$("micBtn").onclick = () => {

  if (!recognition) {
    return;
  }


  if (listening) {

    listening = false;

    recognition.stop();

    $("practiceCard")
      .classList
      .remove("recording");


    $("micStatus").textContent =
      "⏸️ Paused. Tap the microphone to continue.";

  } else {

    listening = true;

    try {

      recognition.start();

    } catch (error) {

      console.log(error);

    }

  }

};


// ================================
// STOP BUTTON
// ================================

$("stopBtn").onclick =
  stopAndReview;


// ================================
// STOP AND REVIEW
// ================================

function stopAndReview() {

  if (
    $("practiceCard")
      .classList
      .contains("hidden")
  ) {

    return;

  }


  clearInterval(timerId);


  listening = false;


  if (recognition) {

    try {

      recognition.stop();

    } catch (error) {

      console.log(error);

    }

  }


  $("practiceCard")
    .classList
    .remove("recording");


  const text =
    (finalText + interimText).trim();


  generateReview(text);

}


// ================================
// SCORE LIMIT
// ================================

function clamp(
  number,
  min = 0,
  max = 100
) {

  return Math.max(
    min,
    Math.min(
      max,
      Math.round(number)
    )
  );

}


// ================================
// GENERATE SPEAKING REVIEW
// ================================

function generateReview(text) {

  const words =
    text
      ? text.split(/\s+/).filter(Boolean)
      : [];


  const wordCount =
    words.length;


  const seconds =
    Math.max(
      1,
      (Date.now() - startTime) / 1000
    );


  const wpm =
    Math.round(
      wordCount / seconds * 60
    );


  const sentences =
    text
      ? text
          .split(/[.!?]+/)
          .filter(
            sentence =>
              sentence.trim()
          )
          .length
      : 0;


  const longWords =
    words.filter(
      word =>
        word
          .replace(/[^A-Za-z]/g, "")
          .length >= 9
    ).length;


  const fillerMatches =
    text.match(
      /\b(um|uh|like|actually|basically|you know)\b/gi
    ) || [];


  const uniqueWords =
    new Set(
      words.map(
        word =>
          word
            .toLowerCase()
            .replace(/[^a-z]/g, "")
      )
    );


  const repeated =
    words.length -
    uniqueWords.size;


  // ================================
  // PRACTICE SCORING
  // ================================

  const pronunciation =
    clamp(
      72 +
      Math.min(
        15,
        Math.log10(wordCount + 1) * 8
      ) -
      Math.min(
        15,
        fillerMatches.length * 2
      )
    );


  const fluency =
    clamp(
      65 +
      Math.min(
        25,
        sentences * 2.2
      ) -
      Math.min(
        20,
        fillerMatches.length * 3
      ) -
      (wordCount < 35 ? 12 : 0)
    );


  const vocabulary =
    clamp(
      62 +
      Math.min(
        30,
        longWords * 2.2
      ) -
      Math.min(
        10,
        repeated * 0.35
      )
    );


  const grammar =
    clamp(
      65 +
      Math.min(
        25,
        sentences * 3
      ) -
      (sentences < 3 ? 8 : 0)
    );


  const pace =
    wordCount === 0
      ? 25
      : clamp(
          100 -
          Math.abs(wpm - 125) * 0.55
        );


  const overall =
    clamp(
      pronunciation * 0.25 +
      fluency * 0.25 +
      vocabulary * 0.18 +
      grammar * 0.17 +
      pace * 0.15
    );


  // ================================
  // SHOW SCORES
  // ================================

  setScore(
    "pronunciation",
    pronunciation,
    "bar1"
  );


  setScore(
    "fluency",
    fluency,
    "bar2"
  );


  setScore(
    "vocabulary",
    vocabulary,
    "bar3"
  );


  setScore(
    "grammar",
    grammar,
    "bar4"
  );


  setScore(
    "pace",
    pace,
    "bar5"
  );


  $("overallScore").textContent =
    overall;


  $("resultTopic").textContent =
    $("topic").value.trim();


  $("finalTranscript").textContent =
    text ||
    "No speech was captured. Please try again and allow microphone access.";


  // ================================
  // GOOD POINTS
  // ================================

  const good = [];


  if (wordCount >= 60) {

    good.push(
      "You spoke enough to develop your topic."
    );

  }


  if (wpm >= 95 && wpm <= 155) {

    good.push(
      "Your speaking pace was comfortable."
    );

  }


  if (longWords >= 3) {

    good.push(
      "You used several advanced or technical words."
    );

  }


  if (sentences >= 4) {

    good.push(
      "You developed your ideas using multiple sentences."
    );

  }


  if (!good.length) {

    good.push(
      "You completed a speaking attempt. Keep practicing!"
    );

  }


  // ================================
  // IMPROVEMENTS
  // ================================

  const improve = [];


  if (wordCount < 60) {

    improve.push(
      "Speak for longer and add examples."
    );

  }


  if (fillerMatches.length >= 2) {

    improve.push(
      "Reduce filler words and use short pauses."
    );

  }


  if (wpm > 155) {

    improve.push(
      "Slow down slightly and pause between ideas."
    );

  }


  if (wpm > 0 && wpm < 95) {

    improve.push(
      "Try to maintain a steadier speaking rhythm."
    );

  }


  if (sentences < 4) {

    improve.push(
      "Use an introduction, main points and conclusion."
    );

  }


  if (!improve.length) {

    improve.push(
      "Work on natural rhythm and clearer transitions."
    );

  }


  $("goodList").innerHTML =
    good
      .map(
        item => `<li>${item}</li>`
      )
      .join("");


  $("improveList").innerHTML =
    improve
      .map(
        item => `<li>${item}</li>`
      )
      .join("");


  // ================================
  // COACH FEEDBACK
  // ================================

  let feedback;


  if (overall >= 85) {

    feedback =
      "Strong practice attempt! Focus on making your delivery more natural and consistent.";

  } else if (overall >= 70) {

    feedback =
      "Good progress! Focus on smoother delivery, clearer sentences and regular speaking practice.";

  } else {

    feedback =
      "This is a useful starting point. Speak slowly, organize your ideas and practice the same topic again.";

  }


  $("coachFeedback").textContent =
    feedback;


  // ================================
  // SAVE HISTORY
  // ================================

  saveHistory(
    $("topic").value.trim(),
    overall
  );


  renderHistory();


  // ================================
  // SHOW RESULT
  // ================================

  $("practiceCard")
    .classList
    .add("hidden");


  $("resultCard")
    .classList
    .remove("hidden");


  $("historyCard")
    .classList
    .remove("hidden");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ================================
// UPDATE SCORE BAR
// ================================

function setScore(
  id,
  value,
  bar
) {

  $(id).textContent =
    value + "%";


  $(bar).style.width =
    value + "%";

}


// ================================
// TRY AGAIN
// ================================

$("againBtn").onclick = () => {

  $("resultCard")
    .classList
    .add("hidden");


  $("practiceCard")
    .classList
    .remove("hidden");


  finalText = "";

  interimText = "";

  startTime = Date.now();


  updateTranscript();


  if (setupRecognition()) {

    try {

      recognition.start();

    } catch (error) {

      console.log(error);

    }

  }


  startTimer();

};


// ================================
// NEW TOPIC
// ================================

$("newTopicBtn").onclick = () => {

  $("resultCard")
    .classList
    .add("hidden");


  $("historyCard")
    .classList
    .add("hidden");


  $("setupCard")
    .classList
    .remove("hidden");


  $("topic").value = "";


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

};


// ================================
// SAVE HISTORY
// ================================

function saveHistory(
  topic,
  score
) {

  const history =
    JSON.parse(
      localStorage.getItem(
        "pronouncetech_history"
      ) || "[]"
    );


  history.unshift({

    topic: topic,

    score: score,

    date:
      new Date()
        .toLocaleDateString()

  });


  localStorage.setItem(

    "pronouncetech_history",

    JSON.stringify(
      history.slice(0, 8)
    )

  );

}


// ================================
// DISPLAY HISTORY
// ================================

function renderHistory() {

  const history =
    JSON.parse(
      localStorage.getItem(
        "pronouncetech_history"
      ) || "[]"
    );


  if (!history.length) {

    $("history").innerHTML =
      "<p class='support'>No attempts yet.</p>";

    return;

  }


  $("history").innerHTML =
    history
      .map(
        item => `

          <div class="history-item">

            <div>

              <p>
                ${escapeHtml(item.topic)}
              </p>

              <small>
                ${item.date}
              </small>

            </div>

            <div class="history-score">
              ${item.score}/100
            </div>

          </div>

        `
      )
      .join("");

}


// ================================
// CLEAR HISTORY
// ================================

$("clearHistory").onclick = () => {

  localStorage.removeItem(
    "pronouncetech_history"
  );


  renderHistory();

};


// ================================
// SECURITY
// ================================

function escapeHtml(text) {

  return text.replace(
    /[&<>"']/g,

    function (character) {

      return {

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#039;"

      }[character];

    }
  );

}


// ================================
// INITIALIZE
// ================================

renderHistory();
function reviewSpeech() {
    const text = finalText.trim();

    if (!text) {
        alert("🎤 Please speak something first.");
        return;
    }

    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Vocabulary estimate
    const uniqueWords = new Set(
        words.map(word => word.toLowerCase().replace(/[.,!?]/g, ""))
    );

    const vocabularyPercentage =
        Math.round((uniqueWords.size / wordCount) * 100);

    // Sentence analysis
    const sentences = text
        .split(/[.!?]+/)
        .filter(sentence => sentence.trim().length > 0);

    const averageSentenceLength =
        sentences.length > 0
            ? Math.round(wordCount / sentences.length)
            : wordCount;

    // Basic fluency score
    let fluencyScore = 50;

    if (wordCount >= 20) fluencyScore += 10;
    if (wordCount >= 50) fluencyScore += 10;
    if (wordCount >= 80) fluencyScore += 10;

    if (averageSentenceLength >= 5) fluencyScore += 10;
    if (averageSentenceLength >= 10) fluencyScore += 10;

    fluencyScore = Math.min(fluencyScore, 100);

    // Vocabulary score
    let vocabularyScore = vocabularyPercentage;

    if (vocabularyScore > 100) {
        vocabularyScore = 100;
    }

    // Overall score
    const overallScore = Math.round(
        (fluencyScore + vocabularyScore) / 2
    );

    // Display results
    $("#overallScore").textContent = overallScore + "/100";
    $("#reviewWords").textContent = wordCount;
    $("#reviewTime").textContent =
        remaining !== undefined ? "Practice session" : "--";

    $("#fluencyResult").textContent =
        fluencyScore + "/100";

    $("#vocabularyResult").textContent =
        vocabularyScore + "/100";

    // Feedback
    let feedback = "";

    if (wordCount < 20) {
        feedback += "Try speaking for a little longer. ";
    } else {
        feedback += "Good speaking practice. ";
    }

    if (vocabularyScore < 40) {
        feedback += "Try using more different words. ";
    } else if (vocabularyScore < 60) {
        feedback += "Your vocabulary variety is developing. ";
    } else {
        feedback += "Good variety of words. ";
    }

    if (averageSentenceLength < 5) {
        feedback += "Try connecting your ideas into complete sentences.";
    } else {
        feedback += "Keep practicing clear and complete sentences.";
    }

    $("#reviewFeedback").textContent = feedback;

    // Show result
    $("#reviewResult").style.display = "block";

    // Scroll to result
    $("#reviewResult").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}
