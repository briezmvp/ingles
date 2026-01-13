import { questions, copy } from './questions.js';

const state = {
    userStatus: null,
    currentLevel: null,
    currentQuestionIndex: 0,
    score: 0,
    answers: []
};

const app = document.getElementById('app');

function render(content) {
    app.innerHTML = content;
}

// Navigation Functions
function showWelcome() {
    render(`
        <div class="screen">
            <img src="mascot.png" class="welcome-mascot" alt="Mascot">
            <h1>English Quiz</h1>
            <p>Descubra seus "pontos cegos" no inglês e detone na vida real!</p>
            <div class="options">
                <button class="btn btn-blue" id="btn-new">Ainda não sou Aluno</button>
                <button class="btn btn-outline" id="btn-student">Já sou Aluno</button>
            </div>
        </div>
    `);

    document.getElementById('btn-new').onclick = () => { state.userStatus = 'new'; showLevelSelection(); };
    document.getElementById('btn-student').onclick = () => { state.userStatus = 'student'; showLevelSelection(); };
}

function showLevelSelection() {
    render(`
        <div class="screen">
            <h1>Qual seu nível?</h1>
            <p>Seja sincero... prometo não julgar! 😉</p>
            <div class="options">
                <button class="btn btn-yellow" onclick="startQuiz(1)">1. Iniciante / Do Zero</button>
                <button class="btn btn-yellow" onclick="startQuiz(2)">2. Básico mas travo</button>
                <button class="btn btn-yellow" onclick="startQuiz(3)">3. Intermediário</button>
                <button class="btn btn-purple" onclick="startQuiz(4)">4. Fluente (Será?)</button>
                <button class="btn btn-red" onclick="startQuiz(5)">5. Desafio HARDCORE</button>
            </div>
            <button class="btn btn-outline" style="margin-top:20px" onclick="showWelcome()">Voltar</button>
        </div>
    `);
}

function startQuiz(level) {
    state.currentLevel = level;
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.answers = [];
    showQuestion();
}

function showQuestion() {
    const levelQuestions = questions[state.currentLevel] || questions[1];
    const q = levelQuestions[state.currentQuestionIndex];
    if (!q) return showResults();

    const progress = ((state.currentQuestionIndex) / levelQuestions.length) * 100;

    render(`
        <div class="screen">
            <div class="level-badge">Questão ${state.currentQuestionIndex + 1}/${levelQuestions.length}</div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
            <div class="question-text">${q.q}</div>
            <div class="options" id="options-container">
                ${q.options.map((opt, i) => `
                    <button class="btn btn-outline" onclick="handleAnswer(${i}, this)">${opt}</button>
                `).join('')}
            </div>
        </div>
    `);
}

function handleAnswer(index, btn) {
    const levelQuestions = questions[state.currentLevel] || questions[1];
    const q = levelQuestions[state.currentQuestionIndex];
    if (!q) return;

    // Visual feedback for click
    const options = document.querySelectorAll('#options-container .btn');
    options.forEach(b => b.classList.add('disabled'));
    btn.classList.add('selected');

    const isCorrect = index === q.correct;
    if (isCorrect) {
        state.score++;
        btn.classList.add('correct');
    } else {
        btn.classList.add('incorrect');
    }
    
    // Smooth delay before feedback modal
    setTimeout(() => {
        showFeedback(isCorrect, q.feedback);
    }, 450);
}

function showFeedback(isCorrect, feedback) {
    const feedbackMsg = isCorrect ? feedback.correct : feedback.incorrect;

    const overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';
    overlay.innerHTML = `
        <div class="feedback-card">
            <img src="mascot.png" class="mascot-img" alt="Mascot">
            <div class="feedback-icon">${isCorrect ? '✨' : '🧐'}</div>
            <div class="feedback-title" style="color: ${isCorrect ? 'var(--primary-green)' : 'var(--primary-red)'}">
                ${isCorrect ? 'Mandou Bem!' : 'Xii, quase...'}
            </div>
            <div class="feedback-msg">${feedbackMsg}</div>
            <button class="btn btn-blue" id="btn-next-q">Próxima Questão 🚀</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Trigger animation in next frame
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    document.getElementById('btn-next-q').onclick = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            state.currentQuestionIndex++;
            const levelQuestions = questions[state.currentLevel] || questions[1];
            if (state.currentQuestionIndex < levelQuestions.length) {
                showQuestion();
            } else {
                showResults();
            }
        }, 600); // Matched with new CSS transition duration
    };
}

function showResults() {
    let resultType = 'lead';
    if (state.score === 10) resultType = 'impostor';
    if (state.userStatus === 'student') resultType = 'ambassador';

    const res = copy.results[resultType];

    render(`
        <div class="screen">
            <img src="mascot.png" class="welcome-mascot" alt="Mascot">
            <h1>${res.title}</h1>
            <div class="score-circle">
                <span class="score-num">${state.score}</span>
                <span class="score-total">de 10</span>
            </div>
            <p>${res.body}</p>
            <div style="background: rgba(156, 136, 255, 0.1); padding: 25px; border-radius: 20px; margin-bottom: 30px; border: 2px dashed var(--primary-purple);">
                <span style="display:block; font-weight:800; color:var(--primary-purple); margin-bottom:10px;">Teacher Says:</span>
                "${res.insight}"
            </div>
            <div class="options">
                ${res.ctas.map(cta => `
                    <button class="btn ${cta.action === 'whatsapp' ? 'btn-green' : (cta.action === 'next_level' ? 'btn-blue' : 'btn-purple')}" onclick="handleCTA('${cta.action}')">
                        ${cta.text}
                    </button>
                `).join('')}
                <button class="btn btn-outline" onclick="showWelcome()">Reiniciar Quiz 🔄</button>
            </div>
        </div>
    `);
}

function handleCTA(action) {
    if (action === 'next_level') showLevelSelection();
    if (action === 'whatsapp') window.open('https://wa.me/seu-numero', '_blank');
    if (action === 'share') alert('Link copiado! Desafie seus amigos! 🔥');
    if (action === 'teacher') alert('Relatório enviado para a Teacher! 👩‍🏫');
}

// Expose to global scope for HTML onclick handlers
window.showWelcome = showWelcome;
window.showLevelSelection = showLevelSelection;
window.startQuiz = startQuiz;
window.handleAnswer = handleAnswer;
window.handleCTA = handleCTA;

// Initial start
showWelcome();
