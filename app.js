
let selectedSubject = "国語";
let selectedDifficulty = "かんたん";

let quizQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let answered = false;

// 画面を切り替える
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(screenId).classList.add("active");
}

// ホーム画面
function showHome() {
  showScreen("homeScreen");
  updateHomeStats();
}

// 履歴画面
function showHistory() {
  showScreen("historyScreen");
  renderHistory();
}

// 教科選択
document.querySelectorAll(".subject-card").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".subject-card").forEach(card => {
      card.classList.remove("selected");
    });

    button.classList.add("selected");
    selectedSubject = button.dataset.subject;
  });
});

// 難易度選択
document.querySelectorAll(".difficulty").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".difficulty").forEach(item => {
      item.classList.remove("selected");
    });

    button.classList.add("selected");
    selectedDifficulty = button.dataset.difficulty;
  });
});

// 配列をランダムに並べ替える
function shuffleQuestions(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// クイズ開始
function startQuiz() {
  const bank = questions[selectedSubject][selectedDifficulty];

  if (!bank || bank.length === 0) {
    alert("この条件の問題がありません。");
    return;
  }

  // 10問をランダムに選ぶ
  // 問題が10問未満の場合は、ある問題を重複させずに全問出題
  quizQuestions = shuffleQuestions(bank).slice(0, 10);

  currentQuestionIndex = 0;
  correctCount = 0;
  answered = false;

  document.getElementById("quizSubject").textContent = selectedSubject;
  document.getElementById("quizDifficulty").textContent = selectedDifficulty;

  showScreen("quizScreen");
  showQuestion();
}

// 問題表示
function showQuestion() {
  answered = false;

  const question = quizQuestions[currentQuestionIndex];

  document.getElementById("questionNumber").textContent =
    `${currentQuestionIndex + 1} / ${quizQuestions.length}`;

  document.getElementById("quizScore").textContent =
    `正解 ${correctCount}`;

  document.getElementById("questionText").textContent = question.q;

  document.getElementById("progressFill").style.width =
    `${(currentQuestionIndex / quizQuestions.length) * 100}%`;

  const choicesArea = document.getElementById("answerChoices");
  choicesArea.innerHTML = "";

  document.getElementById("explanation").classList.add("hidden");
  document.getElementById("nextButton").classList.add("hidden");

  // 選択肢の順番もランダムにする
  const shuffledChoices = shuffleQuestions(question.choices);

  shuffledChoices.forEach(choice => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.textContent = choice;

    button.addEventListener("click", () => {
      checkAnswer(button, choice, question);
    });

    choicesArea.appendChild(button);
  });
}

// 正誤判定
function checkAnswer(button, choice, question) {
  if (answered) return;

  answered = true;

  const buttons = document.querySelectorAll(".answer-button");

  buttons.forEach(item => {
    item.disabled = true;

    if (item.textContent === question.a) {
      item.classList.add("correct");
    }
  });

  if (choice === question.a) {
    correctCount++;
  } else {
    button.classList.add("wrong");
  }

  document.getElementById("quizScore").textContent =
    `正解 ${correctCount}`;

  const explanation = document.getElementById("explanation");

  explanation.textContent =
    `正解：${question.a}\n${question.explain}`;

  explanation.classList.remove("hidden");

  const nextButton = document.getElementById("nextButton");
  nextButton.classList.remove("hidden");

  if (currentQuestionIndex === quizQuestions.length - 1) {
    nextButton.textContent = "結果を見る →";
  } else {
    nextButton.textContent = "次の問題 →";
  }
}

// 次の問題
document.getElementById("nextButton").addEventListener("click", () => {
  currentQuestionIndex++;

  if (currentQuestionIndex >= quizQuestions.length) {
    finishQuiz();
  } else {
    showQuestion();
  }
});

// クイズ終了
function finishQuiz() {
  const total = quizQuestions.length;
  const accuracy = Math.round((correctCount / total) * 100);

  document.getElementById("resultAccuracy").textContent =
    `${accuracy}%`;

  document.getElementById("resultCorrect").textContent =
    correctCount;

  document.getElementById("resultTotal").textContent =
    total;

  let message = "";

  if (accuracy === 100) {
    message = "全問正解！すばらしい！";
  } else if (accuracy >= 80) {
    message = "よくできました！この調子！";
  } else if (accuracy >= 50) {
    message = "いい感じ！少しずつ覚えていこう。";
  } else {
    message = "挑戦できたことが大切！解説を復習しよう。";
  }

  document.getElementById("resultMessage").textContent = message;

  saveHistory({
    subject: selectedSubject,
    difficulty: selectedDifficulty,
    correct: correctCount,
    total: total,
    accuracy: accuracy,
    date: new Date().toLocaleString("ja-JP")
  });

  showScreen("resultScreen");
}

// 履歴保存
function saveHistory(result) {
  const history = JSON.parse(localStorage.getItem("ManacleHistory") || "[]");

  history.unshift(result);

  localStorage.setItem("ManacleHistory", JSON.stringify(history));
}

// 履歴表示
function renderHistory() {
  const history = JSON.parse(localStorage.getItem("ManacleHistory") || "[]");
  const area = document.getElementById("historyList");

  area.innerHTML = "";

  if (history.length === 0) {
    area.textContent = "まだ学習履歴がありません。";
    return;
  }

  history.forEach(item => {
    const card = document.createElement("div");
    card.className = "history-item";

    const left = document.createElement("div");
    left.innerHTML = `
      <strong>${item.subject}・${item.difficulty}</strong>
      <br>
      <small>${item.date}</small>
    `;

    const right = document.createElement("div");
    right.innerHTML = `
      <strong>${item.accuracy}%</strong>
      <br>
      <small>${item.correct} / ${item.total}問</small>
    `;

    card.appendChild(left);
    card.appendChild(right);

    area.appendChild(card);
  });
}

// 履歴削除
function clearHistory() {
  if (!confirm("学習履歴をすべて削除しますか？")) {
    return;
  }

  localStorage.removeItem("ManacleHistory");
  renderHistory();
  updateHomeStats();
}

// ホームの統計更新
function updateHomeStats() {
  const history = JSON.parse(localStorage.getItem("ManacleHistory") || "[]");

  const totalQuestions = history.reduce((sum, item) => {
    return sum + item.total;
  }, 0);

  const totalCorrect = history.reduce((sum, item) => {
    return sum + item.correct;
  }, 0);

  const accuracy = totalQuestions === 0
    ? 0
    : Math.round((totalCorrect / totalQuestions) * 100);

  document.getElementById("totalCount").textContent =
    totalQuestions;

  document.getElementById("totalAccuracy").textContent =
    accuracy;
}

// スタートボタン
document.getElementById("startButton").addEventListener("click", startQuiz);

// 最初の画面を準備
updateHomeStats();
