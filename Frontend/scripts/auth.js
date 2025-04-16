document.addEventListener('DOMContentLoaded', () => {
    // Login Form Submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('http://localhost:3000/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Store user data
                    const user = { full_name: data.user?.full_name || email.split('@')[0], email };
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', data.token || 'dummy-token');
                    alert('Login successful! Welcome to Accent Arena.');
                    window.location.href = 'quiz.html';
                } else {
                    alert(`Login failed: ${data.error || 'Invalid credentials'}`);
                }
            } catch (error) {
                alert('Error connecting to server. Please try again later.');
                console.error('Login error:', error);
            }
        });
    }

    // Signup Form Submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const full_name = document.getElementById('signup-full-name').value;
            const email = document.getElementById('signup-email').value;
            const phone = document.getElementById('signup-phone').value;
            const password = document.getElementById('signup-password').value;

            try {
                const response = await fetch('http://localhost:3000/user/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ full_name, email, phone, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Signup successful! Please log in.');
                    window.location.href = 'login.html';
                } else {
                    alert(`Signup failed: ${data.error || 'Invalid input'}`);
                }
            } catch (error) {
                alert('Error connecting to server. Please try again later.');
                console.error('Signup error:', error);
            }
        });

        // Password Strength Checker
        const passwordInput = document.getElementById('signup-password');
        const strengthMeter = document.getElementById('password-strength');

        passwordInput.addEventListener('input', () => {
            const value = passwordInput.value;
            if (value.length < 6) {
                strengthMeter.className = 'strength-meter weak';
            } else if (value.length < 10 || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
                strengthMeter.className = 'strength-meter medium';
            } else {
                strengthMeter.className = 'strength-meter strong';
            }
        });
    }
});