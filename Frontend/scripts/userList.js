document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const userTableBody = document.getElementById('user-table-body');
    const profileNameEl = document.getElementById('profile-name');
    const profileEmailEl = document.getElementById('profile-email');
    const profileScoreEl = document.getElementById('profile-score').querySelector('span');
    const logoutBtn = document.getElementById('logout-btn');
    const profileToggle = document.getElementById('profile-toggle');
    const profileContent = document.querySelector('.profile-content');

    // Check authentication
    const token = localStorage.getItem('token');
    let user;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
    }

    if (!token || !user || !user.id) {
        console.log('Authentication failed: Missing token or user data', { token, user });
        alert('Please log in to view the leaderboard.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
    }

    // Initialize profile
    profileNameEl.textContent = user.full_name || 'Guest User';
    profileEmailEl.textContent = user.email || 'guest@example.com';

    // Fetch current user's score
    try {
        const scoreResponse = await fetch(`http://localhost:3000/user/score/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!scoreResponse.ok) {
            if (scoreResponse.status === 401) {
                throw new Error('Unauthorized: Invalid or expired token');
            }
            throw new Error(`Failed to fetch user score: ${scoreResponse.status} ${scoreResponse.statusText}`);
        }
        const scoreData = await scoreResponse.json();
        profileScoreEl.textContent = scoreData.score || 0;
    } catch (error) {
        console.error('Error fetching user score:', error);
        if (error.message.includes('Unauthorized')) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        } else {
            profileScoreEl.textContent = 0;
        }
    }

    // Profile Toggle
    profileToggle.addEventListener('click', () => {
        profileContent.classList.toggle('active');
    });

    // Logout (handled in global.js, but keep for sidebar)
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        alert('Logged out successfully.');
        window.location.href = 'login.html';
    });

    // Fetch all users
    try {
        const response = await fetch('http://localhost:3000/user', {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch users:', {
                status: response.status,
                statusText: response.statusText,
                errorText,
            });
            if (response.status === 401) {
                throw new Error('Unauthorized: Invalid or expired token');
            }
            throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const users = Array.isArray(data) ? data : data.users || [];

        if (!users.length) {
            userTableBody.innerHTML = '<tr><td colspan="3">No users found.</td></tr>';
            return;
        }

        // Fetch scores for each user
        const userRows = await Promise.all(users.map(async (user) => {
            try {
                const scoreResponse = await fetch(`http://localhost:3000/user/score/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const scoreData = await scoreResponse.json();
                return `
                    <tr>
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                        <td>${scoreData.score || 0}</td>
                    </tr>
                `;
            } catch (error) {
                console.error(`Error fetching score for user ${user.id}:`, error);
                return `
                    <tr>
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                        <td>0</td>
                    </tr>
                `;
            }
        }));

        userTableBody.innerHTML = userRows.join('');
    } catch (error) {
        console.error('Error in user list fetch:', error);
        if (error.message.includes('Unauthorized')) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        } else {
            userTableBody.innerHTML = '<tr><td colspan="3">Failed to load users. Please try again.</td></tr>';
        }
    }
});