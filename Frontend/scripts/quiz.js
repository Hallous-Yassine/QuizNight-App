document.addEventListener('DOMContentLoaded', () => {
    // Sample quiz data
    const quizData = [
        {
            word: 'Schedule',
            accents: [
                { type: 'British', audio: '../assets/audio/sample-british.mp3' },
                { type: 'American', audio: '../assets/audio/sample-american.mp3' },
            ],
        },
        {
            word: 'Aluminium',
            accents: [
                { type: 'British', audio: '../assets/audio/sample-british.mp3' },
                { type: 'American', audio: '../assets/audio/sample-american.mp3' },
            ],
        },
        {
            word: 'Tomato',
            accents: [
                { type: 'British', audio: '../assets/audio/sample-british.mp3' },
                { type: 'American', audio: '../assets/audio/sample-american.mp3' },
            ],
        },
        {
            word: 'Advertisement',
            accents: [
                { type: 'British', audio: '../assets/audio/sample-british.mp3' },
                { type: 'American', audio: '../assets/audio/sample-american.mp3' },
            ],
        },
        {
            word: 'Garage',
            accents: [
                { type: 'British', audio: '../assets/audio/sample-british.mp3' },
                { type: 'American', audio: '../assets/audio/sample-american.mp3' },
            ],
        },
    ];

    // User data
    let user = JSON.parse(localStorage.getItem('user')) || {
        full_name: 'Guest User',
        email: 'guest@example.com',
    };

    // Quiz State
    let currentQuestion = 0;
    let score = 0;
    let selectedAccent = null;
    let hasPlayedAudio = false; // Track audio playback

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

    // Initialize
    profileNameEl.textContent = user.full_name;
    profileEmailEl.textContent = user.email;
    profileScoreEl.textContent = localStorage.getItem('bestScore') || 0;
    totalQuestionsEl.textContent = quizData.length;

    // Profile Toggle
    profileToggle.addEventListener('click', () => {
        profileContent.classList.toggle('active');
    });

    // Logout
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
        chooseBritishBtn.disabled = true; // Disable by default
        chooseAmericanBtn.disabled = true; // Disable by default
        audioPlayBtn.classList.remove('playing');
        hasPlayedAudio = false; // Reset audio play state
    };

    const playAudio = (src) => {
        const audio = new Audio(src);
        audioPlayBtn.classList.add('playing');
        audio.play();
        audio.onended = () => {
            audioPlayBtn.classList.remove('playing');
            hasPlayedAudio = true; // Mark audio as played
            chooseBritishBtn.disabled = false; // Enable answer buttons
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
            // Confetti effect
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

    nextQuestionBtn.addEventListener('click', () => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            // Update best score
            const bestScore = Math.max(score, parseInt(localStorage.getItem('bestScore') || 0));
            localStorage.setItem('bestScore', bestScore);
            localStorage.setItem('finalScore', score);
            window.location.href = 'retry.html';
        }
    });

    loadQuestion();
});