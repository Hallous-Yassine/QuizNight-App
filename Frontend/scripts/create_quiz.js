document.addEventListener('DOMContentLoaded', function() {
  const authToken = new URLSearchParams(window.location.search).get('token');
  if (!authToken) {
    alert('Veuillez vous connecter pour créer un quiz.');
    window.location.href = './signin.html';
    return;
  }

  const createQuizForm = document.getElementById('createQuizForm');
  console.log('Form:', createQuizForm);
  if (!createQuizForm) {
    console.error('Form with id "createQuizForm" not found!');
    return;
  }

  const addQuestionBtn = document.getElementById('addQuestionBtn');
  const questionsContainer = document.getElementById('questionsContainer');
  let questionCount = 1;

  // Function to create a question group
  function createQuestionGroup(index) {
    const questionGroup = document.createElement('div');
    questionGroup.classList.add('question-group');
    questionGroup.setAttribute('data-index', index);
    questionGroup.innerHTML = `
      <label for="question${index}">Question ${index + 1} :</label>
      <input type="text" id="question${index}" name="question${index}" required>
      <div class="options-group">
        <div class="option-item">
          <input type="radio" name="correctAnswer${index}" value="0" id="option${index}_0" required>
          <label for="option${index}_0" class="option-label">Option 1</label>
          <input type="text" class="option-input" data-index="0" required>
        </div>
        <div class="option-item">
          <input type="radio" name="correctAnswer${index}" value="1" id="option${index}_1" required>
          <label for="option${index}_1" class="option-label">Option 2</label>
          <input type="text" class="option-input" data-index="1" required>
        </div>
        <div class="option-item">
          <input type="radio" name="correctAnswer${index}" value="2" id="option${index}_2" required>
          <label for="option${index}_2" class="option-label">Option 3</label>
          <input type="text" class="option-input" data-index="2" required>
        </div>
        <div class="option-item">
          <input type="radio" name="correctAnswer${index}" value="3" id="option${index}_3" required>
          <label for="option${index}_3" class="option-label">Option 4</label>
          <input type="text" class="option-input" data-index="3" required>
        </div>
      </div>
      <button type="button" class="delete-question-btn">Supprimer</button>
    `;
    return questionGroup;
  }

  // Initialize with the first question
  questionsContainer.appendChild(createQuestionGroup(0));

  // Add new question dynamically
  addQuestionBtn.addEventListener('click', function() {
    const newIndex = questionCount++;
    const questionGroup = createQuestionGroup(newIndex);
    questionsContainer.appendChild(questionGroup);
  });

  // Handle question deletion and reindexing
  questionsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-question-btn')) {
      const questionGroup = e.target.closest('.question-group');
      if (questionGroup && parseInt(questionGroup.getAttribute('data-index')) > 0) {
        questionGroup.remove();
        // Reindex remaining questions
        reindexQuestions();
      }
    }
  });

  // Function to reindex questions
  function reindexQuestions() {
    const questionGroups = Array.from(questionsContainer.querySelectorAll('.question-group'));
    questionGroups.forEach((group, index) => {
      const newIndex = index;
      group.setAttribute('data-index', newIndex);
      const label = group.querySelector('label');
      label.setAttribute('for', `question${newIndex}`);
      label.textContent = `Question ${newIndex + 1} :`;
      const questionInput = group.querySelector('input[type="text"]');
      questionInput.id = `question${newIndex}`;
      questionInput.name = `question${newIndex}`;
      const options = group.querySelectorAll('.option-item');
      options.forEach((option, i) => {
        const radio = option.querySelector('input[type="radio"]');
        const label = option.querySelector('.option-label');
        radio.name = `correctAnswer${newIndex}`;
        radio.id = `option${newIndex}_${i}`;
        label.setAttribute('for', `option${newIndex}_${i}`);
      });
    });
    questionCount = questionsContainer.querySelectorAll('.question-group').length;
  }

  // Update the file input label with the selected file name
  const imageInput = document.getElementById('image');
  const fileNameSpan = document.querySelector('.file-name');
  if (!imageInput || !fileNameSpan) {
    console.error('Image input or file name span not found!');
  } else {
    imageInput.addEventListener('change', function() {
      if (imageInput.files.length > 0) {
        fileNameSpan.textContent = imageInput.files[0].name;
      } else {
        fileNameSpan.textContent = 'Choisir une image';
      }
    });
  }

  // Handle form submission
  createQuizForm.addEventListener('submit', async function(event) {
    try {
      console.log('Submit event triggered');
      event.preventDefault();

      // Step 1: Validate the type selection
      const type = document.getElementById('type').value;
      if (!type || type === '') {
        alert('Veuillez sélectionner un type de quiz valide.');
        return;
      }

      // Step 2: Upload the image
      const imageInput = document.getElementById('image');
      const imageFile = imageInput.files[0];
      let imageUrl;

      if (!imageFile) {
        alert('Veuillez sélectionner une image pour le quiz.');
        return;
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      console.log('Uploading image...');
      const uploadResponse = await fetch('http://localhost:3000/upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      const uploadResult = await uploadResponse.json();
      imageUrl = uploadResult.url;
      console.log('Image uploaded, URL:', imageUrl);

      // Step 3: Create the quiz with the image URL
      const quizData = {
        type: type,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        image: imageUrl,
        createdById: localStorage.getItem('userId') // Assuming userId is stored in localStorage
      };

      console.log('Creating quiz with data:', quizData);
      const quizResponse = await fetch('http://localhost:3000/quiz/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(quizData)
      });

      if (!quizResponse.ok) {
        throw new Error('Failed to create quiz');
      }
      const quizResult = await quizResponse.json();
      const quizId = quizResult.id;
      console.log('Quiz created, ID:', quizId);

      // Step 4: Create questions with quiz_id and question_number
      const questionGroups = document.querySelectorAll('.question-group');
      const questionsData = [];
      questionGroups.forEach((group, index) => {
        const questionText = document.getElementById(`question${index}`)?.value || '';
        if (questionText) {
          const optionInputs = group.querySelectorAll('.option-input');
          const options = Array.from(optionInputs).map(input => input.value || '');
          const correctAnswerRadio = document.querySelector(`input[name="correctAnswer${index}"]:checked`);
          if (!correctAnswerRadio) {
            alert('Veuillez sélectionner une réponse correcte pour chaque question.');
            throw new Error(`Aucune réponse correcte sélectionnée pour la question ${index + 1}.`);
          }
          const correctAnswer = parseInt(correctAnswerRadio.value, 10) + 1;
          questionsData.push({
            quizId: quizId,
            question_number: index + 1,
            question_text: questionText,
            option1: options[0] || '',
            option2: options[1] || '',
            option3: options[2] || '',
            option4: options[3] || '',
            correct_option: correctAnswer
          });
        }
      });

      console.log('Questions data:', questionsData);
      const questionsResponse = await fetch('http://localhost:3000/question/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(questionsData)
      });

      if (!questionsResponse.ok) {
        throw new Error('Failed to create questions');
      }
      console.log('Questions created successfully');
      alert('Quiz créé avec succès !');
      window.location.href = './home.html?token=' + authToken;
    } catch (error) {
      console.error('Error in form submission:', error);
      alert(error.message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.');
    }
  });

  // Navigation and logout
  const logo = document.querySelector('.logo');
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', function() {
    window.location.href = './index.html?token=' + authToken;
  });

  const profileBtn = document.getElementById('profileBtn');
  profileBtn.addEventListener('click', function() {
    window.location.href = `./profile.html?token=${authToken}`;
  });

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('full_name');
    localStorage.removeItem('email');
    localStorage.removeItem('score');
    window.location.href = './index.html';
  });
});