document.addEventListener('DOMContentLoaded', async function() {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    alert('Veuillez vous connecter pour accéder à cette page.');
    window.location.href = './signin.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('quizId');
  const quizTitle = document.getElementById('quizTitle');
  const questionContainer = document.getElementById('questionContainer');
  const submitBtn = document.getElementById('submitBtn');
  const scoreDisplay = document.getElementById('score');
  let score = 0;
  let currentQuestionIndex = 0;
  let questions = [];

  // Fetch quiz data by ID
  async function fetchQuizData() {
    try {
      const response = await fetch(`http://localhost:3000/quiz/${quizId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        quizTitle.textContent = data.title;
      } else {
        const error = await response.json();
        alert('Erreur lors du chargement du quiz : ' + (error.message || 'Veuillez réessayer.'));
        return false;
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Une erreur s\'est produite. Vérifiez votre connexion.');
      return false;
    }
    return true;
  }

  // Fetch quiz questions by quiz ID and order them
  async function fetchQuizQuestions() {
    try {
      const response = await fetch(`http://localhost:3000/question/${quizId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform the questions into the expected format
        questions = data
          .sort((a, b) => a.question_number - b.question_number) // Order by question_number
          .map(question => ({
            text: question.question_text,
            options: [question.option1, question.option2, question.option3, question.option4],
            correctAnswer: question.correct_option - 1 // Adjust to 0-based index
          }));
        displayQuestion();
      } else {
        const error = await response.json();
        alert('Erreur lors du chargement des questions : ' + (error.message || 'Veuillez réessayer.'));
        return false;
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Une erreur s\'est produite. Vérifiez votre connexion.');
      return false;
    }
    return true;
  }

  // Display current question
  function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
      endQuiz();
      return;
    }

    const question = questions[currentQuestionIndex];
    questionContainer.innerHTML = `
      <h3>${question.text}</h3>
      ${question.options.map((option, index) => `
        <div>
          <input type="radio" name="answer" value="${index}" id="option${index}">
          <label for="option${index}">${option}</label>
        </div>
      `).join('')}
    `;
  }

  // Handle quiz submission
  submitBtn.addEventListener('click', function() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (!selectedOption) {
      alert('Veuillez sélectionner une réponse.');
      return;
    }

    const question = questions[currentQuestionIndex];
    const selectedIndex = parseInt(selectedOption.value);
    if (selectedIndex === question.correctAnswer) {
      score += 1;
      scoreDisplay.textContent = `Score: ${score}`;
    } else {
      alert(`Mauvaise réponse ! La réponse correcte était : ${question.options[question.correctAnswer]}`);
    }

    currentQuestionIndex += 1;
    displayQuestion();
  });

  // End quiz, display final score, add separator, and centered Home button
  async function endQuiz() {
    questionContainer.innerHTML = `
      <h3>Quiz terminé ! Votre score : ${score} / ${questions.length}</h3>
      <div class="separator"></div>
      <div class="home-button-container">
        <button class="home-button">Home</button>
      </div>
    `;
    submitBtn.style.display = 'none';
    await updateUserScore();
  }

  // Update user score with best score logic
  async function updateUserScore() {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }

      // Fetch the best score for this user and quiz to get the userquizscoreId
      const checkResponse = await fetch(`http://localhost:3000/userquizscore/user/${userId}/quiz/${quizId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      let currentBestScore = 0;
      let userquizscoreId = null;
      if (checkResponse.ok) {
        const data = await checkResponse.json();
        currentBestScore = data.bestScore || 0;
        userquizscoreId = data.id; // Extract the id from the response
      }

      // Create or update the entry based on existence and score
      if (!userquizscoreId) {
        // If no entry exists for this quiz, create it with the current score
        const createResponse = await fetch(`http://localhost:3000/userquizscore/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ userId, quizId, bestScore: score })
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          console.error('Erreur lors de la création du UserQuizScore:', error.message);
          return;
        }

        const createdData = await createResponse.json();
        userquizscoreId = createdData.id; // Get the newly created id
      } else if (score > currentBestScore) {
        // Update only if the new score is higher
        const updateResponse = await fetch(`http://localhost:3000/userquizscore/${userquizscoreId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ userId, quizId, bestScore: score })
        });

        if (!updateResponse.ok) {
          const error = await updateResponse.json();
          console.error('Erreur lors de la mise à jour du bestScore:', error.message);
          return;
        }
      }

      // Recalculate total best score from all UserQuizScore entries
      const totalResponse = await fetch(`http://localhost:3000/userquizscore/total/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (totalResponse.ok) {
        const totalData = await totalResponse.json();
        const newUserScore = totalData.total || 0;
        console.log('New total score:', newUserScore);

        // Update the user score in the User table
        const userUpdateResponse = await fetch(`http://localhost:3000/user/score/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ score: newUserScore })
        });

        if (userUpdateResponse.ok) {
          localStorage.setItem('score', newUserScore.toString()); // Update localStorage
        } else {
          const error = await userUpdateResponse.json();
          console.error('Erreur lors de la mise à jour du score utilisateur:', error.message);
        }
      }
    } catch (error) {
      console.error('Erreur réseau lors de la mise à jour du score:', error);
    }
  }

  // Add event listener for the Home button
  questionContainer.addEventListener('click', function(e) {
    if (e.target.className === 'home-button') {
      window.location.href = './home.html';
    }
  });

  // Navigation and logout
  const logo = document.querySelector('.logo');
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', function() {
    window.location.href = './index.html';
  });

  const profileBtn = document.getElementById('profileBtn');
  profileBtn.addEventListener('click', function() {
    window.location.href = `./profile.html?token=${authToken}`;
  });

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('full_name');
    localStorage.removeItem('email');
    localStorage.removeItem('score');
    alert('Vous êtes déconnecté.');
    window.location.href = './index.html';
  });

  // Initial fetch
  const quizFetched = await fetchQuizData();
  if (quizFetched) {
    await fetchQuizQuestions();
  }
});