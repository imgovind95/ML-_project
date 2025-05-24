let quizData, feedbackData, chatbotData;
let currentQuestionIndex = 0;
let score = 0;
let shuffledQuestions = [];
let answeredCount = 0;
let answeredMap = {};

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

let normalizedChatbotData = {};

quizData = {
  "questions": [
    {
      "question": "What is the output of print(2 ** 3)?",
      "options": ["6", "8", "9", "5"],
      "answer": "8"
    },
    {
      "question": "Which keyword is used to create a function in Python?",
      "options": ["func", "def", "function", "lambda"],
      "answer": "def"
    },
    {
      "question": "Which data type is used to store True or False?",
      "options": ["int", "str", "bool", "float"],
      "answer": "bool"
    },
    {
      "question": "Which loop continues as long as a condition is True?",
      "options": ["for", "while", "repeat", "loop"],
      "answer": "while"
    },
    {
      "question": "How do you define a function in Python?",
      "options": ["def myFunc():", "function myFunc()", "create myFunc()", "func myFunc()"],
      "answer": "def myFunc():"
    },
    {
      "question": "Which data type is used to store text?",
      "options": ["int", "str", "bool", "list"],
      "answer": "str"
    },
    {
      "question": "How do you insert a comment in Python?",
      "options": ["# This is a comment", "// comment", "/* comment */", "None of the above"],
      "answer": "# This is a comment"
    },
    {
      "question": "What is the output of: print(len('Python'))?",
      "options": ["5", "6", "7", "Error"],
      "answer": "6"
    },
    {
      "question": "What is the sum of 3+6 ?",
      "options": ["5", "8", "7", "9"],
      "answer": "9"
    }
  ]
};

feedbackData = {
  "confused": [
    { "max_score": 40, "message": "Don't worry! Keep practicing, and it'll make sense soon." },
    { "max_score": 70, "message": "You're on the right track. A little more effort will help!" },
    { "max_score": 100, "message": "Nice job! Review any confusing parts again for clarity." }
  ],
  "confident": [
    { "max_score": 40, "message": "Stay humble and keep learning!" },
    { "max_score": 70, "message": "Good job! You're making progress." },
    { "max_score": 100, "message": "Excellent work! You really know your stuff." }
  ],
  "stressed": [
    { "max_score": 40, "message": "Take a deep breath. Learning takes time." },
    { "max_score": 70, "message": "You're doing well, don’t be too hard on yourself." },
    { "max_score": 100, "message": "Great job! Keep pushing forward." }
  ]
};

