document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const finalScoreEl = document.getElementById('final-score');
    const bestScoreEl = document.getElementById('best-score');

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
        alert('Please log in to view results.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
    }

    // Load final score from localStorage
    const finalScore = localStorage.getItem('finalScore') || 0;
    finalScoreEl.textContent = finalScore;

    // Fetch best score from backend
    try {
        const response = await fetch(`http://localhost:3000/user/score/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Invalid or expired token');
            }
            throw new Error(`Failed to fetch best score: ${response.status}`);
        }
        const data = await response.json();
        bestScoreEl.textContent = data.score || 0;
    } catch (error) {
        console.error('Error fetching best score:', error);
        if (error.message.includes('Unauthorized')) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        } else {
            bestScoreEl.textContent = finalScore;
        }
    }
});