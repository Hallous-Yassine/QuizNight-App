document.getElementById('signupForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const full_name = document.getElementById('full_name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validate password match
  if (password !== confirmPassword) {
    alert("Les mots de passe ne correspondent pas !");
    return;
  }

  // Prepare data for API
  const userData = {
    full_name: full_name,
    email: email,
    phone: phone, // Added phone field
    password: password
  };

  try {
    const response = await fetch('http://localhost:3000/user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      window.location.href = './signin.html'; // Redirect to login page
    } else {
      const error = await response.json();
      alert('Erreur lors de l\'inscription : ' + (error.message || 'Veuillez réessayer.'));
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
    alert('Une erreur s\'est produite. Veuillez vérifier votre connexion et réessayer.');
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // Add click event listener to the logo
  const logo = document.querySelector('.logo');
  logo.style.cursor = 'pointer'; // Make the logo appear clickable
  logo.addEventListener('click', function() {
    window.location.href = './index.html';
  });
});