chatbotData = {
  "How are you":"I'm fine!, what about you",
  "what is a variable": "A variable stores data that can be changed later.",
  "define function": "You can define a function using the 'def' keyword like: def my_function():",
  "loop": "Python supports 'for' and 'while' loops to repeat blocks of code.",
  "list": "A list in Python is a collection which is ordered and changeable. Example: my_list = [1, 2, 3]",
  "dictionary": "A dictionary is a collection of key-value pairs. Example: my_dict = {'key': 'value'}",
  "A-Z": "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z",
  "a-z": "a b c d e f g h i j k l m n o p q r s t u v w x y z",
  "DSA": "DSA forms the backbone of computer programming and software development by teaching you how to organize data and design efficient solutions to problems.",
  "dsa": "DSA forms the backbone of computer programming and software development by teaching you how to organize data and design efficient solutions to problems.",
  "class": "A class is a blueprint for creating objects in object-oriented programming.",
  "object": "An object is an instance of a class that contains data and methods.",
  "inheritance": "Inheritance allows a class to inherit properties and methods from another class.",
  "encapsulation": "Encapsulation restricts direct access to some of an object's components, protecting the data.",
  "polymorphism": "Polymorphism allows methods to do different things based on the object it is acting upon.",
  "algorithm": "An algorithm is a step-by-step procedure to solve a specific problem.",
  "recursion": "Recursion is a function calling itself to solve smaller instances of a problem.",
  "array": "An array is a collection of elements identified by index or key, stored contiguously in memory.",
  "stack": "A stack is a data structure that follows Last In First Out (LIFO) principle.",
  "queue": "A queue is a data structure that follows First In First Out (FIFO) principle.",
  "binary search": "Binary search efficiently finds an element in a sorted list by repeatedly dividing the search interval in half.",
  "sorting": "Sorting algorithms arrange elements of a list in a certain order, such as ascending or descending.",
  "python": "Python is a high-level, interpreted programming language known for its simplicity and readability.",
  "java": "Java is a widely-used, class-based, object-oriented programming language designed to have as few implementation dependencies as possible.",
  "bubble sort": "Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
  "merge sort": "Merge Sort is a divide-and-conquer algorithm that divides the list into halves, sorts them and merges back.",
  "quick sort": "Quick Sort selects a pivot and partitions the list around the pivot, sorting sublists recursively.",
  "dynamic programming": "Dynamic Programming solves problems by breaking them into overlapping subproblems and storing results to avoid recomputation.",
  "greedy algorithm": "Greedy algorithms build up a solution piece by piece, choosing the next piece with the most immediate benefit.",
  "depth first search": "DFS explores as far as possible along each branch before backtracking, used in graph traversal.",
  "breadth first search": "BFS explores all neighbors at the current depth before moving to nodes at the next depth level, used in graph traversal.",
  "dijkstra's algorithm": "Dijkstra's algorithm finds the shortest path between nodes in a graph with non-negative edge weights.",
  "backtracking": "Backtracking incrementally builds candidates to the solutions and abandons candidates that fail to satisfy constraints.",
  "divide and conquer": "Divide and Conquer breaks a problem into smaller subproblems, solves them independently, and combines results.",
  "kadane algorithm": "Kadane's Algorithm finds the maximum sum of a contiguous subarray in an array efficiently in linear time.",
  "machine learning": "Machine Learning is a subset of AI that enables computers to learn from data and improve their performance over time without being explicitly programmed.",
  "what is supervised learning": "Supervised learning is a machine learning task where the model learns from labeled data, meaning input-output pairs.",
  "supervised learning": "Supervised learning uses labeled datasets to train models to predict outcomes based on input data.",
  "what is unsupervised learning": "Unsupervised learning is a machine learning task where the model finds patterns or structures in unlabeled data.",
  "unsupervised learning": "Unsupervised learning analyzes and clusters unlabeled data to discover hidden patterns or groupings.",
  "difference between supervised and unsupervised learning": "Supervised learning uses labeled data to predict outcomes, while unsupervised learning finds patterns in unlabeled data.",
  "examples of supervised learning": "Examples include classification tasks like spam detection and regression tasks like predicting house prices.",
  "examples of unsupervised learning": "Examples include clustering customers into segments and dimensionality reduction techniques.",
  "what is reinforcement learning": "Reinforcement learning is a type of machine learning where an agent learns to make decisions by performing actions and receiving rewards or penalties.",
  "reinforcement learning": "Reinforcement learning involves training models to make sequences of decisions by maximizing cumulative rewards.",
  "features in machine learning": "Features are individual measurable properties or characteristics of the data used as input for machine learning models.",
  "training data": "Training data is the dataset used to teach machine learning models to recognize patterns and make predictions.",
  "test data": "Test data is a separate dataset used to evaluate the performance and accuracy of a trained machine learning model.",
  "overfitting": "Overfitting occurs when a machine learning model performs well on training data but poorly on unseen data due to memorizing noise.",
  "underfitting": "Underfitting happens when a model is too simple to capture the underlying patterns in the data, leading to poor performance.",
  "cross validation": "Cross-validation is a technique to assess the generalizability of a machine learning model by training and testing it on different subsets of data.",
  "feature scaling": "Feature scaling is the process of normalizing or standardizing features to improve the performance of some machine learning algorithms."
};

for (const key in chatbotData) {
  normalizedChatbotData[normalize(key)] = chatbotData[key];
}

window.onload = () => {
  shuffledQuestions = shuffleArray([...quizData.questions]);
  showQuestion(currentQuestionIndex);
  document.getElementById("submit-btn").style.display = "block";
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
    ${q.options.map(opt => `<label><input type="radio" name="q" value="${opt}"> ${opt}</label><br>`).join('')}
    <button onclick="submitAnswer()">Next</button>
  `;
  quizContainer.appendChild(questionDiv);
}
function submitAnswer() {
  const selected = document.querySelector(`input[name="q"]:checked`);
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const correct = currentQuestion.answer;

  // Only count the score if the user selected an option and hasn't answered it before
  if (selected && !answeredMap[currentQuestionIndex]) {
    answeredMap[currentQuestionIndex] = true;
    answeredCount++;

    const userAnswer = selected.value.trim().toLowerCase();
    const correctAnswer = correct.trim().toLowerCase();

    if (userAnswer === correctAnswer) {
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
  const userInput = document.getElementById("chat-input").value;
  const normalizedInput = normalize(userInput);

  let response = normalizedChatbotData[normalizedInput];

  if (!response) {
    for (let key in normalizedChatbotData) {
      if (normalizedInput.includes(key)) {
        response = normalizedChatbotData[key];
        break;
      }
    }
  }

  if (!response) {
    response = "Sorry, I don't have an answer for that.";
  }

  document.getElementById("chat-response").innerText = response;
}

