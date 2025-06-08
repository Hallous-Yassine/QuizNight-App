document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const data = { email, password };

  try {
    const response = await fetch('http://localhost:3000/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      // Save token and user data to localStorage
      const { token, user } = result;
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('full_name', user.full_name);
      localStorage.setItem('email', user.email);
      localStorage.setItem('score', user.score || 0);

      window.location.href = './home.html';
    } else {
      alert(result.message || 'Erreur lors de la connexion.');
    }
  } catch (error) {
    alert('Erreur réseau. Vérifiez votre serveur.');
    console.error(error);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const logo = document.querySelector('.logo');
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', function() {
    window.location.href = './index.html';
  });
});