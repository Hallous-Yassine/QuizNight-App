document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const finalScoreEl = document.getElementById('final-score');
    const bestScoreEl = document.getElementById('best-score');

    // Load scores from localStorage
    const finalScore = localStorage.getItem('finalScore') || 0;
    const bestScore = localStorage.getItem('bestScore') || 0;

    // Display scores
    finalScoreEl.textContent = finalScore;
    bestScoreEl.textContent = bestScore;
});