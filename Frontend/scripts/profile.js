document.addEventListener('DOMContentLoaded', function() {
  const authToken = new URLSearchParams(window.location.search).get('token');
  if (!authToken) {
    alert('Veuillez vous connecter pour accéder à votre profil.');
    window.location.href = './signin.html';
    return;
  }

  const profileTitle = document.getElementById('profileTitle');
  const fullNameSpan = document.getElementById('fullName');
  const emailSpan = document.getElementById('email');
  const scoreSpan = document.getElementById('score');
  const editBtn = document.getElementById('editBtn');
  const editForm = document.getElementById('editProfileForm');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  const deleteConfirmation = document.getElementById('deleteConfirmation');
  const deletePassword = document.getElementById('deletePassword');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const quizzesList = document.getElementById('quizzesList');
  const homeBtn = document.getElementById('homeBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Load user info by user ID
  async function loadUserInfo() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Utilisateur non identifié. Veuillez vous reconnecter.');
      window.location.href = './signin.html';
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to load profile');
      const userData = await response.json();
      fullNameSpan.textContent = userData.full_name || 'Non défini';
      emailSpan.textContent = userData.email || 'Non défini';
      scoreSpan.textContent = userData.score !== null ? userData.score : '0';
      profileTitle.textContent = userData.full_name ? `Bienvenue, ${userData.full_name} !` : 'Mon Profil';
      localStorage.setItem('full_name', userData.full_name);
      localStorage.setItem('email', userData.email);
      localStorage.setItem('score', userData.score);
    } catch (error) {
      console.error('Error loading user info:', error);
      alert('Erreur lors du chargement des informations. Veuillez réessayer.');
    }
  }

  // Load created quizzes by user ID
  async function loadCreatedQuizzes() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Utilisateur non identifié. Veuillez vous reconnecter.');
      window.location.href = './signin.html';
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/quiz/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to load quizzes');
      const quizzes = await response.json();
      quizzesList.innerHTML = '';
      if (quizzes.length === 0) {
        quizzesList.innerHTML = '<p class="no-quizzes">Vous n\'avez pas encore créé de quiz.</p>';
        return;
      }
      quizzes.forEach(quiz => {
        const quizItem = document.createElement('div');
        quizItem.className = 'quiz-item';
        quizItem.innerHTML = `
          <h4>${quiz.title}</h4>
          <div class="quiz-actions">
            <button class="submit-button edit-quiz" data-id="${quiz.id}">Modifier</button>
            <button class="delete-button delete-quiz" data-id="${quiz.id}">Supprimer</button>
          </div>
        `;
        quizzesList.appendChild(quizItem);
      });
    } catch (error) {
      console.error('Error loading created quizzes:', error);
      alert('Erreur lors du chargement des quizzes. Veuillez réessayer.');
    }
  }

  // Toggle edit form
  editBtn.addEventListener('click', () => {
    editForm.style.display = 'block';
    editBtn.style.display = 'none';
    document.getElementById('editFullName').value = fullNameSpan.textContent;
    document.getElementById('editEmail').value = emailSpan.textContent;
  });

  cancelEditBtn.addEventListener('click', () => {
    editForm.style.display = 'none';
    editBtn.style.display = 'block';
    editForm.reset();
  });

  // Handle edit form submission
  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Utilisateur non identifié. Veuillez vous reconnecter.');
      window.location.href = './signin.html';
      return;
    }
    const fullName = document.getElementById('editFullName').value;
    const email = document.getElementById('editEmail').value;
    const password = document.getElementById('editPassword').value;
    const currentPassword = document.getElementById('currentPassword').value;

    try {
      const response = await fetch(`http://localhost:3000/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ full_name: fullName, email, password, currentPassword })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      alert('Profil mis à jour avec succès !');
      editForm.style.display = 'none';
      editBtn.style.display = 'block';
      editForm.reset();
      loadUserInfo();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Erreur lors de la mise à jour du profil. Veuillez réessayer.');
    }
  });

  // Show delete confirmation form
  deleteAccountBtn.addEventListener('click', () => {
    deleteConfirmation.style.display = 'block';
    deleteAccountBtn.style.display = 'none';
    deletePassword.focus();
  });

  // Cancel delete action
  cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmation.style.display = 'none';
    deleteAccountBtn.style.display = 'block';
    deletePassword.value = '';
  });

  // Confirm delete account with password verification
  confirmDeleteBtn.addEventListener('click', async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Utilisateur non identifié. Veuillez vous reconnecter.');
      window.location.href = './signin.html';
      return;
    }
    const password = deletePassword.value;
    if (!password) {
      alert('Veuillez entrer votre mot de passe actuel pour confirmer la suppression.');
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        const response = await fetch(`http://localhost:3000/user/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ password })
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete account');
        }
        alert('Compte supprimé avec succès.');
        localStorage.clear();
        window.location.href = './index.html';
      } catch (error) {
        console.error('Error deleting account:', error);
        alert(error.message || 'Erreur lors de la suppression du compte. Veuillez réessayer.');
      }
    }
  });

  // Handle quiz actions
  quizzesList.addEventListener('click', async (event) => {
    const target = event.target;
    if (target.classList.contains('edit-quiz')) {
      const quizId = target.getAttribute('data-id');
      window.location.href = `./edit_quiz.html?id=${quizId}&token=${authToken}`;
    } else if (target.classList.contains('delete-quiz')) {
      const quizId = target.getAttribute('data-id');
      if (confirm(`Êtes-vous sûr de vouloir supprimer le quiz "${target.closest('.quiz-item').querySelector('h4').textContent}" ?`)) {
        try {
          const response = await fetch(`http://localhost:3000/quiz/${quizId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          if (!response.ok) throw new Error('Failed to delete quiz');
          alert('Quiz supprimé avec succès.');
          loadCreatedQuizzes();
        } catch (error) {
          console.error('Error deleting quiz:', error);
          alert('Erreur lors de la suppression du quiz. Veuillez réessayer.');
        }
      }
    }
  });

  // LOGO 
  const logo = document.querySelector('.logo');
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', function() {
    window.location.href = './index.html';
  });


  // Navigation and logout
  homeBtn.addEventListener('click', () => {
    window.location.href = './index.html?token=' + authToken;
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('full_name');
    localStorage.removeItem('email');
    localStorage.removeItem('score');
    window.location.href = './index.html';
  });

  // Initial load
  loadUserInfo();
  loadCreatedQuizzes();
});