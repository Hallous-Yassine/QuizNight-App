document.addEventListener('DOMContentLoaded', () => {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (!emailInput || !passwordInput) {
                console.error('Login form inputs not found. Expected IDs: email, password');
                alert('Form error: Email or password field is missing.');
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                alert('Please enter both email and password.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // Validate response
                if (!data.token || !data.user || !data.user.id) {
                    throw new Error('Invalid response format: Missing token or user data');
                }

                // Store token and user in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data.user.id,
                    full_name: data.user.full_name,
                    email: data.user.email,
                }));

                alert('Login successful!');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Login error:', error);
                alert(`Login failed: ${error.message}`);
            }
        });
    }

    // Signup Form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullNameInput = document.getElementById('full-name');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            if (!fullNameInput || !emailInput || !passwordInput) {
                console.error('Signup form inputs not found. Expected IDs: full-name, email, password');
                alert('Form error: One or more fields are missing.');
                return;
            }

            const full_name = fullNameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!full_name || !email || !password) {
                alert('Please fill in all fields.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/user/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ full_name, email, password }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Signup failed');
                }

                // Validate response
                if (!data.token || !data.user || !data.user.id) {
                    throw new Error('Invalid response format: Missing token or user data');
                }

                // Store token and user in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data.user.id,
                    full_name: data.user.full_name,
                    email: data.user.email,
                }));

                alert('Signup successful!');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Signup error:', error);
                alert(`Signup failed: ${error.message}`);
            }
        });
    }
});