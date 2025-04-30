document.addEventListener('DOMContentLoaded', async () => {
    // Sample quiz data
    const quizData = [
        { word: 'Schedule', accents: [
            { type: 'British', audio: '../assets/audio/sample-british.mp3' },
            { type: 'American', audio: '../assets/audio/sample-american.mp3' },
        ]},
        { word: 'Aluminium', accents: [
            { type: 'British', audio: '../assets/audio/sample-british.mp3' },
            { type: 'American', audio: '../assets/audio/sample-american.mp3' },
        ]},
        { word: 'Tomato', accents: [
            { type: 'British', audio: '../assets/audio/sample-british.mp3' },
            { type: 'American', audio: '../assets/audio/sample-american.mp3' },
        ]},
        { word: 'Advertisement', accents: [
            { type: 'British', audio: '../assets/audio/sample-british.mp3' },
            { type: 'American', audio: '../assets/audio/sample-american.mp3' },
        ]},
        { word: 'Garage', accents: [
            { type: 'British', audio: '../assets/audio/sample-british.mp3' },
            { type: 'American', audio: '../assets/audio/sample-american.mp3' },
        ]},
    ];

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
        alert('Please log in to play the quiz.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
    }

    // Quiz State
    let currentQuestion = 0;
    let score = 0;
    let selectedAccent = null;
    let hasPlayedAudio = false;

    // Elements
    const quizCard = document.querySelector('.quiz-card');
    const profileNameEl = document.getElementById('profile-name');
    const profileEmailEl = document.getElementById('profile-email');
    const profileScoreEl = document.getElementById('profile-score').querySelector('span');
    const logoutBtn = document.getElementById('logout-btn');
    const profileToggle = document.getElementById('profile-toggle');
    const profileContent = document.querySelector('.profile-content');
    const wordEl = document.getElementById('word');
    const promptEl = document.getElementById('prompt');
    const scoreEl = document.getElementById('score');
    const questionNumberEl = document.getElementById('question-number');
    const totalQuestionsEl = document.getElementById('total-questions');
    const progressFill = document.getElementById('progress-fill');
    const audioPlayBtn = document.getElementById('audio-play');
    const chooseBritishBtn = document.getElementById('choose-british');
    const chooseAmericanBtn = document.getElementById('choose-american');
    const feedbackEl = document.getElementById('feedback');
    const nextQuestionBtn = document.getElementById('next-question');

    // Delay card visibility for smoother load
    quizCard.style.opacity = '0';
    setTimeout(() => {
        quizCard.style.opacity = '1';
    }, 100);

    // Initialize profile
    profileNameEl.textContent = user.full_name || 'Guest User';
    profileEmailEl.textContent = user.email || 'guest@example.com';

    // Fetch and display user's best score
    const fetchBestScore = async () => {
        try {
            const response = await fetch(`http://localhost:3000/user/score/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: Invalid or expired token');
                }
                throw new Error(`Failed to fetch score: ${response.status}`);
            }
            const data = await response.json();
            profileScoreEl.textContent = data.score || 0;
        } catch (error) {
            console.error('Error fetching best score:', error);
            if (error.message.includes('Unauthorized')) {
                alert('Session expired. Please log in again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            } else {
                profileScoreEl.textContent = 0;
            }
        }
    };
    await fetchBestScore();

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

    // Quiz Logic
    const loadQuestion = () => {
        const q = quizData[currentQuestion];
        wordEl.textContent = q.word;
        selectedAccent = q.accents[Math.floor(Math.random() * 2)];
        promptEl.textContent = 'Is this a British or American accent?';
        scoreEl.textContent = score;
        questionNumberEl.textContent = currentQuestion + 1;
        progressFill.style.width = `${((currentQuestion + 1) / quizData.length) * 100}%`;
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
        nextQuestionBtn.style.display = 'none';
        chooseBritishBtn.disabled = true;
        chooseAmericanBtn.disabled = true;
        audioPlayBtn.classList.remove('playing');
        hasPlayedAudio = false;
    };

    const playAudio = (src) => {
        const audio = new Audio(src);
        audioPlayBtn.classList.add('playing');
        audio.play();
        audio.onended = () => {
            audioPlayBtn.classList.remove('playing');
            hasPlayedAudio = true;
            chooseBritishBtn.disabled = false;
            chooseAmericanBtn.disabled = false;
        };
    };

    audioPlayBtn.addEventListener('click', () => {
        playAudio(selectedAccent.audio);
    });

    const checkAnswer = (chosenAccent) => {
        chooseBritishBtn.disabled = true;
        chooseAmericanBtn.disabled = true;

        if (chosenAccent === selectedAccent.type) {
            score += 10;
            feedbackEl.textContent = 'Correct! Well done!';
            feedbackEl.className = 'feedback correct';
            for (let i = 0; i < 20; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = `${Math.random() * 100}%`;
                quizCard.appendChild(confetti);
                setTimeout(() => confetti.remove(), 2000);
            }
        } else {
            feedbackEl.textContent = `Incorrect. It was the ${selectedAccent.type} accent.`;
            feedbackEl.className = 'feedback incorrect';
        }

        scoreEl.textContent = score;
        nextQuestionBtn.style.display = 'block';
    };

    chooseBritishBtn.addEventListener('click', () => {
        if (!chooseBritishBtn.disabled) {
            checkAnswer('British');
        }
    });

    chooseAmericanBtn.addEventListener('click', () => {
        if (!chooseAmericanBtn.disabled) {
            checkAnswer('American');
        }
    });

    nextQuestionBtn.addEventListener('click', async () => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            try {
                const response = await fetch(`http://localhost:3000/user/score/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ score }),
                });
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Unauthorized: Invalid or expired token');
                    }
                    throw new Error(`Failed to update score: ${response.status}`);
                }
                localStorage.setItem('finalScore', score);
                window.location.href = 'retry.html';
            } catch (error) {
                console.error('Error updating score:', error);
                if (error.message.includes('Unauthorized')) {
                    alert('Session expired. Please log in again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'login.html';
                } else {
                    alert('Failed to save score. Proceeding to results.');
                    localStorage.setItem('finalScore', score);
                    window.location.href = 'retry.html';
                }
            }
        }
    });

    totalQuestionsEl.textContent = quizData.length;
    loadQuestion();
});