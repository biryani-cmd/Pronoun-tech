const $ = (id) => document.getElementById(id);

const topic = $("topic");
const duration = $("duration");

let recognition = null;
let listening = false;
let timerId = null;
let remaining = 0;

let finalText = "";
let interimText = "";
let startTime = 0;


// ==============================
// DARK MODE
// ==============================

$("themeBtn").onclick = () => {

  document.body.classList.toggle("dark");

  $("themeBtn").textContent =
    document.body.classList.contains("dark")
      ? "🌙"
      : "☀️";
};


// ==============================
// TOPIC SUGGESTIONS
// ==============================

document.querySelectorAll(".suggestion").forEach((button) => {

  button.onclick = () => {

    topic.value = button.textContent.trim();

  };

});


// ==============================
// SPEECH RECOGNITION
// ==============================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;


if (!SpeechRecognition) {

  $("supportText").textContent =
    "Speech recognition is not
