document.addEventListener('DOMContentLoaded', async function() {
  const loginBtn = document.getElementById('loginBtn');
  const playBtn = document.getElementById('playBtn');

  // Define the destination page
  const signup = '../pages/signup.html'; // Change path if needed
  const signin = '../pages/signin.html'; // Change path if needed

  // Add click event listeners
  loginBtn.addEventListener('click', () => {
    window.location.href = signup;
  });

  playBtn.addEventListener('click', async function() {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      // Verify token validity
      try {
        const response = await fetch('http://localhost:3000/health/checkusertoken', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('full_name');
            localStorage.removeItem('email');
            localStorage.removeItem('score');
            alert('Votre session a expiré. Veuillez vous reconnecter.');
            window.location.href = signin;
            return;
          } else {
            alert('Une erreur s\'est produite. Veuillez réessayer.');
            return;
          }
        }
        // Token is valid, proceed to home page
        window.location.href = './home.html';
      } catch (error) {
        console.error('Erreur réseau lors de la vérification du token:', error);
        alert('Une erreur s\'est produite. Vérifiez votre connexion.');
      }
    } else {
      window.location.href = signin; // User is not logged in, go to sign-in page
    }
  });

});