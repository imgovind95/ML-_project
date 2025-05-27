const apiKey = 'AIzaSyBy_DTYl4i3cLqJ4q-FMjgImSlDKTrBuOg';

let shuffledQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let answeredCount = 0;
let answeredMap = {};

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function showQuestion(index) {
  const quizContainer = document.getElementById("quiz-container");
  quizContainer.innerHTML = "";

  const q = shuffledQuestions[index];
  if (!q) return;

  const questionDiv = document.createElement("div");
  questionDiv.innerHTML = `
    <h3>Question ${index + 1} of ${shuffledQuestions.length}</h3>
    <p>${q.question}</p>
    ${q.options.map(opt => `
      <label><input type="radio" name="q" value="${opt}" ${answeredMap[index]?.answer === opt ? "checked" : ""}> ${opt}</label><br>
    `).join('')}
  `;

  quizContainer.appendChild(questionDiv);

  document.getElementById("next-btn").innerText =
    (index === shuffledQuestions.length - 1) ? "Submit Quiz" : "Next";
  document.getElementById("submit-btn").style.display = "none";
  document.getElementById("prev-btn").style.display = (index > 0) ? "inline-block" : "none";
}

function submitAnswer() {
  const selected = document.querySelector(`input[name="q"]:checked`);
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  if (!currentQuestion) return;

  const correct = currentQuestion.answer;
  if (selected) {
    const userAnswer = selected.value.trim();

    if (!answeredMap[currentQuestionIndex]) {
      answeredCount++;
      if (normalize(userAnswer) === normalize(correct)) score++;
    } else {
      const prevAnswer = answeredMap[currentQuestionIndex].answer;
      if (normalize(prevAnswer) === normalize(correct)) score--;
      if (normalize(userAnswer) === normalize(correct)) score++;
    }
    answeredMap[currentQuestionIndex] = { answer: userAnswer };
  }

  if (currentQuestionIndex < shuffledQuestions.length - 1) {
    currentQuestionIndex += 1;
    showQuestion(currentQuestionIndex);
  } else {
    submitQuiz();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion(currentQuestionIndex);
  }
}

function submitQuiz() {
  const total = shuffledQuestions.length;
  const percentage = (score / total) * 100;

  const quizContainer = document.getElementById("quiz-container");
  quizContainer.innerHTML = `
    <h3>You answered ${answeredCount} out of ${total} question(s).</h3>
    <h3>Your Score: ${score} / ${total} (${percentage.toFixed(2)}%)</h3>
  `;

  const mood = document.getElementById("difficulty-select").value;
  generateFeedback(percentage, mood);

  document.getElementById("next-btn").style.display = "none";
  document.getElementById("prev-btn").style.display = "none";
  const submitBtn = document.getElementById("submit-btn");
  submitBtn.innerText = "Retest";
  submitBtn.style.display = "inline-block";
}

document.getElementById("submit-btn").addEventListener("click", () => {
  if (document.getElementById("submit-btn").innerText === "Retest") {
    resetQuiz();
  }
});

document.getElementById("next-btn").addEventListener("click", submitAnswer);
document.getElementById("prev-btn").addEventListener("click", prevQuestion);
document.getElementById("ask-btn").addEventListener("click", chat);
document.getElementById("start-btn").addEventListener("click", () => {
  startQuiz();
});

document.getElementById("difficulty-select").addEventListener("change", () => {
  document.getElementById("start-btn").disabled = false;
});

document.getElementById("subject-select").addEventListener("change", () => {
  document.getElementById("start-btn").disabled = false;
});

async function generateQuizQuestions(subject, difficulty) {
  const prompt = `
Generate 10 ${subject} programming quiz questions suitable for "${difficulty}" difficulty.
Each question must include:
- a clear question
- 4 answer options
- the correct answer (must match one of the options)

Return only a valid JSON array in this format:
[
  {
    "question": "What is ...?",
    "options": ["A", "B", "C", "D"],
    "answer": "C"
  }
]
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating questions:", error);
    alert("Failed to load questions. Please try again.");
    return [];
  }
}

async function startQuiz() {
  const difficulty = document.getElementById("difficulty-select").value;
  const subject = document.getElementById("subject-select").value;

  if (!difficulty || !subject) {
    alert("Please select both subject and difficulty.");
    return;
  }

  const quizContainer = document.getElementById("quiz-container");
  quizContainer.innerHTML = "<p>Loading questions...</p>";

  currentQuestionIndex = 0;
  score = 0;
  answeredCount = 0;
  answeredMap = {};

  document.getElementById("next-btn").style.display = "none";
  document.getElementById("prev-btn").style.display = "none";
  document.getElementById("submit-btn").style.display = "none";
  document.getElementById("feedback-msg").innerText = "";

  shuffledQuestions = await generateQuizQuestions(subject, difficulty);

  if (shuffledQuestions.length === 0) {
    quizContainer.innerHTML = "<p>Failed to load questions. Please try again later.</p>";
    return;
  }

  showQuestion(currentQuestionIndex);

  document.getElementById("start-btn").style.display = "none";
  document.getElementById("next-btn").style.display = "inline-block";
  document.getElementById("prev-btn").style.display = "none";
  document.getElementById("submit-btn").style.display = "none";
}

function resetQuiz() {
  document.getElementById("submit-btn").innerText = "Submit Quiz";
  startQuiz();
}

async function generateFeedback(percentage, mood) {
  const prompt = `
I completed a quiz with a score of ${percentage.toFixed(2)}% at "${mood}" difficulty.
Give 2–3 lines of encouraging feedback.
Also suggest which topics I should improve.
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const content = data?.candidates?.[0]?.content;
    const msg = content?.parts?.[0]?.text || data?.error?.message || "No feedback received.";
    document.getElementById("feedback-msg").innerText = msg;
  } catch (error) {
    console.error("Gemini feedback error:", error);
    document.getElementById("feedback-msg").innerText = "Network error while getting feedback.";
  }
}

async function chat() {
  const inputElement = document.getElementById("chat-input");
  const userInput = inputElement.value.trim();
  const responseBox = document.getElementById("chat-response");
  if (!userInput) return;

  responseBox.innerText = "Assistant is thinking...";

  const prompt = `
You are a helpful tutor.
Explain this clearly:

"${userInput}"
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    let fullText = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.error?.message || "No response received.";

    fullText = fullText
      .split('\n')
      .map(line => {
        if (line.trim().startsWith("**") && line.trim().endsWith("**")) {
          return `<b>${line.trim().replace(/\*\*/g, '')}</b>`;
        }
        if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
          return `<b>${line.replace(/^(\*|-)\s*/, '')}</b>`;
        }
        if (line.includes(":")) {
          const [key, value] = line.split(/:(.+)/);
          return `<b>${key.trim()}:</b>${value}`;
        }
        return line;
      })
      .join('<br>');

    responseBox.innerHTML = "";
    const lines = fullText.split('<br>');
    let i = 0;
    function typeNextLine() {
      if (i < lines.length) {
        responseBox.innerHTML += lines[i] + "<br>";
        i++;
        setTimeout(typeNextLine, 200);
      }
    }
    typeNextLine();
  } catch (error) {
    console.error("Gemini assistant error:", error);
    responseBox.innerText = "Network error while asking assistant.";
  }
}





