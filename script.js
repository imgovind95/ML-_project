const apiKey = 'AIzaSyBy_DTYl4i3cLqJ4q-FMjgImSlDKTrBuOg'; // Replace with your actual Gemini API key
let quizData = {
  questions: [
    { question: "What is the output of print(2 ** 3)?", options: ["6", "8", "9", "5"], answer: "8" },
    { question: "Which keyword is used to create a function in Python?", options: ["func", "def", "function", "lambda"], answer: "def" },
    { question: "Which data type is used to store True or False?", options: ["int", "str", "bool", "float"], answer: "bool" },
    { question: "Which loop continues as long as a condition is True?", options: ["for", "while", "repeat", "loop"], answer: "while" },
    { question: "How do you define a function in Python?", options: ["def myFunc():", "function myFunc()", "create myFunc()", "func myFunc()"], answer: "def myFunc():" },
    { question: "Which data type is used to store text?", options: ["int", "str", "bool", "list"], answer: "str" },
    { question: "How do you insert a comment in Python?", options: ["# This is a comment", "// comment", "/* comment */", "None of the above"], answer: "# This is a comment" },
    { question: "What is the output of: print(len('Python'))?", options: ["5", "6", "7", "Error"], answer: "6" },
    { question: "What is the sum of 3+6 ?", options: ["5", "8", "7", "9"], answer: "9" }
  ]
};

let currentQuestionIndex = 0;
let shuffledQuestions = [];
let score = 0;
let answeredCount = 0;
let answeredMap = {};

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

window.onload = () => {
  shuffledQuestions = shuffleArray([...quizData.questions]);
  showQuestion(currentQuestionIndex);
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
    ${q.options.map(opt => `
      <label><input type="radio" name="q" value="${opt}" ${answeredMap[index]?.answer === opt ? "checked" : ""}> ${opt}</label><br>
    `).join('')}
  `;

  quizContainer.appendChild(questionDiv);

  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");
  const submitBtn = document.getElementById("submit-btn");

  nextBtn.innerText = (index === shuffledQuestions.length - 1) ? "Submit Quiz" : "Next";
  submitBtn.style.display = "none";
  prevBtn.style.display = (index > 0) ? "inline" : "none";
}

function submitAnswer() {
  const selected = document.querySelector(`input[name="q"]:checked`);
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
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

  const mood = document.getElementById("mood-select").value;
  generateFeedback(percentage, mood);

  document.getElementById("next-btn").style.display = "none";
  document.getElementById("prev-btn").style.display = "none";
  document.getElementById("submit-btn").innerText = "Retest";
  document.getElementById("submit-btn").style.display = "inline";
}

// Retest Handler
document.getElementById("submit-btn").addEventListener("click", () => {
  if (document.getElementById("submit-btn").innerText === "Retest") {
    currentQuestionIndex = 0;
    score = 0;
    answeredCount = 0;
    answeredMap = {};
    shuffledQuestions = shuffleArray([...quizData.questions]);
    showQuestion(currentQuestionIndex);
    document.getElementById("feedback-msg").innerText = "";
    document.getElementById("submit-btn").style.display = "none";
    document.getElementById("next-btn").style.display = "inline";
  }
});

// ✅ No inline onclick — use listeners
document.getElementById("next-btn").addEventListener("click", submitAnswer);
document.getElementById("prev-btn").addEventListener("click", prevQuestion);
document.getElementById("ask-btn").addEventListener("click", chat);

// ✅ Gemini AI - Feedback Generator
async function generateFeedback(percentage, mood) {
  const prompt = `I just completed a Python quiz with a score of ${percentage.toFixed(2)}%. My mood is "${mood}". Give me motivating feedback in 2-3 sentences.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
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

// ✅ Gemini AI - Assistant Chat
async function chat() {
  const userInput = document.getElementById("chat-input").value.trim();
  const responseBox = document.getElementById("chat-response");
  if (!userInput) return;

  responseBox.innerText = "Assistant is thinking...";

  const prompt = `
You are a helpful and intelligent assistant. A user has asked the following query. Please provide a clear, helpful, and complete response.

Query: "${userInput}"

If the query is about code, explain and give the correct code example in the most appropriate programming language (not just Python). If it’s a general question, respond informatively like a smart AI tutor.
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const fullText = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.error?.message || "No response received.";

    // Typing animation
    responseBox.innerText = "";
    const lines = fullText.split('\n');
    let i = 0;

    function typeNextLine() {
      if (i < lines.length) {
        responseBox.innerText += lines[i] + '\n';
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




