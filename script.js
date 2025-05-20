let quizData, feedbackData, chatbotData;
let currentQuestionIndex = 0;
let score = 0;
let shuffledQuestions = [];
let answeredCount = 0;
let answeredMap = {};  // <-- Add this line

window.onload = async () => {
  try {
    quizData = await fetch('./data/quiz_data.json').then(res => res.json());
    feedbackData = await fetch('./data/mood_feedback.json').then(res => res.json());
    chatbotData = await fetch('./data/chatbot_data.json').then(res => res.json());

    shuffledQuestions = shuffleArray([...quizData.questions]);
    showQuestion(currentQuestionIndex);
    document.getElementById("submit-btn").style.display = "block"; // Show Submit button
  } catch (err) {
    console.error("Error loading data:", err);
  }
};

// Shuffle questions
function shuffleArray(array) {
  for (let i = array.length-1 ; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showQuestion(index) {
  const quizContainer = document.getElementById("quiz-container");
  quizContainer.innerHTML = "";

  const q = shuffledQuestions[index];

  const questionDiv = document.createElement("div");
  questionDiv.innerHTML = `
    <h3>Question ${index + 1} of ${shuffledQuestions.length}</h3>
    <p>${q.question}</p>
    ${q.options.map(opt => `<label><input type="radio" name="q" value="${opt}"> ${opt}</label><br>`).join('')}
    <button onclick="submitAnswer()">Next</button>
  `;
  quizContainer.appendChild(questionDiv);
}


function submitAnswer() {
  const selected = document.querySelector(`input[name="q"]:checked`);
  if (!selected) {
    alert("Please select an answer before continuing.");
    return;
  }

  const correct = shuffledQuestions[currentQuestionIndex].answer;

  if (!answeredMap[currentQuestionIndex]) {
    answeredMap[currentQuestionIndex] = true;
    answeredCount++;
    if (selected.value === correct) {
      score++;
    }
  }

  currentQuestionIndex++;
  if (currentQuestionIndex < shuffledQuestions.length) {
    showQuestion(currentQuestionIndex);
  } else {
    document.getElementById("quiz-container").innerHTML = "<p>You have completed all questions. You may submit now.</p>";
  }
}



function submitQuiz() {
  const totalQuestions = shuffledQuestions.length;
  const percentage = (totalQuestions > 0) ? (score / totalQuestions) * 100 : 0;

  document.getElementById("quiz-container").innerHTML = `
    <h3>You answered ${answeredCount} out of ${totalQuestions} question(s).</h3>
    <h3>Your Score: ${score} / ${totalQuestions} (${percentage.toFixed(2)}%)</h3>
  `;

  localStorage.setItem("last_score", percentage);

  const mood = document.getElementById("mood-select").value;
  const feedback = feedbackData[mood]?.find(f => percentage <= f.max_score)?.message || "Great job!";
  document.getElementById("feedback-msg").innerText = feedback;

  document.getElementById("submit-btn").style.display = "none";
}



function chat() {
  const input = document.getElementById("chat-input").value.toLowerCase().trim();
  let response = "Sorry, I don't have an answer for that.";
  for (let key in chatbotData) {
    if (input.includes(key)) {
      response = chatbotData[key];
      break;
    }
  }
  document.getElementById("chat-response").innerText = response;
}
