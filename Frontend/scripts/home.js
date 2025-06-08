document.addEventListener('DOMContentLoaded', async function() {
  // Check server health
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    alert('Veuillez vous connecter pour accéder à cette page.');
    window.location.href = './signin.html';
    return;
  }

  try {
    const healthResponse = await fetch('http://localhost:3000/health/', {
      method: 'GET',
    });

    if (!healthResponse.ok) {
      alert('Le serveur est indisponible. Veuillez réessayer plus tard.');
      return;
    }
  } catch (error) {
    console.error('Erreur de santé du serveur:', error);
    alert('Une erreur s\'est produite lors de la vérification du serveur.');
    return;
  }

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
    window.location.href = './index.html';
  });

  // Update welcome message with stored full_name
  const fullName = localStorage.getItem('full_name');
  if (fullName) {
    const welcomeMessage = document.querySelector('.welcome-text h1');
    welcomeMessage.textContent = `Bienvenue ${fullName} !`;
  }

  // Fetch top 5 users
  async function fetchTopUsers() {
    try {
      const response = await fetch('http://localhost:3000/user/top5', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const topUsers = await response.json();
        const topUsersList = document.getElementById('topUsers');
        topUsersList.innerHTML = '';
        topUsers.forEach((user, index) => {
          const li = document.createElement('li');
          li.textContent = `${index + 1}. ${user.full_name} - ${user.score}pts`;
          topUsersList.appendChild(li);
        });
      } else {
        const error = await response.json();
        alert('Erreur lors du chargement des scores : ' + (error.message || 'Veuillez réessayer.'));
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Une erreur s\'est produite. Vérifiez votre connexion.');
    }
  }

  // Fetch available quizzes
  async function fetchAvailableQuizzes() {
    try {
      const response = await fetch('http://localhost:3000/quiz/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const quizzes = await response.json();
        const quizGrid = document.querySelector('.quiz-grid');
        // Start with an empty grid
        quizGrid.innerHTML = '';

        // Add dynamic quizzes first
        quizzes.forEach(quiz => {
          if (quiz.type !== 'create-quiz') { // Skip if it's the create-quiz type
            const quizCard = document.createElement('div');
            quizCard.classList.add('quiz-card');
            quizCard.setAttribute('data-quiz-id', quiz.id); // Use quiz ID instead of type
            quizCard.innerHTML = `
              <img src="${quiz.image}" alt="${quiz.title}" />
              <h3>${quiz.title}</h3>
              <p>${quiz.description}</p>
            `;
            quizGrid.appendChild(quizCard);
          }
        });

        // Move or add the static "Crée ton quiz" card to the end
        const staticCreateQuiz = document.querySelector('.quiz-card[data-quiz-id="create-quiz"]');
        if (staticCreateQuiz) {
          quizGrid.appendChild(staticCreateQuiz); // Move it to the end
        } else {
          const createQuizCard = document.createElement('div');
          createQuizCard.classList.add('quiz-card');
          createQuizCard.setAttribute('data-quiz-id', 'create-quiz');
          createQuizCard.innerHTML = `
            <img src="../assets/create-quiz.jpg" alt="Crée ton quiz" />
            <h3>Crée ton quiz</h3>
            <p>Laisse libre cours à ta créativité ! Crée tes propres questions et défis tes amis avec ton propre quiz. 🎯✨</p>
          `;
          quizGrid.appendChild(createQuizCard);
        }

        // Re-attach event listeners to all quiz cards
        const quizCards = document.querySelectorAll('.quiz-card');
        quizCards.forEach(card => {
          card.addEventListener('click', function() {
            const quizId = this.getAttribute('data-quiz-id');
            if (quizId === 'create-quiz') {
              window.location.href = `./create_quiz.html?token=${authToken}`;
            } else {
              window.location.href = `./quiz.html?quizId=${quizId}&token=${authToken}`;
            }
          });
        });
      } else {
        const error = await response.json();
        alert('Erreur lors du chargement des quiz : ' + (error.message || 'Veuillez réessayer.'));
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Une erreur s\'est produite. Vérifiez votre connexion.');
    }
  }

  // Initial fetch of data
  await Promise.all([
    fetchTopUsers(),
    fetchAvailableQuizzes()
  ]);
});